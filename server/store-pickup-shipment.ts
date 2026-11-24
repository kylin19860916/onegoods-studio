import { timingSafeEqual } from 'node:crypto';
import { HttpError, isAdmin, json } from './catalog';
import { logisticsCallbackPath, logisticsMac } from './ecpay-logistics';
import { validPickupName } from './pickup-names';

const root = '/api/admin/store-pickup-shipment/';
const shop = 'https://onegoods.studio';
const provider = 'https://logistics.ecpay.com.tw';
const subtype = 'UNIMARTC2C';

type Env = Cloudflare.Env & {
  OGS_LIVE_PICKUP_FULFILLMENT_ENABLED?: string;
  OGS_LIVE_PICKUP_FULFILLMENT_ORDER_ID?: string;
  OGS_ECPAY_LOGISTICS_MERCHANT_ID?: string;
  OGS_ECPAY_LOGISTICS_HASH_KEY?: string;
  OGS_ECPAY_LOGISTICS_HASH_IV?: string;
  OGS_ECPAY_LOGISTICS_RETURN_URL?: string;
};
type Fields = Record<string, string>;
type Credentials = { merchant: string; key: string; iv: string };
type Shipment = {
  order_id: string; trade_no: string; logistics_id: string | null;
  store_id: string; goods_amount: number; status: string; attempted_at: number;
};
type Order = {
  snapshot: string; payment_reference: string | null; created_at: string;
};

function credentials(env: Env): Credentials | null {
  const merchant = env.OGS_ECPAY_LOGISTICS_MERCHANT_ID?.trim() ?? '';
  const key = env.OGS_ECPAY_LOGISTICS_HASH_KEY?.trim() ?? '';
  const iv = env.OGS_ECPAY_LOGISTICS_HASH_IV?.trim() ?? '';
  return /^\d{7,10}$/.test(merchant) && !['2000132', '2000933', '3002607'].includes(merchant) &&
    /^[A-Za-z0-9]{16}$/.test(key) && /^[A-Za-z0-9]{16}$/.test(iv) &&
    env.OGS_ECPAY_LOGISTICS_RETURN_URL === shop + logisticsCallbackPath ? { merchant, key, iv } : null;
}

export function canCreateLivePickup(env: Env, orderId: string) {
  const restrictedOrder = env.OGS_LIVE_PICKUP_FULFILLMENT_ORDER_ID?.trim();
  const allowed = restrictedOrder
    ? /^OGS-P-[A-F0-9]{12}$/.test(restrictedOrder) && restrictedOrder === orderId
    : env.OGS_LIVE_PICKUP_FULFILLMENT_ENABLED === 'true';
  return allowed && Boolean(credentials(env));
}

async function callProvider(config: Credentials, path: string, fields: Fields) {
  const params = new URLSearchParams({ ...fields, MerchantID: config.merchant });
  params.set('CheckMacValue', logisticsMac(params, config.key, config.iv));
  const response = await fetch(provider + path, {
    method: 'POST', body: params, redirect: 'error', signal: AbortSignal.timeout(15000),
  });
  const body = (await response.text()).trim();
  if (!response.ok && !body.startsWith('0|')) throw new HttpError(502, '綠界暫時無法連線，請先查詢原單。');
  return body;
}

function verifyProvider(raw: string, shipment: Shipment, config: Credentials) {
  const params = new URLSearchParams(raw);
  const fields = Object.fromEntries(params);
  const mac = fields.CheckMacValue || '';
  const matchedType = fields.LogisticsSubType === subtype || fields.LogisticsType === 'CVS_' + subtype;
  if (params.size !== Object.keys(fields).length || fields.MerchantID !== config.merchant ||
      !/^[A-F0-9]{32}$/.test(mac) ||
      !timingSafeEqual(Buffer.from(mac), Buffer.from(logisticsMac(params, config.key, config.iv))) ||
      !matchedType || fields.MerchantTradeNo !== shipment.trade_no ||
      !/^\d{1,20}$/.test(fields.AllPayLogisticsID ?? '') ||
      (shipment.logistics_id && fields.AllPayLogisticsID !== shipment.logistics_id) ||
      fields.GoodsAmount !== String(shipment.goods_amount) ||
      (fields.ReceiverStoreID && fields.ReceiverStoreID !== shipment.store_id) ||
      (fields.CollectionAmount && fields.CollectionAmount !== '0')) {
    throw new HttpError(502, '綠界回傳無法與原訂單核對，請先查詢。');
  }
  return fields;
}

