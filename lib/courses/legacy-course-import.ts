import 'server-only';

import { readFile } from 'fs/promises';
import path from 'path';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { lessons } from '@/lib/db/schema';
import type { Lesson } from '@/lib/db/schema';
import { extractLegacyLessonFromHtml } from '@/lib/courses/legacy-html-extract';
import {
  getAdminCourseBySlug,
  getCourseOutlineForAdmin,
} from '@/lib/db/queries-admin';

import type {
  LegacyCourseImportSummary,
  LegacyImportLessonResult,
} from '@/lib/courses/legacy-import-types';

function isEmpty(v: string | null | undefined): boolean {
  return v == null || String(v).trim() === '';
}

function shouldFill(force: boolean, current: string | null | undefined): boolean {
  return force || isEmpty(current);
}

export async function runLegacyCourseImport(options: {
  courseSlug: string;
  force: boolean;
}): Promise<LegacyCourseImportSummary> {
  const course = await getAdminCourseBySlug(options.courseSlug);
  if (!course) {
    return {
      ok: false,
      courseSlug: options.courseSlug,
      results: [],
      logLines: [`Course not found: ${options.courseSlug}`],
    };
  }

  const outline = await getCourseOutlineForAdmin(course.id);
  const results: LegacyImportLessonResult[] = [];
  const logLines: string[] = [
    `Legacy import — ${course.slug} — force=${options.force}`,
  ];

  for (const mod of outline) {
    for (const lesson of mod.lessons) {
      const row = await importOneLesson(lesson, options.force);
      results.push(row);
      const tag =
        row.status === 'updated'
          ? '✓'
          : row.status === 'skipped'
            ? '○'
            : row.status === 'missing_file'
              ? '!'
              : '×';
      logLines.push(
        `${tag} ${row.lessonKey}${row.legacyPath ? ` ← ${row.legacyPath}` : ''}` +
          (row.appliedFields.length ? ` [${row.appliedFields.join(', ')}]` : '') +
          (row.message ? ` — ${row.message}` : '')
      );
    }
  }

  const updated = results.filter((r) => r.status === 'updated').length;
  const errs = results.filter((r) => r.status === 'error' || r.status === 'missing_file').length;
  logLines.push(`Done. Updated: ${updated}. Issues: ${errs}.`);

  return {
    ok: true,
    courseSlug: course.slug,
    results,
    logLines,
  };
}

async function importOneLesson(
  lesson: Lesson,
  force: boolean
): Promise<LegacyImportLessonResult> {
  const base: LegacyImportLessonResult = {
    lessonKey: lesson.lessonKey,
    legacyPath: lesson.legacyHtmlPath?.trim() ?? null,
    status: 'skipped',
    appliedFields: [],
  };

  const legacyPath = lesson.legacyHtmlPath?.trim();
  if (!legacyPath) {
    return {
      ...base,
      status: 'skipped',
      message: 'No legacy_html_path',
    };
  }

  const abs = path.join(process.cwd(), 'public', 'legacy', 'course', legacyPath);

  let html: string;
  try {
    html = await readFile(abs, 'utf8');
  } catch {
    return {
      ...base,
      status: 'missing_file',
      message: `Missing file: public/legacy/course/${legacyPath}`,
    };
  }

  try {
    const ex = extractLegacyLessonFromHtml(html);
    const patch: Partial<Lesson> = {};
    const applied: string[] = [];

    const takeString = (
      field: keyof Lesson,
      value: string | null | undefined,
      label: string
    ) => {
      if (!value?.trim()) return;
      if (!shouldFill(force, lesson[field] as string | null)) return;
      (patch as Record<string, unknown>)[field] = value.trim();
      applied.push(label);
    };

    takeString('summaryEn', ex.summaryEn, 'summaryEn');
    takeString('summaryEs', ex.summaryEs, 'summaryEs');
    takeString('reflectionPromptEn', ex.reflectionPromptEn, 'reflectionPromptEn');
    takeString('reflectionPromptEs', ex.reflectionPromptEs, 'reflectionPromptEs');
    takeString('actionStepsEn', ex.actionStepsEn, 'actionStepsEn');
    takeString('actionStepsEs', ex.actionStepsEs, 'actionStepsEs');

    if (
      ex.knowledgeQuiz &&
      ex.knowledgeQuiz.items.length > 0 &&
      (force || lesson.knowledgeQuizJson == null)
    ) {
      patch.knowledgeQuizJson = ex.knowledgeQuiz;
      applied.push('knowledgeQuizJson');
    }

    if (
      ex.estimatedMinutes != null &&
      (force || lesson.estimatedMinutes == null)
    ) {
      patch.estimatedMinutes = ex.estimatedMinutes;
      applied.push('estimatedMinutes');
    }

    const body = ex.bodyMarkdownEn?.trim();
    if (body && shouldFill(force, lesson.publishedBodyMarkdown)) {
      patch.publishedBodyMarkdown = body;
      patch.draftBodyMarkdown = body;
      patch.lessonPublishedAt = new Date();
      applied.push('publishedBodyMarkdown', 'draftBodyMarkdown', 'lessonPublishedAt');
    }

    if (force) {
      if (ex.titleEnFromHtml?.trim()) {
        patch.titleEn = ex.titleEnFromHtml.trim();
        applied.push('titleEn');
      }
      if (ex.titleEsFromHtml?.trim()) {
        patch.titleEs = ex.titleEsFromHtml.trim();
        applied.push('titleEs');
      }
    }

    const uniqueApplied = [...new Set(applied)];

    if (Object.keys(patch).length === 0) {
      return {
        ...base,
        status: 'skipped',
        message: 'All target fields already populated (use force to overwrite)',
        appliedFields: [],
      };
    }

    await db.update(lessons).set(patch).where(eq(lessons.id, lesson.id));

    return {
      ...base,
      status: 'updated',
      appliedFields: uniqueApplied,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ...base,
      status: 'error',
      message: msg,
    };
  }
}
