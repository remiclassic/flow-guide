import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  AlertCircle,
  Flag,
  Trophy,
  Activity as ActivityIcon,
  ArrowRight,
  LockIcon,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import {
  getActivityLogs,
  getCompletedLessonIdsForUser,
  filterOutlineForLearner,
  getCourseOutline,
  getPublishedCourses,
  primaryPlayableCourse,
  getTeamForUser,
  getUser,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import {
  completionRatio,
  flattenLessonIds,
  moduleProgressRows,
  toOutlineLite,
  type OutlineModuleLite,
} from '@/lib/courses/progress';
import { GLOW_FLOW_COURSE_SLUG } from '@/lib/courses/curriculum';
import { GlowFlowQuestsPanel } from '@/components/quests/glow-flow-quests-panel';
import { activityIconMap } from '@/lib/activity/format';
import {
  formatActivityActionI18n,
  getRelativeTimeLongI18n,
  type ActivityTranslateFn,
} from '@/lib/activity/format-i18n';
import { cn } from '@/lib/utils';

type ActivityTab = 'activity' | 'quests' | 'achievements';

type DashboardT = Awaited<ReturnType<typeof getTranslations>>;

function nextLessonInModule(
  outline: OutlineModuleLite[],
  moduleTitleEn: string,
  completedSet: ReadonlySet<number>
): { lessonKey: string; titleEn: string } | null {
  const mod = outline.find((m) => m.titleEn === moduleTitleEn);
  if (!mod) return null;
  for (const lesson of mod.lessons) {
    if (!completedSet.has(lesson.id)) {
      return { lessonKey: lesson.lessonKey, titleEn: lesson.titleEn };
    }
  }
  return null;
}

function ActivityTabs({ active, t }: { active: ActivityTab; t: DashboardT }) {
  const tabs: { href: string; label: string; key: ActivityTab; icon: LucideIcon }[] = [
    { href: '/dashboard/activity', label: t('activity.tabActivity'), key: 'activity', icon: ActivityIcon },
    { href: '/dashboard/activity?view=quests', label: t('activity.tabQuests'), key: 'quests', icon: Flag },
    {
      href: '/dashboard/activity?view=achievements',
      label: t('activity.tabAchievements'),
      key: 'achievements',
      icon: Trophy,
    },
  ];

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-border/80 pb-3"
      aria-label={t('activity.tabsAria')}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-primary/12 text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

async function ActivityLogPanel({ t }: { t: DashboardT }) {
  const logs = await getActivityLogs();
  const activityLogT = t as unknown as ActivityTranslateFn;

  return (
    <Card className="border-border/80 shadow-card-soft">
      <CardHeader>
        <CardTitle>{t('activity.logTitle')}</CardTitle>
        <CardDescription>{t('activity.logDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <ul className="space-y-4">
            {logs.map((log) => {
              const Icon = activityIconMap[log.action as ActivityType] || Settings;
              const formattedAction = formatActivityActionI18n(log.action as ActivityType, activityLogT);

              return (
                <li key={log.id} className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2.5">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {formattedAction}
                      {log.ipAddress ? ` ${t('activity.fromIp', { ip: log.ipAddress })}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTimeLongI18n(new Date(log.timestamp), activityLogT)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 size-12 text-primary/70" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">{t('activity.noActivityTitle')}</h3>
            <p className="max-w-sm text-sm text-muted-foreground">{t('activity.noActivityBody')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Generic module-as-quest list for non–Glow Flow primary courses */
function ModuleQuestsFallbackPanel({
  primarySlug,
  unlocked,
  outlineLite,
  modRows,
  completedSet,
  t,
}: {
  primarySlug: string;
  unlocked: boolean;
  outlineLite: OutlineModuleLite[];
  modRows: ReturnType<typeof moduleProgressRows>;
  completedSet: ReadonlySet<number>;
  t: DashboardT;
}) {
  return (
    <div className="space-y-4">
      <Card className="border-border/80 shadow-card-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="size-5 text-primary" aria-hidden />
            {t('activity.moduleQuestsTitle')}
          </CardTitle>
          <CardDescription>{t('activity.moduleQuestsDesc')}</CardDescription>
        </CardHeader>
      </Card>

      <ul className="space-y-3">
        {modRows.map((row) => {
          const next = nextLessonInModule(outlineLite, row.titleEn, completedSet);
          const done = row.percent >= 100;
          const href = !unlocked
            ? '/pricing?reason=subscription'
            : next
              ? `/dashboard/courses/${primarySlug}/lessons/${next.lessonKey}`
              : `/dashboard/courses/${primarySlug}`;

          return (
            <li key={row.moduleId}>
              <Card className="border-border/80 shadow-card-soft">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{row.titleEn}</p>
                      {done ? (
                        <Badge className="rounded-full bg-primary/12 text-primary hover:bg-primary/12">
                          {t('shared.complete')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full font-medium">
                          {t('shared.inProgress')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('shared.lessonsCompleted', { completed: row.completed, total: row.total })}
                    </p>
                    <Progress value={row.percent} className="h-2 max-w-md bg-muted/80" />
                  </div>
                  <Button asChild className="shrink-0 rounded-full" variant={done ? 'outline' : 'default'}>
                    <Link href={href} className="gap-2">
                      {!unlocked ? (
                        <>
                          <LockIcon className="size-4" />
                          {t('shared.unlock')}
                        </>
                      ) : done ? (
                        <>
                          {t('shared.reviewPath')}
                          <ArrowRight className="size-4" />
                        </>
                      ) : (
                        <>
                          {t('shared.continue')}
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type AchievementTile = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  iconSrc: string;
};

type AchievementCtx = {
  ratioPercent: number;
  ratioCompleted: number;
  ratioTotal: number;
  moduleCount: number;
  modulesCompleted: number;
  modulesStarted: number;
  touchedAllModules: boolean;
};

const STATIC_ACHIEVEMENT_DEFS: {
  id: string;
  iconSrc: string;
  minLessons?: number;
  minModules?: number;
  isUnlocked: (ctx: AchievementCtx) => boolean;
}[] = [
  {
    id: 'first-step',
    iconSrc: '/achievements/first-step.svg',
    isUnlocked: (c) => c.ratioCompleted >= 1,
  },
  {
    id: 'triple-spark',
    iconSrc: '/achievements/lessons-3.svg',
    minLessons: 3,
    isUnlocked: (c) => c.ratioCompleted >= 3,
  },
  {
    id: 'steady-five',
    iconSrc: '/achievements/lessons-5.svg',
    minLessons: 5,
    isUnlocked: (c) => c.ratioCompleted >= 5,
  },
  {
    id: 'double-digits',
    iconSrc: '/achievements/lessons-10.svg',
    minLessons: 10,
    isUnlocked: (c) => c.ratioCompleted >= 10,
  },
  {
    id: 'deep-bench',
    iconSrc: '/achievements/lessons-15.svg',
    minLessons: 15,
    isUnlocked: (c) => c.ratioCompleted >= 15,
  },
  {
    id: 'score-twenty',
    iconSrc: '/achievements/lessons-20.svg',
    minLessons: 20,
    isUnlocked: (c) => c.ratioCompleted >= 20,
  },
  {
    id: 'silver-stack',
    iconSrc: '/achievements/lessons-25.svg',
    minLessons: 25,
    isUnlocked: (c) => c.ratioCompleted >= 25,
  },
  {
    id: 'penultimate-push',
    iconSrc: '/achievements/lessons-30.svg',
    minLessons: 30,
    isUnlocked: (c) => c.ratioCompleted >= 30,
  },
  {
    id: 'building-rhythm',
    iconSrc: '/achievements/pct-25.svg',
    isUnlocked: (c) => c.ratioPercent >= 25,
  },
  {
    id: 'halfway-hero',
    iconSrc: '/achievements/pct-50.svg',
    isUnlocked: (c) => c.ratioPercent >= 50,
  },
  {
    id: 'strong-current',
    iconSrc: '/achievements/pct-75.svg',
    isUnlocked: (c) => c.ratioPercent >= 75,
  },
  {
    id: 'final-approach',
    iconSrc: '/achievements/pct-90.svg',
    isUnlocked: (c) => c.ratioPercent >= 90,
  },
  {
    id: 'finisher',
    iconSrc: '/achievements/pct-100.svg',
    isUnlocked: (c) => c.ratioPercent >= 100,
  },
  {
    id: 'branching-paths',
    iconSrc: '/achievements/modules-branching.svg',
    minModules: 2,
    isUnlocked: (c) => c.modulesStarted >= 2,
  },
  {
    id: 'full-map',
    iconSrc: '/achievements/modules-full-coverage.svg',
    minModules: 2,
    isUnlocked: (c) => c.touchedAllModules,
  },
  {
    id: 'first-pillar',
    iconSrc: '/achievements/module-first-complete.svg',
    isUnlocked: (c) => c.modulesCompleted >= 1,
  },
  {
    id: 'triple-pillars',
    iconSrc: '/achievements/modules-three-complete.svg',
    minModules: 3,
    isUnlocked: (c) => c.modulesCompleted >= 3,
  },
  {
    id: 'half-the-hall',
    iconSrc: '/achievements/modules-half-hall.svg',
    minModules: 2,
    isUnlocked: (c) =>
      c.moduleCount > 0 && c.modulesCompleted >= Math.ceil(c.moduleCount / 2),
  },
];

function buildAchievementTiles(
  modRows: ReturnType<typeof moduleProgressRows>,
  ctx: AchievementCtx,
  t: DashboardT
): AchievementTile[] {
  const moduleMasteries: AchievementTile[] = modRows
    .filter((r) => r.percent >= 100)
    .map((r) => ({
      id: `mastery-${r.moduleId}`,
      title: t('activity.masteredPrefix', { title: r.titleEn }),
      description: t('activity.masteredDesc'),
      unlocked: true,
      iconSrc: '/achievements/module-mastery.svg',
    }));

  const staticTiles: AchievementTile[] = STATIC_ACHIEVEMENT_DEFS.filter((def) => {
    if (def.minLessons != null && ctx.ratioTotal < def.minLessons) return false;
    if (def.minModules != null && ctx.moduleCount < def.minModules) return false;
    return true;
  }).map((def) => ({
    id: def.id,
    title: t(`activity.achievements.${def.id}.title` as 'activity.achievements.first-step.title'),
    description: t(`activity.achievements.${def.id}.description` as 'activity.achievements.first-step.description'),
    iconSrc: def.iconSrc,
    unlocked: def.isUnlocked(ctx),
  }));

  return [...staticTiles, ...moduleMasteries];
}

function AchievementsPanel({
  ratioPercent,
  ratioCompleted,
  ratioTotal,
  modRows,
  t,
}: {
  ratioPercent: number;
  ratioCompleted: number;
  ratioTotal: number;
  modRows: ReturnType<typeof moduleProgressRows>;
  t: DashboardT;
}) {
  const moduleCount = modRows.length;
  const modulesCompleted = modRows.filter((r) => r.percent >= 100).length;
  const modulesStarted = modRows.filter((r) => r.completed > 0).length;
  const touchedAllModules = moduleCount > 0 && modRows.every((r) => r.completed > 0);

  const ctx: AchievementCtx = {
    ratioPercent,
    ratioCompleted,
    ratioTotal,
    moduleCount,
    modulesCompleted,
    modulesStarted,
    touchedAllModules,
  };

  const tiles = buildAchievementTiles(modRows, ctx, t);
  const unlockedCount = tiles.filter((tile) => tile.unlocked).length;

  return (
    <div className="space-y-4">
      <Card className="border-border/80 shadow-card-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" aria-hidden />
            {t('activity.achievementsTitle')}
          </CardTitle>
          <CardDescription>
            {t('activity.achievementsDesc', {
              completed: ratioCompleted,
              total: ratioTotal,
              percent: ratioPercent,
              unlocked: unlockedCount,
              totalBadges: tiles.length,
            })}
          </CardDescription>
        </CardHeader>
      </Card>

      <ul className="grid gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <li key={tile.id}>
            <Card
              className={cn(
                'h-full border-border/80 shadow-card-soft transition-opacity',
                tile.unlocked ? 'opacity-100' : 'opacity-60'
              )}
            >
              <CardContent className="flex gap-4 p-5">
                <div
                  className={cn(
                    'relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60',
                    tile.unlocked ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.iconSrc}
                    alt=""
                    width={40}
                    height={40}
                    className={cn(
                      'size-10 object-contain',
                      tile.unlocked ? 'opacity-100' : 'opacity-45 saturate-0'
                    )}
                  />
                  {!tile.unlocked ? (
                    <span
                      className="absolute bottom-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm ring-1 ring-border/80"
                      aria-hidden
                    >
                      <LockIcon className="size-3" />
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{tile.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tile.description}</p>
                  {tile.unlocked ? (
                    <p className="mt-2 text-xs font-medium text-primary">{t('activity.achievementUnlocked')}</p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">{t('activity.achievementLocked')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyCourseState({
  variant,
  t,
}: {
  variant: 'quests' | 'achievements';
  t: DashboardT;
}) {
  return (
    <Card className="border-border/80 shadow-card-soft">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <AlertCircle className="mb-4 size-12 text-primary/70" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {variant === 'quests' ? t('activity.emptyQuestsTitle') : t('activity.emptyAchievementsTitle')}
        </h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {variant === 'quests' ? t('activity.emptyQuestsBody') : t('activity.emptyAchievementsBody')}
        </p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/courses">{t('shared.browseCourses')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function ActivityPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  const user = await getUser();
  if (!user) {
    return redirectLocalized({ href: '/sign-in' });
  }

  const { view } = await searchParams;
  const tab: ActivityTab =
    view === 'quests' ? 'quests' : view === 'achievements' ? 'achievements' : 'activity';

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);
  const courses = await getPublishedCourses();
  const primary = primaryPlayableCourse(courses);

  let outlineLite: OutlineModuleLite[] = [];
  let completedSet = new Set<number>();
  let modRows: ReturnType<typeof moduleProgressRows> = [];
  let ratio = { percent: 0, completed: 0, total: 0 };

  if (primary) {
    const outlineRaw = await getCourseOutline(primary.id);
    const outline = filterOutlineForLearner(outlineRaw);
    outlineLite = toOutlineLite(outline);
    const lessonIds = flattenLessonIds(outlineLite);
    completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);
    ratio = completionRatio(
      lessonIds.filter((id) => completedSet.has(id)).length,
      lessonIds.length
    );
    modRows = moduleProgressRows(outlineLite, completedSet);
  }

  const title =
    tab === 'quests'
      ? t('activity.titleQuests')
      : tab === 'achievements'
        ? t('activity.titleAchievements')
        : t('activity.titleActivity');

  const subtitle =
    tab === 'activity'
      ? t('activity.subtitleActivity')
      : tab === 'quests'
        ? t('activity.subtitleQuests')
        : t('activity.subtitleAchievements');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="mb-1 text-lg font-semibold text-foreground lg:text-2xl">{title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>

      <ActivityTabs active={tab} t={t} />

      {tab === 'activity' ? (
        <ActivityLogPanel t={t} />
      ) : !primary ? (
        <EmptyCourseState variant={tab === 'quests' ? 'quests' : 'achievements'} t={t} />
      ) : tab === 'quests' ? (
        primary.slug === GLOW_FLOW_COURSE_SLUG ? (
          <GlowFlowQuestsPanel
            primarySlug={primary.slug}
            unlocked={unlocked}
            outlineLite={outlineLite}
            completedSet={completedSet}
          />
        ) : (
          <ModuleQuestsFallbackPanel
            primarySlug={primary.slug}
            unlocked={unlocked}
            outlineLite={outlineLite}
            modRows={modRows}
            completedSet={completedSet}
            t={t}
          />
        )
      ) : (
        <AchievementsPanel
          ratioPercent={ratio.percent}
          ratioCompleted={ratio.completed}
          ratioTotal={ratio.total}
          modRows={modRows}
          t={t}
        />
      )}
    </section>
  );
}
