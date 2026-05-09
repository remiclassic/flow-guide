/**
 * CLI: imports legacy HTML lesson files into Course Studio fields for a course.
 * Usage:
 *   pnpm run import:legacy-course [courseSlug] [--force]
 * Example:
 *   pnpm run import:legacy-course glow-flow-method
 */

import 'dotenv/config';

import { GLOW_FLOW_COURSE_SLUG } from '@/lib/courses/curriculum';
import { runLegacyCourseImport } from '@/lib/courses/legacy-course-import';

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--force');
  const force = process.argv.includes('--force');
  const slug = args[0]?.trim() || GLOW_FLOW_COURSE_SLUG;

  const summary = await runLegacyCourseImport({ courseSlug: slug, force });
  console.log(summary.logLines.join('\n'));
  process.exit(summary.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
