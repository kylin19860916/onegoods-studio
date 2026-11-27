import { canCreateLivePickup } from './store-pickup-shipment';
import { isCheckoutTestHost } from './checkout-test-host';
import { isAdmin, json, HttpError } from './catalog';
import { generateClicker3mf, generateMechanical3mf, type ClickerDesign, type MechanicalDesign } from './clicker-print';
import { exceedsClickerTextLimit, quoteClickerEcpayStage, quoteClickerTest } from '../src/clicker-test-pricing.js';
import { keyringFonts } from '../src/keyring-font-picker.js';
import { ecpayStageCheckout, ecpayStageReturnUrl, isEcpayStageCallback, readEcpayStageResult, verifyEcpayStageTrade } from './ecpay-stage';

const palette = new Set(['#a087c1', '#fffcf5', '#f2c879', '#393142', '#b8d6bd', '#efb39e']);
const prefix = '/api/clicker-orders/test';
const orderRoute = /^\/api\/clicker-orders\/test\/(OGS-T-[A-F0-9]{12})\/checkout(?:\/(test-[ab]))?$/;
const ecpayRoute = /^\/api\/clicker-orders\/test\/(OGS-E-[A-F0-9]{12})\/checkout\/ecpay-stage$/;
const adminRoute = /^\/api\/admin\/clicker-orders\/(OGS-[TE]-[A-F0-9]{12})\/(match|3mf)$/;
const testOnly = '測試流程 · 不會付款或出貨';

type Order = {
  id: string;
  design: string;
  tier: string;
  amount: number;
  created_at: string;
  mock_reference: string | null;
  matched_reference: string | null;
  matched_at: string | null;
};
type Store = { DB: D1Database; BUCKET: R2Bucket; ASSETS: Fetcher };
type Payload = { style?: unknown; base?: unknown; keys?: unknown; requestId?: unknown; text?: unknown; font?: unknown; colors?: Partial<ClickerDesign['colors']> };
const fileKey = (id: string) => 'clicker-test/' + id + '.3mf';
const code = (prefix: string) => prefix + crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
const fail = (message: string, status = 400): never => { throw new HttpError(status, message); };

function validate(body: Payload, ecpay: boolean) {
  if (!body || typeof body.requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(body.requestId)) return fail('提交編號不正確，請重新整理。');
  if (body.style === 'mechanical') {
    if (ecpay) return fail('機械鍵盤款目前僅開放 3MF 測試。');
    if (typeof body.base !== 'string' || !palette.has(body.base)) return fail('請選擇可用的底座顏色。');
    if (!Array.isArray(body.keys) || body.keys.length < 1 || body.keys.length > 6) return fail('請選擇 1 至 6 鍵。');
    const keys = body.keys.map(key => {
      if (!key || typeof key.text !== 'string' || key.text.length > 12 ||
          typeof key.font !== 'string' || !Object.hasOwn(keyringFonts, key.font) ||
          !palette.has(key.cap) || !palette.has(key.ink)) return fail('請確認每鍵的文字、字型和顏色。');
      const text = key.text.trim().normalize('NFC');
      if (text && !/^[\p{L}\p{N}][\p{M}]*$/u.test(text)) return fail('每鍵限一個字或字母。');
      return { text, font: key.font as MechanicalDesign['keys'][number]['font'], cap: String(key.cap), ink: String(key.ink) };
    });
    const design: MechanicalDesign = { style: 'mechanical', text: keys.map(key => key.text).join('') || `機械鍵盤款 ${keys.length} 鍵`, base: body.base, keys };
    return { design, tier: { id: 'mechanical-test', amount: 0 }, requestId: body.requestId };
  }
  if (body.style !== undefined) return fail('請選擇可測試的款式。');
  if (exceedsClickerTextLimit(body?.text)) return fail('文字超過長度上限。中文最多 5 字，英文最多 8 個字母。');
  const quote = (ecpay ? quoteClickerEcpayStage : quoteClickerTest)(body?.text);
  const font = body?.font;
  if (!quote) return fail('請填寫可列印的姓名或文字。');
  if (typeof font !== 'string' || !Object.hasOwn(keyringFonts, font)) return fail('請選擇可用的字型。');
  const colors = { border: body.colors?.border ?? '', fill: body.colors?.fill ?? '', ink: body.colors?.ink ?? '' };
  if (Object.values(colors).some(value => !palette.has(value))) return fail('請選擇可用的顏色。');
  const design: ClickerDesign = { text: quote.text, font: font as ClickerDesign['font'], colors };
  return { design, tier: quote.tier, requestId: body.requestId };
}

