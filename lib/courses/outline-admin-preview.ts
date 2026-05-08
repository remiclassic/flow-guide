/** Removes modules with zero lessons (outline already excludes soft-deletes). */
export function filterOutlineForAdminPreview<
  T extends { lessons: readonly unknown[] },
>(outline: readonly T[]): T[] {
  return outline.filter((m) => m.lessons.length > 0);
}
