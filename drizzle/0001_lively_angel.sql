CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_key` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "profile_singleton" CHECK("profile"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `profile_translations` (
	`locale` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`intro` text NOT NULL,
	`cv_key` text,
	`contact_available` text NOT NULL,
	`contact_headline` text NOT NULL,
	`contact_description` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`position` integer NOT NULL
);
