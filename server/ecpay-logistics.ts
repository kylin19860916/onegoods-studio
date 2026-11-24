import { createHash, timingSafeEqual } from 'node:crypto';

export const logisticsCallbackPath = '/api/logistics/ecpay/notify';

type Env = Cloudflare.Env & {
  OGS_ECPAY_LOGISTICS_MERCHANT_ID?: string;
  OGS_ECPAY_LOGISTICS_HASH_KEY?: string;
  OGS_ECPAY_LOGISTICS_HASH_IV?: string;
  OGS_ECPAY_LOGISTICS_RETURN_URL?: string;
};

const serviceTypes = new Map([
  ['UNIMARTC2C', 'CVS'], ['FAMIC2C', 'CVS'], ['HILIFEC2C', 'CVS'], ['TCAT', 'HOME'],
]);

export function logisticsMac(fields: URLSearchParams, key: string, iv: string) {
  const sorted = [...fields].filter(([name]) => name !== 'CheckMacValue')
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase(), 'en'));
  const source = 'HashKey=' + key + '&' + sorted.map(([name, value]) => name + '=' + value).join('&') + '&HashIV=' + iv;
  const encoded = encodeURIComponent(source).replace(/%20/g, '+').replace(/'/g, '%27').replace(/~/g, '%7E').toLowerCase();
  return createHash('md5').update(encoded).digest('hex').toUpperCase();
}

export async function receiveLogisticsNotice(request: Request, env: Env) {
  const reply = (message: string, status: number) => new Response(message, {
    status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
  if (request.method !== 'POST') return reply('Method not allowed', 405);
  const merchant = env.OGS_ECPAY_LOGISTICS_MERCHANT_ID;
  const key = env.OGS_ECPAY_LOGISTICS_HASH_KEY;
  const iv = env.OGS_ECPAY_LOGISTICS_HASH_IV;
  const callback = URL.parse(env.OGS_ECPAY_LOGISTICS_RETURN_URL ?? '');
  if (!merchant || !key || !iv || !env.DB || callback?.href !== 'https://onegoods.studio' + logisticsCallbackPath) {
    return reply('Logistics callback is not configured', 503);
  }
  if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) {
    return reply('Unsupported content type', 415);
  }
  const reader = request.body?.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';
  if (reader) {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return reply('Payload too large', 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  }
  const fields = new URLSearchParams(body);
  if (new Set(fields.keys()).size !== [...fields.keys()].length) return reply('Duplicate fields', 400);
  const mac = fields.get('CheckMacValue') ?? '';
  if (!/^[A-F0-9]{32}$/.test(mac) || fields.get('MerchantID') !== merchant ||
      !timingSafeEqual(Buffer.from(mac), Buffer.from(logisticsMac(fields, key, iv)))) {
    return reply('Invalid logistics signature', 400);
  }
  const trade = fields.get('MerchantTradeNo') ?? '';
  const logisticsId = fields.get('AllPayLogisticsID') ?? '';
  const subtype = fields.get('LogisticsSubType') ?? '';
  const type = serviceTypes.get(subtype);
  const code = fields.get('RtnCode') ?? '';
  if (!/^[A-Za-z0-9]{1,20}$/.test(trade) || !/^\d{1,20}$/.test(logisticsId) || !type ||
      fields.get('LogisticsType') !== type || !/^\d{1,8}$/.test(code)) {
    return reply('Invalid logistics fields', 400);
  }

  const matched = await env.DB.prepare(
    'SELECT trade_no FROM logistics_shipments WHERE trade_no=? AND logistics_id=? AND subtype=?'
  ).bind(trade, logisticsId, subtype).first();
  if (!matched) return reply('Shipment not found', 404);
  const fingerprint = createHash('sha256').update(trade + ':' + mac).digest('hex');
  await env.DB.prepare(
    'INSERT INTO logistics_notifications (id, trade_no, status_code, received_at) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO NOTHING'
  ).bind(fingerprint, trade, code, new Date().toISOString()).run();
  return reply('1|OK', 200);
}
