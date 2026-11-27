import { validPickupName } from './pickup-names';
import { validHomeAddress } from './taiwan-address';
import { timingSafeEqual } from 'node:crypto';
import { HttpError, json } from './catalog';
import { quoteConnectedClicker } from '../src/clicker-test-pricing.js';
import { keyringFonts } from '../src/keyring-font-picker.js';
import { nameClickerContours, parseKeyringFont } from './keyring-geometry.mjs';
import { livePickupReady, readLivePickupStore } from './checkout-delivery-preview';

type Env = Cloudflare.Env & {
  OGS_ECPAY_PAYMENT_ENABLED?: string;
  OGS_ECPAY_PAYMENT_MERCHANT_ID?: string;
  OGS_ECPAY_PAYMENT_HASH_KEY?: string;
  OGS_ECPAY_PAYMENT_HASH_IV?: string;
  OGS_STORE_HOME_SHIPPING_FEE?: string;
  OGS_PUBLIC_PICKUP_ENABLED?: string;
  ASSETS?: Fetcher;
};
type Fields = Record<string, string>;
type Order = {
  id: string; request_id: string; snapshot: string; amount: number;
  created_at: string; payment_reference: string | null;
};
const origin = 'https://onegoods.studio';
const paymentUrl = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
const prefix = '/api/store-payment';
const pickupShipping = 60;
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

async function priceOrder(db: D1Database, productId: string, quantity: number, shipping: number, pickup = false) {
  const row = await db.prepare("SELECT data FROM catalog WHERE id=? AND kind='physical' AND status='published'")
    .bind(productId).first<{ data: string }>();
  const item = row && JSON.parse(row.data);
  if (!item || item.isPlaceholder || item.saleStatus !== 'available' || !Number.isSafeInteger(item.price) || item.price <= 0) {
    throw new HttpError(409, '這件商品目前無法在官網下單。');
  }
  const subtotal = item.price * quantity;
  if (pickup && subtotal > 20000) throw new HttpError(400, '超商取貨的單筆商品金額上限為 NT$20,000，請調整數量或改選宅配。');
  const amount = subtotal + shipping;
  if (!Number.isSafeInteger(amount) || amount > 200000) throw new HttpError(400, '訂單超過單筆付款上限，請調整數量。');
  return { name: item.name, quantity, subtotal, shipping, amount };
}

const clickerColors = new Set(['#a087c1', '#fffcf5', '#f2c879', '#393142', '#b8d6bd', '#efb39e']);
function priceClicker(input: unknown, shipping: number) {
  const design = input as { text?: string; font?: string; colors?: { border?: string; fill?: string; ink?: string } } | null;
  const quote = quoteConnectedClicker(design?.text);
  const font = design?.font;
  const { border, fill, ink } = design?.colors ?? {};
  if (!quote || typeof font !== 'string' || !Object.hasOwn(keyringFonts, font) ||
      ![border, fill, ink].every(color => typeof color === 'string' && clickerColors.has(color))) {
    throw new HttpError(400, '請確認客製文字、字型及配色。');
  }
  return {
    name: '連字按壓款', quantity: 1, subtotal: quote.amount, shipping, amount: quote.amount + shipping,
    design: { text: quote.text, font: font as keyof typeof keyringFonts, colors: { border, fill, ink } },
  };
}

