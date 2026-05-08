import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'publicCourses' });
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

  return {
    title: `${t('title')} · Flow Guide`,
    description: t('intro'),
    alternates: {
      canonical: `${base}/${locale}${locale === 'es' ? '/cursos' : '/courses'}`,
      languages: {
        es: `${base}/es/cursos`,
        en: `${base}/en/courses`,
        'x-default': `${base}/es/cursos`
      }
    }
  };
}

export default async function PublicCoursesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'publicCourses' });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-border bg-card/85 p-8 shadow-card-soft backdrop-blur-md sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
          <BookOpen className="size-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t('intro')}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">{t('note')}</p>
        <Button asChild className="mt-8 rounded-full btn-gradient-primary shadow-card-soft">
          <NextLink href="/dashboard/courses">
            {t('browseLibrary')}
            <BookOpen className="ml-2 size-4" />
          </NextLink>
        </Button>
      </div>
    </main>
  );
}
