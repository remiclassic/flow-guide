import type { OutlineModuleLite } from '@/lib/courses/progress';

export type CompletionEvent = { lessonId: number; completedAt: Date };

function toUtcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfUtcWeek(d: Date): Date {
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export function countCompletionsInUtcWeek(
  events: CompletionEvent[],
  now: Date
): number {
  const weekStart = startOfUtcWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  return events.filter(
    (e) => e.completedAt >= weekStart && e.completedAt < weekEnd
  ).length;
}

export function countCompletionsTodayUtc(events: CompletionEvent[], now: Date): number {
  const t = toUtcDateString(now);
  return events.filter((e) => toUtcDateString(e.completedAt) === t).length;
}

export function daysSinceLastCompletion(
  events: CompletionEvent[],
  now: Date
): number | null {
  if (events.length === 0) return null;
  const latest = events.reduce((a, b) =>
    a.completedAt > b.completedAt ? a : b
  ).completedAt;
  const diffMs = now.getTime() - latest.getTime();
  return Math.floor(diffMs / 86400000);
}

/** Streak along UTC calendar days ending at the day of the latest completion. */
export function computeCompletionStreakDays(events: CompletionEvent[]): number {
  if (events.length === 0) return 0;
  const dates = new Set(events.map((e) => toUtcDateString(e.completedAt)));
  const latest = events.reduce((a, b) =>
    a.completedAt > b.completedAt ? a : b
  ).completedAt;
  let streak = 0;
  const cursor = new Date(latest);
  cursor.setUTCHours(12, 0, 0, 0);
  while (dates.has(toUtcDateString(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function completionsInRollingWindow(
  events: CompletionEvent[],
  now: Date,
  startDaysAgo: number,
  endDaysAgo: number
): number {
  const t0 = now.getTime();
  const startMs = startDaysAgo * 86400000;
  const endMs = endDaysAgo * 86400000;
  return events.filter((e) => {
    const dt = t0 - e.completedAt.getTime();
    return dt >= startMs && dt < endMs;
  }).length;
}

export function countModulesFinishedInUtcWeek(
  outline: OutlineModuleLite[],
  completedSet: ReadonlySet<number>,
  events: CompletionEvent[],
  now: Date
): number {
  const weekStart = startOfUtcWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const byLesson = new Map<number, Date>();
  for (const e of events) {
    byLesson.set(e.lessonId, e.completedAt);
  }

  let count = 0;
  for (const mod of outline) {
    const ids = mod.lessons.map((l) => l.id);
    if (ids.length === 0) continue;
    const allDone = ids.every((id) => completedSet.has(id));
    if (!allDone) continue;
    const times = ids.map((id) => byLesson.get(id)).filter((x): x is Date => x != null);
    if (times.length !== ids.length) continue;
    const moduleDoneAt = new Date(Math.max(...times.map((t) => t.getTime())));
    if (moduleDoneAt >= weekStart && moduleDoneAt < weekEnd) count += 1;
  }
  return count;
}

export function findStrongestModuleTitle(
  modRows: Array<{ titleEn: string; percent: number }>
): string | null {
  const inProgress = modRows.filter((r) => r.percent > 0 && r.percent < 100);
  if (inProgress.length === 0) {
    const firstNew = modRows.find((r) => r.percent === 0);
    return firstNew?.titleEn ?? null;
  }
  return inProgress.reduce((a, b) => (a.percent >= b.percent ? a : b)).titleEn;
}

export function findNearCompleteModule<
  T extends { titleEn: string; completed: number; total: number; percent: number },
>(modRows: T[]): T | null {
  const candidates = modRows.filter(
    (r) => r.percent > 0 && r.percent < 100 && r.total - r.completed === 1
  );
  if (candidates.length === 0) return null;
  return candidates[0] ?? null;
}
