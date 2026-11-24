CREATE TABLE `store_pickup_shipments` (
	`order_id` text PRIMARY KEY NOT NULL,
	`trade_no` text NOT NULL,
	`logistics_id` text,
	`store_id` text NOT NULL,
	`goods_amount` integer NOT NULL,
	`status` text NOT NULL,
	`attempted_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `store_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_pickup_shipments_trade_no_unique` ON `store_pickup_shipments` (`trade_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_pickup_shipments_logistics_id_unique` ON `store_pickup_shipments` (`logistics_id`);