import { redirectLocalized } from '@/lib/i18n/redirect-localized';

export default async function SettingsAliasPage() {
  return redirectLocalized({ href: '/dashboard/general' });
}
