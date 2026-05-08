import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { GLOW_FLOW_COURSE_SLUG } from '@/lib/courses/curriculum';

/** Alias for the Glow Flow roadmap; URL segment stays English per product rules. */
export default async function DashboardRoadmapAliasPage() {
  await redirectLocalized({
    href: `/dashboard/courses/${GLOW_FLOW_COURSE_SLUG}`,
  });
}
