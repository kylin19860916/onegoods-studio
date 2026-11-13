CREATE TABLE `logistics_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`trade_no` text NOT NULL,
	`status_code` text NOT NULL,
	`received_at` text NOT NULL,
	FOREIGN KEY (`trade_no`) REFERENCES `logistics_shipments`(`trade_no`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logistics_shipments` (
	`trade_no` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`logistics_id` text NOT NULL,
	`subtype` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `logistics_shipments_logistics_id_unique` ON `logistics_shipments` (`logistics_id`);