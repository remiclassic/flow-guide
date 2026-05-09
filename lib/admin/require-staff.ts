import 'server-only';

import { getUser } from '@/lib/db/queries';
import { isCourseStaffRole } from '@/lib/db/schema';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';

/** CMS routes: owner, admin, or editor */
export async function requireCourseStaff() {
  const user = await getUser();
  if (!user) {
    return redirectLocalized({ href: '/sign-in' });
  }
  if (!isCourseStaffRole(user.role)) {
    return redirectLocalized({ href: '/dashboard' });
  }
  return user;
}

/** Billing / destructive ops — owners only */
export async function requireOwner() {
  const user = await getUser();
  if (!user) {
    return redirectLocalized({ href: '/sign-in' });
  }
  if (user.role !== 'owner') {
    return redirectLocalized({ href: '/dashboard' });
  }
  return user;
}
