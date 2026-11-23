import { addressSearch } from './address-search';
import { isCheckoutTestHost, isLocalCheckoutTest } from './checkout-test-host';
import { HttpError, isAdmin, json } from './catalog';

const carriers = { UNIMARTC2C: '7-ELEVEN', FAMIC2C: '全家', HILIFEC2C: '萊爾富' } as const;
const mapEndpoint = 'https://logistics-stage.ecpay.com.tw/Express/map';
const tokenPattern = /^[a-f0-9]{20}$/;
const publicTokenPattern = /^[pvx][tes][a-f0-9]{18}$/;
const checkoutPaths = { t: '/checkout.html', s: '/zh-cn/checkout.html', e: '/en/checkout.html' } as const;
type MapRow = { carrier: keyof typeof carriers; result: string | null };
type PreviewEnv = Cloudflare.Env & { OGS_ECPAY_MAP_RETURN_URL?: string; OGS_GOOGLE_PLACES_KEY?: string; OGS_ECPAY_LOGISTICS_MERCHANT_ID?: string };
const root = '/api/checkout-delivery-preview/';
const sameOrigin = (request: Request) => request.headers.get('Origin') === new URL(request.url).origin;

export async function readPreviewStore(db: D1Database, token: unknown) {
  if (typeof token !== 'string' || !(tokenPattern.test(token) || publicTokenPattern.test(token))) return null;
  return readMapResult(db, token);
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
  const publicMap = path === 'public-store-start' || path === 'public-store';
  if (!publicMap && path !== 'store-return' && !isAdmin(user, env)) return json({}, 403);
  try {
    if (path === 'config' && request.method === 'GET') {
      return json({ storeMap: !!mapReturn, googlePlaces: !!env.OGS_GOOGLE_PLACES_KEY && env.OGS_GOOGLE_PLACES_ENABLED === 'true' });
    }
    if (path === 'store' && request.method === 'GET') {
      return json({ store: await readPreviewStore(db, url.searchParams.get('token')) });
    }
    if (path === 'public-store' && request.method === 'GET') {
      const token = url.searchParams.get('token') || '';
      if (!publicTokenPattern.test(token)) return json({}, 404);
      return json({ store: await readMapResult(db, token) });
    }
    if ((path === 'store-start' || path === 'public-store-start') && request.method === 'POST' && sameOrigin(request)) {
      const body = await request.json() as { carrier: keyof typeof carriers; mobile: boolean; language?: string; flow?: string; map?: string };
      if (!Object.hasOwn(carriers, body.carrier)) throw new HttpError(400, '請選擇超商品牌。');
      const storefront = body.flow === 'storefront-test';
      if(storefront && (publicMap || !isAdmin(user,env) || body.carrier !== 'UNIMARTC2C')) throw new HttpError(403,'此入口僅供管理員測試 7-ELEVEN。');
      const liveMerchant = env.OGS_ECPAY_LOGISTICS_MERCHANT_ID;
      const liveMap = storefront && body.map === 'live' && !!liveMerchant && !['2000933','2000132'].includes(liveMerchant);
      if (!mapReturn) throw new HttpError(503, '綠界測試選店尚未啟用。');
      await db.prepare('DELETE FROM checkout_preview_store_maps WHERE expires_at <= ?').bind(Date.now()).run();
      const random = crypto.randomUUID().replaceAll('-', '');
      const locale = body.language === 'en' ? 'e' : body.language === 'zh-Hans' ? 's' : 't';
      const token = storefront ? (liveMap?'v':'x')+locale+random.slice(0,18) : publicMap ? 'p' + locale + random.slice(0, 18) : random.slice(0, 20);
      await db.prepare('INSERT INTO checkout_preview_store_maps (token, carrier, expires_at) VALUES (?, ?, ?)')
        .bind(token, body.carrier, Date.now() + 30 * 60_000).run();
      return json({ action: liveMap ? 'https://logistics.ecpay.com.tw/Express/map' : mapEndpoint, token, fields: {
        MerchantID: liveMap ? liveMerchant! : '2000933', MerchantTradeNo: token, LogisticsType: 'CVS',
        LogisticsSubType: body.carrier, IsCollection: 'N', Device: body.mobile ? '1' : '0',
        ServerReplyURL: mapReturn, ExtraData: token,
      } });
    }
    if (path === 'store-return' && request.method === 'POST') {
      const raw = await request.text();
      if (raw.length > 8192) throw new HttpError(413, '門市資料過長。');
      const fields = new URLSearchParams(raw);
      const token = fields.get('ExtraData') || '';
      const isPublicToken = publicTokenPattern.test(token);
      if ((!isPublicToken && !tokenPattern.test(token)) || fields.get('MerchantID') !== (token.startsWith('v') ? env.OGS_ECPAY_LOGISTICS_MERCHANT_ID : '2000933')) throw new HttpError(400, '門市資料無效。');
      const row = await db.prepare('SELECT carrier, result FROM checkout_preview_store_maps WHERE token=? AND expires_at>?')
        .bind(token, Date.now()).first<MapRow>();
      const id = fields.get('CVSStoreID') || '';
      const name = fields.get('CVSStoreName')?.trim() || '';
      const address = fields.get('CVSAddress')?.trim() || '';
      if (!row || fields.get('LogisticsSubType') !== row.carrier || !/^\d{3,9}$/.test(id) ||
          !name || name.length > 40 || !address || address.length > 180) throw new HttpError(400, '門市資料不完整或選店已逾時。');
      const result = { carrier: carriers[row.carrier], id, name, address };
      if (!row.result) {
        await db.prepare('UPDATE checkout_preview_store_maps SET result=? WHERE token=? AND result IS NULL')
          .bind(JSON.stringify(result), token).run();
      }
      if (isLocalCheckoutTest(url)) return json({ token });
      const destination = isPublicToken ? checkoutPaths[token[1] as keyof typeof checkoutPaths] + (token[0]==='p'?'?':'?shipping-test=1&map='+(token[0]==='v'?'live':'stage')+'&') : '/internal-checkout.html?preview=1&';
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
