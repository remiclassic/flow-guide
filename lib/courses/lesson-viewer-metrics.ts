import type { CompletionEvent } from '@/lib/coach/analytics';
import {
  computeCompletionStreakDays,
  countCompletionsTodayUtc,
} from '@/lib/coach/analytics';

/** UTC date string YYYY-MM-DD */
function toUtcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Seven integers — completions per UTC day, oldest → newest (last = today). */
export function completionsSparklineLast7DaysUtc(
  events: CompletionEvent[],
  now: Date = new Date()
): number[] {
  const out: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - i);
    day.setUTCHours(12, 0, 0, 0);
    const dayStr = toUtcDateString(day);
    const n = events.filter((e) => toUtcDateString(e.completedAt) === dayStr).length;
    out.push(n);
  }
  return out;
}

export function courseCompletionStreakDays(
  events: CompletionEvent[]
): number {
  return computeCompletionStreakDays(events);
}

export function completedLessonToday(events: CompletionEvent[], now: Date): boolean {
  return countCompletionsTodayUtc(events, now) > 0;
}
