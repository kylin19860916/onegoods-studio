import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const catalog = sqliteTable('catalog', {
 id:text('id').primaryKey(), kind:text('kind').notNull(), status:text('status').notNull(),
 data:text('data').notNull(), revision:integer('revision').notNull().default(1), updatedAt:text('updated_at').notNull(),
});
export const assets = sqliteTable('catalog_assets', {
 id:text('id').primaryKey(), kind:text('kind').notNull(), name:text('name').notNull(), mime:text('mime').notNull(),
 size:integer('size').notNull(), createdAt:text('created_at').notNull(),
});
