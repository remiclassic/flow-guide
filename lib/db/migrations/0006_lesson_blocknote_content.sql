-- Structured BlockNote content for Course Studio lessons.
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "draft_body_blocks" jsonb;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "published_body_blocks" jsonb;
