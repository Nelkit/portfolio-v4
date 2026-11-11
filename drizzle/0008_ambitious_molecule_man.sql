CREATE TABLE `education_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`start_year` integer NOT NULL,
	`start_month` integer NOT NULL,
	`end_year` integer,
	`end_month` integer,
	`in_progress` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `education_entry_translations` (
	`entry_id` integer NOT NULL,
	`locale` text NOT NULL,
	`degree` text NOT NULL,
	`institution` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	PRIMARY KEY(`entry_id`, `locale`),
	FOREIGN KEY (`entry_id`) REFERENCES `education_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
