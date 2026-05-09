const MAX_SLUG = 120;

export function slugifyTitle(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG);
  return s || 'course';
}

export function slugifyLessonKey(input: string): string {
  return slugifyTitle(input).replace(/-/g, '-').slice(0, MAX_SLUG);
}
