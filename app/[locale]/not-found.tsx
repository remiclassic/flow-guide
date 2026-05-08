'use client';

import { Link } from '@/i18n/navigation';
import { CircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LocaleNotFound() {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <CircleIcon className="size-12 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {t('notFoundTitle')}
        </h1>
        <p className="text-base text-gray-500">{t('notFoundBody')}</p>
        <Link
          href="/"
          className="mx-auto flex max-w-48 justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
