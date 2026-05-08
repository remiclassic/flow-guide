/**
 * CLI: converts legacy markdown/HTML lesson bodies into native BlockNote JSON.
 *
 * Usage:
 *   pnpm run migrate:blocknote-lessons -- --course glow-flow-method --dry-run
 *   pnpm run migrate:blocknote-lessons -- --course glow-flow-method --lesson lesson-01
 *   pnpm run migrate:blocknote-lessons -- --all --force
 */

import 'dotenv/config';

import { readFile } from 'fs/promises';
import path from 'path';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { courseModules, courses, lessons, type Lesson } from '@/lib/db/schema';
import { GLOW_FLOW_COURSE_SLUG } from '@/lib/courses/curriculum';
import { extractLegacyLessonFromHtml } from '@/lib/courses/legacy-html-extract';
import { lessonBlocksHaveContent } from '@/lib/courses/blocknote-content';
import { lessonToBlockNoteBlocks } from '@/lib/courses/legacy-to-blocknote';

type Args = {
  all: boolean;
  courseSlug: string | null;
  lessonKey: string | null;
  dryRun: boolean;
  force: boolean;
};

type MigrationResult = {
  courseSlug: string;
  lessonKey: string;
  legacyPath: string | null;
  status: 'migrated' | 'dry_run' | 'skipped' | 'missing_file' | 'empty' | 'error';
  blockCount: number;
  message?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    all: false,
    courseSlug: null,
    lessonKey: null,
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') args.all = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--course') args.courseSlug = argv[++i] ?? null;
    else if (arg === '--lesson') args.lessonKey = argv[++i] ?? null;
    else if (!arg?.startsWith('--') && !args.courseSlug) args.courseSlug = arg ?? null;
  }

  if (!args.all && !args.courseSlug) {
    args.courseSlug = GLOW_FLOW_COURSE_SLUG;
  }

  return args;
}

async function readLegacyExtract(lesson: Lesson) {
  const legacyPath = lesson.legacyHtmlPath?.trim();
  if (!legacyPath) return { extracted: null, missingFile: false };

  const abs = path.join(process.cwd(), 'public', 'legacy', 'course', legacyPath);
  try {
    const html = await readFile(abs, 'utf8');
    return { extracted: extractLegacyLessonFromHtml(html), missingFile: false };
  } catch {
    return { extracted: null, missingFile: true };
  }
}

async function listTargetRows(args: Args) {
  const whereParts = [
    isNull(courses.deletedAt),
    isNull(courseModules.deletedAt),
    isNull(lessons.deletedAt),
  ];

  if (!args.all && args.courseSlug) {
    whereParts.push(eq(courses.slug, args.courseSlug));
  }
  if (args.lessonKey) {
    whereParts.push(eq(lessons.lessonKey, args.lessonKey));
  }

  return db
    .select({ course: courses, module: courseModules, lesson: lessons })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(and(...whereParts))
    .orderBy(asc(courses.slug), asc(courseModules.sortOrder), asc(lessons.sortOrder));
}

async function ensureBlockNoteColumns() {
  await db.execute(sql`
    ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "draft_body_blocks" jsonb
  `);
  await db.execute(sql`
    ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "published_body_blocks" jsonb
  `);
  await db.execute(sql`
    ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "knowledge_quiz_json" jsonb
  `);
}

