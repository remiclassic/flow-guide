import { ActivityType } from '@/lib/db/schema';

/** next-intl `t` function slice used by activity formatting */
export type ActivityTranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string;

/** Pass `namespace: 'dashboard'` `t` wrapped as `(k,v) => t('activityLog.'+k, v)` or use `dashboardActivityLogT` below. */
export function formatActivityActionI18n(
  action: ActivityType,
  t: ActivityTranslateFn
): string {
  return t(`activityLog.actions.${action}`);
}

export function activityShortLabelI18n(
  action: ActivityType,
  t: ActivityTranslateFn
): string {
  return t(`activityLog.short.${action}`);
}

export function activityCategoryI18n(
  action: ActivityType,
  t: ActivityTranslateFn
): string {
  switch (action) {
    case ActivityType.SIGN_UP:
    case ActivityType.SIGN_IN:
    case ActivityType.SIGN_OUT:
      return t('activityLog.categories.session');
    case ActivityType.UPDATE_PASSWORD:
    case ActivityType.UPDATE_ACCOUNT:
    case ActivityType.DELETE_ACCOUNT:
      return t('activityLog.categories.account');
    case ActivityType.CREATE_TEAM:
    case ActivityType.REMOVE_TEAM_MEMBER:
    case ActivityType.INVITE_TEAM_MEMBER:
    case ActivityType.ACCEPT_INVITATION:
      return t('activityLog.categories.team');
    default:
      return t('activityLog.categories.activity');
  }
}

export function getRelativeTimeI18n(date: Date, t: ActivityTranslateFn): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return t('activityLog.relative.justNow');
  if (diffInSeconds < 3600) {
    const m = Math.floor(diffInSeconds / 60);
    return t('activityLog.relative.minutesShort', { count: m });
  }
  if (diffInSeconds < 86400) {
    const h = Math.floor(diffInSeconds / 3600);
    return t('activityLog.relative.hoursShort', { count: h });
  }
  if (diffInSeconds < 604800) {
    const d = Math.floor(diffInSeconds / 86400);
    return t('activityLog.relative.daysShort', { count: d });
  }
  return date.toLocaleDateString();
}

export function getRelativeTimeLongI18n(
  date: Date,
  t: ActivityTranslateFn
): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return t('activityLog.relative.justNow');
  if (diffInSeconds < 3600) {
    return t('activityLog.relative.minutesLong', {
      count: Math.floor(diffInSeconds / 60),
    });
  }
  if (diffInSeconds < 86400) {
    return t('activityLog.relative.hoursLong', {
      count: Math.floor(diffInSeconds / 3600),
    });
  }
  if (diffInSeconds < 604800) {
    return t('activityLog.relative.daysLong', {
      count: Math.floor(diffInSeconds / 86400),
    });
  }
  return date.toLocaleDateString();
}
