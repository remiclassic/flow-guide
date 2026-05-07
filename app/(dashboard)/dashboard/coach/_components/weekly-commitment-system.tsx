'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { startOfUtcWeek } from '@/lib/coach/analytics';
import { COACH_STORAGE_KEYS } from '@/lib/coach/storage-keys';
import type { CoachServerSnapshot } from '@/lib/coach/types';
import { useCoachTone } from './coach-tone-provider';

type WeeklyGoalsStored = {
  weekKeyUtc: string;
  intention: string;
  lessonsTarget: number | null;
  minutesTarget: number | null;
  modulesTarget: number | null;
};

function currentUtcWeekKey(d = new Date()): string {
  return startOfUtcWeek(d).toISOString().slice(0, 10);
}

function loadGoals(): WeeklyGoalsStored {
  if (typeof window === 'undefined') {
    return {
      weekKeyUtc: currentUtcWeekKey(),
      intention: '',
      lessonsTarget: null,
      minutesTarget: null,
      modulesTarget: null,
    };
  }
  try {
    const raw = localStorage.getItem(COACH_STORAGE_KEYS.weeklyGoals);
    if (!raw) throw new Error('empty');
    const p = JSON.parse(raw) as WeeklyGoalsStored;
    const wk = currentUtcWeekKey();
    if (p.weekKeyUtc !== wk) {
      return {
        weekKeyUtc: wk,
        intention: p.intention ?? '',
        lessonsTarget: null,
        minutesTarget: null,
        modulesTarget: null,
      };
    }
    return {
      weekKeyUtc: p.weekKeyUtc,
      intention: typeof p.intention === 'string' ? p.intention : '',
      lessonsTarget:
        typeof p.lessonsTarget === 'number' && p.lessonsTarget >= 0 ? p.lessonsTarget : null,
      minutesTarget:
        typeof p.minutesTarget === 'number' && p.minutesTarget >= 0 ? p.minutesTarget : null,
      modulesTarget:
        typeof p.modulesTarget === 'number' && p.modulesTarget >= 0 ? p.modulesTarget : null,
    };
  } catch {
    return {
      weekKeyUtc: currentUtcWeekKey(),
      intention: '',
      lessonsTarget: null,
      minutesTarget: null,
      modulesTarget: null,
    };
  }
}

function saveGoals(g: WeeklyGoalsStored) {
  try {
    localStorage.setItem(COACH_STORAGE_KEYS.weeklyGoals, JSON.stringify(g));
  } catch {
    /* ignore */
  }
}

function normalizeWeek(g: WeeklyGoalsStored): WeeklyGoalsStored {
  const wk = currentUtcWeekKey();
  if (g.weekKeyUtc === wk) return g;
  return {
    weekKeyUtc: wk,
    intention: g.intention,
    lessonsTarget: null,
    minutesTarget: null,
    modulesTarget: null,
  };
}

const MINUTES_PER_LESSON = 12;

