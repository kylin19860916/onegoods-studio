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
