ALTER TABLE "courses" ADD COLUMN "is_coming_soon" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "preview_module_count" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "preview_lesson_count" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "preview_est_minutes" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "hero_image_path" varchar(512);