CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`service` text,
	`status` text DEFAULT 'new' NOT NULL,
	`appointment_at` text,
	`accepted_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
