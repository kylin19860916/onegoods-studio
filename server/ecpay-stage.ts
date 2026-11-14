import { HttpError } from './catalog';

const merchant = '3002607';
const checkoutUrl = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
const queryUrl = 'https://payment-stage.ecpay.com.tw/Cashier/QueryTradeInfo/V5';
const returnPath = '/api/clicker-orders/test/ecpay-return/';
type Fields = Record<string, string>;
type Order = { id: string; amount: number; created_at: string };

export function ecpayStageReturnUrl(env: Cloudflare.Env) {
  const input = env.OGS_ECPAY_STAGE_RETURN_URL;
  if (!input) return null;
  const url = URL.parse(input);
  if (!url || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      !new RegExp('^' + returnPath + '[a-f0-9]{32}$').test(url.pathname)) return null;
  return url;
}

export function isEcpayStageCallback(path: string) {
  return path.startsWith(returnPath);
}

function merchantTradeNo(id: string) {
  return id.startsWith('OGS-DEMO-') ? 'OGSD' + id.slice('OGS-DEMO-'.length) : 'OGSE' + id.slice('OGS-E-'.length);
}

export async function stageCheckMac(fields: Fields) {
  const pairs = Object.entries(fields)
    .filter(([key]) => key !== 'CheckMacValue')
    .sort(([a], [b]) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0);
  const input = 'HashKey=pwFHCqoQZGmho4w6&' + pairs.map(([key, value]) => key + '=' + value).join('&') + '&HashIV=EkRm7iFT261dpevs';
  const encoded = encodeURIComponent(input).replace(/%20/g, '+').replace(/'/g, '%27').replace(/~/g, '%7E').toLowerCase();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(encoded));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export async function ecpayStageCheckout(order: Order, callback: URL, siteOrigin: string, productName?: string) {
  const date = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date(order.created_at)).replaceAll('-', '/');
  const fields: Fields = {
    MerchantID: merchant, MerchantTradeNo: merchantTradeNo(order.id), MerchantTradeDate: date,
    PaymentType: 'aio', TotalAmount: String(order.amount), TradeDesc: 'OGS stage test',
    ItemName: 'OGS 測試・' + (productName || '連字按壓款').replaceAll('#', ' ').slice(0, 80), ReturnURL: callback.href, ChoosePayment: 'Credit',
    EncryptType: '1', CustomField1: order.id,
  };
  if (siteOrigin === callback.origin) {
    const back = productName ? '/admin#orders/' + order.id : '/admin?clicker-order=' + order.id + '#clicker-orders';
    fields.ClientBackURL = new URL(back, siteOrigin).href;
  }
  fields.CheckMacValue = await stageCheckMac(fields);
  const inputs = Object.entries(fields).map(([name, value]) =>
    '<input type="hidden" name="' + name + '" value="' + escapeAttribute(value) + '">').join('');
  const nonce = crypto.randomUUID();
  return new Response(`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>前往綠界測試付款 · OGS</title><link rel="stylesheet" href="/style.css">
    <main class="section nameplate-page"><h1>前往綠界測試付款</h1>
    <p>客製編號 ${order.id} · NT$${order.amount} · 測試環境</p>
    <form method="post" action="${checkoutUrl}">${inputs}<button class="button yellow">前往綠界測試付款</button></form></main>
    <script nonce="${nonce}">document.forms[0].submit()</script></html>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex', 'Content-Security-Policy': "default-src 'none'; style-src 'self'; script-src 'nonce-" + nonce + "'; form-action https://payment-stage.ecpay.com.tw",
    },
  });
}

function readFields(body: string) {
  const fields: Fields = Object.create(null);
  for (const [key, value] of new URLSearchParams(body)) {
    if (Object.hasOwn(fields, key)) throw new HttpError(400, 'Invalid ECPay fields');
    fields[key] = value;
  }
  return fields;
}

export async function readEcpayStageResult(request: Request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) throw new HttpError(415, 'Invalid ECPay request');
  const body = await request.text();
  if (body.length > 8192) throw new HttpError(413, 'Invalid ECPay request');
  const fields = readFields(body);
  const match = /^OGS([ED])([A-F0-9]{12})$/.exec(fields.MerchantTradeNo);
  const id = match && (match[1] === 'D' ? 'OGS-DEMO-' : 'OGS-E-') + match[2];
  if (!id || fields.CustomField1 !== id || fields.MerchantID !== merchant || fields.CheckMacValue !== await stageCheckMac(fields)) {
    throw new HttpError(400, 'Invalid ECPay callback');
  }
  return { id, fields };
}

export async function verifyEcpayStageTrade(order: Order, fields: Fields) {
  const query: Fields = {
    MerchantID: merchant, MerchantTradeNo: merchantTradeNo(order.id),
    TimeStamp: String(Math.floor(Date.now() / 1000)),
  };
  query.CheckMacValue = await stageCheckMac(query);
  const response = await fetch(queryUrl, {
    method: 'POST', body: new URLSearchParams(query), redirect: 'manual', signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new HttpError(502, 'ECPay order verification unavailable');
  const result = readFields(await response.text());
  if (result.CheckMacValue !== await stageCheckMac(result) || result.CustomField1 !== order.id ||
      result.MerchantID !== merchant || result.MerchantTradeNo !== query.MerchantTradeNo ||
      result.TradeStatus !== '1' || result.TradeAmt !== String(order.amount) || result.TradeNo !== fields.TradeNo) {
    throw new HttpError(409, 'ECPay order not yet verified');
  }
}
