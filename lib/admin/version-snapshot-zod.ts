import { z } from 'zod';
import { knowledgeQuizDataSchema } from '@/lib/courses/knowledge-quiz';
import type {
  CourseVersionSnapshotV1,
  LessonVersionSnapshotV1,
} from '@/lib/admin/lesson-version-snapshot';

const blockSchema: z.ZodType<Record<string, unknown>> = z.record(
  z.string(),
  z.unknown()
);

export const lessonVersionSnapshotV1Schema = z.object({
  v: z.literal(1),
  draftBodyMarkdown: z.string().nullable(),
  draftBodyBlocks: z.array(blockSchema).nullable(),
  knowledgeQuizJson: knowledgeQuizDataSchema.nullable(),
  titleEn: z.string(),
  titleEs: z.string(),
  summaryEn: z.string().nullable(),
  summaryEs: z.string().nullable(),
  reflectionPromptEn: z.string().nullable(),
  reflectionPromptEs: z.string().nullable(),
  actionStepsEn: z.string().nullable(),
  actionStepsEs: z.string().nullable(),
  estimatedMinutes: z.number().int().nullable(),
  legacyHtmlPath: z.string().nullable(),
}) satisfies z.ZodType<LessonVersionSnapshotV1>;

export const courseVersionSnapshotV1Schema = z.object({
  v: z.literal(1),
  title: z.string(),
  description: z.string().nullable(),
  heroImagePath: z.string().nullable(),
  primaryLocale: z.string(),
  accessMode: z.string(),
  previewModuleCount: z.number().int().nullable(),
  previewLessonCount: z.number().int().nullable(),
  previewEstMinutes: z.number().int().nullable(),
}) satisfies z.ZodType<CourseVersionSnapshotV1>;

export function parseLessonVersionSnapshot(
  raw: unknown
): LessonVersionSnapshotV1 | null {
  const r = lessonVersionSnapshotV1Schema.safeParse(raw);
  return r.success ? r.data : null;
}

export function parseCourseVersionSnapshot(
  raw: unknown
): CourseVersionSnapshotV1 | null {
  const r = courseVersionSnapshotV1Schema.safeParse(raw);
  return r.success ? r.data : null;
}
