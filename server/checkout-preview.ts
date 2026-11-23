import { isCheckoutTestHost } from './checkout-test-host';
import { HttpError, isAdmin, json } from './catalog';
import { createOrder } from './clicker-orders';
import { quoteClickerEcpayStage } from '../src/clicker-test-pricing.js';

import { ecpayStageCheckout, ecpayStageReturnUrl, verifyEcpayStageTrade } from './ecpay-stage';
import { readPreviewStore } from './checkout-delivery-preview';
import { validHomeAddress } from './taiwan-address';
import { previewShipping } from '../src/checkout-preview-shipping.js';
const uuid = /^[0-9a-f-]{36}$/i;
const cap = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

type PreviewStore = { DB: D1Database; BUCKET: R2Bucket; ASSETS: Fetcher };
type Receipt = { id: string; createdAt?: string; productName?: string; subtotal: number; shipping: number; total: number; checkoutUrl?: string; paymentReference?: string; paidAt?: string; delivery?: unknown };

export async function previewCheckout(request: Request, env: Cloudflare.Env, user: Parameters<typeof isAdmin>[0]) {
  const url = new URL(request.url);
  if (!isCheckoutTestHost(url)) {
    return json({ error: '找不到此功能。' }, 404);
  }
  if (!isAdmin(user, env)) return json({ error: '請先登入 OGS 管理帳號。' }, 403);
  if (url.pathname === '/api/checkout-preview/config' && request.method === 'GET') return json({ enabled:!!ecpayStageReturnUrl(env), test:true, shipping:previewShipping.home.fee, pickupShipping:previewShipping.store.fee });
  const checkoutId = /^\/api\/checkout-preview\/payment\/(OGS-DEMO-[A-F0-9]{12})$/.exec(url.pathname)?.[1];
  if (checkoutId && request.method === 'GET') {
    const callback = ecpayStageReturnUrl(env);
    if (!callback || !env.DB) return json({}, 503);
    const order = await findPhysicalStageOrder(env.DB, checkoutId);
    if (!order) return json({ error: '找不到商品測試訂單。' }, 404);
    const receipt = JSON.parse(order.receipt) as Receipt;
    if (order.status === 'success') return Response.redirect(new URL('/admin#orders/' + checkoutId, url), 303);
    return ecpayStageCheckout({ id: checkoutId, amount: receipt.total, created_at: receipt.createdAt! }, callback, url.origin, receipt.productName);
  }
  if (request.method !== 'POST' || request.headers.get('Origin') !== url.origin) {
    return json({ error: '請在測試頁內操作。' }, 403);
  }
  try {
    const { DB: db } = env as PreviewStore;
    const raw = await request.text();
    if (raw.length > 8192) throw new HttpError(413, '送出的資料過長。');
    const body = JSON.parse(raw);
    const requestId = cap(body?.requestId, 36);
    if (!uuid.test(requestId)) throw new HttpError(400, '提交編號無效。');
    if (body.paymentState !== undefined) {
      if (!['pending', 'failure', 'success'].includes(body.paymentState)) throw new HttpError(400, '付款狀態無效。');
      const result = await db.prepare(
        "UPDATE checkout_preview_orders SET status = CASE WHEN status = 'success' THEN status ELSE ? END WHERE request_id = ? AND json_extract(receipt, '$.checkoutUrl') IS NULL RETURNING status"
      ).bind(body.paymentState, requestId).first<{status: string}>();
      if (!result) throw new HttpError(404, '找不到測試單。');
      return json(result);
    }
    const { item, method } = body;
    const ecpay = body.provider === 'ecpay';
    if (ecpay && !ecpayStageReturnUrl(env)) throw new HttpError(503, '綠界測試目前未啟用。');
    const existing = await db.prepare('SELECT receipt, payload FROM checkout_preview_orders WHERE request_id = ?')
      .bind(requestId).first<{receipt: string; payload: string}>();
    if (existing) {
      if (existing.payload !== raw) throw new HttpError(409, '訂單內容已變更，請重新確認。');
      return json(JSON.parse(existing.receipt));
    }

    if (method !== 'store' && method !== 'home') throw new HttpError(400, '請選擇配送方式。');
    const contact = cap(body.contact, 80);
    const phone = cap(body.phone, 32);
    if (!contact || !phone) throw new HttpError(400, '請填寫收件人與電話。');
    if(body.flow==='storefront-test' && method==='store' && String(body.storeToken).startsWith('v')) throw new HttpError(409,'正式地圖門市僅供選店驗證；完整測試請改選綠界固定測試門市。');
    const store = method === 'store' ? await readPreviewStore(db, body.storeToken) : null;
    if (method === 'store' && !store) throw new HttpError(400, '請重新選擇取貨門市。');
    const address = method === 'home' ? {
      city: cap(body.address?.city, 12), district: cap(body.address?.district, 12),
      postalCode: cap(body.address?.postalCode, 6), street: cap(body.address?.street, 100),
      unit: cap(body.address?.unit, 40),
    } : null;
    if (address && (!address.street || !validHomeAddress(address.city,address.district,address.postalCode))) {
      throw new HttpError(400, '請填寫縣市、行政區、郵遞區號與街道門牌。');
    }
    if(body.flow === 'storefront-test' && (method === 'store' && store?.carrier !== '7-ELEVEN')) throw new HttpError(400,'此測試流程僅支援 7-ELEVEN。');
    const delivery = { method, contact, phone, store, address };

    const shipping = (method === 'store' ? previewShipping.store : previewShipping.home).fee;
    let checkoutUrl: string | undefined;
    let subtotal: number;
    let id: string;
    let productName: string | undefined;
    if (item?.kind === 'custom') {
      const quote = quoteClickerEcpayStage(item.design?.text);
      if (!quote) throw new HttpError(400, '請確認客製文字。');
      const customRequest = new Request(request.url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item.design, requestId }),
      });
      const response = await createOrder(customRequest, env as PreviewStore, ecpay, { preview: !ecpay, shipping: ecpay ? shipping : 0 });
      const custom = await response.json() as {id: string; amount: number; checkoutUrl: string};
      id = custom.id;
      subtotal = quote.tier.amount;
      if (ecpay) checkoutUrl = custom.checkoutUrl;
    } else {
      const quantity = item?.quantity;
      if (item?.kind !== 'physical' || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new HttpError(400, '請確認商品與數量。');
      }
      const row = await db.prepare("SELECT data FROM catalog WHERE id = ? AND kind = 'physical' AND status = 'published'")
        .bind(cap(item.id, 80)).first<{data: string}>();
      const product = row ? JSON.parse(row.data) : null;
      if (product?.saleStatus !== 'available' || !Number.isSafeInteger(product.price) || product.price <= 0 || product.isPlaceholder) {
        throw new HttpError(409, '這件商品目前無法下單。');
      }
      id = 'OGS-DEMO-' + requestId.replaceAll('-', '').slice(0, 12).toUpperCase();
      subtotal = product.price * quantity;
      productName = product.name;
      if (ecpay) checkoutUrl = '/api/checkout-preview/payment/' + id;
    }
    if(body.flow === 'storefront-test' && body.total !== subtotal+shipping) throw new HttpError(409,'商品或運費金額已變更，請重新確認。');
    const receipt: Receipt = { id, createdAt: new Date().toISOString(), productName, subtotal, shipping, total: subtotal + shipping, checkoutUrl, delivery };
    await db.prepare('INSERT INTO checkout_preview_orders (request_id, receipt, payload) VALUES (?, ?, ?) ON CONFLICT (request_id) DO NOTHING')
      .bind(requestId, JSON.stringify(receipt), raw).run();
    const saved = await db.prepare('SELECT receipt, payload FROM checkout_preview_orders WHERE request_id = ?')
      .bind(requestId).first<{receipt: string; payload: string}>();
    if (!saved || saved.payload !== raw) throw new HttpError(409, '訂單內容已變更，請重新確認。');
    return json(JSON.parse(saved.receipt), 201);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return json({ error: '資料格式不正確。' }, 400);
    console.error('Local checkout test failed', error);
    return json({ error: '目前無法建立測試單，請再試一次。' }, 500);
  }
}


