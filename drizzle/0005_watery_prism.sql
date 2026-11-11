CREATE TABLE `skill_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skill_category_skills` (
	`category_id` integer NOT NULL,
	`skill_id` integer NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`category_id`, `skill_id`),
	FOREIGN KEY (`category_id`) REFERENCES `skill_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_category_translations` (
	`category_id` integer NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`category_id`, `locale`),
	FOREIGN KEY (`category_id`) REFERENCES `skill_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skills_name_nocase` ON `skills` (lower("name"));