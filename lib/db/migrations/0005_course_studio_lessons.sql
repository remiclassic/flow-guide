-- Lesson structured fields for Course Studio
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "summary_en" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "summary_es" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "reflection_prompt_en" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "reflection_prompt_es" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "action_steps_en" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "action_steps_es" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "estimated_minutes" integer;

-- Embed URLs for lesson_assets (upload rows keep storage_key + public_url)
ALTER TABLE "lesson_assets" ADD COLUMN IF NOT EXISTS "embed_url" text;
ALTER TABLE "lesson_assets" ALTER COLUMN "storage_key" DROP NOT NULL;
ALTER TABLE "lesson_assets" ALTER COLUMN "public_url" DROP NOT NULL;
