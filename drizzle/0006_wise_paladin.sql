CREATE TABLE `store_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`snapshot` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text NOT NULL,
	`payment_reference` text,
	`paid_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_orders_request_id_unique` ON `store_orders` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_orders_payment_reference_unique` ON `store_orders` (`payment_reference`);