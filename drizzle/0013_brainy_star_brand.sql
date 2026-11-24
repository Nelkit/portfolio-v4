PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`year` integer,
	`image_key` text,
	`area_id` integer NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`featured_order` integer DEFAULT 0 NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `expertise_areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Hand-edited (drizzle-kit selected the new columns from the old table, which do not exist there).
-- New columns start empty (year NULL, not featured). area_id becomes required: a project
-- without area gets the first area by position; reassign it in the admin afterwards.
INSERT INTO `__new_projects`("id", "slug", "company", "year", "image_key", "area_id", "featured", "featured_order", "position", "created_at", "updated_at") SELECT "id", "slug", "company", NULL, "image_key", COALESCE("area_id", (SELECT "id" FROM `expertise_areas` ORDER BY "position", "id" LIMIT 1)), 0, 0, "position", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
ALTER TABLE `project_translations` ADD `key_result` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_translations` ADD `role` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_translations` ADD `how_it_works` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_translations` ADD `results` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_translations` ADD `my_role` text DEFAULT '' NOT NULL;