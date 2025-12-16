ALTER TABLE `product` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `role` enum('admin','user') DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `product` ADD CONSTRAINT `product_slug_unique` UNIQUE(`slug`);