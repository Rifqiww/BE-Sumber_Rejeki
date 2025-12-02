CREATE TABLE `address` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`address` varchar(255) NOT NULL,
	`zip_code` int NOT NULL,
	`user_id` bigint NOT NULL,
	CONSTRAINT `address_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `category_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checkouts` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`address_id` bigint NOT NULL,
	`user_id` bigint NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `checkouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`checkout_id` bigint NOT NULL,
	`provider` varchar(50) NOT NULL,
	`method` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` varchar(20) NOT NULL,
	`transaction_id` varchar(100) NOT NULL,
	`paid_at` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_checkout` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`product_id` bigint NOT NULL,
	`checkouts_id` bigint NOT NULL,
	`quantity` int NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	CONSTRAINT `product_checkout_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`stock` int NOT NULL,
	`category_id` bigint NOT NULL,
	CONSTRAINT `product_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products_images` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`product_id` bigint NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`alt_image` varchar(255),
	CONSTRAINT `products_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`product_id` bigint NOT NULL,
	`user_id` bigint NOT NULL,
	`review` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_likes` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`product_id` bigint NOT NULL,
	CONSTRAINT `user_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `address` ADD CONSTRAINT `address_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkouts` ADD CONSTRAINT `checkouts_address_id_address_id_fk` FOREIGN KEY (`address_id`) REFERENCES `address`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkouts` ADD CONSTRAINT `checkouts_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_checkout_id_checkouts_id_fk` FOREIGN KEY (`checkout_id`) REFERENCES `checkouts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_checkout` ADD CONSTRAINT `product_checkout_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_checkout` ADD CONSTRAINT `product_checkout_checkouts_id_checkouts_id_fk` FOREIGN KEY (`checkouts_id`) REFERENCES `checkouts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product` ADD CONSTRAINT `product_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products_images` ADD CONSTRAINT `products_images_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_likes` ADD CONSTRAINT `user_likes_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_likes` ADD CONSTRAINT `user_likes_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;