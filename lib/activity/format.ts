import {
  CheckCircle,
  Lock,
  LogOut,
  Mail,
  Settings,
  UserCog,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';

export const activityIconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
};

export function formatActivityAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    default:
      return 'Unknown action occurred';
  }
}

export function activityShortLabel(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'Account created';
    case ActivityType.SIGN_IN:
      return 'Signed in';
    case ActivityType.SIGN_OUT:
      return 'Signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'Password updated';
    case ActivityType.DELETE_ACCOUNT:
      return 'Account deleted';
    case ActivityType.UPDATE_ACCOUNT:
      return 'Account updated';
    case ActivityType.CREATE_TEAM:
      return 'Team created';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'Member removed';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'Invite sent';
    case ActivityType.ACCEPT_INVITATION:
      return 'Invite accepted';
    default:
      return 'Activity';
  }
}

export function activityCategory(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
    case ActivityType.SIGN_IN:
    case ActivityType.SIGN_OUT:
      return 'Session';
    case ActivityType.UPDATE_PASSWORD:
    case ActivityType.UPDATE_ACCOUNT:
    case ActivityType.DELETE_ACCOUNT:
      return 'Account';
    case ActivityType.CREATE_TEAM:
    case ActivityType.REMOVE_TEAM_MEMBER:
    case ActivityType.INVITE_TEAM_MEMBER:
    case ActivityType.ACCEPT_INVITATION:
      return 'Team';
    default:
      return 'Activity';
  }
}

type ActivityTone = 'success' | 'info' | 'accent' | 'warning' | 'muted';

export function activityTone(action: ActivityType): ActivityTone {
  switch (action) {
    case ActivityType.SIGN_UP:
    case ActivityType.ACCEPT_INVITATION:
      return 'success';
    case ActivityType.SIGN_IN:
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'info';
    case ActivityType.CREATE_TEAM:
    case ActivityType.UPDATE_ACCOUNT:
      return 'accent';
    case ActivityType.UPDATE_PASSWORD:
      return 'warning';
    case ActivityType.SIGN_OUT:
    case ActivityType.REMOVE_TEAM_MEMBER:
    case ActivityType.DELETE_ACCOUNT:
    default:
      return 'muted';
  }
}

const TONE_CLASSES: Record<ActivityTone, string> = {
  success: 'bg-chart-4/15 text-chart-4',
  info: 'bg-stat-level/15 text-stat-level',
  accent: 'bg-primary/12 text-primary',
  warning: 'bg-stat-streak/15 text-stat-streak',
  muted: 'bg-muted text-muted-foreground',
};

export function activityToneClasses(action: ActivityType): string {
  return TONE_CLASSES[activityTone(action)];
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const m = Math.floor(diffInSeconds / 60);
    return `${m}m ago`;
  }
  if (diffInSeconds < 86400) {
    const h = Math.floor(diffInSeconds / 3600);
    return `${h}h ago`;
  }
  if (diffInSeconds < 604800) {
    const d = Math.floor(diffInSeconds / 86400);
    return `${d}d ago`;
  }
  return date.toLocaleDateString();
}

export function getRelativeTimeLong(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}