async function findPhysicalStageOrder(db: D1Database, id: string) {
  return db.prepare(`SELECT request_id, receipt, status FROM checkout_preview_orders
    WHERE json_extract(receipt, '$.id') = ? AND json_extract(receipt, '$.checkoutUrl') = ?
      AND json_extract(payload, '$.provider') = 'ecpay' AND json_extract(payload, '$.item.kind') = 'physical'`)
    .bind(id, '/api/checkout-preview/payment/' + id)
    .first<{ request_id: string; receipt: string; status: string }>();
}

export async function recordPhysicalStagePayment(db: D1Database, id: string, fields: Record<string, string>) {
  const order = await findPhysicalStageOrder(db, id);
  if (!order) throw new HttpError(404, 'Test order not found');
  const receipt = JSON.parse(order.receipt) as Receipt;
  const acknowledge = () => new Response('1|OK', { headers: { 'Content-Type': 'text/plain' } });
  if (fields.RtnCode !== '1' || fields.SimulatePaid === '1') return acknowledge();
  if (fields.TradeAmt !== String(receipt.total) || !/^[A-Za-z0-9]{1,20}$/.test(fields.TradeNo || '') ||
      !fields.PaymentType?.startsWith('Credit_')) throw new HttpError(409, 'ECPay payment does not match order');
  if (receipt.paymentReference === fields.TradeNo) return acknowledge();
  if (receipt.paymentReference) throw new HttpError(409, 'ECPay order already matched');
  await verifyEcpayStageTrade({ id, amount: receipt.total, created_at: receipt.createdAt! }, fields);
  const saved = await db.prepare(`UPDATE checkout_preview_orders
    SET status = 'success', receipt = json_set(receipt, '$.paymentReference', ?, '$.paidAt', ?)
    WHERE request_id = ? AND json_extract(receipt, '$.paymentReference') IS NULL
    RETURNING request_id`).bind(fields.TradeNo, new Date().toISOString(), order.request_id).first();
  if (!saved) {
    const current = await findPhysicalStageOrder(db, id);
    if (!current || JSON.parse(current.receipt).paymentReference !== fields.TradeNo) throw new HttpError(409, 'ECPay order already matched');
  }
  return acknowledge();
}
