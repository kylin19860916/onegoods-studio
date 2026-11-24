import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const catalog = sqliteTable('catalog', {
 id:text('id').primaryKey(), kind:text('kind').notNull(), status:text('status').notNull(),
 data:text('data').notNull(), revision:integer('revision').notNull().default(1), updatedAt:text('updated_at').notNull(),
});
export const assets = sqliteTable('catalog_assets', {
 id:text('id').primaryKey(), kind:text('kind').notNull(), name:text('name').notNull(), mime:text('mime').notNull(),
 size:integer('size').notNull(), createdAt:text('created_at').notNull(),
});

// Stable management numbers are independent of public slugs and display order.
export const catalogCodes = sqliteTable('catalog_codes', {
 number:integer('number').primaryKey({autoIncrement:true}),
 productId:text('product_id').notNull().unique(),
});

export const catalogCategories = sqliteTable('catalog_categories', {
 id:text('id').primaryKey(), name:text('name').notNull(), nameEn:text('name_en').notNull().default(''), nameZhHans:text('name_zh_hans').notNull().default(''),
 sortOrder:integer('sort_order').notNull().default(0), active:integer('active').notNull().default(1), revision:integer('revision').notNull().default(1), updatedAt:text('updated_at').notNull(),
});

export const clickerOrders = sqliteTable('clicker_orders', {
 id: text('id').primaryKey(),
 requestId: text('request_id').notNull().unique(),
 design: text('design').notNull(),
 tier: text('tier').notNull(),
 amount: integer('amount').notNull(),
 createdAt: text('created_at').notNull(),
 mockReference: text('mock_reference').unique(),
 matchedReference: text('matched_reference').unique(),
 matchedAt: text('matched_at'),
});

export const logisticsShipments = sqliteTable('logistics_shipments', {
  tradeNo: text('trade_no').primaryKey().notNull(),
  orderId: text('order_id').notNull(),
  logisticsId: text('logistics_id').notNull().unique(),
  subtype: text('subtype').notNull(),
});

export const logisticsNotifications = sqliteTable('logistics_notifications', {
  id: text('id').primaryKey().notNull(),
  tradeNo: text('trade_no').notNull().references(() => logisticsShipments.tradeNo),
  statusCode: text('status_code').notNull(),
  receivedAt: text('received_at').notNull(),
});

export const checkoutPreviewOrders = sqliteTable('checkout_preview_orders', {
  requestId: text('request_id').primaryKey(),
  receipt: text('receipt').notNull(),
  payload: text('payload').notNull(),
  status: text('status').notNull().default('unpaid'),
});

export const checkoutPreviewStoreMaps = sqliteTable('checkout_preview_store_maps', {
  token: text('token').primaryKey(),
  carrier: text('carrier').notNull(),
  expiresAt: integer('expires_at').notNull(),
  result: text('result'),
});

export const checkoutPreviewShipments = sqliteTable('checkout_preview_shipments', {
  orderId: text('order_id').primaryKey(),
  tradeNo: text('trade_no').notNull().unique(),
  subtype: text('subtype').notNull(),
  logisticsId: text('logistics_id').unique(),
  status: text('status'),
  notice: text('notice'),
  auditJson: text('audit_json'),
});

export const storeOrders = sqliteTable('store_orders', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().unique(),
  snapshot: text('snapshot').notNull(),
  amount: integer('amount').notNull(),
  createdAt: text('created_at').notNull(),
  paymentReference: text('payment_reference').unique(),
  paidAt: text('paid_at'),
});

export const googlePlacesUsage = sqliteTable('google_places_usage', {
  bucket: text('bucket').primaryKey(),
  used: integer('used').notNull().default(0),
  expiresAt: integer('expires_at').notNull(),
});

export const storePickupShipments = sqliteTable('store_pickup_shipments', {
  orderId: text('order_id').primaryKey().notNull().references(() => storeOrders.id),
  tradeNo: text('trade_no').notNull().unique(),
  logisticsId: text('logistics_id').unique(),
  storeId: text('store_id').notNull(),
  goodsAmount: integer('goods_amount').notNull(),
  status: text('status').notNull(),
  attemptedAt: integer('attempted_at').notNull(),
});