export function WeeklyCommitmentSystem({
  snapshot,
  visitStreakDays,
}: {
  snapshot: CoachServerSnapshot;
  visitStreakDays: number;
}) {
  const { tone } = useCoachTone();
  const [rawGoals, setRawGoals] = useState<WeeklyGoalsStored>(() => loadGoals());
  const utcWeekKey = currentUtcWeekKey();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- utcWeekKey intentionally bumps weekly rollover
  const goals = useMemo(() => normalizeWeek(rawGoals), [rawGoals, utcWeekKey]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const lessonsProgress =
    goals.lessonsTarget != null && goals.lessonsTarget > 0
      ? Math.min(100, (snapshot.lessonsCompletedThisUtcWeek / goals.lessonsTarget) * 100)
      : 0;

  const estMinutesDone = snapshot.lessonsCompletedThisUtcWeek * MINUTES_PER_LESSON;
  const minutesProgress =
    goals.minutesTarget != null && goals.minutesTarget > 0
      ? Math.min(100, (estMinutesDone / goals.minutesTarget) * 100)
      : 0;

  const modulesProgress =
    goals.modulesTarget != null && goals.modulesTarget > 0
      ? Math.min(100, (snapshot.modulesCompletedThisUtcWeek / goals.modulesTarget) * 100)
      : 0;

  const targets = useMemo(() => {
    const active: Array<{ id: string; label: string; pct: number; met: boolean }> = [];
    if (goals.lessonsTarget != null && goals.lessonsTarget > 0) {
      active.push({
        id: 'lessons',
        label: `Lessons (${snapshot.lessonsCompletedThisUtcWeek}/${goals.lessonsTarget})`,
        pct: lessonsProgress,
        met: snapshot.lessonsCompletedThisUtcWeek >= goals.lessonsTarget,
      });
    }
    if (goals.minutesTarget != null && goals.minutesTarget > 0) {
      active.push({
        id: 'minutes',
        label: `Minutes (~${estMinutesDone}/${goals.minutesTarget})`,
        pct: minutesProgress,
        met: estMinutesDone >= goals.minutesTarget,
      });
    }
    if (goals.modulesTarget != null && goals.modulesTarget > 0) {
      active.push({
        id: 'modules',
        label: `Modules closed (${snapshot.modulesCompletedThisUtcWeek}/${goals.modulesTarget})`,
        pct: modulesProgress,
        met: snapshot.modulesCompletedThisUtcWeek >= goals.modulesTarget,
      });
    }
    return active;
  }, [
    goals.lessonsTarget,
    goals.minutesTarget,
    goals.modulesTarget,
    estMinutesDone,
    lessonsProgress,
    minutesProgress,
    modulesProgress,
    snapshot.lessonsCompletedThisUtcWeek,
    snapshot.modulesCompletedThisUtcWeek,
  ]);

  const weekDone =
    targets.length > 0 && targets.every((t) => t.met);

  const headerNote =
    tone === 'calm'
      ? 'Your intentions stay on this device—there’s no scoreboard, only support.'
      : tone === 'motivational'
        ? 'You choose the bar—we cheer beside it.'
        : tone === 'strategic'
          ? 'Tune targets anytime—the week is yours to design.'
          : 'Saved privately in your browser for now.';

  return (
    <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
      <CardHeader className="pb-3">
        <CardDescription className="flex flex-wrap items-center gap-3 text-sm font-semibold text-stat-level">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-stat-level/10">
            <Target className="size-5" />
          </span>
          Weekly rhythm
          {weekDone ? (
            <Badge className="rounded-full bg-emerald-600/90 text-white hover:bg-emerald-600">
              Week complete
            </Badge>
          ) : null}
        </CardDescription>
        <CardTitle className="text-xl font-semibold tracking-tight">
          Name what this week means to you
        </CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">{headerNote}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="coach-intention" className="text-sm font-medium text-foreground">
            This week I will…
          </label>
          <Input
            id="coach-intention"
            placeholder="e.g. Close one module calmly"
            value={goals.intention}
            onChange={(e) =>
              setRawGoals((g) => ({ ...normalizeWeek(g), intention: e.target.value }))
            }
            className="rounded-xl border-border/80 bg-white/90"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Lessons / week</label>
            <Input
              type="number"
              min={0}
              max={99}
              placeholder="—"
              value={goals.lessonsTarget ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setRawGoals((g) => {
                  const base = normalizeWeek(g);
                  return {
                    ...base,
                    lessonsTarget: v === '' ? null : Math.min(99, Math.max(0, Number(v))),
                  };
                });
              }}
              className="rounded-xl border-border/80 bg-white/90"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Minutes / week</label>
            <Input
              type="number"
              min={0}
              max={9999}
              placeholder="—"
              value={goals.minutesTarget ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setRawGoals((g) => {
                  const base = normalizeWeek(g);
                  return {
                    ...base,
                    minutesTarget: v === '' ? null : Math.min(9999, Math.max(0, Number(v))),
                  };
                });
              }}
              className="rounded-xl border-border/80 bg-white/90"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Modules / week</label>
            <Input
              type="number"
              min={0}
              max={99}
              placeholder="—"
              value={goals.modulesTarget ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setRawGoals((g) => {
                  const base = normalizeWeek(g);
                  return {
                    ...base,
                    modulesTarget: v === '' ? null : Math.min(99, Math.max(0, Number(v))),
                  };
                });
              }}
              className="rounded-xl border-border/80 bg-white/90"
            />
          </div>
        </div>

        {targets.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-sm text-muted-foreground">
            Add a lesson, minute, or module goal to see your week come alive. When Monday arrives, we
            quietly begin again—your intention can travel with you.
          </p>
        ) : (
          <ul className="space-y-4">
            {targets.map((t) => (
              <li key={t.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">{t.label}</span>
                  {t.met ? (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-label="Met" />
                  ) : null}
                </div>
                <Progress value={t.pct} className="h-2 bg-muted/80" />
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Rhythm at a glance</p>
          <p className="mt-1">
            Days in a row you&apos;ve finished a lesson:{' '}
            <span className="tabular-nums font-semibold text-foreground">
              {snapshot.completionStreakDays}
            </span>
          </p>
          <p className="mt-1">
            Days you&apos;ve opened this coaching space:{' '}
            <span className="tabular-nums font-semibold text-foreground">{visitStreakDays}</span>
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() =>
            setRawGoals({
              weekKeyUtc: currentUtcWeekKey(),
              intention: goals.intention,
              lessonsTarget: null,
              minutesTarget: null,
              modulesTarget: null,
            })
          }
        >
          Reset weekly numbers
        </Button>
      </CardContent>
    </Card>
  );
}
