import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Box,
  Clock,
  LineChart,
  Lock,
  Map,
  Star,
  Target,
  UserRound,
  Users,
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
  getCompletedLessonIdsForUser,
  getCourseBySlug,
  getCourseOutline,
  getTeamForUser,
  getUser,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import { courseDescriptionForSlug } from '@/lib/courses/curriculum';
import {
  completionRatio,
  courseCtaLabel,
  estimateMinutesForLessons,
  findNextIncompleteLesson,
  flattenLessonIds,
  moduleProgressRows,
  toOutlineLite,
} from '@/lib/courses/progress';

type Params = { courseSlug: string };

export default async function CourseOverviewPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug } = await props.params;
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);

  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const outline = await getCourseOutline(course.id);
  const outlineLite = toOutlineLite(outline);
  const lessonIds = flattenLessonIds(outlineLite);
  const completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);
  const ratio = completionRatio(
    lessonIds.filter((id) => completedSet.has(id)).length,
    lessonIds.length
  );
  const modRows = moduleProgressRows(outlineLite, completedSet);
  const nextLesson = findNextIncompleteLesson(outlineLite, completedSet);
  const estMin = estimateMinutesForLessons(lessonIds.length);
  const cta = courseCtaLabel(ratio.completed);

  const continueHref = !unlocked
    ? '/pricing?reason=subscription'
    : nextLesson
      ? `/dashboard/courses/${course.slug}/lessons/${nextLesson.lessonKey}`
      : `/dashboard/courses/${course.slug}`;

  const overviewBlurb = courseDescriptionForSlug(course.slug, course.description);
  const estHours = Math.max(1, Math.round(estMin / 60));

  const infoPills = [
    {
      icon: Box,
      label: `${outline.length} Modules`,
    },
    {
      icon: BookOpen,
      label: `${lessonIds.length} Lessons`,
    },
    {
      icon: Clock,
      label: `Est. path ~${estHours}h`,
    },
    {
      icon: UserRound,
      label: 'Self-paced',
    },
  ] as const;

  const featureHighlights = [
    {
      icon: Target,
      title: 'Purpose-driven',
      description: 'Lessons designed to create real, lasting transformation.',
    },
    {
      icon: Star,
      title: 'Action-focused',
      description: 'Apply what you learn with practical tools & exercises.',
    },
    {
      icon: LineChart,
      title: 'Track progress',
      description: 'Monitor your growth and stay motivated every step.',
    },
    {
      icon: Users,
      title: 'Built for you',
      description: 'Self-paced, flexible, and designed around your life.',
    },
  ] as const;

  return (
    <section className="flex-1 space-y-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_32rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))] p-4 pb-10 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/90 bg-white/95 p-6 shadow-[0_22px_74px_-46px_hsl(var(--primary)/0.45)] sm:rounded-[1.75rem] sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-primary/[0.12] blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-12">
            <div className="min-w-0 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[hsl(262_83%_97%)] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                <ArrowLeftRight className="size-3.5 shrink-0 opacity-90" aria-hidden />
                Learning roadmap
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {course.title}
              </h1>
              {overviewBlurb ? (
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px] sm:leading-7">
                  {overviewBlurb}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {infoPills.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-[hsl(262_83%_98%)] px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <Icon className="size-3.5 shrink-0 opacity-90" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              <div className="max-w-2xl space-y-2.5 pt-1">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Your progress</span>
                  <span className="tabular-nums">
                    {ratio.completed} / {ratio.total} lessons
                  </span>
                </div>
                <div className="relative">
                  <Progress
                    value={ratio.percent}
                    className="h-9 rounded-full bg-[#F5F3FF] shadow-inner"
                    indicatorClassName="rounded-full"
                  />
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold tabular-nums text-primary sm:text-sm"
                    aria-hidden
                  >
                    {ratio.percent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
              {!unlocked ? (
                <div className="rounded-2xl border border-primary/10 bg-[#F5F3FF] p-5 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-primary/10">
                      <Lock className="size-[18px] text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <p className="text-base font-bold text-foreground">Unlock full access</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Subscribe to open lessons, sync progress, and keep future drops
                        available.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="mt-4 h-11 w-full rounded-xl border-0 bg-primary text-primary-foreground shadow-md hover:bg-primary/92"
                  >
                    <Link href="/pricing">View plans</Link>
                  </Button>
                </div>
              ) : null}

              <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_40px_-28px_rgba(17,24,39,0.25)]">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F3FF] ring-1 ring-primary/10">
                    <Map className="size-[18px] text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-base font-bold text-foreground">Continue learning</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {nextLesson && unlocked
                        ? `${nextLesson.moduleTitleEn} · Next up`
                        : unlocked
                          ? 'Path complete — review any lesson anytime.'
                          : 'Subscribe to unlock your lesson path.'}
                    </p>
                  </div>
                </div>
                {nextLesson && unlocked ? (
                  <p className="mt-3 text-sm font-semibold text-foreground">{nextLesson.titleEn}</p>
                ) : null}
                <div className="mt-4 space-y-3">
                  <Button
                    asChild
                    className="h-11 w-full rounded-xl border-0 btn-gradient-primary shadow-md"
                  >
                    <Link href={continueHref}>
                      {!unlocked ? 'Unlock to continue' : cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full rounded-xl border-border bg-card text-foreground hover:bg-muted/40"
                  >
                    <Link href="/dashboard/courses">Browse all courses</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-10 grid gap-8 border-t border-border/60 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {featureHighlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F3FF] text-primary ring-1 ring-primary/10">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-sm leading-snug text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px] space-y-8 pl-2 md:pl-8">
        <div className="absolute bottom-6 left-[15px] top-12 hidden w-px bg-gradient-to-b from-primary/45 via-border to-transparent md:block" />

        {outline.map((mod, modIndex) => {
          const row = modRows.find((r) => r.moduleId === mod.id);
          const doneCount = mod.lessons.filter((l) => completedSet.has(l.id)).length;

          return (
            <div key={mod.id} className="relative md:pl-12">
              <div className="absolute left-0 top-8 hidden size-3.5 rounded-full border-[3px] border-primary bg-background shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] md:block" />

              <Card className="border-border/80 shadow-card-soft">
                <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Milestone {modIndex + 1}
                      </Badge>
                      {row?.percent === 100 ? (
                        <Badge variant="success" className="rounded-full normal-case">
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full normal-case">
                          In progress
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                      {mod.titleEn}
                    </CardTitle>
                    <CardDescription className="text-base">{mod.titleEs}</CardDescription>
                  </div>
                  <div className="w-full shrink-0 space-y-2 sm:max-w-[220px]">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Module progress</span>
                      <span className="tabular-nums">
                        {doneCount}/{mod.lessons.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        mod.lessons.length
                          ? Math.round((doneCount / mod.lessons.length) * 100)
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mod.lessons.map((lesson, li) => {
                      const done = completedSet.has(lesson.id);
                      const href = unlocked
                        ? `/dashboard/courses/${course.slug}/lessons/${lesson.lessonKey}`
                        : '/pricing?reason=subscription';

                      return (
                        <Link
                          key={lesson.id}
                          href={href}
                          className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4 transition-all duration-150 hover:border-primary/35 hover:bg-card hover:shadow-card-soft"
                        >
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                            {li + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug text-foreground">
                              {lesson.titleEn}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {done ? (
                                <Badge variant="success" className="rounded-full normal-case">
                                  Done
                                </Badge>
                              ) : unlocked ? (
                                <Badge variant="outline" className="rounded-full normal-case border-border">
                                  Open
                                </Badge>
                              ) : (
                                <Badge variant="warning" className="gap-1 rounded-full normal-case">
                                  <Lock className="size-3" />
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
}
