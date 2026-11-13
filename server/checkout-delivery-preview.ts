import { isCheckoutTestHost, isLocalCheckoutTest } from './checkout-test-host';
import { HttpError, isAdmin, json } from './catalog';

const carriers = { UNIMARTC2C: '7-ELEVEN', FAMIC2C: '全家', HILIFEC2C: '萊爾富' } as const;
const mapEndpoint = 'https://logistics-stage.ecpay.com.tw/Express/map';
const tokenPattern = /^[a-f0-9]{20}$/;
type MapRow = { carrier: keyof typeof carriers; result: string | null };
type PreviewEnv = Cloudflare.Env & { OGS_ECPAY_MAP_RETURN_URL?: string; OGS_GOOGLE_PLACES_KEY?: string };
const root = '/api/checkout-delivery-preview/';
const sameOrigin = (request: Request) => request.headers.get('Origin') === new URL(request.url).origin;

export async function readPreviewStore(db: D1Database, token: unknown) {
  if (typeof token !== 'string' || !tokenPattern.test(token)) return null;
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
  if (path !== 'store-return' && !isAdmin(user, env)) return json({}, 403);
  try {
    if (path === 'config' && request.method === 'GET') {
      return json({ storeMap: !!mapReturn, googlePlaces: !!env.OGS_GOOGLE_PLACES_KEY });
    }
    if (path === 'store' && request.method === 'GET') {
      return json({ store: await readPreviewStore(db, url.searchParams.get('token')) });
    }
    if (path === 'store-start' && request.method === 'POST' && sameOrigin(request)) {
      const body = await request.json() as { carrier: keyof typeof carriers; mobile: boolean };
      if (!Object.hasOwn(carriers, body.carrier)) throw new HttpError(400, '請選擇超商品牌。');
      if (!mapReturn) throw new HttpError(503, '綠界測試選店尚未啟用。');
      await db.prepare('DELETE FROM checkout_preview_store_maps WHERE expires_at <= ?').bind(Date.now()).run();
      const token = crypto.randomUUID().replaceAll('-', '').slice(0, 20);
      await db.prepare('INSERT INTO checkout_preview_store_maps (token, carrier, expires_at) VALUES (?, ?, ?)')
        .bind(token, body.carrier, Date.now() + 30 * 60_000).run();
      return json({ action: mapEndpoint, token, fields: {
        MerchantID: '2000933', MerchantTradeNo: token, LogisticsType: 'CVS',
        LogisticsSubType: body.carrier, IsCollection: 'N', Device: body.mobile ? '1' : '0',
        ServerReplyURL: mapReturn, ExtraData: token,
      } });
    }
    if (path === 'store-return' && request.method === 'POST') {
      const raw = await request.text();
      if (raw.length > 8192) throw new HttpError(413, '門市資料過長。');
      const fields = new URLSearchParams(raw);
      const token = fields.get('ExtraData') || '';
      if (!tokenPattern.test(token) || fields.get('MerchantID') !== '2000933') throw new HttpError(400, '門市資料無效。');
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
      return Response.redirect(url.origin + '/internal-checkout.html?preview=1&store=' + token, 303);
    }
    if (path === 'places' && request.method === 'POST' && sameOrigin(request)) {
      if (!env.OGS_GOOGLE_PLACES_KEY) throw new HttpError(503, 'Google 地址搜尋尚未設定。');
      const body = await request.json() as { input?: string; placeId?: string; sessionToken?: string };
      if (!/^[a-zA-Z0-9_-]{1,36}$/.test(body.sessionToken || '')) throw new HttpError(400, '地址搜尋識別碼無效。');
      const headers = { 'X-Goog-Api-Key': env.OGS_GOOGLE_PLACES_KEY };
      const endpoint = 'https://places.googleapis.com/v1/';
      const placeId = body.placeId;
      if (placeId && !/^[\w-]{1,250}$/.test(placeId)) throw new HttpError(400, '地址識別碼無效。');
      const input = typeof body.input === 'string' ? body.input.trim().slice(0, 180) : '';
      if (!placeId && input.length < 3) return json({ suggestions: [] });
      const response = await (placeId
        ? fetch(endpoint + 'places/' + placeId + '?' + new URLSearchParams({ sessionToken: body.sessionToken!, languageCode: 'zh-TW', regionCode: 'TW' }),
            { headers: { ...headers, 'X-Goog-FieldMask': 'formattedAddress,addressComponents' }, signal: AbortSignal.timeout(8000) })
        : fetch(endpoint + 'places:autocomplete', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text' }, signal: AbortSignal.timeout(8000),
            body: JSON.stringify({ input, sessionToken: body.sessionToken, includedRegionCodes: ['tw'], languageCode: 'zh-TW', regionCode: 'TW' }) }));
      if (!response.ok) throw new HttpError(502, '暫時無法搜尋地址，請手動填寫。');
      return json(await response.json());
    }
    return json({}, 404);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    return json({ error: '暫時無法取得配送資料。' }, 502);
  }
}
