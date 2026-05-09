import { redirectLocalized } from '@/lib/i18n/redirect-localized';

/** Alias for the AI coach shell; canonical route remains `/dashboard/coach`. */
export default async function DashboardAiCoachAliasPage() {
  await redirectLocalized({ href: '/dashboard/coach' });
}