async function recordResult(db: D1Database, shipment: Shipment, fields: Fields, status: string) {
  if (!/^\d{1,8}$/.test(status)) throw new HttpError(502, '綠界物流狀態無效。');
  const [current] = await db.batch([
    db.prepare(`UPDATE store_pickup_shipments SET logistics_id=?, status=?
      WHERE order_id=? AND (logistics_id IS NULL OR logistics_id=?)`)
      .bind(fields.AllPayLogisticsID, status, shipment.order_id, fields.AllPayLogisticsID),
    db.prepare(`INSERT INTO logistics_shipments (trade_no,order_id,logistics_id,subtype)
      SELECT trade_no,order_id,logistics_id,? FROM store_pickup_shipments WHERE order_id=? AND logistics_id=?
      ON CONFLICT(trade_no) DO NOTHING`).bind(subtype, shipment.order_id, fields.AllPayLogisticsID),
  ]);
  if (!current.meta.changes) throw new HttpError(409, '物流單號與已保存資料不符。');
}

export async function storePickupShipment(request: Request, env: Env, user: Parameters<typeof isAdmin>[0]) {
  if (!isAdmin(user, env)) return json({}, 403);
  const url = new URL(request.url);
  if (url.origin !== shop || request.method !== 'POST' || request.headers.get('Origin') !== shop ||
      !request.headers.get('Content-Type')?.startsWith('application/json')) return json({}, 403);
  const action = url.pathname.slice(root.length);
  if (!['create', 'query', 'print', 'code'].includes(action)) return json({}, 404);
  const config = credentials(env), db = env.DB;
  if (!db || !config) return json({ error: '正式物流設定尚未完成。' }, 503);

  try {
    const body = await request.text();
    if (body.length > 4096) return json({}, 413);
    const { id, senderName, senderPhone, confirmed } = JSON.parse(body);
    if (typeof id !== 'string' || !/^OGS-P-[A-F0-9]{12}$/.test(id)) return json({}, 400);
    const order = await db.prepare('SELECT snapshot, payment_reference, created_at FROM store_orders WHERE id=?')
      .bind(id).first<Order>();
    const details = order && JSON.parse(order.snapshot);
    const delivery = details?.delivery;
    if (!order?.payment_reference || delivery?.method !== 'store' || delivery.store?.carrier !== '7-ELEVEN' ||
        !/^\d{6}$/.test(delivery.store.id)) {
      throw new HttpError(409, '僅能為已付款且已保存 7-ELEVEN 門市的商品訂單建單。');
    }
    const lookup = db.prepare('SELECT * FROM store_pickup_shipments WHERE order_id=?').bind(id);
    let shipment = await lookup.first<Shipment>();

    if (action === 'create') {
      if (!canCreateLivePickup(env, id)) throw new HttpError(503, '正式寄件單尚未啟用。');
      if (confirmed !== true) throw new HttpError(400, '請確認建立正式物流單。');
      if (shipment && shipment.status !== 'retryable') {
        throw new HttpError(409, '本單已送出建單請求，請先查詢原單。');
      }
      if (!validPickupName(senderName) || !/^09\d{8}$/.test(senderPhone ?? '')) {
        throw new HttpError(400, '請填寫符合證件的寄件人姓名及台灣手機號碼。');
      }
      if (!validPickupName(delivery.contact) || !/^09\d{8}$/.test(delivery.phone) ||
          !Number.isSafeInteger(details.subtotal) || details.subtotal < 1 || details.subtotal > 20000) {
        throw new HttpError(409, '原訂單收件資料或商品金額不符合交貨便建單規格。');
      }
      const trade = 'OGSPCVS' + id.slice(-12);
      const attemptedAt = Date.now();
      const claim = await db.prepare(`INSERT INTO store_pickup_shipments
        (order_id,trade_no,store_id,goods_amount,status,attempted_at) VALUES (?,?,?,?,'creating',?)
        ON CONFLICT(order_id) DO UPDATE SET status='creating',attempted_at=excluded.attempted_at
        WHERE status='retryable' AND logistics_id IS NULL AND store_id=excluded.store_id AND goods_amount=excluded.goods_amount`)
        .bind(id, trade, delivery.store.id, details.subtotal, attemptedAt).run();
      if (!claim.meta.changes) throw new HttpError(409, '已有建單請求，請先查詢。');
      shipment = await lookup.first<Shipment>();
      const goodsName = [...String(details.name ?? '').replace(/[^\p{L}\p{N} .-]/gu, '')].slice(0, 25).join('').trim() || 'OGS 商品';
      try {
        const result = await callProvider(config, '/Express/Create', {
          MerchantTradeNo: trade,
          MerchantTradeDate: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'medium' })
            .format(new Date(order.created_at)).replaceAll('-', '/'),
          LogisticsType: 'CVS', LogisticsSubType: subtype, GoodsAmount: String(details.subtotal),
          GoodsName: goodsName, IsCollection: 'N', SenderName: senderName.trim(), SenderCellPhone: senderPhone,
          ReceiverName: delivery.contact.trim(), ReceiverCellPhone: delivery.phone,
          ReceiverStoreID: delivery.store.id, ServerReplyURL: shop + logisticsCallbackPath,
        });
        if (result.startsWith('0|')) {
          await db.prepare("UPDATE store_pickup_shipments SET status='create_failed' WHERE order_id=? AND logistics_id IS NULL").bind(id).run();
          const code = /^0\|(\d{4,12})/.exec(result)?.[1];
          throw new HttpError(502, '綠界拒絕建單' + (code ? '（' + code + '）' : '') + '，請查詢原單後再處理。');
        }
        if (!result.startsWith('1|') || !shipment) throw new Error('Unrecognized response');
        const fields = verifyProvider(result.slice(2), shipment, config);
        await recordResult(db, shipment, fields, fields.RtnCode);
      } catch (error) {
        await db.prepare("UPDATE store_pickup_shipments SET status='create_unknown' WHERE order_id=? AND status='creating'")
          .bind(id).run();
        throw error;
      }
      return json(await lookup.first<Shipment>());
    }

    if (!shipment) throw new HttpError(404, '此訂單尚未建立 7-ELEVEN 寄件單。');
    const raw = await callProvider(config, '/Helper/QueryLogisticsTradeInfo/V5', {
      MerchantTradeNo: shipment.trade_no, TimeStamp: String(Math.floor(Date.now() / 1000)),
    });
    if (action === 'query' && raw === '0|找不到訂單' && !shipment.logistics_id &&
        Date.now() - shipment.attempted_at >= 45000) {
      await db.prepare("UPDATE store_pickup_shipments SET status='retryable' WHERE order_id=? AND logistics_id IS NULL AND attempted_at=?")
        .bind(id, shipment.attempted_at).run();
      return json(await lookup.first<Shipment>());
    }
    const fields = verifyProvider(raw, shipment, config);
    await recordResult(db, shipment, fields, fields.LogisticsStatus);
    if (action === 'query') return json(await lookup.first<Shipment>());
    const payment = fields.CVSPaymentNo, validation = fields.CVSValidationNo;
    if (!/^[A-Z0-9]{8}$/i.test(payment ?? '') || !/^\d{4}$/.test(validation ?? '')) {
      throw new HttpError(502, '綠界尚未提供完整交貨便代碼。');
    }
    if (action === 'code') return json({ code: payment + validation });
    const print = new URLSearchParams({
      MerchantID: config.merchant, AllPayLogisticsID: fields.AllPayLogisticsID,
      CVSPaymentNo: payment, CVSValidationNo: validation, PrintMode: '1',
    });
    print.set('CheckMacValue', logisticsMac(print, config.key, config.iv));
    return json({ action: provider + '/Express/PrintUniMartC2COrderInfo', fields: Object.fromEntries(print) });
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return json({ error: '請確認建單資料格式。' }, 400);
    return json({ error: '目前無法取得綠界物流結果，請先查詢原單。' }, 502);
  }
}
