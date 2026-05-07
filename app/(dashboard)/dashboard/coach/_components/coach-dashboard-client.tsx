'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  Flame,
  Leaf,
  Clock,
  ListTodo,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CoachServerSnapshot, CoachTone } from '@/lib/coach/types';
import { COACH_STORAGE_KEYS } from '@/lib/coach/storage-keys';
import { computeLocalVisitStreak, localDateKey } from '@/lib/coach/local-dates';
import {
  buildCoachFeed,
  buildDailyFocus,
  buildInsights,
  buildPriorityBullets,
  buildReminderDeck,
} from '@/lib/coach/rules';
import { CoachToneProvider, useCoachTone } from './coach-tone-provider';
import { ReflectionJournal } from './reflection-journal';
import { WeeklyCommitmentSystem } from './weekly-commitment-system';

const TONE_OPTIONS: { id: CoachTone; label: string; hint: string }[] = [
  { id: 'calm', label: 'Calm', hint: 'Gentle pace' },
  { id: 'motivational', label: 'Uplifting', hint: 'Extra warmth' },
  { id: 'strategic', label: 'Thoughtful', hint: 'Structured' },
  { id: 'direct', label: 'Straightforward', hint: 'Clear & brief' },
];

function TonePicker() {
  const { tone, setTone } = useCoachTone();
  return (
    <div className="flex flex-wrap gap-2">
      {TONE_OPTIONS.map((opt) => (
        <Button
          key={opt.id}
          type="button"
          size="sm"
          variant={tone === opt.id ? 'default' : 'outline'}
          className={`rounded-full ${tone === opt.id ? 'btn-gradient-primary border-0' : 'border-white/80 bg-white/80'}`}
          onClick={() => setTone(opt.id)}
        >
          <span className="font-semibold">{opt.label}</span>
          <span className="ml-1 hidden text-xs font-normal opacity-90 sm:inline">{opt.hint}</span>
        </Button>
      ))}
    </div>
  );
}

