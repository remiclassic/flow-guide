import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
  const path = locale === 'es' ? '/legal/privacidad' : '/legal/privacy';

  return {
    title: t('privacyTitle'),
    alternates: {
      canonical: `${base}/${locale}${path}`,
      languages: {
        es: `${base}/es/legal/privacidad`,
        en: `${base}/en/legal/privacy`,
        'x-default': `${base}/es/legal/privacidad`
      }
    }
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {t('privacyTitle')}
      </h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        {t('privacyLead')}
      </p>
    </main>
  );
}
