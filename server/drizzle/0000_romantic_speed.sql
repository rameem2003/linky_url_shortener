CREATE TABLE `links` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`link` varchar(50) NOT NULL,
	`shortCode` varchar(50) NOT NULL,
	CONSTRAINT `links_id` PRIMARY KEY(`id`),
	CONSTRAINT `links_shortCode_unique` UNIQUE(`shortCode`)
);