function CoachDashboardInner({ snapshot }: { snapshot: CoachServerSnapshot }) {
  const { tone } = useCoachTone();
  const [visitStreakDays, setVisitStreakDays] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(COACH_STORAGE_KEYS.visits);
        let dates: string[] = [];
        try {
          dates = raw ? (JSON.parse(raw) as string[]) : [];
        } catch {
          dates = [];
        }
        const today = localDateKey(new Date());
        let next = dates;
        if (!dates.includes(today)) {
          next = [...dates, today].slice(-120);
          localStorage.setItem(COACH_STORAGE_KEYS.visits, JSON.stringify(next));
        }
        setVisitStreakDays(computeLocalVisitStreak(next));
      } catch {
        setVisitStreakDays(0);
      }
    });
  }, []);

  const daily = useMemo(() => buildDailyFocus(snapshot, tone), [snapshot, tone]);
  const feed = useMemo(() => buildCoachFeed(snapshot, tone), [snapshot, tone]);
  const insights = useMemo(() => buildInsights(snapshot, tone), [snapshot, tone]);
  const reminders = useMemo(() => buildReminderDeck(snapshot, tone), [snapshot, tone]);
  const priorities = useMemo(() => buildPriorityBullets(snapshot), [snapshot]);

  const estSessionMinutesToday = snapshot.lessonsCompletedTodayUtc * 12;

  const feedVariantStyles = {
    celebrate: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white',
    steady: 'border-primary/15 bg-gradient-to-br from-primary/[0.06] to-white',
    nudge: 'border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-white',
  } as const;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Your companion
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl xl:text-5xl">
            Coaching home
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Hi {snapshot.displayName}—welcome to a calm corner shaped by what you&apos;ve actually
            lived in your lessons. Nothing here is hurried—it&apos;s meant to feel like a steady hand
            beside you.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-xs font-semibold normal-case tracking-normal text-foreground shadow-sm backdrop-blur"
            >
              Made for your journey · richer conversations ahead
            </Badge>
            {snapshot.primaryCourseTitle ? (
              <Badge
                variant="outline"
                className="rounded-full border-white/80 bg-white/70 px-3 py-1 text-xs font-medium normal-case"
              >
                {snapshot.primaryCourseTitle}
              </Badge>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How your coach speaks to you
            </p>
            <TonePicker />
          </div>
        </div>
      </div>

      {/* Session + reminders */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-white/80 bg-white/95 shadow-[0_24px_70px_-40px_hsl(var(--primary)/0.45)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Clock className="size-4 text-primary" />
              Today at a glance
            </CardDescription>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Your momentum right now
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-muted/15 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Lessons finished today</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {snapshot.lessonsCompletedTodayUtc}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/15 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Rough focus time today</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                ~{estSessionMinutesToday} min
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Based on typical lesson length</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/15 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Learning streak</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {snapshot.completionStreakDays}d
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Days in a row with a finished lesson</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Bell className="size-4" />
              Gentle reminders
            </CardDescription>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Here when you open this page—not as push alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re caught up on scripted reminders. Keep flowing.
              </p>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-sm leading-relaxed"
                >
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="mt-1 text-muted-foreground">{r.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Focus */}
      <Card className="relative overflow-hidden border-white/80 bg-white shadow-[0_28px_90px_-48px_hsl(var(--primary)/0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),transparent_45%)]" />
        <CardHeader className="relative pb-2">
          <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Leaf className="size-4" />
            Today&apos;s Focus
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
            {daily.headline}
          </CardTitle>
          <p className="text-sm font-medium text-muted-foreground">{daily.sublabel}</p>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {daily.bullets.map((t) => (
              <li key={t} className="flex gap-2">
                <Target className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          {snapshot.lessonPositionLabel ? (
            <p className="text-sm font-medium text-foreground">{snapshot.lessonPositionLabel}</p>
          ) : null}
          {snapshot.lastCompletedLessonTitle && snapshot.lastCompletionAtIso ? (
            <p className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
              Last lesson you wrapped:{' '}
              <span className="font-medium text-foreground">{snapshot.lastCompletedLessonTitle}</span>
              <span className="block pt-1 text-[11px]">
                {new Date(snapshot.lastCompletionAtIso).toLocaleString()}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Next lesson + momentum */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <Card className="flex flex-col justify-between border-white/80 bg-white/95 shadow-[0_24px_70px_-40px_hsl(var(--primary)/0.5)]">
          <CardHeader>
            <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Your next step
            </CardDescription>
            <CardTitle className="text-xl font-semibold tracking-tight">
              {snapshot.primaryCourseTitle ?? 'Your library'}
            </CardTitle>
            {snapshot.courseDescription ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{snapshot.courseDescription}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.primaryCourseSlug ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {!snapshot.unlocked && snapshot.nextLesson
                      ? `Where you’ll start: ${snapshot.nextLesson.titleEn}`
                      : snapshot.nextLesson
                        ? snapshot.nextLesson.titleEn
                        : 'Path complete—revisit any lesson anytime.'}
                  </p>
                  {snapshot.nextLesson ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {!snapshot.unlocked
                        ? `${snapshot.nextLesson.moduleTitleEn} · ${snapshot.ratio.total} lessons in this course`
                        : snapshot.nextLesson.moduleTitleEn}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {snapshot.primaryCourseTitle}
                    </p>
                  )}
                </div>
                <Progress value={snapshot.ratio.percent} className="h-3 bg-muted/80" />
                <p className="text-xs text-muted-foreground">
                  {snapshot.courseCtaLabel} · {snapshot.ratio.completed}/{snapshot.ratio.total}{' '}
                  lessons
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose a course in your library to begin.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full border-0 btn-gradient-primary shadow-[0_18px_36px_-18px_hsl(var(--primary)/0.7)]"
              >
                <Link href={snapshot.continueHref}>
                  {snapshot.continueCtaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-white/80 bg-white/90 shadow-sm"
              >
                <Link
                  href={
                    snapshot.courseOverviewHref ?? '/dashboard/courses'
                  }
                >
                  <BookOpen className="size-4" />
                  {snapshot.courseOverviewHref ? 'View your path' : 'Browse courses'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-3 text-sm font-semibold text-stat-done">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-stat-done/10">
                  <BookOpen className="size-5" />
                </span>
                Learning journey
              </CardDescription>
              <CardTitle className="text-4xl font-semibold tabular-nums tracking-[-0.03em]">
                {snapshot.ratio.percent}%
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={snapshot.ratio.percent} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {snapshot.ratio.completed}/{snapshot.ratio.total} lessons · modules{' '}
                {snapshot.modulesDone}/{Math.max(snapshot.moduleTotal, 1)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-3 text-sm font-semibold text-stat-xp">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-stat-xp/10">
                  <Sparkles className="size-5" />
                </span>
                Growth points
              </CardDescription>
              <CardTitle className="text-4xl font-semibold tabular-nums tracking-[-0.03em]">
                {snapshot.xpPreview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Includes {snapshot.moduleBonusXp} bonus points from modules you&apos;ve fully
                completed—something to celebrate, not a scoreboard exam.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-3 text-sm font-semibold text-stat-streak">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-stat-streak/10">
                  <Flame className="size-5" />
                </span>
                Daily rhythm
              </CardDescription>
              <CardTitle className="text-4xl font-semibold tracking-[-0.03em]">
                {snapshot.completionStreakDays}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Days in a row you&apos;ve completed at least one lesson—small consistency, quietly
                powerful.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-3 text-sm font-semibold text-stat-level">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-stat-level/10">
                  <BarChart3 className="size-5" />
                </span>
                Where you stand
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Level {snapshot.levelNum}{' '}
                <span className="block text-sm font-medium text-muted-foreground">
                  {snapshot.levelLabel}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A simple lens on how far you&apos;ve traveled—meant to encourage, not pressure.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Lessons you&apos;ve completed:{' '}
                <span className="font-semibold text-foreground">{snapshot.ratio.completed}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Milestones */}
      {snapshot.milestones.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Moments worth marking
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.milestones.map((m) => (
              <Card
                key={m.id}
                className={`border-white/80 shadow-[0_14px_40px_-28px_hsl(var(--primary)/0.35)] ${
                  m.done ? 'bg-emerald-50/70' : 'bg-white/90'
                }`}
              >
                <CardContent className="flex items-center gap-3 py-4">
                  {m.done ? (
                    <CheckCircle2 className="size-8 shrink-0 text-emerald-600" />
                  ) : (
                    <Target className="size-8 shrink-0 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium leading-snug text-foreground">{m.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* Weekly + Journal */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyCommitmentSystem snapshot={snapshot} visitStreakDays={visitStreakDays} />
        <ReflectionJournal />
      </div>

      {/* Coach feed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Notes from your coach</h2>
          <Badge variant="outline" className="rounded-full border-white/80 bg-white/70 text-[10px]">
            Personalized to you
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {feed.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-muted/20">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Finish a lesson and this space fills with encouragement tailored to your pace.
              </CardContent>
            </Card>
          ) : (
            feed.map((card) => (
              <Card
                key={card.id}
                className={`border shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.25)] ${feedVariantStyles[card.toneVariant]}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold leading-snug">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Insights */}
      <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)]">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <BarChart3 className="size-4" />
            Growth insights
          </CardDescription>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Patterns that help you see yourself clearly
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {insights.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{row.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{row.detail}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-4 md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your recent rhythm
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Recent week</p>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {snapshot.completionsLast7Days}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Week before</p>
                <p className="text-3xl font-semibold tabular-nums text-muted-foreground">
                  {snapshot.completionsPrior7Days}
                </p>
              </div>
              <div className="min-w-[120px] flex-1">
                <div className="flex h-28 items-end gap-2">
                  <div
                    className="flex-1 rounded-t-lg bg-primary/80"
                    style={{
                      height: `${Math.min(100, snapshot.completionsLast7Days * 12)}%`,
                      minHeight: snapshot.completionsLast7Days > 0 ? '12%' : '4%',
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-lg bg-muted-foreground/25"
                    style={{
                      height: `${Math.min(100, snapshot.completionsPrior7Days * 12)}%`,
                      minHeight: snapshot.completionsPrior7Days > 0 ? '12%' : '4%',
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  A simple visual—meant to feel your pace, not crunch numbers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module breakdown + priorities */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)]">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
            <div>
              <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Your progress path
              </CardDescription>
              <CardTitle className="mt-1 text-xl font-semibold tracking-tight">
                Each chapter of your course
              </CardTitle>
            </div>
            {snapshot.courseOverviewHref ? (
              <Link
                href={snapshot.courseOverviewHref}
                className="text-sm font-medium text-primary hover:underline"
              >
                Roadmap →
              </Link>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.modRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Modules will appear here soon.</p>
            ) : (
              <ul className="space-y-4">
                {snapshot.modRows.map((row) => (
                  <li key={row.moduleId} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">{row.titleEn}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {row.completed}/{row.total}
                      </span>
                    </div>
                    <Progress value={row.percent} className="h-2 bg-muted/80" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)]">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ListTodo className="size-4" />
              What deserves your attention
            </CardDescription>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Clear, kind next steps
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Suggestions drawn from your journey—steady, human, and easy to trust.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-relaxed text-foreground">
              {priorities.map((line) => (
                <li key={line} className="flex gap-3">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-stat-done" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card className="border border-primary/20 bg-primary/[0.06] shadow-card-soft">
        <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">What&apos;s ahead</p>
            <p className="text-sm text-muted-foreground">
              Deeper coaching narratives and optional cloud sync may arrive later—always built
              around your real progress. For now, everything you see grows from the lessons
              you&apos;ve lived.
            </p>
          </div>
          <Badge variant="outline" className="w-fit shrink-0 border-primary/25 bg-white/70">
            Calm · caring · with you
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

export function CoachDashboardClient({ snapshot }: { snapshot: CoachServerSnapshot }) {
  return (
    <CoachToneProvider>
      <CoachDashboardInner snapshot={snapshot} />
    </CoachToneProvider>
  );
}
