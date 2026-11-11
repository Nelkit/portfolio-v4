CREATE TABLE `career_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`start_year` integer NOT NULL,
	`start_month` integer NOT NULL,
	`end_year` integer,
	`end_month` integer
);
--> statement-breakpoint
CREATE TABLE `career_entry_translations` (
	`entry_id` integer NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	PRIMARY KEY(`entry_id`, `locale`),
	FOREIGN KEY (`entry_id`) REFERENCES `career_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
