CREATE TABLE `lets-order_order_carts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clerk_id` text NOT NULL,
	`event_id` integer NOT NULL,
	`clerk_name` text,
	`clerk_email` text,
	`note` text,
	`payment_confirmation_at` integer,
	`payment_at` integer,
	`payment_status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `lets-order_order_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`clerk_id` text NOT NULL,
	`name` text NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	`payment_at` integer,
	`paymentStatus` text DEFAULT 'PENDING' NOT NULL,
	`ending_at` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `lets-order_order_event_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lets-order_order_items` (
	`cart_id` integer NOT NULL,
	`order_event_product_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	PRIMARY KEY(`cart_id`, `order_event_product_id`)
);
--> statement-breakpoint
CREATE TABLE `lets-order_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`clerk_id` text NOT NULL,
	`previous_version_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_unique` ON `lets-order_order_carts` (`clerk_id`,`event_id`);--> statement-breakpoint
CREATE INDEX `code_index` ON `lets-order_order_events` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `menu_unique` ON `lets-order_order_event_products` (`product_id`,`event_id`);