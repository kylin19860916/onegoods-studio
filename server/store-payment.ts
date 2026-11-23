import { timingSafeEqual } from 'node:crypto';
import { HttpError, json } from './catalog';

type Env = Cloudflare.Env & {
  OGS_ECPAY_PAYMENT_ENABLED?: string;
  OGS_ECPAY_PAYMENT_MERCHANT_ID?: string;
  OGS_ECPAY_PAYMENT_HASH_KEY?: string;
  OGS_ECPAY_PAYMENT_HASH_IV?: string;
  OGS_STORE_HOME_SHIPPING_FEE?: string;
};
type Fields = Record<string, string>;
type Order = {
  id: string; request_id: string; snapshot: string; amount: number;
  created_at: string; payment_reference: string | null;
};
const origin = 'https://onegoods.studio';
const paymentUrl = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
const prefix = '/api/store-payment';
const orderIdPattern = /^OGS-P-[A-F0-9]{12}$/;
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const cap = (value: unknown, size: number) => typeof value === 'string' && value.trim().length <= size ? value.trim() : '';
const responseText = (message: string, status = 200) => new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

function credentials(env: Env) {
  const merchant = env.OGS_ECPAY_PAYMENT_MERCHANT_ID?.trim();
  const key = env.OGS_ECPAY_PAYMENT_HASH_KEY?.trim();
  const iv = env.OGS_ECPAY_PAYMENT_HASH_IV?.trim();
  if (!merchant || !/^\d{7,10}$/.test(merchant) || ['3002607', '2000132', '2000933'].includes(merchant) ||
      !key || !/^[A-Za-z0-9]{16}$/.test(key) || !iv || !/^[A-Za-z0-9]{16}$/.test(iv)) return null;
  return { merchant, key, iv };
}

function shippingFee(env: Env) {
  const raw = env.OGS_STORE_HOME_SHIPPING_FEE?.trim() || '';
  return /^\d{1,4}$/.test(raw) ? Number(raw) : null;
}

export async function paymentMac(fields: Fields, key: string, iv: string) {
  const pairs = Object.keys(fields).filter(field => field !== 'CheckMacValue')
    .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0)
    .map(field => field + '=' + fields[field]).join('&');
  const encoded = encodeURIComponent('HashKey=' + key + '&' + pairs + '&HashIV=' + iv)
    .replace(/%20/g, '+').replace(/'/g, '%27').replace(/~/g, '%7E').toLowerCase();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(encoded));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function tradeNumber(id: string) {
  return 'OGSP' + id.slice('OGS-P-'.length);
}

