import stageLabelImages from './ecpay-stage-label-images.json';
import { isCheckoutTestHost, isLocalCheckoutTest } from './checkout-test-host';
import { createHash } from 'node:crypto';
import { HttpError, isAdmin, json } from './catalog';

const origin = 'https://logistics-stage.ecpay.com.tw';
const merchant = '2000933';
const carriers: Record<string, string> = { '7-ELEVEN': 'UNIMARTC2C', 全家: 'FAMIC2C', 萊爾富: 'HILIFEC2C' };
const root = '/api/checkout-logistics-preview/';
const noticePath = (env: Env) => 'notice/' + new URL(env.OGS_ECPAY_STAGE_RETURN_URL!).pathname.split('/').pop();
type Fields = Record<string, string>;
type Env = Cloudflare.Env & { OGS_ECPAY_LOGISTICS_STAGE_RETURN_URL?: string };
type Delivery = {
  method: 'store' | 'home'; contact: string; phone: string;
  store?: { carrier: string; id: string; name?: string; address?: string }; address?: { city: string; district: string; postalCode: string; street: string; unit: string };
};
type Receipt = { subtotal: number; delivery?: Delivery };
type Shipment = { order_id: string; trade_no: string; subtype: string; logistics_id: string | null; status: string | null; notice: string | null };

// Public sandbox credentials from ECPay's logistics integration guide.
export function logisticsStageMac(fields: Fields) {
  const query = Object.keys(fields).filter(k => k !== 'CheckMacValue').sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase(), 'en')).map(k => k + '=' + fields[k]).join('&');
  const value = encodeURIComponent('HashKey=XBERn1YOvpM9nfZc&' + query + '&HashIV=h1ONHk4P4yqbl5LK')
    .replace(/%20/g, '+').replace(/'/g, '%27').replace(/~/g, '%7E').toLowerCase();
  return createHash('md5').update(value).digest('hex').toUpperCase();
}

function parseSigned(raw: string) {
  const fields: Fields = Object.create(null);
  for (const [key, value] of new URLSearchParams(raw)) {
    if (Object.hasOwn(fields, key)) throw new HttpError(400, '綠界物流回傳欄位重複。');
    fields[key] = value;
  }
  if (fields.MerchantID !== merchant || fields.CheckMacValue !== logisticsStageMac(fields)) {
    throw new HttpError(400, '綠界物流回傳檢查碼不符。');
  }
  return fields;
}

