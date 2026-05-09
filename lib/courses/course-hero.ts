import { COMING_SOON_CATALOG } from '@/lib/courses/curriculum';

/** Static catalog hero used when `courses.hero_image_path` is null (legacy parity). */
export function catalogHeroPathForSlug(slug: string): string | null {
  const entry = COMING_SOON_CATALOG.find((c) => c.slug === slug);
  const p = entry?.heroImagePath?.trim();
  return p || null;
}

/**
 * Learner-facing cover URL: DB value wins; otherwise catalog default for known slugs.
 * Canonical stored value remains `courses.hero_image_path` in the database.
 */
export function resolveCourseHeroImagePath(
  slug: string,
  dbHero: string | null | undefined
): string | null {
  const db = dbHero?.trim();
  if (db) return db;
  return catalogHeroPathForSlug(slug);
}

export function isCatalogFallbackHero(
  slug: string,
  dbHero: string | null | undefined
): boolean {
  return !dbHero?.trim() && Boolean(catalogHeroPathForSlug(slug));
}
