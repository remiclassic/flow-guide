CREATE TABLE "lesson_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"version_note" varchar(500),
	"restore_source_version_id" integer
);
--> statement-breakpoint
CREATE INDEX "lesson_versions_lesson_id_idx" ON "lesson_versions" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_versions_lesson_created_idx" ON "lesson_versions" USING btree ("lesson_id","created_at" DESC);--> statement-breakpoint
ALTER TABLE "lesson_versions" ADD CONSTRAINT "lesson_versions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_versions" ADD CONSTRAINT "lesson_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_versions" ADD CONSTRAINT "lesson_versions_restore_source_version_id_lesson_versions_id_fk" FOREIGN KEY ("restore_source_version_id") REFERENCES "public"."lesson_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "course_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"version_note" varchar(500),
	"restore_source_version_id" integer
);
--> statement-breakpoint
CREATE INDEX "course_versions_course_id_idx" ON "course_versions" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_versions_course_created_idx" ON "course_versions" USING btree ("course_id","created_at" DESC);--> statement-breakpoint
ALTER TABLE "course_versions" ADD CONSTRAINT "course_versions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_versions" ADD CONSTRAINT "course_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_versions" ADD CONSTRAINT "course_versions_restore_source_version_id_course_versions_id_fk" FOREIGN KEY ("restore_source_version_id") REFERENCES "public"."course_versions"("id") ON DELETE set null ON UPDATE no action;
