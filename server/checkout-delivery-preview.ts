import { addressSearch } from './address-search';
import { isCheckoutTestHost, isLocalCheckoutTest } from './checkout-test-host';
import { HttpError, isAdmin, json } from './catalog';
import { logisticsMac } from './ecpay-logistics';

const carriers = { UNIMARTC2C: '7-ELEVEN', FAMIC2C: '全家', HILIFEC2C: '萊爾富' } as const;
const mapEndpoint = 'https://logistics-stage.ecpay.com.tw/Express/map';
const tokenPattern = /^[a-f0-9]{20}$/;
const publicTokenPattern = /^[lpvx][tes][a-f0-9]{18}$/;
const liveTokenPattern = /^l[tes][a-f0-9]{18}$/;
const liveMapEndpoint = 'https://logistics.ecpay.com.tw/Express/map';
const checkoutPaths = { t: '/checkout.html', s: '/zh-cn/checkout.html', e: '/en/checkout.html' } as const;
type MapRow = { carrier: keyof typeof carriers; result: string | null };
type PreviewEnv = Cloudflare.Env & { OGS_ECPAY_MAP_RETURN_URL?: string; OGS_GOOGLE_PLACES_KEY?: string; OGS_ECPAY_LOGISTICS_MERCHANT_ID?: string; OGS_ECPAY_LOGISTICS_HASH_KEY?: string; OGS_ECPAY_LOGISTICS_HASH_IV?: string; OGS_PUBLIC_PICKUP_ENABLED?: string };
const root = '/api/checkout-delivery-preview/';
const sameOrigin = (request: Request) => request.headers.get('Origin') === new URL(request.url).origin;

export async function readPreviewStore(db: D1Database, token: unknown) {
  if (typeof token !== 'string' || !(tokenPattern.test(token) || publicTokenPattern.test(token))) return null;
  return readMapResult(db, token);
}

export function livePickupMerchant(env: PreviewEnv) {
  const merchant = env.OGS_ECPAY_LOGISTICS_MERCHANT_ID?.trim();
  return merchant && /^\d{7,10}$/.test(merchant) && !['2000132', '2000933', '3002607'].includes(merchant) ? merchant : null;
}

export function livePickupReady(env: PreviewEnv) {
  return Boolean(livePickupMerchant(env) && env.OGS_ECPAY_LOGISTICS_HASH_KEY?.trim() && env.OGS_ECPAY_LOGISTICS_HASH_IV?.trim());
}

type LiveBranch = { StoreId: string; StoreName: string; StoreAddr: string };
let liveDirectory: { merchant: string; expiry: number; entries: Map<string, LiveBranch> } | undefined;

