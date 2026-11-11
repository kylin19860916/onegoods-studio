CREATE TABLE `clicker_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`design` text NOT NULL,
	`tier` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text NOT NULL,
	`mock_reference` text,
	`matched_reference` text,
	`matched_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clicker_orders_request_id_unique` ON `clicker_orders` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `clicker_orders_mock_reference_unique` ON `clicker_orders` (`mock_reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `clicker_orders_matched_reference_unique` ON `clicker_orders` (`matched_reference`);