async function verifyClickerDesign(env: Env, url: URL, design: ReturnType<typeof priceClicker>['design']) {
  const asset = await env.ASSETS?.fetch(new Request(new URL('/assets/fonts/keyring/' + keyringFonts[design.font], url)));
  if (!asset?.ok) throw new HttpError(503, '目前無法驗證客製字型，請稍後再試。');
  const font = parseKeyringFont(new Uint8Array(await asset.arrayBuffer()));
  if ([...design.text].some(character => character !== ' ' && !font.charToGlyphIndex(character))) {
    throw new HttpError(400, '目前字型缺少這些文字，請更換字型或調整文字。');
  }
  try { nameClickerContours(font, design.text); }
  catch (error) {
    throw new HttpError(400, error instanceof Error ? error.message : '無法生成完整上蓋，請調整文字或字型。');
  }
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
  const pickupEnabled = enabled && env.OGS_PUBLIC_PICKUP_ENABLED === 'true' && livePickupReady(env);
  if (action === '/config' && request.method === 'GET') {
    return json({ enabled, customClickerEnabled: enabled && Boolean(env.ASSETS), shipping: fee, pickupEnabled, pickupShipping: pickupEnabled ? pickupShipping : null });
  }
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
    if (!['/checkout', '/quote'].includes(action) || request.method !== 'POST') return json({}, 404);
    if (request.headers.get('Origin') !== url.origin || !request.headers.get('Content-Type')?.startsWith('application/json')) return json({}, 403);
    if (!enabled || !config || fee === null) return json({ error: '官網付款準備中，請稍後再試。' }, 503);
    const raw = await request.text();
    if (raw.length > 4096) return json({}, 413);
    const body = JSON.parse(raw);
    const requestId = cap(body.requestId, 36);
    const productId = cap(body.productId, 80);
    const quantity = body.quantity;
    const custom = body.kind === 'custom';
    if ((custom ? quantity !== 1 || productId !== 'connected-name-clicker' : !/^[a-z0-9][a-z0-9-]{0,79}$/.test(productId)) ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 99 ||
        ![undefined, 'home', 'pickup'].includes(body.method)) throw new HttpError(400, '請確認商品、數量及配送方式。');
    const isPickup = body.method === 'pickup';
    const store = isPickup && pickupEnabled ? await readLivePickupStore(db, request, body.storeToken) : null;
    if (isPickup && !store) throw new HttpError(400, '請重新選擇 7-ELEVEN 取貨門市。');
    const shipping = store ? pickupShipping : fee;
    const clicker = custom ? priceClicker(body.design, shipping) : null;
    if (action === '/quote') {
      if (clicker) {
        await verifyClickerDesign(env, url, clicker.design);
        return json({ name: clicker.name, quantity, subtotal: clicker.subtotal, shipping, amount: clicker.amount });
      }
      return json(await priceOrder(db, productId, quantity, shipping, isPickup));
    }
    const address = { city: cap(body.city, 12), district: cap(body.district, 16), postalCode: cap(body.postalCode, 6), street: cap(body.street, 100), unit: cap(body.unit, 35) };
    const contact = cap(body.contact, 40);
    const phone = cap(body.phone, 20);
    const email = cap(body.email, 100);
    if (!requestIdPattern.test(requestId) || !contact || !/^[+\d() -]{8,20}$/.test(phone) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (store ? !validPickupName(contact) || !/^09\d{8}$/.test(phone) : !address.street || !validHomeAddress(address.city, address.district, address.postalCode))) {
      throw new HttpError(400, store ? '請填寫與證件相符的收件姓名（中文 2–5 字或英文 4–10 字元）、台灣手機號碼及電子郵件。' : '請確認聯絡資料與台灣本島配送地址。');
    }
    const details = { productId, quantity, ...(clicker ? { kind: 'custom', design: clicker.design } : {}), delivery: store
      ? { method: 'store', contact, phone, email, store }
      : { contact, phone, email, address } };
    const requestSnapshot = JSON.stringify(details);
    const lookup = db.prepare('SELECT * FROM store_orders WHERE request_id=?').bind(requestId);
    let order = await lookup.first<Order>();
    if (!order) {
      const { name, subtotal, amount } = clicker ?? await priceOrder(db, productId, quantity, shipping, isPickup);
      if (clicker) await verifyClickerDesign(env, url, clicker.design);
      if (body.total !== amount) throw new HttpError(409, '商品或運費金額已變更，請重新整理後確認。');
      const snapshot = JSON.stringify({ ...details, name, subtotal, shipping, requestSnapshot });
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
      ItemName: itemName + (snapshot.delivery.store ? '#7-ELEVEN 超商取貨' : '#黑貓宅配'), ReturnURL: url.origin + prefix + '/notify',
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
