/** Browser-local calendar keys (not UTC). */

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeLocalVisitStreak(sortedUniqueDates: string[]): number {
  const set = new Set(sortedUniqueDates);
  const today = localDateKey(new Date());
  const cursor = new Date();
  if (!set.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const key = localDateKey(cursor);
    if (!set.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
