import { isAdmin, json, HttpError } from './catalog';
import { generateClicker3mf, type ClickerDesign } from './clicker-print';
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
type Payload = { requestId?: unknown; text?: unknown; font?: unknown; colors?: Partial<ClickerDesign['colors']> };
const fileKey = (id: string) => 'clicker-test/' + id + '.3mf';
const code = (prefix: string) => prefix + crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
const fail = (message: string, status = 400): never => { throw new HttpError(status, message); };

function validate(body: Payload, ecpay: boolean) {
  if (exceedsClickerTextLimit(body?.text)) return fail('文字超過長度上限。中文最多 5 字，英文最多 8 個字母。');
  const quote = (ecpay ? quoteClickerEcpayStage : quoteClickerTest)(body?.text);
  const font = body?.font;
  if (!quote) return fail('請填寫可列印的姓名或文字。');
  if (typeof font !== 'string' || !Object.hasOwn(keyringFonts, font)) return fail('請選擇可用的字型。');
  if (typeof body.requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(body.requestId)) return fail('提交編號不正確，請重新整理。');
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
  return { id: row.id, tier: row.tier, amount: row.amount, checkoutUrl: prefix + '/' + row.id + '/checkout/' + row.tier };
}

async function createOrder(request: Request, store: Store, ecpay: boolean) {
  const { design, tier, requestId } = validate(await requestJson(request), ecpay);
  const snapshot = JSON.stringify(design);
  const lookup = store.DB.prepare('SELECT * FROM clicker_orders WHERE request_id=?').bind(requestId);
  const existing = await lookup.first<Order>();
  if (existing) {
    if (existing.design !== snapshot || existing.tier !== tier.id) return fail('此確認已提交，請重新確認變更後的設計。', 409);
    return json(receipt(existing));
  }
  const fontUrl = new URL('/assets/fonts/keyring/' + keyringFonts[design.font], request.url);
  const file = await generateClicker3mf(design, await store.ASSETS.fetch(new Request(fontUrl)));
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
  if (!concurrent || concurrent.design !== snapshot || concurrent.tier !== tier.id) return fail('此確認已提交，請重新確認設計。', 409);
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

async function recordEcpayStagePayment(request: Request, store: Store) {
  const { id, fields } = await readEcpayStageResult(request);
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
      return await recordEcpayStagePayment(request, env as Store);
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
      const result = await store.DB.prepare('SELECT * FROM clicker_orders WHERE id LIKE ? OR mock_reference LIKE ? OR matched_reference LIKE ? ORDER BY created_at DESC LIMIT 100')
        .bind(pattern, pattern, pattern).all<Order>();
      return json({ ecpayStageAvailable: !!callback, items: result.results.map(row => ({
        id: row.id, design: JSON.parse(row.design), tier: row.tier, amount: row.amount, createdAt: row.created_at,
        checkoutCreated: !!row.mock_reference, matchedReference: row.matched_reference, matchedAt: row.matched_at,
      })) });
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
    if (checkout && ['GET', 'POST'].includes(request.method)) {
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
