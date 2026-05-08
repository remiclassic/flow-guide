CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"storage_bucket" varchar(120) NOT NULL,
	"storage_key" text NOT NULL,
	"public_url" text NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"byte_size" integer NOT NULL,
	"kind" varchar(30) NOT NULL,
	"original_filename" varchar(512),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" varchar(30) DEFAULT 'upload' NOT NULL,
	"uploaded_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_public_id_uidx" ON "media_assets" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_bucket_key_uidx" ON "media_assets" USING btree ("storage_bucket","storage_key");--> statement-breakpoint
CREATE INDEX "media_assets_uploaded_by_idx" ON "media_assets" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE INDEX "media_assets_created_at_active_idx" ON "media_assets" USING btree ("created_at" DESC) WHERE "deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assets" ADD COLUMN "media_asset_id" integer;--> statement-breakpoint
ALTER TABLE "course_assets" ADD COLUMN "uploaded_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "course_assets" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "course_assets" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "course_assets_media_asset_id_idx" ON "course_assets" USING btree ("media_asset_id");--> statement-breakpoint
ALTER TABLE "course_assets" ADD CONSTRAINT "course_assets_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assets" ADD CONSTRAINT "course_assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD COLUMN "media_asset_id" integer;--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD COLUMN "uploaded_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "lesson_assets_media_asset_id_idx" ON "lesson_assets" USING btree ("media_asset_id");--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD CONSTRAINT "lesson_assets_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_assets" ADD CONSTRAINT "lesson_assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
