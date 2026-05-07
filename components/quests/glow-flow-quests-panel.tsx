import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Flag, LockIcon } from 'lucide-react';
import type { OutlineModuleLite } from '@/lib/courses/progress';
import {
  resolveGlowFlowCampaignQuests,
  resolveGlowFlowSideQuestGroups,
  type ResolvedGlowFlowCampaignQuest,
  type ResolvedGlowFlowLessonQuest,
} from '@/lib/quests/progress';
import { cn } from '@/lib/utils';

const THUMB = 112;

function QuestThumb({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        className
      )}
      style={{ width: THUMB, height: THUMB }}
    >
      <Image
        src={src}
        alt={alt}
        width={THUMB}
        height={THUMB}
        className="size-full object-cover"
        sizes={`${THUMB}px`}
      />
    </div>
  );
}

function campaignBadge(status: ResolvedGlowFlowCampaignQuest['status']) {
  switch (status) {
    case 'locked':
      return (
        <Badge variant="secondary" className="rounded-full font-medium">
          Locked
        </Badge>
      );
    case 'complete':
      return (
        <Badge className="rounded-full bg-primary/12 text-primary hover:bg-primary/12">
          Complete
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="secondary" className="rounded-full font-medium">
          In progress
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="rounded-full font-medium">
          Available
        </Badge>
      );
  }
}

function lessonBadge(status: ResolvedGlowFlowLessonQuest['status']) {
  switch (status) {
    case 'locked':
      return (
        <Badge variant="secondary" className="rounded-full text-xs font-medium">
          Locked
        </Badge>
      );
    case 'complete':
      return (
        <Badge className="rounded-full bg-primary/12 text-xs text-primary hover:bg-primary/12">
          Complete
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="rounded-full text-xs font-medium">
          Active
        </Badge>
      );
  }
}

function campaignCtaHref(
  row: ResolvedGlowFlowCampaignQuest,
  primarySlug: string,
  unlocked: boolean
): string {
  if (!unlocked) return '/pricing?reason=subscription';
  if (row.status === 'complete') return `/dashboard/courses/${primarySlug}`;
  if (row.nextLessonKey) return `/dashboard/courses/${primarySlug}/lessons/${row.nextLessonKey}`;
  return `/dashboard/courses/${primarySlug}`;
}

function campaignCtaLabel(row: ResolvedGlowFlowCampaignQuest, unlocked: boolean): string {
  if (!unlocked) return 'Unlock';
  if (row.status === 'complete') return 'Review path';
  return 'Continue';
}

export function GlowFlowQuestsPanel({
  primarySlug,
  unlocked,
  outlineLite,
  completedSet,
}: {
  primarySlug: string;
  unlocked: boolean;
  outlineLite: OutlineModuleLite[];
  completedSet: ReadonlySet<number>;
}) {
  const campaign = resolveGlowFlowCampaignQuests(outlineLite, completedSet, unlocked);
  const sideGroups = resolveGlowFlowSideQuestGroups(
    outlineLite,
    completedSet,
    primarySlug,
    unlocked
  );

  return (
    <div className="space-y-8">
      <Card className="border-border/80 shadow-card-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="size-5 text-primary" aria-hidden />
            Campaign quests
          </CardTitle>
          <CardDescription>
            Each module is a major quest. Finish its lessons to complete it—progress stays synced with
            your checklist.
          </CardDescription>
        </CardHeader>
      </Card>

      <ul className="space-y-4">
        {campaign.map((row) => {
          const href = campaignCtaHref(row, primarySlug, unlocked);
          const done = row.status === 'complete';

          return (
            <li key={row.id}>
              <Card className="overflow-hidden border-border/80 shadow-card-soft">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch">
                  <QuestThumb src={row.imageSrc} alt={`Quest art: ${row.title}`} />
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{row.title}</p>
                      {campaignBadge(row.status)}
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {row.moduleTitleEn}
                      {row.rewardTitle ? ` · ${row.rewardTitle}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{row.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Reward: <span className="font-medium text-foreground">+{row.rewardXp} XP</span>
                      </span>
                      <span className="tabular-nums">
                        {row.completed}/{row.total} lessons
                      </span>
                    </div>
                    <Progress value={row.percent} className="h-2 max-w-md bg-muted/80" />
                  </div>
                  <Button
                    asChild
                    className="shrink-0 self-start rounded-full sm:self-center"
                    variant={done ? 'outline' : 'default'}
                  >
                    <Link href={href} className="gap-2">
                      {!unlocked ? (
                        <>
                          <LockIcon className="size-4" />
                          {campaignCtaLabel(row, unlocked)}
                        </>
                      ) : (
                        <>
                          {campaignCtaLabel(row, unlocked)}
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

      <Card className="border-border/80 shadow-card-soft">
        <CardHeader>
          <CardTitle>Side quests</CardTitle>
          <CardDescription>
            One quest per lesson—complete the lesson to check it off. Spotlight quests include bonus
            badges.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-8">
        {sideGroups.map((group) => (
          <section key={group.moduleNumericId} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group.moduleTitleEn}
            </h2>
            <ul className="space-y-2">
              {group.quests.map((q) => {
                const href = !unlocked ? '/pricing?reason=subscription' : q.href;

                return (
                  <li key={q.lessonKey}>
                    <Card className="border-border/80 shadow-card-soft">
                      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                        <QuestThumb
                          className="sm:mt-0"
                          src={q.imageSrc}
                          alt={`Quest art: ${q.questTitle}`}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{q.questTitle}</p>
                            {lessonBadge(q.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{q.description}</p>
                          <p className="text-xs text-muted-foreground">
                            +{q.rewardXp} XP
                            {q.rewardBadge ? (
                              <>
                                {' '}
                                · Badge:{' '}
                                <span className="font-medium text-foreground">{q.rewardBadge}</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          variant={q.status === 'complete' ? 'outline' : 'default'}
                          className="shrink-0 rounded-full"
                        >
                          <Link href={href} className="gap-2">
                            {!unlocked ? (
                              <>
                                <LockIcon className="size-4" />
                                Unlock
                              </>
                            ) : q.status === 'complete' ? (
                              <>
                                Review
                                <ArrowRight className="size-4" />
                              </>
                            ) : (
                              <>
                                Begin
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
          </section>
        ))}
      </div>
    </div>
  );
}
