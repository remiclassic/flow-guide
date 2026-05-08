ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_public_id_uidx" ON "courses" USING btree ("public_id");--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "lifecycle_status" varchar(20);--> statement-breakpoint
UPDATE "courses" SET "lifecycle_status" = CASE
  WHEN "is_coming_soon" IS TRUE THEN 'scheduled'
  WHEN "is_published" IS TRUE THEN 'published'
  ELSE 'draft'
END;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "lifecycle_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "lifecycle_status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "is_published";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "is_coming_soon";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "primary_locale" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "access_mode" varchar(30) DEFAULT 'subscription' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "course_modules" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "course_modules_public_id_uidx" ON "course_modules" USING btree ("public_id");--> statement-breakpoint
ALTER TABLE "course_modules" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_lesson_key_unique";--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_public_id_uidx" ON "lessons" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_module_lesson_key_uidx" ON "lessons" USING btree ("module_id","lesson_key");--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "draft_body_markdown" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "published_body_markdown" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "lesson_published_at" timestamp;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "legacy_html_path" DROP NOT NULL;--> statement-breakpoint
CREATE TABLE "course_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"course_id" integer NOT NULL,
	"kind" varchar(30) NOT NULL,
	"locale" varchar(10),
	"storage_key" text NOT NULL,
	"public_url" text NOT NULL,
	"mime_type" varchar(255),
	"byte_size" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "course_assets_public_id_uidx" ON "course_assets" USING btree ("public_id");--> statement-breakpoint
ALTER TABLE "course_assets" ADD CONSTRAINT "course_assets_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "lesson_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" integer NOT NULL,
	"kind" varchar(30) NOT NULL,
	"locale" varchar(10),
	"storage_key" text NOT NULL,
	"public_url" text NOT NULL,
	"mime_type" varchar(255),
	"byte_size" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_assets_public_id_uidx" ON "lesson_assets" USING btree ("public_id");--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD CONSTRAINT "lesson_assets_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