async function officialPickupBranches(env: PreviewEnv, merchant: string) {
  if (liveDirectory?.merchant === merchant && liveDirectory.expiry > Date.now()) return liveDirectory.entries;
  const fields = new URLSearchParams({ MerchantID: merchant, CvsType: 'UNIMART' });
  fields.set('CheckMacValue', logisticsMac(fields, env.OGS_ECPAY_LOGISTICS_HASH_KEY!.trim(), env.OGS_ECPAY_LOGISTICS_HASH_IV!.trim()));
  const response = await fetch('https://logistics.ecpay.com.tw/Helper/GetStoreList', {
    method: 'POST', body: fields, signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error('Store directory unavailable');
  const result = await response.json() as { RtnCode: number; StoreList?: { CvsType: string; StoreInfo: LiveBranch[] }[] };
  const stores = result.StoreList?.find(group => group.CvsType === 'UNIMART')?.StoreInfo;
  if (String(result.RtnCode) !== '1' || !Array.isArray(stores) || !stores.length) throw new Error('Store directory unavailable');
  const entries = new Map(stores.filter(store =>
    /^\d{3,9}$/.test(store.StoreId) && store.StoreName?.trim() && store.StoreAddr?.trim() &&
    !/^(澎湖縣|金門縣|連江縣|[臺台]東縣(?:蘭嶼|綠島)鄉|屏東縣琉球鄉)/.test(store.StoreAddr.trim())
  ).map(store => [String(store.StoreId), store]));
  liveDirectory = { merchant, expiry: Date.now() + 10 * 60_000, entries };
  return entries;
}

export async function readLivePickupStore(db: D1Database, request: Request, token: unknown) {
  if (typeof token !== 'string' || !liveTokenPattern.test(token)) return null;
  const cookie = request.headers.get('Cookie')?.split(';').some(value => value.trim() === 'ogs_pickup_' + token + '=1');
  if (!cookie) return null;
  const store = await readMapResult(db, token);
  return store?.carrier === '7-ELEVEN' ? store : null;
}

async function readMapResult(db: D1Database, token: string) {
  const row = await db.prepare('SELECT result FROM checkout_preview_store_maps WHERE token=? AND expires_at>?')
    .bind(token, Date.now()).first<MapRow>();
  return row?.result ? JSON.parse(row.result) as { carrier: string; id: string; name: string; address: string } : null;
}

export async function deliveryPreview(request: Request, env: PreviewEnv, user: Parameters<typeof isAdmin>[0]) {
  const url = new URL(request.url);
  if (!isCheckoutTestHost(url)) return json({}, 404);
  const path = url.pathname.slice(root.length);
  const db = env.DB!;
  const mapReturn = isLocalCheckoutTest(url) ? env.OGS_ECPAY_MAP_RETURN_URL : url.origin + root + 'store-return';
  const publicMap = path === 'public-store-start' || path === 'public-store' || path === 'public-branches';
  if (!publicMap && path !== 'store-return' && !isAdmin(user, env)) return json({}, 403);
  try {
    if ((path === 'public-branches' || (path === 'config' && url.searchParams.has('branches'))) && request.method === 'GET') {
      const query = (url.searchParams.get('q') || '').trim().replaceAll('臺', '台');
      const merchant = livePickupMerchant(env);
      if (!merchant || !livePickupReady(env) || (publicMap && env.OGS_PUBLIC_PICKUP_ENABLED !== 'true')) return json({}, 503);
      if (query.length < 2 || query.length > 60) return json({ branches: [] });
      const branches = await officialPickupBranches(env, merchant);
      const matches = [];
      for (const branch of branches.values()) {
        if (branch.StoreId === query || (branch.StoreName + branch.StoreAddr).replaceAll('臺', '台').includes(query)) {
          matches.push({ id: branch.StoreId, name: branch.StoreName.trim(), address: branch.StoreAddr.trim() });
          if (matches.length === 12) break;
        }
      }
      return json({ branches: matches });
    }
    if (path === 'config' && request.method === 'GET') {
      return json({ storeMap: !!mapReturn, googlePlaces: !!env.OGS_GOOGLE_PLACES_KEY && env.OGS_GOOGLE_PLACES_ENABLED === 'true' });
    }
    if (path === 'store' && request.method === 'GET') {
      return json({ store: await readPreviewStore(db, url.searchParams.get('token')) });
    }
    if (path === 'public-store' && request.method === 'GET') {
      const token = url.searchParams.get('token') || '';
      if (!publicTokenPattern.test(token)) return json({}, 404);
      return json({ store: liveTokenPattern.test(token) ? await readLivePickupStore(db, request, token) : await readMapResult(db, token) });
    }
    if ((path === 'store-start' || path === 'public-store-start') && request.method === 'POST' && sameOrigin(request)) {
      const body = await request.json() as { carrier: keyof typeof carriers; mobile: boolean; language?: string; flow?: string; map?: string; branchId?: string };
      if (!Object.hasOwn(carriers, body.carrier)) throw new HttpError(400, '請選擇超商品牌。');
      const storefront = body.flow === 'storefront-test';
      if(storefront && (publicMap || !isAdmin(user,env) || body.carrier !== 'UNIMARTC2C')) throw new HttpError(403,'此入口僅供管理員測試 7-ELEVEN。');
      const liveMerchant = livePickupMerchant(env);
      const publicLive = publicMap && url.protocol === 'https:';
      const liveMap = (publicLive || (storefront && body.map === 'live')) && liveMerchant;
      if (publicLive && (body.carrier !== 'UNIMARTC2C' || env.OGS_PUBLIC_PICKUP_ENABLED !== 'true' || !livePickupReady(env))) {
        throw new HttpError(503, '7-ELEVEN 選店暫時無法使用。');
      }
      if (!mapReturn) throw new HttpError(503, '綠界選店尚未啟用。');
      let branch;
      if (publicLive) {
        const selected = (await officialPickupBranches(env, liveMerchant!)).get(body.branchId || '');
        if (!selected?.StoreName || !selected.StoreAddr) throw new HttpError(400, '此門市目前無法選用，請重新選擇。');
        branch = { carrier: '7-ELEVEN', id: selected.StoreId, name: selected.StoreName.trim(), address: selected.StoreAddr.trim() };
      }
      await db.prepare('DELETE FROM checkout_preview_store_maps WHERE expires_at <= ?').bind(Date.now()).run();
      const random = crypto.randomUUID().replaceAll('-', '');
      const locale = body.language === 'en' ? 'e' : body.language === 'zh-Hans' ? 's' : 't';
      const token = publicLive ? 'l' + locale + random.slice(0, 18)
        : storefront ? (liveMap ? 'v' : 'x') + locale + random.slice(0, 18)
        : publicMap ? 'p' + locale + random.slice(0, 18) : random.slice(0, 20);
      await db.prepare('INSERT INTO checkout_preview_store_maps (token, carrier, expires_at, result) VALUES (?, ?, ?, ?)')
        .bind(token, body.carrier, Date.now() + 30 * 60_000, branch ? JSON.stringify(branch) : null).run();
      const response = branch ? json({ token, branch }) : json({ action: liveMap ? liveMapEndpoint : mapEndpoint, token, fields: {
        MerchantID: liveMap || '2000933', MerchantTradeNo: token, LogisticsType: 'CVS',
        LogisticsSubType: body.carrier, IsCollection: 'N', Device: body.mobile ? '1' : '0',
        ServerReplyURL: mapReturn, ExtraData: token,
      } });
      if (publicLive) response.headers.append('Set-Cookie',
        'ogs_pickup_' + token + '=1; Path=/api/; Max-Age=1800; Secure; HttpOnly; SameSite=Lax');
      return response;
    }
    if (path === 'store-return' && request.method === 'POST') {
      const raw = await request.text();
      if (raw.length > 8192) throw new HttpError(413, '門市資料過長。');
      const fields = new URLSearchParams(raw);
      const token = fields.get('ExtraData') || '';
      const isPublicToken = publicTokenPattern.test(token);
      const live = liveTokenPattern.test(token);
      const merchant = token.startsWith('v') ? livePickupMerchant(env) : '2000933';
      if (live || (!isPublicToken && !tokenPattern.test(token)) || !merchant || fields.get('MerchantID') !== merchant) {
        throw new HttpError(400, '門市資料無效。');
      }
      const row = await db.prepare('SELECT carrier, result FROM checkout_preview_store_maps WHERE token=? AND expires_at>?')
        .bind(token, Date.now()).first<MapRow>();
      const id = fields.get('CVSStoreID') || '';
      const name = fields.get('CVSStoreName')?.trim() || '';
      const address = fields.get('CVSAddress')?.trim() || '';
      if (!row || fields.get('LogisticsSubType') !== row.carrier || !/^\d{3,9}$/.test(id) ||
          !name || name.length > 40 || !address || address.length > 180) throw new HttpError(400, '門市資料不完整或選店已逾時。');
      if (!row.result) {
        let result = { carrier: carriers[row.carrier], id, name, address };
        if (token.startsWith('v') && livePickupReady(env)) {
          if (!livePickupReady(env) || fields.get('CVSOutSide') === '1') throw new HttpError(400, '請返回結帳並選擇台灣本島取貨門市。');
          const selected = (await officialPickupBranches(env, merchant)).get(id);
          if (!selected?.StoreName || !selected.StoreAddr) throw new HttpError(400, '此門市目前無法選用，請重新選擇。');
          result = { ...result, name: selected.StoreName.trim(), address: selected.StoreAddr.trim() };
        }
        await db.prepare('UPDATE checkout_preview_store_maps SET result=? WHERE token=? AND result IS NULL')
          .bind(JSON.stringify(result), token).run();
      }
      if (isLocalCheckoutTest(url)) return json({ token });
      const destination = isPublicToken ? checkoutPaths[token[1] as keyof typeof checkoutPaths] + (['p','l'].includes(token[0])?'?':'?shipping-test=1&map='+(token[0]==='v'?'live':'stage')+'&') : '/internal-checkout.html?preview=1&';
      return Response.redirect(url.origin + destination + 'store=' + token, 303);
    }
    if (path === 'places' && request.method === 'POST' && sameOrigin(request)) {
      // Private previews share the public rate and monthly usage guard.
      const response = await addressSearch(new Request(url.origin + '/api/address-search/places', request), env);
      if (!response.ok) return response;
      const data = await response.json() as any;
      if (data.address) return json({formattedAddress:data.formattedAddress,addressComponents:[
        {types:['administrative_area_level_1'],longText:data.address.city},
        {types:['administrative_area_level_3'],longText:data.address.district},
        {types:['postal_code'],longText:data.address.postalCode}
      ]});
      return json({suggestions:data.suggestions.map((s:any)=>({placePrediction:{placeId:s.placeId,text:{text:s.text}}}))});
    }
    return json({}, 404);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    return json({ error: '暫時無法取得配送資料。' }, 502);
  }
}
