CREATE TABLE `hero_translations` (
	`locale` text PRIMARY KEY NOT NULL,
	`headline` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
