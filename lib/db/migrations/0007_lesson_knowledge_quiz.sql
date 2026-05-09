-- Multiple-choice "Check your understanding" quizzes (legacy knowledge-quiz + studio)
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "knowledge_quiz_json" jsonb;
