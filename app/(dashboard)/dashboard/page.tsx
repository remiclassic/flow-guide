import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Settings,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getActivityLogs,
  getCompletedLessonIdsForUser,
  getCourseOutline,
  getPublishedCourses,
  getTeamForUser,
  getUser,
  isPersistedCourseRow,
  primaryPlayableCourse,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';
import {
  activityCategory,
  activityIconMap,
  activityShortLabel,
  activityToneClasses,
  getRelativeTime,
} from '@/lib/activity/format';
import {
  courseDescriptionForSlug,
  GLOW_FLOW_COURSE_SLUG,
} from '@/lib/courses/curriculum';
import { glowFlowCampaignForModuleTitle } from '@/lib/quests/progress';
import {
  completionRatio,
  courseCtaLabel,
  courseListingCounts,
  courseListingProgress,
  ESTIMATED_MINUTES_PER_LESSON,
  estimateMinutesForLessons,
  findNextIncompleteLesson,
  flatLessonIndex,
  flattenLessonIds,
  moduleProgressRows,
  placeholderLevelFromPercent,
  placeholderXpFromLessons,
  toOutlineLite,
  type OutlineModuleLite,
} from '@/lib/courses/progress';

function PathProgressRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total <= 0 ? 0 : Math.round((completed / total) * 100);
  const r = 40;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-[148px] shrink-0">
        <svg className="-rotate-90 size-full" viewBox="0 0 100 100" aria-hidden>
          <circle
            className="fill-none stroke-muted"
            strokeWidth="10"
            cx="50"
            cy="50"
            r={r}
          />
          <circle
            className="fill-none stroke-chart-4 transition-all duration-500"
            strokeWidth="10"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r={r}
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-semibold tabular-nums text-foreground">
            {completed}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            / {total} lessons
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-3 text-sm">
        <li className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-chart-4" />
          <span className="text-muted-foreground">Completed</span>
          <span className="ml-auto font-medium tabular-nums text-foreground">
            {completed}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-muted-foreground/35" />
          <span className="text-muted-foreground">Remaining</span>
          <span className="ml-auto font-medium tabular-nums text-foreground">
            {Math.max(0, total - completed)}
          </span>
        </li>
      </ul>
    </div>
  );
}

