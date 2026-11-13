CREATE TABLE `checkout_preview_orders` (
	`request_id` text PRIMARY KEY NOT NULL,
	`receipt` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkout_preview_shipments` (
	`order_id` text PRIMARY KEY NOT NULL,
	`trade_no` text NOT NULL,
	`subtype` text NOT NULL,
	`logistics_id` text,
	`status` text,
	`notice` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_preview_shipments_trade_no_unique` ON `checkout_preview_shipments` (`trade_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_preview_shipments_logistics_id_unique` ON `checkout_preview_shipments` (`logistics_id`);--> statement-breakpoint
CREATE TABLE `checkout_preview_store_maps` (
	`token` text PRIMARY KEY NOT NULL,
	`carrier` text NOT NULL,
	`expires_at` integer NOT NULL,
	`result` text
);
