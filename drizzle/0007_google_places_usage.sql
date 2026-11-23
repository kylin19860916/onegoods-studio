CREATE TABLE `google_places_usage` (
  `bucket` text PRIMARY KEY NOT NULL,
  `used` integer DEFAULT 0 NOT NULL,
  `expires_at` integer NOT NULL
);