export async function storePayment(request: Request, env: Env) {
  const url = new URL(request.url);
  const local = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.origin !== origin && !local) return json({}, 404);
  const action = url.pathname.slice(prefix.length);
  const config = credentials(env);
  const fee = shippingFee(env);
  const db = env.DB;
  // Preparing credentials must not silently switch the public shop to live collection.
  // Pending payment notifications remain verifiable even when new checkout is paused.
  const enabled = url.origin === origin && env.OGS_ECPAY_PAYMENT_ENABLED === 'true' && Boolean(config && db && fee !== null);
  if (action === '/config' && request.method === 'GET') return json({ enabled, shipping: fee });
  if (!db) return json({}, 503);
  try {
    if (action === '/status' && request.method === 'GET') {
      const id = url.searchParams.get('id') || '';
      const token = url.searchParams.get('token') || '';
      if (!orderIdPattern.test(id) || !requestIdPattern.test(token)) return json({}, 404);
      const order = await db.prepare('SELECT id, amount, payment_reference FROM store_orders WHERE id=? AND request_id=?')
        .bind(id, token).first<Order>();
      return order ? json({ id: order.id, amount: order.amount, paid: Boolean(order.payment_reference) }) : json({}, 404);
    }
    if (action === '/notify' && request.method === 'POST') {
      if (!config) return responseText('Payment not configured', 503);
      if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) return responseText('Invalid request', 415);
      const raw = await request.text();
      if (raw.length > 8192) return responseText('Invalid request', 413);
      const fields: Fields = Object.create(null);
      for (const [name, value] of new URLSearchParams(raw)) {
        if (Object.hasOwn(fields, name)) return responseText('Invalid request', 400);
        fields[name] = value;
      }
      if (fields.MerchantID !== config.merchant || !/^[A-F0-9]{64}$/.test(fields.CheckMacValue || '') ||
          !timingSafeEqual(Buffer.from(fields.CheckMacValue), Buffer.from(await paymentMac(fields, config.key, config.iv)))) {
        return responseText('Invalid signature', 400);
      }
      const match = /^OGSP([A-F0-9]{12})$/.exec(fields.MerchantTradeNo);
      const order = match && await db.prepare('SELECT * FROM store_orders WHERE id=?').bind('OGS-P-' + match[1]).first<Order>();
      if (!order || fields.TradeAmt !== String(order.amount) || (fields.CustomField1 && fields.CustomField1 !== order.id)) {
        return responseText('Order mismatch', 409);
      }
      if (fields.RtnCode !== '1' || fields.SimulatePaid === '1') return responseText('1|OK');
      if (fields.SimulatePaid !== '0' || !/^Credit_/.test(fields.PaymentType || '') ||
          !/^\d{8,24}$/.test(fields.TradeNo || '')) return responseText('Invalid transaction', 400);
      await db.prepare('UPDATE store_orders SET payment_reference=?, paid_at=? WHERE id=? AND payment_reference IS NULL')
        .bind(fields.TradeNo, new Date().toISOString(), order.id).run();
      const updated = await db.prepare('SELECT payment_reference FROM store_orders WHERE id=?').bind(order.id).first<Order>();
      return updated?.payment_reference === fields.TradeNo ? responseText('1|OK') : responseText('Transaction mismatch', 409);
    }
    if (action !== '/checkout' || request.method !== 'POST') return json({}, 404);
    if (request.headers.get('Origin') !== url.origin || !request.headers.get('Content-Type')?.startsWith('application/json')) return json({}, 403);
    if (!enabled || !config || fee === null) return json({ error: '官網付款準備中，請稍後再試。' }, 503);
    const raw = await request.text();
    if (raw.length > 4096) return json({}, 413);
    const body = JSON.parse(raw);
    const requestId = cap(body.requestId, 36);
    const productId = cap(body.productId, 80);
    const quantity = body.quantity;
    const address = { city: cap(body.city, 12), district: cap(body.district, 16), postalCode: cap(body.postalCode, 6), street: cap(body.street, 100), unit: cap(body.unit, 35) };
    const contact = cap(body.contact, 40);
    const phone = cap(body.phone, 20);
    const email = cap(body.email, 100);
    if (!requestIdPattern.test(requestId) || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(productId) ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 99 ||
        !contact || !/^[+\d() -]{8,20}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !address.city || !address.district || !address.street || !/^\d{3}(?:\d{2,3})?$/.test(address.postalCode) ||
        ['金門縣', '連江縣', '澎湖縣'].includes(address.city)) {
      throw new HttpError(400, '請確認聯絡資料與台灣本島配送地址。');
    }
    const details = { productId, quantity, delivery: { contact, phone, email, address } };
    const requestSnapshot = JSON.stringify(details);
    const lookup = db.prepare('SELECT * FROM store_orders WHERE request_id=?').bind(requestId);
    let order = await lookup.first<Order>();
    if (!order) {
      const product = await db.prepare("SELECT data FROM catalog WHERE id=? AND kind='physical' AND status='published'").bind(productId).first<{ data: string }>();
      const item = product && JSON.parse(product.data);
      if (!item || item.isPlaceholder || item.saleStatus !== 'available' || !Number.isSafeInteger(item.price) || item.price <= 0) {
        throw new HttpError(409, '這件商品目前無法在官網下單。');
      }
      const subtotal = item.price * quantity;
      const amount = subtotal + fee;
      if (body.total !== amount) throw new HttpError(409, '商品或運費金額已變更，請重新整理後確認。');
      if (amount > 200000) throw new HttpError(400, '訂單超過單筆付款上限，請調整數量。');
      const snapshot = JSON.stringify({ ...details, name: item.name, subtotal, shipping: fee, requestSnapshot });
      const id = 'OGS-P-' + crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
      await db.prepare('INSERT INTO store_orders (id,request_id,snapshot,amount,created_at) VALUES (?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING')
        .bind(id, requestId, snapshot, amount, new Date().toISOString()).run();
      order = await lookup.first<Order>();
    }
    if (!order) throw new HttpError(503, '目前無法建立訂單。');
    const snapshot = JSON.parse(order.snapshot);
    if (snapshot.requestSnapshot !== requestSnapshot || order.amount !== body.total) throw new HttpError(409, '訂單內容已變更，請重新確認。');
    const back = url.origin + '/order-receipt.html?id=' + order.id + '&token=' + requestId;
    if (order.payment_reference) return json({ receipt: back });
    const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'medium' })
      .format(new Date(order.created_at)).replaceAll('-', '/');
    const itemName = String(snapshot.name).replaceAll('#', ' ').slice(0, 100) + ' × ' + snapshot.quantity;
    const fields: Fields = {
      MerchantID: config.merchant, MerchantTradeNo: tradeNumber(order.id), MerchantTradeDate: date,
      PaymentType: 'aio', TotalAmount: String(order.amount), TradeDesc: 'OGS online order',
      ItemName: itemName + '#黑貓宅配', ReturnURL: url.origin + prefix + '/notify',
      ClientBackURL: back, ChoosePayment: 'Credit', EncryptType: '1', CustomField1: order.id,
    };
    fields.CheckMacValue = await paymentMac(fields, config.key, config.iv);
    return json({ action: paymentUrl, fields });
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return json({ error: '資料格式不正確。' }, 400);
    return json({ error: '目前無法處理付款，請稍後再試。' }, 502);
  }
}
