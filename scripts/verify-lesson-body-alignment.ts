/**
 * Lists lessons where draft BlockNote exists but published blocks are empty,
 * or draft vs published BlockNote JSON differs (read-only).
 * Also reports lessons that use legacy-structured BlockNote block types
 * (flowOutcomes, flowKeyInsight, flowVignette, flowFramework, flowPullQuote, flowLessonExercise).
 *
 * Usage:
 *   pnpm run verify:lesson-body-alignment
 *   pnpm run verify:lesson-body-alignment -- --course glow-flow-method
 *   pnpm run verify:lesson-body-alignment -- --all
 */

import 'dotenv/config';

import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { courseModules, courses, lessons } from '@/lib/db/schema';
import { GLOW_FLOW_COURSE_SLUG } from '@/lib/courses/curriculum';
import {
  lessonDraftBlockNoteNotPublished,
  lessonPublishedBlocksDifferFromDraft,
} from '@/lib/admin/studio-lesson-state';
import { lessonBlocksContainBlockTypes } from '@/lib/courses/blocknote-content';

const LEGACY_STRUCTURED_BLOCK_TYPES = [
  'flowOutcomes',
  'flowKeyInsight',
  'flowVignette',
  'flowFramework',
  'flowPullQuote',
  'flowLessonExercise',
] as const;

type Args = { all: boolean; courseSlug: string | null };

function parseArgs(argv: string[]): Args {
  const args: Args = { all: false, courseSlug: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') args.all = true;
    else if (a === '--course') args.courseSlug = argv[++i] ?? null;
  }
  if (!args.all && !args.courseSlug) {
    args.courseSlug = GLOW_FLOW_COURSE_SLUG;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const whereParts = [
    isNull(courses.deletedAt),
    isNull(courseModules.deletedAt),
    isNull(lessons.deletedAt),
  ];
  if (!args.all && args.courseSlug) {
    whereParts.push(eq(courses.slug, args.courseSlug));
  }

  const rows = await db
    .select({
      courseSlug: courses.slug,
      lessonKey: lessons.lessonKey,
      draftBodyBlocks: lessons.draftBodyBlocks,
      publishedBodyBlocks: lessons.publishedBodyBlocks,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(and(...whereParts))
    .orderBy(asc(courses.slug), asc(courseModules.sortOrder), asc(lessons.sortOrder));

  const draftNotPublished: string[] = [];
  const blockDrift: string[] = [];
  const legacyStructured: string[] = [];

  for (const row of rows) {
    const lessonPick = {
      draftBodyBlocks: row.draftBodyBlocks,
      publishedBodyBlocks: row.publishedBodyBlocks,
    };
    if (lessonDraftBlockNoteNotPublished(lessonPick)) {
      draftNotPublished.push(`${row.courseSlug}\t${row.lessonKey}`);
    } else if (lessonPublishedBlocksDifferFromDraft(lessonPick)) {
      blockDrift.push(`${row.courseSlug}\t${row.lessonKey}`);
    }

    if (
      lessonBlocksContainBlockTypes(
        row.publishedBodyBlocks,
        [...LEGACY_STRUCTURED_BLOCK_TYPES]
      ) ||
      lessonBlocksContainBlockTypes(row.draftBodyBlocks, [
        ...LEGACY_STRUCTURED_BLOCK_TYPES,
      ])
    ) {
      legacyStructured.push(`${row.courseSlug}\t${row.lessonKey}`);
    }
  }

  console.log(
    `Checked ${rows.length} lesson(s)` +
      (args.all ? ' (all courses)' : ` (course: ${args.courseSlug ?? 'n/a'})`)
  );
  console.log('');

  if (draftNotPublished.length === 0) {
    console.log(
      'No lessons with draft BlockNote but empty published blocks.'
    );
  } else {
    console.log(
      'Draft BlockNote present; published blocks empty (learners use markdown/legacy):'
    );
    console.log('courseSlug\tlessonKey');
    for (const line of draftNotPublished) console.log(line);
  }

  console.log('');

  if (blockDrift.length === 0) {
    console.log('No lessons with published vs draft BlockNote drift.');
  } else {
    console.log('Published BlockNote differs from draft (publish to align learners):');
    console.log('courseSlug\tlessonKey');
    for (const line of blockDrift) console.log(line);
  }

  console.log('');
  console.log(
    `Lessons using legacy-structured BlockNote blocks (${LEGACY_STRUCTURED_BLOCK_TYPES.join(', ')}): ${legacyStructured.length}`
  );
  if (legacyStructured.length > 0) {
    console.log('courseSlug\tlessonKey');
    for (const line of legacyStructured) console.log(line);
  }
  console.log('');
  console.log(
    'Manual check: open /legacy/course/module-1/lesson-01.html vs the app lesson viewer after `pnpm run migrate:blocknote-lessons -- --force` to compare section patterns.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