async function requestJson(request: Request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return fail('資料格式不正確。');
  const input = await request.text();
  if (input.length > 4096) return fail('送出的資料過長。', 413);
  try { return JSON.parse(input); } catch { return fail('資料格式不正確。'); }
}

function receipt(row: Pick<Order, 'id' | 'tier' | 'amount'>) {
  return { id: row.id, tier: row.tier, amount: row.amount, checkoutUrl: row.tier === 'mechanical-test' ? '/admin#orders/' + row.id : prefix + '/' + row.id + '/checkout/' + row.tier };
}

export async function createOrder(request: Request, store: Store, ecpay: boolean, options: { preview?: boolean; shipping?: number } = {}) {
  const { preview = false, shipping = 0 } = options;
  const { design, tier: quote, requestId } = validate(await requestJson(request), ecpay || preview);
  const tier = { ...quote, id: preview ? 'checkout-preview' : quote.id, amount: quote.amount + shipping };
  const snapshot = JSON.stringify(design);
  const lookup = store.DB.prepare('SELECT * FROM clicker_orders WHERE request_id=?').bind(requestId);
  const existing = await lookup.first<Order>();
  if (existing) {
    if (existing.design !== snapshot || existing.tier !== tier.id || existing.amount !== tier.amount) return fail('此確認已提交，請重新確認變更後的設計。', 409);
    return json(receipt(existing));
  }
  const readFont = (font: keyof typeof keyringFonts) =>
    store.ASSETS.fetch(new Request(new URL('/assets/fonts/keyring/' + keyringFonts[font], request.url)));
  const file = 'style' in design
    ? await generateMechanical3mf(design, readFont)
    : await generateClicker3mf(design, await readFont(design.font));
  const id = code(ecpay ? 'OGS-E-' : 'OGS-T-');
  await store.BUCKET.put(fileKey(id), file, { httpMetadata: { contentType: 'model/3mf' } });
  try {
    const result = await store.DB.prepare('INSERT INTO clicker_orders (id,request_id,design,tier,amount,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING')
      .bind(id, requestId, snapshot, tier.id, tier.amount, new Date().toISOString()).run();
    if (result.meta.changes) return json(receipt({ id, tier: tier.id, amount: tier.amount }), 201);
  } catch (error) {
    // If a write succeeded but the response failed, leave the attached file intact.
    const saved = await lookup.first<Order>();
    if (saved?.id === id) return json(receipt(saved));
    await store.BUCKET.delete(fileKey(id));
    throw error;
  }
  await store.BUCKET.delete(fileKey(id));
  const concurrent = await lookup.first<Order>();
  if (!concurrent || concurrent.design !== snapshot || concurrent.tier !== tier.id || concurrent.amount !== tier.amount) return fail('此確認已提交，請重新確認設計。', 409);
  return json(receipt(concurrent));
}

