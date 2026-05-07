import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock, Lock } from 'lucide-react';
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
  getCourseOutline,
  getPublishedCourses,
  getTeamForUser,
  getUser,
  isPersistedCourseRow,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import {
  courseDescriptionForSlug,
  GLOW_FLOW_COURSE_SLUG,
} from '@/lib/courses/curriculum';
import {
  courseCtaLabel,
  courseListingCounts,
  courseListingProgress,
  flattenLessonIds,
  toOutlineLite,
} from '@/lib/courses/progress';

function courseHeroGradient(slug: string, index: number): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * (i + 1)) % 360;
  const h2 = (h + 40 + index * 22) % 360;
  return `linear-gradient(135deg, hsl(${h} 42% 91%) 0%, hsl(${h2} 48% 87%) 50%, hsl(268 38% 93%) 100%)`;
}

function formatApproxHours(estMinutes: number): string {
  const h = estMinutes / 60;
  if (Number.isInteger(h)) return String(h);
  return (Math.round(h * 10) / 10).toFixed(1);
}

export default async function CoursesLibraryPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);

  const rows = await getPublishedCourses();
  const items = await Promise.all(
    rows.map(async (course) => {
      const outline = isPersistedCourseRow(course)
        ? await getCourseOutline(course.id)
        : [];
      const lite = toOutlineLite(outline);
      const lessonIds = flattenLessonIds(lite);
      const done = await getCompletedLessonIdsForUser(user.id, lessonIds);
      const completed = lessonIds.filter((id) => done.has(id)).length;
      const { moduleCount, lessonCount, estMinutes } = courseListingCounts(
        course,
        outline.length,
        lessonIds.length
      );
      const ratio = courseListingProgress(
        course,
        completed,
        lessonIds.length,
        lessonCount
      );
      const isComingSoon = course.isComingSoon;
      const statusLabel = isComingSoon
        ? 'Coming soon'
        : !unlocked
          ? 'Locked'
          : ratio.percent === 0
            ? 'New'
            : ratio.percent === 100
              ? 'Complete'
              : 'Continue';
      return {
        ...course,
        moduleCount,
        lessonCount,
        estMinutes,
        progress: ratio,
        statusLabel,
        isComingSoon,
      };
    })
  );

  return (
    <section className="flex-1 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_34rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.28))] p-3 pb-10 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-7">
      <div className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-[0_22px_74px_-46px_hsl(var(--primary)/0.5)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Learning path
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">
            Course library
          </h1>
          <p className="text-base leading-8 text-muted-foreground sm:text-lg">
            Access structured courses with guided lessons, saved progress, and a clear
            path to help you keep learning consistently.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit rounded-full border border-primary/10 bg-primary/10 px-5 py-2 text-sm font-semibold normal-case tracking-normal text-primary"
        >
          {items.length} program{items.length === 1 ? '' : 's'}
        </Badge>
      </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {items.map((course, idx) => {
          const cta = courseCtaLabel(course.progress.completed);
          const hours = formatApproxHours(Math.max(1, course.estMinutes));
          const blurb = courseDescriptionForSlug(course.slug, course.description);
          const isGlowFlowCourse = course.slug === GLOW_FLOW_COURSE_SLUG;
          const heroSrc = course.heroImagePath?.trim() || null;
          const isComingSoon = course.isComingSoon;
          return (
            <Card
              key={course.id}
              className={`group gap-0 overflow-hidden rounded-[1.8rem] border-white/80 bg-white py-0 shadow-[0_18px_58px_-36px_hsl(var(--primary)/0.42)] transition-all duration-300 ${
                isComingSoon
                  ? ''
                  : 'hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_28px_80px_-40px_hsl(var(--primary)/0.55)]'
              }`}
            >
              <div
                className="relative aspect-[16/11] overflow-hidden border-b border-white/60"
                style={{ background: courseHeroGradient(course.slug, idx) }}
              >
                {isGlowFlowCourse ? (
                  <Image
                    src="/brand/glow-flow-continue-hero.png"
                    alt=""
                    fill
                    className={`object-cover ${isComingSoon ? 'grayscale-[0.35]' : ''}`}
                    sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 33vw"
                    priority={idx === 0}
                  />
                ) : null}
                {heroSrc && !isGlowFlowCourse ? (
                  <Image
                    src={heroSrc}
                    alt=""
                    fill
                    className={`object-cover ${isComingSoon ? 'grayscale-[0.45]' : ''}`}
                    sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 33vw"
                  />
                ) : null}
                {!isGlowFlowCourse && !heroSrc ? (
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(255,255,255,0.7),transparent_12rem),linear-gradient(135deg,rgba(255,255,255,0.24),transparent)]" />
                ) : null}
                {isComingSoon ? (
                  <span className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
                ) : null}
                <span className="absolute bottom-5 left-5 text-6xl font-semibold tracking-[-0.08em] text-white/75 drop-shadow-sm">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="absolute right-4 top-4 flex flex-wrap items-center justify-end gap-2">
                  <span
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm ${
                      isComingSoon
                        ? 'bg-amber-500/95 text-white'
                        : 'bg-white/92 text-foreground'
                    }`}
                  >
                    {course.statusLabel}
                  </span>
                  {isComingSoon ? (
                    <span className="flex items-center gap-1 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                      <Lock className="size-3" aria-hidden />
                      Locked
                    </span>
                  ) : !unlocked ? (
                    <span className="flex items-center gap-1 rounded-full bg-white/92 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
                      <Lock className="size-3" />
                      Members
                    </span>
                  ) : null}
                </div>
              </div>
              <CardHeader className="space-y-3 pb-2 pt-7">
                <CardTitle
                  className={`text-2xl font-semibold tracking-[-0.03em] text-foreground transition-colors ${
                    isComingSoon ? '' : 'group-hover:text-primary'
                  }`}
                >
                  {course.title}
                </CardTitle>
                {blurb ? (
                  <CardDescription className="line-clamp-3 text-base leading-7">
                    {blurb}
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-7 pb-8">
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span className="rounded-xl bg-muted/35 px-3 py-2">
                    <span className="block text-muted-foreground/75">Modules</span>
                    <span className="text-sm font-semibold text-foreground">{course.moduleCount}</span>
                  </span>
                  <span className="rounded-xl bg-muted/35 px-3 py-2">
                    <span className="block text-muted-foreground/75">Lessons</span>
                    <span className="text-sm font-semibold text-foreground">{course.lessonCount}</span>
                  </span>
                  <span className="rounded-xl bg-muted/35 px-3 py-2">
                    <Clock className="mb-0.5 size-3.5 text-primary/70" />
                    <span className="text-sm font-semibold text-foreground">~{hours}h</span>
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>Progress</span>
                    <span className="tabular-nums">
                      {course.progress.completed}/{course.progress.total} lessons
                    </span>
                  </div>
                  <Progress value={course.progress.percent} className="h-3" />
                </div>
                {isComingSoon ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled
                    className="h-12 w-full cursor-not-allowed rounded-full border border-muted bg-muted/80 text-base font-semibold text-muted-foreground shadow-none"
                  >
                    Coming soon
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full rounded-full border-0 text-base btn-gradient-primary shadow-card-soft"
                  >
                    <Link href={`/dashboard/courses/${course.slug}`}>{cta}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed border-border bg-muted/25 shadow-none">
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            No published courses yet.
          </CardContent>
        </Card>
      ) : null}
      </div>
    </section>
  );
}