async function post(path: string, fields: Fields) {
  fields.CheckMacValue = logisticsStageMac(fields);
  const response = await fetch(origin + path, {
    method: 'POST', body: new URLSearchParams(fields), redirect: 'manual', signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new HttpError(502, '綠界物流測試暫時無法連線。');
  return (await response.text()).trim();
}

function requireMatching(row: Shipment, fields: Fields) {
  if (fields.MerchantTradeNo !== row.trade_no || !/^\d{1,20}$/.test(fields.AllPayLogisticsID || '') ||
      (fields.LogisticsSubType && fields.LogisticsSubType !== row.subtype) ||
      (fields.LogisticsType?.includes('_') && !fields.LogisticsType.endsWith('_' + row.subtype)) ||
      (row.logistics_id && fields.AllPayLogisticsID !== row.logistics_id)) {
    throw new HttpError(409, '綠界物流回傳與原訂單不符。');
  }
}

const sevenSubtype = 'UNIMARTC2C';
// Stage only: 300 means ECPay received the order and it is awaiting handoff.
const waitingForHandoff = '300';

async function queryShipment(row: Shipment) {
  const result = await post('/Helper/QueryLogisticsTradeInfo/V5', {
    MerchantID: merchant, MerchantTradeNo: row.trade_no, TimeStamp: String(Math.floor(Date.now()/1000)),
  });
  const fields = parseSigned(result);
  requireMatching(row, fields);
  return fields;
}

function shippingCode(fields: Fields) {
  const { CVSPaymentNo: number, CVSValidationNo: validation } = fields;
  if (!/^[A-Z0-9]{8}$/i.test(number ?? '') || !/^\d{4}$/.test(validation ?? '')) {
    throw new HttpError(502, '綠界尚未提供有效的 12 碼交貨便代碼。');
  }
  return number + validation;
}

function printFields(shipments: Fields[]) {
  const fields: Fields = { MerchantID: merchant, PrintMode: '1' };
  for (const field of ['AllPayLogisticsID', 'CVSPaymentNo', 'CVSValidationNo']) {
    fields[field] = shipments.map(shipment => shipment[field]).join(',');
  }
  return {
    action: origin + '/Express/PrintUniMartC2COrderInfo',
    fields: { ...fields, CheckMacValue: logisticsStageMac(fields) },
  };
}

function escapeHtml(value: unknown) {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

async function printableStageLabels(shipments: Fields[]) {
  const { fields } = printFields(shipments);
  const html = await post('/Express/PrintUniMartC2COrderInfo', fields);
  if (!html.includes('內部測試') || [...html.matchAll(/id="[^"]+_lblRecvshop1"/g)].length !== shipments.length) {
    throw new HttpError(502, '綠界回傳的測試面單數量與待寄件清單不符。');
  }
  const images = new Map<string, string>();
  for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
    if (images.has(src)) continue;
    const imageUrl = new URL(src, origin);
    if (imageUrl.origin !== origin || !imageUrl.pathname.startsWith('/Content/Images/PrintUniMartC2COrderInfo/')) {
      throw new HttpError(502, '測試面單圖片來源無效。');
    }
    const asset = (stageLabelImages as Record<string, string>)[imageUrl.pathname.split('/').at(-1) ?? ''];
    if (!asset || imageUrl.search || imageUrl.hash) throw new HttpError(502, '無法辨識綠界測試條碼圖片。');
    images.set(src, 'data:image/png;base64,' + asset);
  }
  if (!images.size) throw new HttpError(502, '綠界測試面單缺少條碼圖片。');
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/(<img\b[^>]*\bsrc=")([^"]+)"/gi, (_, start, src) => start + images.get(src) + '"')
    .replace(/<head>/i, `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">`);
  return new Response(markup, { headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Disposition': 'attachment; filename="ogs-stage-label-source.html"',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'Cache-Control': 'no-store',
  } });
}

async function pendingSevenShipments(db: D1Database) {
  const result = await db.prepare(`
    SELECT s.*, p.receipt
    FROM checkout_preview_shipments s
    JOIN checkout_preview_orders p ON json_extract(p.receipt,'$.id') = s.order_id
    LEFT JOIN clicker_orders c ON c.request_id = p.request_id
    WHERE s.subtype = ? AND s.logistics_id IS NOT NULL AND s.status = ?
      AND (p.status = 'success' OR c.matched_reference IS NOT NULL)
    ORDER BY json_extract(p.receipt,'$.createdAt') DESC
    LIMIT 101
  `).bind(sevenSubtype, waitingForHandoff).all<Shipment & { receipt: string }>();
  if (result.results.length > 100) throw new HttpError(409, '測試物流單超過 100 筆，請先處理既有寄件單。');
  const pending: Array<{ row: Shipment; store: NonNullable<Delivery['store']>; fields: Fields; code: string }> = [];
  for (const row of result.results) {
    const store = (JSON.parse(row.receipt) as Receipt).delivery?.store;
    if (store?.carrier !== '7-ELEVEN' || !/^\d{6}$/.test(store.id)) {
      throw new HttpError(409, '訂單 ' + row.order_id + ' 缺少 7-ELEVEN 取貨門市。');
    }
    const fields = await queryShipment(row);
    if (fields.LogisticsStatus !== waitingForHandoff) continue;
    pending.push({ row, store, fields, code: shippingCode(fields) });
  }
  if (!pending.length) throw new HttpError(404, '目前沒有已建單、待交寄的 7-ELEVEN 測試單。');
  return pending;
}

export async function logisticsPreview(request: Request, env: Env, user: Parameters<typeof isAdmin>[0]) {
  const url = new URL(request.url);
  if (!isCheckoutTestHost(url)) return json({}, 404);
  const db = env.DB!;
  const path = url.pathname.slice(root.length);
  try {
    const local = isLocalCheckoutTest(url);
    const callbackPath = local ? 'notice' : env.OGS_ECPAY_STAGE_RETURN_URL ? noticePath(env) : null;
    if (path === callbackPath && request.method === 'POST') {
      const raw = await request.text();
      if (raw.length > 8192) throw new HttpError(413, '回傳資料過長。');
      const fields = parseSigned(raw);
      const row = await db.prepare('SELECT * FROM checkout_preview_shipments WHERE trade_no=?')
        .bind(fields.MerchantTradeNo).first<Shipment>();
      if (!row) throw new HttpError(404, '找不到物流測試單。');
      requireMatching(row, fields);
      await db.prepare('UPDATE checkout_preview_shipments SET logistics_id=?, status=?, notice=? WHERE trade_no=?')
        .bind(fields.AllPayLogisticsID, fields.RtnCode, fields.RtnCode, row.trade_no).run();
      return new Response('1|OK');
    }
    if (!isAdmin(user, env)) return json({}, 403);
    if (request.method !== 'POST' || request.headers.get('Origin') !== url.origin) return json({}, 403);
    if (path === 'export-pending' || path === 'print-pending' || path === 'render-pending-labels') {
      const pending = await pendingSevenShipments(db);
      if (path === 'render-pending-labels') return await printableStageLabels(pending.map(item => item.fields));
      if (path === 'print-pending') return json(printFields(pending.map(item => item.fields)));
      const rows = pending.map(({ row, store, code }) =>
        `<tr><td>${escapeHtml(row.order_id)}</td><td>${escapeHtml(row.logistics_id)}</td><td>${escapeHtml(store.name)}（${escapeHtml(store.id)}）<br>${escapeHtml(store.address)}</td><td class="code">${escapeHtml(code)}</td></tr>`).join('');
      const html = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
      <title>OGS 7-ELEVEN 待寄件清單</title><style>body{font:16px system-ui,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}th,td{text-align:left;border:1px solid #aaa;padding:10px}tr{break-inside:avoid}.code{font:700 16px monospace;white-space:nowrap}</style>
      <h1>7-ELEVEN 待寄件清單</h1><p>測試資料 · 共 ${pending.length} 筆</p>
      <table><thead><tr><th>OGS 訂單</th><th>物流單號</th><th>原訂單取貨門市</th><th>交貨便代碼</th></tr></thead><tbody>${rows}</tbody></table></html>`;
      return new Response(html, { headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ogs-7eleven-pending-test.html"',
        'Cache-Control': 'no-store',
      } });
    }
    if (!['create', 'query', 'code', 'print'].includes(path)) return json({}, 404);
    const { id } = await request.json() as { id: string };
    if (!/^OGS-(?:[TE]|DEMO)-[A-F0-9]{12}$/.test(id)) return json({}, 400);
    let row = await db.prepare('SELECT * FROM checkout_preview_shipments WHERE order_id=?').bind(id).first<Shipment>();
    if (path === 'code' || path === 'print') {
      if (!row?.logistics_id || row.subtype !== sevenSubtype) throw new HttpError(404, '找不到這筆 7-ELEVEN 物流測試單。');
      const fields = await queryShipment(row);
      const code = shippingCode(fields);
      return json(path === 'code' ? { code } : printFields([fields]));
    }
    if (path === 'query') {
      if (!row) throw new HttpError(404, '請先建立物流測試單。');
      const fields = await queryShipment(row);
      await db.prepare('UPDATE checkout_preview_shipments SET logistics_id=?, status=COALESCE(notice,?) WHERE order_id=?')
        .bind(fields.AllPayLogisticsID, fields.LogisticsStatus, id).run();
    } else if (!row) {
      const callback = local ? env.OGS_ECPAY_LOGISTICS_STAGE_RETURN_URL : callbackPath && url.origin + root + callbackPath;
      if (!callback?.startsWith('https://')) throw new HttpError(503, '綠界測試回傳網址尚未設定。');
      const order = await db.prepare(`SELECT p.receipt, p.status, c.matched_reference
        FROM checkout_preview_orders p LEFT JOIN clicker_orders c USING(request_id)
        WHERE json_extract(p.receipt,'$.id')=? AND json_extract(p.payload,'$.provider')='ecpay'`)
        .bind(id).first<{ receipt: string; status: string; matched_reference: string | null }>();
      if (!order || (id.startsWith('OGS-DEMO-') ? order.status !== 'success' || !JSON.parse(order.receipt).paymentReference : order.status !== 'success' && !order.matched_reference)) throw new HttpError(409, '請先完成測試付款。');
      const { delivery, subtotal } = JSON.parse(order.receipt) as Receipt;
      const subtype = delivery?.method === 'store' && delivery.store ? carriers[delivery.store.carrier] : delivery?.address ? 'TCAT' : null;
      if (!delivery || !subtype) throw new HttpError(400, '訂單缺少有效的配送資料。');
      const trade = 'OGSL' + id.replaceAll('-', '').slice(3);
      if(trade.length > 20) throw new HttpError(400,'測試交易編號過長。');
      const fields: Fields = {
        MerchantID: merchant, MerchantTradeNo: trade,
        MerchantTradeDate: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'medium' }).format(new Date()).replaceAll('-', '/'),
        LogisticsType: delivery.method === 'store' ? 'CVS' : 'HOME', LogisticsSubType: subtype,
        GoodsAmount: String(subtotal), GoodsName: 'OGS測試商品', IsCollection: 'N',
        SenderName: '測試寄件', SenderCellPhone: '0911111111',
        ReceiverName: delivery.contact, ReceiverCellPhone: delivery.phone, ServerReplyURL: callback,
      };
      if (delivery.store) fields.ReceiverStoreID = delivery.store.id;
      if (delivery.address) {
        const { city, district, postalCode, street, unit } = delivery.address;
        Object.assign(fields, {
          SenderZipCode: '115', SenderAddress: '台北市南港區三重路19號1樓',
          ReceiverZipCode: postalCode, ReceiverAddress: city + district + street + unit,
          Temperature: '0001', Specification: '0001', Distance: '00', ScheduledPickupTime: '4', ScheduledDeliveryTime: '4',
        });
      }
      const claimed = await db.prepare('INSERT INTO checkout_preview_shipments (order_id, trade_no, subtype) VALUES (?, ?, ?) ON CONFLICT DO NOTHING')
        .bind(id, trade, subtype).run();
      if (!claimed.meta.changes) throw new HttpError(409, '建單已送出，請查詢狀態。');
      const response = await post('/Express/Create', fields);
      if (!response.startsWith('1|')) {
        const code = response.match(/^0\|(\d+)/)?.[1];
        if (code) await db.prepare('DELETE FROM checkout_preview_shipments WHERE order_id=? AND logistics_id IS NULL').bind(id).run();
        throw new HttpError(502, '綠界測試建單失敗' + (code ? '（' + code + '）' : '，請先查詢建單結果。'));
      }
      const fieldsReturned = parseSigned(response.slice(2));
      requireMatching({ order_id: id, trade_no: trade, subtype, logistics_id: null, status: null, notice: null }, fieldsReturned);
      await db.prepare('UPDATE checkout_preview_shipments SET logistics_id=?, status=COALESCE(notice,?) WHERE order_id=?')
        .bind(fieldsReturned.AllPayLogisticsID, fieldsReturned.RtnCode, id).run();
    }
    row = await db.prepare('SELECT * FROM checkout_preview_shipments WHERE order_id=?').bind(id).first<Shipment>();
    return json(row);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error('Logistics stage preview failed', error instanceof Error ? error.message : '');
    return json({ error: '目前無法取得物流測試結果。' }, 502);
  }
}
