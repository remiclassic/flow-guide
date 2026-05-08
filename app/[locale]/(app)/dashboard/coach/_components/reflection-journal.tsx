'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookHeart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COACH_STORAGE_KEYS } from '@/lib/coach/storage-keys';
import { localDateKey } from '@/lib/coach/local-dates';
import { useCoachTone } from './coach-tone-provider';

export type JournalEntry = {
  id: string;
  createdAt: string;
  dateKey: string;
  learned: string;
  challenged: string;
  applyNext: string;
};

const MAX_ENTRIES = 60;

function safeParse(raw: string | null): JournalEntry[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function loadJournal(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(COACH_STORAGE_KEYS.journal));
}

function saveJournal(entries: JournalEntry[]) {
  try {
    localStorage.setItem(COACH_STORAGE_KEYS.journal, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore */
  }
}

export function ReflectionJournal() {
  const { tone } = useCoachTone();
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournal());
  const [learned, setLearned] = useState('');
  const [challenged, setChallenged] = useState('');
  const [applyNext, setApplyNext] = useState('');

  useEffect(() => {
    saveJournal(entries);
  }, [entries]);

  const saveEntry = useCallback(() => {
    const trimmed =
      learned.trim() || challenged.trim() || applyNext.trim()
        ? { learned: learned.trim(), challenged: challenged.trim(), applyNext: applyNext.trim() }
        : null;
    if (!trimmed) return;
    const now = new Date();
    const entry: JournalEntry = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: now.toISOString(),
      dateKey: localDateKey(now),
      learned: trimmed.learned,
      challenged: trimmed.challenged,
      applyNext: trimmed.applyNext,
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
    setLearned('');
    setChallenged('');
    setApplyNext('');
  }, [learned, challenged, applyNext]);

  const sortedPreview = useMemo(
    () => entries.slice(0, 8),
    [entries]
  );

  const textareaClass = cn(
    'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
    'border-input flex min-h-[72px] w-full rounded-xl border bg-white/90 px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
  );

  const emptyCopy =
    tone === 'calm'
      ? 'Stillness is okay—when you’re ready, one honest line is enough.'
      : tone === 'motivational'
        ? 'Fresh page, fresh energy—note a win from today.'
        : tone === 'strategic'
          ? 'Start with one takeaway worth remembering.'
          : 'Short notes beat perfect paragraphs.';

  return (
    <Card className="border-white/80 bg-white/92 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-soft-hover">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-3 text-sm font-semibold text-chart-5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-chart-5/10">
            <BookHeart className="size-5" />
          </span>
          Reflection space
        </CardDescription>
        <CardTitle className="text-xl font-semibold tracking-tight">
          A quiet place to digest what you&apos;re learning
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Your reflections stay private on this device for now.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">What did you learn today?</label>
            <textarea
              className={textareaClass}
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="One insight is enough."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">What challenged you?</label>
            <textarea
              className={textareaClass}
              value={challenged}
              onChange={(e) => setChallenged(e.target.value)}
              placeholder="What slowed you down or surprised you?"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">What will you apply next?</label>
            <textarea
              className={textareaClass}
              value={applyNext}
              onChange={(e) => setApplyNext(e.target.value)}
              placeholder="Tiny next step beats a big vague plan."
            />
          </div>
        </div>
        <Button type="button" className="rounded-full btn-gradient-primary" onClick={saveEntry}>
          Save entry
        </Button>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Lately
          </p>
          {sortedPreview.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyCopy}
            </div>
          ) : (
            <ul className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {sortedPreview.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-sm leading-relaxed"
                >
                  <p className="text-xs font-medium text-muted-foreground">{e.dateKey}</p>
                  {e.learned ? (
                    <p className="mt-2">
                      <span className="font-semibold text-foreground">Learned: </span>
                      {e.learned}
                    </p>
                  ) : null}
                  {e.challenged ? (
                    <p className="mt-1">
                      <span className="font-semibold text-foreground">Challenged: </span>
                      {e.challenged}
                    </p>
                  ) : null}
                  {e.applyNext ? (
                    <p className="mt-1">
                      <span className="font-semibold text-foreground">Next: </span>
                      {e.applyNext}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
