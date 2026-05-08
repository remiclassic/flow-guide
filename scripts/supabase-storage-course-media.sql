-- Flow Guide: default Storage bucket for admin uploads (course covers + media).
-- Run in Supabase → SQL Editor (requires sufficient privileges).
--
-- Default bucket id: course-media (override with SUPABASE_MEDIA_BUCKET / SUPABASE_STORAGE_BUCKET).
-- Public = true so getPublicUrl() works for learner course cards without signed URLs.
--
-- If the bucket already exists (e.g. created private in the UI), either mark it public
-- in Storage → bucket → Configuration, or: update storage.buckets set public = true where id = 'course-media';

insert into storage.buckets (id, name, public)
values ('course-media', 'course-media', true)
on conflict (id) do nothing;
