ALTER TABLE `lets_order_users` RENAME COLUMN `email` TO `display_email`;--> statement-breakpoint
ALTER TABLE lets_order_users ADD `primary_email` text;--> statement-breakpoint
ALTER TABLE lets_order_users ADD `first_name` text;--> statement-breakpoint
ALTER TABLE lets_order_users ADD `last_name` text;--> statement-breakpoint
CREATE UNIQUE INDEX `clerk_id_index` ON `lets_order_users` (`clerk_id`);--> statement-breakpoint
CREATE INDEX `search_index` ON `lets_order_users` (`display_name`,`display_email`,`primary_email`,`first_name`,`last_name`);