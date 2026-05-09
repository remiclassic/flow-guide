import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

  return {
    title: t('defaultTitle'),
    description: t('defaultDescription'),
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        es: `${base}/es`,
        en: `${base}/en`,
        'x-default': `${base}/es`
      }
    }
  };
}

export default async function MarketingHomePage({ params }: PageParams) {
  const { locale } = await params;
  const tHero = await getTranslations({ locale, namespace: 'hero' });
  const tHome = await getTranslations({ locale, namespace: 'home' });

  const heroStatItems = [
    { kind: 'metric' as const, value: tHero('statMinutes'), label: tHero('stats.rhythm') },
    { kind: 'metric' as const, value: tHero('statPaths'), label: tHero('stats.focus') },
    { kind: 'metric' as const, value: tHero('statScore'), label: tHero('stats.clarity') },
    {
      kind: 'trust' as const,
      title: tHero('trustCardTitle'),
      subtitle: tHero('trustCardSubtitle')
    }
  ];

  const trustBuiltTags = [
    tHome('trustBuiltTagCalm'),
    tHome('trustBuiltTagNoGuru'),
    tHome('trustBuiltTagPrivate'),
    tHome('trustBuiltTagProgress')
  ];

  const learningPaths = [
    {
      key: 'design' as const,
      image: '/courses/design-ideal-lifestyle-hero.png'
    },
    {
      key: 'mindset' as const,
      image: '/courses/mindset-habits-mastery-hero.png'
    },
    {
      key: 'glow' as const,
      image: '/brand/glow-flow-continue-hero.png'
    }
  ].map((path) => ({
    title: tHome(`paths.${path.key}.title`),
    body: tHome(`paths.${path.key}.body`),
    meta: tHome(`paths.${path.key}.meta`),
    image: path.image
  }));

  const experiencePillars = [
    {
      icon: Compass,
      title: tHome('pillars.paths.title'),
      body: tHome('pillars.paths.body')
    },
    {
      icon: CalendarCheck,
      title: tHome('pillars.accountability.title'),
      body: tHome('pillars.accountability.body')
    },
    {
      icon: Brain,
      title: tHome('pillars.coach.title'),
      body: tHome('pillars.coach.body')
    },
    {
      icon: Target,
      title: tHome('pillars.systems.title'),
      body: tHome('pillars.systems.body')
    }
  ];

  const journeySteps = [
    {
      step: '01',
      title: tHome('journey.step1Title'),
      body: tHome('journey.step1Body')
    },
    {
      step: '02',
      title: tHome('journey.step2Title'),
      body: tHome('journey.step2Body')
    },
    {
      step: '03',
      title: tHome('journey.step3Title'),
      body: tHome('journey.step3Body')
    }
  ];

  return (
    <main className="overflow-hidden bg-[#fbf7f0] text-stone-950">
      <section className="relative isolate px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_12%,rgba(255,219,171,0.55),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(196,181,253,0.34),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8f0e6_48%,#fbf7f0_100%)]" />
        <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600 shadow-[0_16px_50px_-30px_rgba(120,83,45,0.55)] backdrop-blur">
              <Sparkles className="size-4 text-amber-600" />
              {tHero('badge')}
            </p>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-stone-950 sm:text-6xl lg:text-7xl">
                {tHero('headline')}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
                {tHero('subhead')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-950 px-7 text-base text-white shadow-[0_18px_45px_-24px_rgba(28,25,23,0.9)] hover:bg-stone-800"
              >
                <Link href="/sign-up">
                  {tHero('ctaPrimary')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-stone-300/80 bg-white/70 px-7 text-base text-stone-800 shadow-sm backdrop-blur hover:bg-white"
              >
                <Link href="/pricing">{tHero('ctaSecondary')}</Link>
              </Button>
            </div>

            <p className="max-w-xl pt-1 text-[11px] font-medium leading-relaxed tracking-[0.14em] text-stone-400 sm:text-xs sm:tracking-[0.18em]">
              {tHero('trustStrip')}
            </p>

            <div className="grid max-w-2xl grid-cols-2 gap-3 pt-5 sm:grid-cols-4 sm:gap-3.5">
              {heroStatItems.map((stat) => (
                <div
                  key={
                    stat.kind === 'metric'
                      ? stat.label
                      : `${stat.title}-${stat.subtitle}`
                  }
                  className="rounded-2xl border border-white/85 bg-white/65 p-4 shadow-[0_18px_52px_-34px_rgba(120,83,45,0.48)] backdrop-blur sm:p-[1.125rem]"
                >
                  {stat.kind === 'metric' ? (
                    <>
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                        {stat.label}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-semibold tracking-[-0.035em] text-stone-800">
                        {stat.title}
                      </p>
                      <p className="mt-1.5 text-[11px] font-normal leading-snug tracking-[0.02em] text-stone-500">
                        {stat.subtitle}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-14 z-10 hidden rounded-3xl border border-white/80 bg-white/82 p-4 shadow-[0_24px_70px_-38px_rgba(28,25,23,0.42)] backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {tHero('widgetTitle')}
                  </p>
                  <p className="text-xs text-stone-500">
                    {tHero('widgetSubtitle')}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 right-5 z-10 rounded-3xl border border-white/80 bg-stone-950/82 p-5 text-white shadow-[0_24px_70px_-36px_rgba(28,25,23,0.8)] backdrop-blur md:right-10">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                {tHero('momentumLabel')}
              </p>
              <div className="mt-3 flex items-end gap-3">
                <p className="text-4xl font-semibold tracking-[-0.06em]">18</p>
                <p className="pb-1 text-sm text-white/72">{tHero('momentumDays')}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white p-3 shadow-[0_34px_100px_-50px_rgba(120,83,45,0.58)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                <Image
                  src="/brand/marketing-hero-lifestyle.png"
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 56vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              {tHome('featuredEyebrow')}
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
              {tHome('featuredTitle')}
            </h2>
            <p className="text-lg leading-8 text-stone-600">
              {tHome('featuredBody')}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {learningPaths.map((path) => (
              <article
                key={path.title}
                className="group overflow-hidden rounded-[2rem] border border-white/85 bg-white/82 shadow-[0_24px_70px_-44px_rgba(120,83,45,0.44)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image
                    src={path.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/42 via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-5 rounded-full bg-white/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                    {path.meta}
                  </p>
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-2xl font-semibold tracking-[-0.035em] text-stone-950">
                    {path.title}
                  </h3>
                  <p className="leading-7 text-stone-600">{path.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-white/85 bg-white/72 p-6 shadow-[0_28px_90px_-54px_rgba(120,83,45,0.5)] backdrop-blur sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-stone-100">
            <Image
              src="/courses/design-ideal-lifestyle-hero.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 44vw"
            />
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                {tHome('howEyebrow')}
              </p>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
                {tHome('howTitle')}
              </h2>
              <p className="text-lg leading-8 text-stone-600">{tHome('howBody')}</p>
            </div>

            <div className="grid gap-4">
              {journeySteps.map((item) => (
                <div
                  key={item.step}
                  className="grid gap-4 rounded-3xl border border-stone-200/70 bg-[#fffaf2] p-5 sm:grid-cols-[4rem_1fr]"
                >
                  <p className="text-3xl font-semibold tracking-[-0.06em] text-amber-700">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 leading-7 text-stone-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                {tHome('pillarsEyebrow')}
              </p>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
                {tHome('pillarsTitle')}
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-stone-600">
              {tHome('pillarsIntro')}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {experiencePillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <div
                  key={pillar.title}
                  className="rounded-[1.75rem] border border-white/85 bg-white/78 p-6 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)]"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-stone-950">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 leading-7 text-stone-600">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              {tHome('coachEyebrow')}
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
              {tHome('coachTitle')}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              {tHome('coachBody')}
            </p>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/82 p-6 shadow-[0_24px_70px_-48px_rgba(120,83,45,0.44)]">
              <p className="text-sm font-semibold text-stone-950">
                {tHome('coachPromptLabel')}
              </p>
              <p className="mt-3 text-lg leading-8 text-stone-600">
                {tHome('coachPromptBody')}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/85 bg-white p-3 shadow-[0_30px_90px_-52px_rgba(120,83,45,0.55)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
              <Image
                src="/quests/glow-flow/identity-architecture.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-7 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-400">
            {tHome('trustBuiltEyebrow')}
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-[2rem] sm:leading-tight">
            {tHome('trustBuiltHeadline')}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-[1.75rem] text-stone-600 sm:text-lg sm:leading-8">
            {tHome('trustBuiltBody')}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1 sm:gap-2.5">
            {trustBuiltTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-stone-200/70 bg-white/55 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] text-stone-500 shadow-[0_8px_28px_-22px_rgba(120,83,45,0.35)] backdrop-blur-sm sm:px-4 sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/85 bg-[linear-gradient(135deg,#fffaf2_0%,#f3e8ff_100%)] p-8 text-center shadow-[0_30px_95px_-58px_rgba(120,83,45,0.55)] sm:p-12">
          <TrendingUp className="mx-auto size-10 text-amber-700" />
          <p className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">
            {tHome('ctaBandTitle')}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
            {tHome('ctaBandBody')}
          </p>
          <p className="mx-auto mt-6 max-w-md text-[10px] font-normal tracking-[0.08em] text-stone-400/90">
            {tHero('stripeBillingNote')}
          </p>
          <div className="mt-5 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-stone-950 px-7 text-base text-white hover:bg-stone-800"
            >
              <Link href="/sign-up">
                {tHome('ctaBandButton')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