async function migrateLesson(
  row: Awaited<ReturnType<typeof listTargetRows>>[number],
  args: Args
): Promise<MigrationResult> {
  const { course, lesson } = row;
  const legacyPath = lesson.legacyHtmlPath?.trim() || null;

  if (!args.force && lessonBlocksHaveContent(lesson.publishedBodyBlocks)) {
    return {
      courseSlug: course.slug,
      lessonKey: lesson.lessonKey,
      legacyPath,
      status: 'skipped',
      blockCount: lesson.publishedBodyBlocks?.length ?? 0,
      message: 'Already has published BlockNote content (use --force to overwrite)',
    };
  }

  const { extracted, missingFile } = await readLegacyExtract(lesson);
  if (missingFile && !lesson.publishedBodyMarkdown?.trim() && !lesson.draftBodyMarkdown?.trim()) {
    return {
      courseSlug: course.slug,
      lessonKey: lesson.lessonKey,
      legacyPath,
      status: 'missing_file',
      blockCount: 0,
      message: `Missing public/legacy/course/${legacyPath}`,
    };
  }

  const blocks = lessonToBlockNoteBlocks({ lesson, extracted });
  if (!lessonBlocksHaveContent(blocks)) {
    return {
      courseSlug: course.slug,
      lessonKey: lesson.lessonKey,
      legacyPath,
      status: 'empty',
      blockCount: 0,
      message: 'No markdown or extractable legacy HTML content',
    };
  }

  if (args.dryRun) {
    return {
      courseSlug: course.slug,
      lessonKey: lesson.lessonKey,
      legacyPath,
      status: 'dry_run',
      blockCount: blocks.length,
      message:
        'Would write blocks' +
        (extracted?.knowledgeQuiz?.items.length &&
        (args.force || lesson.knowledgeQuizJson == null)
          ? ' + knowledge_quiz_json'
          : ''),
    };
  }

  const quizPatch =
    extracted?.knowledgeQuiz?.items.length &&
    (args.force || lesson.knowledgeQuizJson == null)
      ? extracted.knowledgeQuiz
      : undefined;

  await db
    .update(lessons)
    .set({
      draftBodyBlocks: blocks,
      publishedBodyBlocks: blocks,
      lessonPublishedAt: lesson.lessonPublishedAt ?? new Date(),
      ...(quizPatch !== undefined ? { knowledgeQuizJson: quizPatch } : {}),
    })
    .where(eq(lessons.id, lesson.id));

  return {
    courseSlug: course.slug,
    lessonKey: lesson.lessonKey,
    legacyPath,
    status: 'migrated',
    blockCount: blocks.length,
  };
}

function printReport(results: MigrationResult[], args: Args) {
  console.log(
    `BlockNote migration — course=${args.all ? 'all' : args.courseSlug} lesson=${args.lessonKey ?? 'all'} dryRun=${args.dryRun} force=${args.force}`
  );

  for (const row of results) {
    const tag =
      row.status === 'migrated'
        ? '✓'
        : row.status === 'dry_run'
          ? '◇'
          : row.status === 'skipped'
            ? '○'
            : row.status === 'empty'
              ? '!'
              : row.status === 'missing_file'
                ? '!'
                : '×';

    console.log(
      `${tag} ${row.courseSlug}/${row.lessonKey}` +
        (row.legacyPath ? ` ← ${row.legacyPath}` : '') +
        ` — ${row.status} (${row.blockCount} blocks)` +
        (row.message ? ` — ${row.message}` : '')
    );
  }

  const counts = results.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Done. ${JSON.stringify(counts)}`);

  const manual = results.filter(
    (row) => row.status === 'missing_file' || row.status === 'empty' || row.status === 'error'
  );
  if (manual.length > 0) {
    console.log('Manual cleanup recommended:');
    for (const row of manual) {
      console.log(`- ${row.courseSlug}/${row.lessonKey}: ${row.message ?? row.status}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await ensureBlockNoteColumns();
  const rows = await listTargetRows(args);

  if (rows.length === 0) {
    console.error('No matching lessons found.');
    process.exit(1);
  }

  const results: MigrationResult[] = [];
  for (const row of rows) {
    try {
      results.push(await migrateLesson(row, args));
    } catch (error) {
      results.push({
        courseSlug: row.course.slug,
        lessonKey: row.lesson.lessonKey,
        legacyPath: row.lesson.legacyHtmlPath?.trim() || null,
        status: 'error',
        blockCount: 0,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  printReport(results, args);
  const failed = results.some((row) => row.status === 'error' || row.status === 'missing_file');
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
