import Link from 'next/link';
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
  TrendingUp,
} from 'lucide-react';

const heroStats = [
  { value: '12 min', label: 'daily rhythm' },
  { value: '4 paths', label: 'guided focus' },
  { value: '87%', label: 'clarity score' },
];

const learningPaths = [
  {
    title: 'Design your ideal lifestyle',
    body: 'Clarify the routines, spaces, and choices that support the person you are becoming.',
    image: '/courses/design-ideal-lifestyle-hero.png',
    meta: 'Lifestyle design',
  },
  {
    title: 'Mindset and habits mastery',
    body: 'Build the identity, discipline, and momentum that make consistency feel natural.',
    image: '/courses/mindset-habits-mastery-hero.png',
    meta: 'Personal growth',
  },
  {
    title: 'Glow Flow foundations',
    body: 'Follow a calm system for deep work, weekly review, attention hygiene, and real progress.',
    image: '/brand/glow-flow-continue-hero.png',
    meta: 'Structured learning',
  },
];

const experiencePillars = [
  {
    icon: Compass,
    title: 'Guided learning paths',
    body: 'A clear sequence turns big life goals into approachable lessons, reflections, and daily practice.',
  },
  {
    icon: CalendarCheck,
    title: 'Accountability and momentum',
    body: 'Progress stays visible so each small action reinforces the next one.',
  },
  {
    icon: Brain,
    title: 'AI coaching support',
    body: 'Reflect, reset, and choose the next best step with calm guidance when focus starts to drift.',
  },
  {
    icon: Target,
    title: 'Calm structured systems',
    body: 'Simple rituals help you protect attention, organize priorities, and keep growth sustainable.',
  },
];

const journeySteps = [
  {
    step: '01',
    title: 'Choose a direction',
    body: 'Start with a path that matches the area of life you want to strengthen first.',
  },
  {
    step: '02',
    title: 'Practice daily',
    body: 'Short lessons and focused actions help you turn insight into behavior.',
  },
  {
    step: '03',
    title: 'Track momentum',
    body: 'Completion, streaks, and reflection make your progress feel tangible.',
  },
];

export default function MarketingHomePage() {
  return (
    <main className="overflow-hidden bg-[#fbf7f0] text-stone-950">
      <section className="relative isolate px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_12%,rgba(255,219,171,0.55),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(196,181,253,0.34),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8f0e6_48%,#fbf7f0_100%)]" />
        <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600 shadow-[0_16px_50px_-30px_rgba(120,83,45,0.55)] backdrop-blur">
              <Sparkles className="size-4 text-amber-600" />
              Premium guided growth
            </p>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-stone-950 sm:text-6xl lg:text-7xl">
                Build structure. Create momentum.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
                Flow Guide helps you transform through calm learning paths,
                daily accountability, and practical systems that turn small
                actions into lasting change.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-950 px-7 text-base text-white shadow-[0_18px_45px_-24px_rgba(28,25,23,0.9)] hover:bg-stone-800"
              >
                <Link href="/sign-up">
                  Start your path
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-stone-300/80 bg-white/70 px-7 text-base text-stone-800 shadow-sm backdrop-blur hover:bg-white"
              >
                <Link href="/pricing">Explore membership</Link>
              </Button>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/85 bg-white/65 p-4 shadow-[0_18px_52px_-34px_rgba(120,83,45,0.48)] backdrop-blur"
                >
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                    {stat.label}
                  </p>
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
                    Today&apos;s focus complete
                  </p>
                  <p className="text-xs text-stone-500">
                    One clear step forward
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 right-5 z-10 rounded-3xl border border-white/80 bg-stone-950/82 p-5 text-white shadow-[0_24px_70px_-36px_rgba(28,25,23,0.8)] backdrop-blur md:right-10">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                Momentum
              </p>
              <div className="mt-3 flex items-end gap-3">
                <p className="text-4xl font-semibold tracking-[-0.06em]">18</p>
                <p className="pb-1 text-sm text-white/72">days steady</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white p-3 shadow-[0_34px_100px_-50px_rgba(120,83,45,0.58)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                <Image
                  src="/brand/marketing-hero-lifestyle.png"
                  alt="Flow Guide on a laptop in a calm workspace with mountain views"
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
              Featured learning paths
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
              Choose the life you want to practice.
            </h2>
            <p className="text-lg leading-8 text-stone-600">
              Every course blends reflection, structure, and action so learning
              becomes part of your daily rhythm.
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
              alt="A calm sunlit room designed for focused learning and reflection"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 44vw"
            />
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                How Flow Guide works
              </p>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
                A calmer way to grow, one clear step at a time.
              </h2>
              <p className="text-lg leading-8 text-stone-600">
                The system gives your ambition a shape: choose a path, practice
                daily, and keep visible proof that you are becoming more
                focused, disciplined, and intentional.
              </p>
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
                Progress and accountability
              </p>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
                Structure that keeps you moving.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-stone-600">
              Learn with clarity, consistency, and focus through tools that make
              momentum easy to see and easier to repeat.
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
              AI coach preview
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
              Reflect, reset, and return to what matters.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              When the day gets noisy, your coach helps you name the obstacle,
              simplify the next action, and protect the version of life you are
              building.
            </p>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/82 p-6 shadow-[0_24px_70px_-48px_rgba(120,83,45,0.44)]">
              <p className="text-sm font-semibold text-stone-950">
                Today&apos;s coaching prompt
              </p>
              <p className="mt-3 text-lg leading-8 text-stone-600">
                What is the smallest focused action that would make tonight feel
                like progress?
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/85 bg-white p-3 shadow-[0_30px_90px_-52px_rgba(120,83,45,0.55)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
              <Image
                src="/quests/glow-flow/identity-architecture.png"
                alt="A soft illustration of identity and personal growth planning"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/85 bg-[linear-gradient(135deg,#fffaf2_0%,#f3e8ff_100%)] p-8 text-center shadow-[0_30px_95px_-58px_rgba(120,83,45,0.55)] sm:p-12">
          <TrendingUp className="mx-auto size-10 text-amber-700" />
          <p className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">
            Small daily actions become real change when your path is clear.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
            Start with one guided path and build the rhythm that helps your
            learning show up in everyday life.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-stone-950 px-7 text-base text-white hover:bg-stone-800"
            >
              <Link href="/sign-up">
                Begin your transformation
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