export default async function DashboardHomePage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);

  const courses = await getPublishedCourses();
  const primary = primaryPlayableCourse(courses);

  let outlineLite: OutlineModuleLite[] = [];
  let completedSet = new Set<number>();
  let lessonIds: number[] = [];
  let ratio = { percent: 0, completed: 0, total: 0 };
  let nextLesson = null as ReturnType<typeof findNextIncompleteLesson>;
  let modRows: ReturnType<typeof moduleProgressRows> = [];

  if (primary) {
    const outline = await getCourseOutline(primary.id);
    outlineLite = toOutlineLite(outline);
    lessonIds = flattenLessonIds(outlineLite);
    completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);
    ratio = completionRatio(
      lessonIds.filter((id) => completedSet.has(id)).length,
      lessonIds.length
    );
    nextLesson = findNextIncompleteLesson(outlineLite, completedSet);
    modRows = moduleProgressRows(outlineLite, completedSet);
  }

  const xp = placeholderXpFromLessons(ratio.completed);
  const levelNum = placeholderLevelFromPercent(ratio.percent);
  const levelLabel =
    levelNum >= 4 ? 'Advanced' : levelNum >= 3 ? 'Intermediate' : 'Building momentum';
  const estMinutesTotal = estimateMinutesForLessons(ratio.total);
  const estMinutesRemaining = estimateMinutesForLessons(
    Math.max(0, ratio.total - ratio.completed)
  );

  const continueHref =
    !primary
      ? '/dashboard/courses'
      : !unlocked
        ? '/pricing?reason=subscription'
        : nextLesson
          ? `/dashboard/courses/${primary.slug}/lessons/${nextLesson.lessonKey}`
          : `/dashboard/courses/${primary.slug}`;

  const continueLabel = !primary
    ? 'Browse courses'
    : !unlocked
      ? 'Unlock to continue'
      : nextLesson
        ? 'Continue learning'
        : 'Review learning path';

  const displayName = user.name?.trim() || user.email?.split('@')[0] || 'Learner';

  const topModules = modRows.slice(0, 3);

  const questRow = nextLesson
    ? modRows.find((r) => r.titleEn === nextLesson.moduleTitleEn)
    : null;
  const glowFlowCampaign =
    primary?.slug === GLOW_FLOW_COURSE_SLUG && nextLesson
      ? glowFlowCampaignForModuleTitle(nextLesson.moduleTitleEn)
      : null;
  const questFraction = questRow
    ? `${questRow.completed}/${questRow.total}`
    : null;
  const questPercent = questRow
    ? questRow.total > 0
      ? Math.round((questRow.completed / questRow.total) * 100)
      : 0
    : 0;

  const achievementModules = modRows.filter((r) => r.percent === 100).slice(0, 4);

  const activityLogs = await getActivityLogs();
  const recentActivity = activityLogs.slice(0, 3).map((log) => ({
    id: log.id,
    action: log.action as ActivityType,
    timestamp: new Date(log.timestamp),
  }));

  const playableRows = courses.filter((c) => !c.isComingSoon);
  const comingSoonRows = courses.filter((c) => c.isComingSoon);
  const stripRows = [
    ...playableRows.slice(0, 1),
    ...comingSoonRows,
    ...playableRows.slice(1),
  ].slice(0, 6);

  const previewCourses = await Promise.all(
    stripRows.map(async (course) => {
      const outline = isPersistedCourseRow(course)
        ? await getCourseOutline(course.id)
        : [];
      const lite = toOutlineLite(outline);
      const ids = flattenLessonIds(lite);
      const done = await getCompletedLessonIdsForUser(user.id, ids);
      const completed = ids.filter((id) => done.has(id)).length;
      const { moduleCount, lessonCount, estMinutes } = courseListingCounts(
        course,
        outline.length,
        ids.length
      );
      const pr = courseListingProgress(
        course,
        completed,
        ids.length,
        lessonCount
      );
      const hours = formatApproxHours(Math.max(1, estMinutes));
      const cta = course.isComingSoon ? 'Coming soon' : courseCtaLabel(pr.completed);
      const statusLabel = course.isComingSoon
        ? 'Coming soon'
        : !unlocked
          ? 'Locked'
          : pr.percent === 0
            ? 'New'
            : pr.percent === 100
              ? 'Complete'
              : 'Continue';
      return {
        ...course,
        moduleCount,
        lessonCount,
        progress: pr,
        hours,
        cta,
        statusLabel,
        isComingSoon: course.isComingSoon,
      };
    })
  );

  const lessonOrdinal =
    nextLesson && primary ? flatLessonIndex(outlineLite, nextLesson.lessonKey) : -1;
  const lessonPosition =
    lessonOrdinal >= 0 ? `Lesson ${lessonOrdinal + 1} of ${ratio.total}` : null;

  const primaryCourseDescription = primary
    ? courseDescriptionForSlug(primary.slug, primary.description) ??
      'Browse published programs and open your roadmap.'
    : 'Browse published programs and open your roadmap.';

  const continueLearningHeroSrc =
    primary?.slug === GLOW_FLOW_COURSE_SLUG
      ? '/brand/glow-flow-continue-hero.png'
      : '/brand/dashboard-hero.png';

  const continueCardLessonTitle =
    !primary
      ? null
      : !unlocked
        ? nextLesson
          ? `Where you’ll start: ${nextLesson.titleEn}`
          : 'Membership unlocks lessons and synced progress.'
        : nextLesson
          ? nextLesson.titleEn
          : 'Path complete — revisit any lesson anytime.';

  const continueCardLessonMeta =
    !primary
      ? null
      : !unlocked
        ? nextLesson
          ? `${nextLesson.moduleTitleEn} · ${ratio.total} lessons in this course`
          : primary.title
        : nextLesson
          ? nextLesson.moduleTitleEn
          : primary.title;

  const continueCardCtaLabel =
    !primary
      ? 'Browse courses'
      : !unlocked
        ? 'View plans'
        : nextLesson
          ? 'Continue lesson'
          : 'Open course';

  return (
    <section className="flex-1 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_34rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.32))] p-3 pb-10 sm:p-4 lg:p-6 lg:pb-10">
      <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-6">
          {/* Welcome hero */}
          <div className="relative overflow-hidden rounded-[2rem] bg-card bg-[url('/brand/welcome-back-bg.png')] bg-cover bg-center shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55),0_24px_80px_-42px_hsl(var(--primary)/0.45)]">
            <div className="pointer-events-none absolute -right-24 -top-24 size-[360px] rounded-full bg-primary/[0.16] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 size-[300px] rounded-full bg-chart-5/35 blur-3xl" />
            <div className="relative grid gap-8 p-7 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-10 xl:p-12">
              <div className="max-w-3xl space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  Learning home
                </p>
                <h1 className="text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl xl:text-6xl">
                  Welcome back, {displayName}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Small steps today compound into real momentum. Your path,
                  progress, and next lesson are ready when you are.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {primary ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-primary/10 bg-white/75 px-4 py-1.5 text-sm font-semibold normal-case tracking-normal text-foreground shadow-sm backdrop-blur"
                    >
                      {primary.title}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full border-0 px-8 text-base btn-gradient-primary shadow-[0_18px_36px_-18px_hsl(var(--primary)/0.7)]"
                >
                  <Link href={continueHref}>
                    {continueLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/80 bg-white/80 px-7 text-base shadow-sm backdrop-blur">
                  <Link href="/dashboard/courses">
                    <BookOpen className="size-4" />
                    Course library
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats — horizontal icon + metric column (compact; Card defaults py-6/gap-6 stripped) */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="gap-0 py-0 border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
              <CardContent className="flex items-start gap-3 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stat-xp/10">
                  <Zap className="size-5 text-stat-xp" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
                    XP{' '}
                    <span className="font-medium text-primary">(preview)</span>
                  </p>
                  <p className="text-2xl font-semibold tabular-nums leading-tight tracking-[-0.03em] text-foreground">
                    {xp.toLocaleString()}
                  </p>
                  <p className="text-[13px] font-medium leading-snug text-chart-4">
                    +120 this week (demo)
                  </p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Persistent XP ships later.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0 border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
              <CardContent className="flex items-start gap-3 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stat-streak/10">
                  <Flame className="size-5 text-stat-streak" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
                    Streak
                  </p>
                  <p className="text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground">
                    —
                  </p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Daily streak not wired yet—shown as a coaching cue.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0 border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
              <CardContent className="flex items-start gap-3 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stat-level/10">
                  <BarChart3 className="size-5 text-stat-level" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
                    Level{' '}
                    <span className="font-medium text-primary">(preview)</span>
                  </p>
                  <p className="text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground">
                    Level {levelNum}
                  </p>
                  <p className="text-[13px] font-medium leading-snug text-stat-level">
                    {levelLabel}
                  </p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Derived from completion %—not stored server-side yet.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0 border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
              <CardContent className="flex items-start gap-3 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stat-done/10">
                  <Trophy className="size-5 text-stat-done" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
                      Completion
                    </p>
                    <p className="text-2xl font-semibold tabular-nums leading-tight tracking-[-0.03em] text-foreground">
                      {ratio.percent}%
                    </p>
                    <p className="text-[13px] font-medium leading-snug text-chart-4">
                      {ratio.completed}/{ratio.total} lessons completed
                    </p>
                  </div>
                  <Progress value={ratio.percent} className="h-2 bg-muted/80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue learning */}
          <Card className="relative min-h-[640px] gap-0 overflow-hidden rounded-2xl border-0 bg-[linear-gradient(to_right,rgb(9_9_11)_0%,rgb(9_9_11)_42%,rgb(255_255_255)_56%,rgb(255_255_255)_100%)] py-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.78),0_28px_90px_-48px_hsl(var(--primary)/0.55)]">
            <Image
              src={continueLearningHeroSrc}
              alt=""
              fill
              className="origin-center object-cover object-center scale-[1.045]"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
            />
            {/* Mockup: full-height wash; ~half card width on md+, full-width horizontal fade on small screens */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-full bg-[linear-gradient(to_left,hsla(0,0%,100%,0.97)_0%,hsla(0,0%,100%,0.93)_16%,hsla(0,0%,100%,0.78)_38%,hsla(0,0%,100%,0.42)_64%,hsla(0,0%,100%,0.08)_88%,hsla(0,0%,100%,0)_100%)] md:w-[54%]"
            />
            <CardContent className="relative z-[2] ml-auto flex min-h-[640px] w-full max-w-[min(100%,26rem)] flex-col justify-center gap-7 p-7 sm:max-w-[28rem] sm:p-9 lg:max-w-[30rem] lg:p-11 xl:p-12">
              <div className="relative flex flex-col gap-7">
              <div className="-mx-7 space-y-6 px-7 pb-2 pt-1 text-slate-950 sm:-mx-9 sm:px-9 lg:-mx-11 lg:px-11 xl:-mx-12 xl:px-12">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                      Continue learning
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground xl:text-4xl">
                      {primary ? primary.title : 'Your library'}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-slate-800">
                      {primaryCourseDescription}
                    </p>
                  </div>
                  {primary ? (
                    <div>
                      <p className="text-lg font-semibold text-foreground">{continueCardLessonTitle}</p>
                      {continueCardLessonMeta ? (
                        <p className="mt-1.5 text-sm text-slate-600">{continueCardLessonMeta}</p>
                      ) : null}
                    </div>
                  ) : null}
              </div>
                {primary ? (
                  <>
                    <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                      {lessonPosition ? (
                        <span className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.8)] backdrop-blur-md">
                          <BookOpen className="mb-1 size-4 text-primary" />
                          <span className="block font-semibold text-foreground">{lessonPosition}</span>
                          {!unlocked ? (
                            <span className="mt-1 block text-xs font-normal leading-snug text-slate-600">
                              Syllabus order — playback unlocks with membership.
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                      <span className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.8)] backdrop-blur-md">
                        <Clock className="mb-1 size-4 text-stat-level" />
                        <span className="block font-semibold text-foreground">
                          ~{Math.round(estMinutesRemaining)} min
                        </span>
                        {unlocked ? 'remaining in path' : 'estimated after unlock'}
                      </span>
                      <span className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.8)] backdrop-blur-md">
                        <Trophy className="mb-1 size-4 text-stat-done" />
                        <span className="block font-semibold text-foreground">
                          ~{Math.max(1, Math.round(estMinutesTotal / 60))}h
                        </span>
                        full course (est.)
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">
                      Estimates use ~{ESTIMATED_MINUTES_PER_LESSON} min per lesson until each lesson has a real duration.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button
                        asChild
                        size="lg"
                        className="h-12 rounded-full border-0 px-8 text-base text-white btn-gradient-primary shadow-card-soft"
                      >
                        <Link href={continueHref}>{continueCardCtaLabel}</Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="h-12 rounded-full border-slate-200/90 bg-white/95 px-7 text-base text-foreground shadow-sm hover:bg-white hover:text-foreground"
                      >
                        <Link href={primary ? `/dashboard/courses/${primary.slug}` : '/dashboard/courses'}>
                          View course
                        </Link>
                      </Button>
                    </div>
                    {!unlocked ? (
                      <p className="text-xs font-medium text-slate-600">
                        Lesson viewer and progress sync are included with membership — use View plans above.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <Button asChild className="w-fit rounded-full border-0 text-white btn-gradient-primary">
                    <Link href="/dashboard/courses">Open library</Link>
                  </Button>
                )}
              </div>
              </CardContent>
          </Card>

          {/* Course strip */}
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
                  Your courses
                </h2>
                <p className="mt-1 text-base text-muted-foreground">
                  Programs with tracked completion
                </p>
              </div>
              <Link
                href="/dashboard/courses"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {previewCourses.map((course, idx) => {
                const isGlowFlowCourse = course.slug === GLOW_FLOW_COURSE_SLUG;
                const heroSrc = course.heroImagePath?.trim() || null;
                const isComingSoon = course.isComingSoon;
                const shellClass = `group block overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_18px_58px_-36px_hsl(var(--primary)/0.42)] transition-all duration-300 ${
                  isComingSoon
                    ? 'cursor-not-allowed opacity-[0.98]'
                    : 'hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_28px_80px_-40px_hsl(var(--primary)/0.55)]'
                }`;

                const cardInner = (
                  <>
                  <div
                    className="relative aspect-[16/11] overflow-hidden"
                    style={{
                      background: courseHeroGradient(course.slug, idx),
                    }}
                  >
                    {isGlowFlowCourse ? (
                      <Image
                        src="/brand/glow-flow-continue-hero.png"
                        alt=""
                        fill
                        className={`object-cover ${isComingSoon ? 'grayscale-[0.35]' : ''}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                        priority={idx === 0}
                      />
                    ) : null}
                    {heroSrc && !isGlowFlowCourse ? (
                      <Image
                        src={heroSrc}
                        alt=""
                        fill
                        className={`object-cover ${isComingSoon ? 'grayscale-[0.45]' : ''}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                      />
                    ) : null}
                    {!isGlowFlowCourse && !heroSrc ? (
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(255,255,255,0.7),transparent_12rem),linear-gradient(135deg,rgba(255,255,255,0.2),transparent)]" />
                    ) : null}
                    {isComingSoon ? (
                      <span className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
                    ) : null}
                    <div className="absolute right-4 top-4 flex flex-wrap items-center justify-end gap-2">
                      <span
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm ${
                          isComingSoon
                            ? 'bg-amber-500/95 text-white'
                            : 'bg-white/90 text-foreground'
                        }`}
                      >
                        {course.statusLabel}
                      </span>
                      {isComingSoon ? (
                        <span className="flex items-center gap-1 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                          <Lock className="size-3" aria-hidden />
                          Locked
                        </span>
                      ) : null}
                    </div>
                    <span className="absolute bottom-5 left-5 text-5xl font-semibold tracking-[-0.08em] text-white/75 drop-shadow-sm">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-5 p-6">
                    <h3
                      className={`text-xl font-semibold leading-tight tracking-[-0.025em] text-foreground ${
                        isComingSoon ? '' : 'group-hover:text-primary'
                      }`}
                    >
                      {course.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span className="rounded-xl bg-muted/35 px-3 py-2">
                        <span className="block text-muted-foreground/80">Modules</span>
                        <span className="text-sm font-semibold text-foreground">{course.moduleCount}</span>
                      </span>
                      <span className="rounded-xl bg-muted/35 px-3 py-2">
                        <span className="block text-muted-foreground/80">Lessons</span>
                        <span className="text-sm font-semibold text-foreground">{course.lessonCount}</span>
                      </span>
                      <span className="rounded-xl bg-muted/35 px-3 py-2">
                        <Clock className="mb-0.5 size-3.5" />
                        <span className="text-sm font-semibold text-foreground">~{course.hours}h</span>
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span className="tabular-nums">
                          {course.progress.completed}/{course.progress.total}
                        </span>
                      </div>
                      <Progress value={course.progress.percent} className="h-3" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        isComingSoon ? 'text-muted-foreground' : 'text-primary'
                      }`}
                    >
                      {course.cta}
                      {!isComingSoon ? (
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      ) : null}
                    </span>
                  </div>
                  </>
                );

                return isComingSoon ? (
                  <div key={course.id} className={shellClass}>
                    {cardInner}
                  </div>
                ) : (
                  <Link
                    key={course.id}
                    href={`/dashboard/courses/${course.slug}`}
                    className={shellClass}
                  >
                    {cardInner}
                  </Link>
                );
              })}
            </div>
            {previewCourses.length === 0 ? (
              <Card className="border-dashed border-border bg-muted/30 py-12 text-center shadow-none">
                <CardContent className="text-sm text-muted-foreground">
                  No published courses yet.
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Recent path / activity hint */}
          <Card className="border-white/80 bg-white/90 shadow-[0_18px_58px_-36px_hsl(var(--primary)/0.42)]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-[-0.02em]">Recent path</CardTitle>
              <CardDescription className="text-base">Top modules from your syllabus</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 md:grid-cols-3">
                {topModules.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No module data yet.</li>
                ) : (
                  topModules.map((row) => (
                    <li
                      key={row.moduleId}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm transition-colors hover:bg-muted/35"
                    >
                      <span className="min-w-0 truncate font-medium text-foreground">
                        {row.titleEn}
                      </span>
                      <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                        {row.completed}/{row.total}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          {primary && nextLesson && unlocked ? (
            <Card className="border-primary/20 bg-[linear-gradient(135deg,hsl(var(--primary)/0.1),hsl(var(--card)))] shadow-card-soft">
              <CardContent className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Next up
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{nextLesson.titleEn}</p>
                  <p className="text-sm text-muted-foreground">{nextLesson.moduleTitleEn}</p>
                </div>
                <Button
                  asChild
                  className="shrink-0 rounded-full btn-gradient-primary border-0 shadow-card-soft"
                >
                  <Link
                    href={`/dashboard/courses/${primary.slug}/lessons/${nextLesson.lessonKey}`}
                  >
                    {courseCtaLabel(ratio.completed)}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right rail */}
        <aside className="space-y-5 xl:self-start">
          <Card className="border-white/80 bg-white/92 shadow-[0_20px_64px_-42px_hsl(var(--primary)/0.55)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-[-0.025em]">Path progress</CardTitle>
              <CardDescription className="text-sm leading-6">Lessons completed on your primary course</CardDescription>
            </CardHeader>
            <CardContent>
              {primary && ratio.total > 0 ? (
                <div className="space-y-4">
                  <PathProgressRing completed={ratio.completed} total={ratio.total} />
                  <p className="text-sm text-muted-foreground">
                    {modRows.filter((m) => m.percent === 100).length} of{' '}
                    {modRows.length} modules fully completed
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enroll in a course to see progress here.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/92 shadow-[0_20px_64px_-42px_hsl(var(--primary)/0.55)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-[-0.025em]">Focus module</CardTitle>
              <CardDescription className="text-sm leading-6">
                {nextLesson && unlocked
                  ? 'Progress inside the module you’re in'
                  : 'Unlock lessons to track module quests'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questRow && nextLesson && unlocked ? (
                <>
                  <p className="text-base font-semibold text-foreground">
                    {glowFlowCampaign?.title ?? questRow.titleEn}
                  </p>
                  {glowFlowCampaign ? (
                    <p className="text-xs text-muted-foreground">{glowFlowCampaign.moduleTitleEn}</p>
                  ) : null}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Module lessons</span>
                      <span className="tabular-nums">{questFraction}</span>
                    </div>
                    <Progress value={questPercent} className="h-3" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Complete this module to unlock the next milestone.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {unlocked
                    ? 'You’re caught up or no module context — open the roadmap.'
                    : 'Subscribe to continue your quest path.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/92 shadow-[0_20px_64px_-42px_hsl(var(--primary)/0.55)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-[-0.025em]">Milestones</CardTitle>
              <CardDescription className="text-sm leading-6">Modules you’ve fully completed</CardDescription>
            </CardHeader>
            <CardContent>
              {achievementModules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Finish every lesson in a module to earn a milestone badge here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {achievementModules.map((m) => (
                    <li
                      key={m.moduleId}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-4"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4">
                        <CheckCircle2 className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{m.titleEn}</p>
                        <p className="text-xs text-muted-foreground">Module complete</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/92 shadow-[0_20px_64px_-42px_hsl(var(--primary)/0.55)]">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-semibold tracking-[-0.025em]">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-sm leading-6">
                  Latest events on your account
                </CardDescription>
              </div>
              <Link
                href="/dashboard/activity"
                className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet. Sign-ins, account changes, and team events will appear here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((entry) => {
                    const Icon = activityIconMap[entry.action] ?? Settings;
                    return (
                      <li
                        key={entry.id}
                        className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-3"
                      >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${activityToneClasses(entry.action)}`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {activityShortLabel(entry.action)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {activityCategory(entry.action)}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                          {getRelativeTime(entry.timestamp)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function formatApproxHours(estMinutes: number): string {
  const h = estMinutes / 60;
  if (Number.isInteger(h)) return String(h);
  return (Math.round(h * 10) / 10).toFixed(1);
}

function courseHeroGradient(slug: string, index: number): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * (i + 1)) % 360;
  const h2 = (h + 40 + index * 22) % 360;
  return `linear-gradient(135deg, hsl(${h} 45% 92%) 0%, hsl(${h2} 55% 88%) 48%, hsl(270 40% 94%) 100%)`;
}