function checkoutPage(order: Order) {
  const tierLabel = order.tier === 'test-a' ? 'A 檔' : 'B 檔';
  const confirmation = order.mock_reference
    ? `<h2>測試單已成立</h2>
       <p>模擬賣貨便單號 <strong>${order.mock_reference}</strong></p>
       <p>可在 OGS 後台用客製編號搜尋，再輸入這個單號與商品金額完成配對。</p>
       <a class="button yellow" href="/admin#clicker-orders">前往 OGS 後台</a>`
    : `<form method="post" class="nameplate-form">
         <button class="button yellow" type="submit">送出模擬賣貨便訂單</button>
       </form>`;
  return new Response(`<!doctype html><html lang="zh-Hant">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>賣貨便下單模擬 · OGS</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <main class="section nameplate-page">
        <div class="nameplate-heading">
          <a class="custom-back" href="/nameplate?style=name-clicker&amp;test-order=1">返回客製測試</a>
          <h1>賣貨便模擬結帳 · ${tierLabel}</h1>
          <p>${testOnly}</p>
        </div>
        <div class="nameplate-form">
          <p>OGS 客製編號 <strong>${order.id}</strong></p>
          <p>測試商品金額 <strong>NT$${order.amount}</strong></p>
          ${confirmation}
        </div>
      </main>
    </body>
  </html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' },
  });
}

async function simulateCheckout(request: Request, store: Store, order: Order) {
  if (request.method === 'GET' || order.mock_reference) return checkoutPage(order);
  // The authenticated checkout route already resolved the order and verified its tier.
  await store.DB.prepare('UPDATE clicker_orders SET mock_reference=? WHERE id=? AND mock_reference IS NULL')
    .bind(code('TEST-MYSHIP-'), order.id).run();
  return Response.redirect(request.url, 303);
}

async function matchOrder(request: Request, store: Store, order: Order) {
  const body = await requestJson(request);
  const reference = typeof body?.reference === 'string' ? body.reference.trim().toUpperCase() : '';
  if (!order.mock_reference || reference !== order.mock_reference) return fail('賣貨便測試單號與這筆客製訂單不符。', 409);
  if (body.amount !== order.amount) return fail('商品金額與客製訂單不符。', 409);
  const matchedAt = order.matched_at ?? new Date().toISOString();
  await store.DB.prepare('UPDATE clicker_orders SET matched_reference=?,matched_at=? WHERE id=? AND matched_reference IS NULL')
    .bind(reference, matchedAt, order.id).run();
  return json({ reference, matchedAt });
}

async function recordEcpayStagePayment(id: string, fields: Record<string, string>, store: Store) {
  const order = await store.DB.prepare("SELECT * FROM clicker_orders WHERE id=? AND tier='ecpay-stage'").bind(id).first<Order>();
  if (!order) return fail('Test order not found', 404);
  const acknowledged = () => new Response('1|OK', { headers: { 'Content-Type': 'text/plain' } });
  if (fields.RtnCode !== '1' || fields.SimulatePaid === '1') return acknowledged();
  if (fields.TradeAmt !== String(order.amount) || !/^[A-Za-z0-9]{1,20}$/.test(fields.TradeNo) ||
      !fields.PaymentType?.startsWith('Credit_')) return fail('ECPay payment does not match order', 409);
  if (order.matched_reference === fields.TradeNo) return acknowledged();
  if (order.matched_reference) return fail('ECPay order already matched', 409);
  await verifyEcpayStageTrade(order, fields);
  if (!await store.BUCKET.head(fileKey(id))) return fail('Print file missing', 409);
  const result = await store.DB.prepare('UPDATE clicker_orders SET matched_reference=?,matched_at=? WHERE id=? AND matched_reference IS NULL')
    .bind(fields.TradeNo, new Date().toISOString(), id).run();
  if (!result.meta.changes) {
    const current = await store.DB.prepare('SELECT matched_reference FROM clicker_orders WHERE id=?').bind(id).first<Order>();
    if (current?.matched_reference !== fields.TradeNo) return fail('ECPay order already matched', 409);
  }
  return acknowledged();
}

export async function clickerOrderApi(request: Request, env: Cloudflare.Env, user: Parameters<typeof isAdmin>[0]) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    const callback = ecpayStageReturnUrl(env);
    if (isEcpayStageCallback(path)) {
      if (request.method !== 'POST' || callback?.pathname !== path || !env.DB || !env.BUCKET) return fail('找不到此功能。', 404);
      const { id, fields } = await readEcpayStageResult(request);
      if (id.startsWith('OGS-DEMO-')) {
        const { recordPhysicalStagePayment } = await import('./checkout-preview');
        return await recordPhysicalStagePayment(env.DB, id, fields);
      }
      return await recordEcpayStagePayment(id, fields, env as Store);
    }
    if (!user) return json({ error: '請先用 OGS 管理帳號登入。' }, 401);
    if (!isAdmin(user, env)) return json({ error: '此流程目前僅開放 OGS 內部測試。' }, 403);
    if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return fail('請在本網站內操作。', 403);
    const ecpay = url.searchParams.get('provider') === 'ecpay';
    if (path === prefix && ecpay && !callback) return fail('綠界測試目前未啟用。', 404);
    if (path === prefix && request.method === 'GET') return json({ test: true });
    if (!env.DB || !env.BUCKET) throw new Error('Order storage is not configured');
    const store = env as Store;
    if (path === prefix && request.method === 'POST') return await createOrder(request, store, ecpay);
    if (path === '/api/admin/clicker-orders' && request.method === 'GET') {
      const query = url.searchParams.get('q')?.trim().toUpperCase() ?? '';
      const pattern = '%' + query.slice(0, 64).replace(/[%_]/g, '') + '%';
      const querySql = `SELECT * FROM clicker_orders WHERE id LIKE ? OR mock_reference LIKE ? OR matched_reference LIKE ? OR json_extract(design, '$.text') LIKE ? ORDER BY created_at DESC LIMIT 100`;
      const previewSql = querySql.replace('SELECT *', "SELECT clicker_orders.*, (SELECT receipt FROM checkout_preview_orders WHERE request_id = clicker_orders.request_id) AS preview_receipt, (SELECT status FROM checkout_preview_orders WHERE request_id = clicker_orders.request_id) AS preview_status, (SELECT json_object('id', logistics_id, 'status', status, 'notice', notice, 'subtype', subtype) FROM checkout_preview_shipments WHERE order_id = clicker_orders.id) AS preview_shipment");
      const result = await store.DB.prepare(isCheckoutTestHost(url) ? previewSql : querySql)
        .bind(pattern, pattern, pattern, pattern).all<Order & { preview_receipt?: string; preview_status?: string; preview_shipment?: string }>();
      const checkoutTest = isCheckoutTestHost(url);
      const physical = checkoutTest ? await store.DB.prepare(`
        SELECT p.receipt, p.status, (SELECT json_object('id',logistics_id,'status',CASE WHEN logistics_id IS NULL AND json_extract(audit_json,'$.providerResponse') LIKE '0|%' THEN 'create_failed' ELSE status END,'notice',notice,'subtype',subtype,'error',CASE WHEN logistics_id IS NULL AND json_extract(audit_json,'$.providerResponse') LIKE '0|%' THEN json_extract(audit_json,'$.providerResponse') END) FROM checkout_preview_shipments WHERE order_id=json_extract(p.receipt,'$.id')) AS shipment, json_extract(p.payload, '$.item.id') AS product_id,
          json_extract(p.payload, '$.item.quantity') AS quantity, json_extract(c.data, '$.name') AS product_name
        FROM checkout_preview_orders p
        LEFT JOIN catalog c ON c.id = json_extract(p.payload, '$.item.id')
        WHERE json_extract(p.payload, '$.item.kind') = 'physical'
        ORDER BY p.rowid DESC LIMIT 100
      `).all<{ receipt: string; status: string; product_id: string; quantity: number; product_name: string | null; shipment: string | null }>() : null;
      const liveOrders = await store.DB.prepare(`
        SELECT id, snapshot, amount, created_at, payment_reference, paid_at,
          (SELECT json_object('id', s.logistics_id, 'status', s.status, 'subtype', 'UNIMARTC2C',
            'notice', (SELECT status_code FROM logistics_notifications WHERE trade_no=s.trade_no ORDER BY received_at DESC LIMIT 1))
            FROM store_pickup_shipments s WHERE s.order_id=store_orders.id) AS pickup_shipment
        FROM store_orders
        WHERE id LIKE ? OR payment_reference LIKE ? OR json_extract(snapshot, '$.name') LIKE ?
          OR json_extract(snapshot, '$.delivery.contact') LIKE ? OR json_extract(snapshot, '$.design.text') LIKE ?
        ORDER BY created_at DESC LIMIT 100
      `).bind(pattern, pattern, pattern, pattern, pattern).all<{ id: string; snapshot: string; amount: number; created_at: string; payment_reference: string | null; paid_at: string | null; pickup_shipment: string | null }>();
      const liveItems = liveOrders.results.map(row => {
        const details = JSON.parse(row.snapshot);
        return { id: row.id, kind: details.kind === 'custom' ? 'custom' : 'physical', design: details.design, live: true, name: details.name, quantity: details.quantity,
          amount: row.amount, subtotal: details.subtotal, shipping: details.shipping, delivery: details.delivery,
          createdAt: row.created_at, matchedReference: row.payment_reference, matchedAt: row.paid_at,
          canCreatePickup: canCreateLivePickup(env, row.id), shipment: row.pickup_shipment ? JSON.parse(row.pickup_shipment) : undefined };
      });
      const physicalItems = (physical?.results ?? []).map(row => {
        const receipt = JSON.parse(row.receipt);
        return {
          id: receipt.id, kind: 'physical', name: receipt.productName || row.product_name || row.product_id,
          quantity: row.quantity, amount: receipt.total, createdAt: receipt.createdAt,
          delivery: receipt.delivery, matchedReference: receipt.paymentReference, matchedAt: receipt.paidAt, previewPaid: row.status === 'success', paymentState: row.status,
          subtotal: receipt.subtotal, shipping: receipt.shipping, shipment:row.shipment?JSON.parse(row.shipment):undefined,
        };
      });
      return json({ ecpayStageAvailable: !!callback, shippingToolsAvailable: checkoutTest, physicalItems: [...liveItems, ...physicalItems], items: result.results.map(row => ({
        id: row.id, kind: 'custom', searchReference: row.mock_reference, design: JSON.parse(row.design), tier: row.tier, amount: row.amount, createdAt: row.created_at,
        delivery: row.preview_receipt ? JSON.parse(row.preview_receipt).delivery : undefined,
        previewPaid: row.preview_status === 'success' || (!!row.preview_receipt && !!row.matched_reference),
        shipment: row.preview_shipment ? JSON.parse(row.preview_shipment) : undefined,
        checkoutCreated: !!row.mock_reference, matchedReference: row.matched_reference, matchedAt: row.matched_at,
      })) });
    }
    const paidClicker = /^\/api\/admin\/clicker-orders\/(OGS-P-[A-F0-9]{12})\/3mf$/.exec(path);
    if (paidClicker && request.method === 'GET') {
      const id = paidClicker[1];
      const row = await store.DB.prepare('SELECT snapshot FROM store_orders WHERE id=? AND payment_reference IS NOT NULL')
        .bind(id).first<{ snapshot: string }>();
      const snapshot = row && JSON.parse(row.snapshot);
      if (snapshot?.kind !== 'custom' || !snapshot.design) return fail('找不到已付款的客製訂單。', 404);
      const design = snapshot.design as ClickerDesign;
      const asset = await store.ASSETS.fetch(new Request(new URL('/assets/fonts/keyring/' + keyringFonts[design.font], url)));
      const file = await generateClicker3mf(design, asset);
      return new Response(new Uint8Array(file), { headers: {
        'Content-Type': 'model/3mf', 'Content-Disposition': `attachment; filename="${id}.3mf"`,
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      } });
    }
    const checkout = orderRoute.exec(path);
    const ecpayCheckout = ecpayRoute.exec(path);
    const admin = adminRoute.exec(path);
    const id = (checkout ?? ecpayCheckout ?? admin)?.[1];
    if (!id) return json({ error: '找不到此功能。' }, 404);
    const order = await store.DB.prepare('SELECT * FROM clicker_orders WHERE id=?').bind(id).first<Order>();
    if (!order) return json({ error: '找不到客製訂單。' }, 404);
    if (ecpayCheckout && request.method === 'GET' && order.tier === 'ecpay-stage' && callback) {
      if (order.matched_reference) return Response.redirect(new URL('/admin#clicker-orders', request.url), 303);
      return await ecpayStageCheckout(order, callback, url.origin);
    }
    if (checkout && order.tier !== 'mechanical-test' && ['GET', 'POST'].includes(request.method)) {
      if (checkout[2] && checkout[2] !== order.tier) return fail('此測試結帳連結與客製訂單價位不符。', 404);
      return await simulateCheckout(request, store, order);
    }
    if (admin?.[2] === 'match' && request.method === 'PUT') return await matchOrder(request, store, order);
    if (admin?.[2] === '3mf' && request.method === 'GET') {
      const file = await store.BUCKET.get(fileKey(id));
      if (!file) return json({ error: '找不到列印檔。' }, 404);
      return new Response(file.body, { headers: {
        'Content-Type': 'model/3mf', 'Content-Disposition': `attachment; filename="${id}.3mf"`,
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      } });
    }
    return json({ error: '找不到此功能。' }, 404);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error('Clicker test order failed', error instanceof Error ? (import.meta.env.DEV ? error.stack : error.message) : 'unknown');
    return json({ error: '目前無法完成測試，請稍後再試。' }, 500);
  }
}
