CREATE TABLE `catalog_codes` (
	`number` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_codes_product_id_unique` ON `catalog_codes` (`product_id`);