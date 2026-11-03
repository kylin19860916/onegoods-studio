CREATE TABLE `catalog_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_en` text DEFAULT '' NOT NULL,
	`name_zh_hans` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
