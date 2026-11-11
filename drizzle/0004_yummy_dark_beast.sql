CREATE TABLE `expertise_area_translations` (
	`area_id` integer NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`area_id`, `locale`),
	FOREIGN KEY (`area_id`) REFERENCES `expertise_areas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expertise_areas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `area_id` integer REFERENCES expertise_areas(id);