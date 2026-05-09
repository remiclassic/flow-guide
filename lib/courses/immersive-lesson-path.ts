const LOCALES = new Set(['en', 'es']);

/** Strip `/en` or `/es` prefix so logic matches default routing. */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  if (LOCALES.has(parts[0] ?? '')) {
    return '/' + parts.slice(1).join('/');
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/**
 * Learner lesson viewer under the dashboard — immersive chrome (no global sidebar).
 * Matches `/dashboard/courses/[slug]/lessons/[lessonKey]`.
 */
export function isDashboardCourseLessonPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  const re = /^\/dashboard\/courses\/[^/]+\/lessons\/[^/]+/;
  return re.test(path);
}
