'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type RoadmapModule = {
  id: number;
  titleEn: string;
  lessons: { lessonKey: string; titleEn: string; done: boolean }[];
};

type Props = {
  courseSlug: string;
  unlocked: boolean;
  modules: RoadmapModule[];
  currentLessonKey: string;
};

export function LessonRoadmapAside({
  courseSlug,
  unlocked,
  modules,
  currentLessonKey,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = useCallback(() => setMobileOpen((o) => !o), []);

  const aside = (
    <aside className="flex max-h-[min(70dvh,560px)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card-soft lg:max-h-[calc(100dvh-220px)] lg:sticky lg:top-4">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Map className="size-4 text-primary" />
          Learning path
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-border text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Outline
        </Badge>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-6">
          {modules.map((mod) => (
            <li key={mod.id}>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {mod.titleEn}
              </p>
              <ul className="space-y-1">
                {mod.lessons.map((lesson) => {
                  const active = lesson.lessonKey === currentLessonKey;
                  const href = unlocked
                    ? `/dashboard/courses/${courseSlug}/lessons/${lesson.lessonKey}`
                    : '/pricing?reason=subscription';

                  return (
                    <li key={lesson.lessonKey}>
                      <Link
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm transition-colors duration-150',
                          active
                            ? 'bg-primary/[0.1] font-semibold text-primary ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            'size-4 shrink-0',
                            active ? 'text-primary' : 'text-muted-foreground/60'
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate leading-snug">
                          {lesson.titleEn}
                        </span>
                        {lesson.done ? (
                          <Badge variant="success" className="shrink-0 rounded-full text-[10px] normal-case">
                            Done
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );

  return (
    <div className="w-full shrink-0 lg:w-72 xl:w-80">
      <Button
        type="button"
        variant="outline"
        className="mb-3 w-full rounded-full border-border lg:hidden"
        onClick={toggle}
      >
        <Map className="size-4 text-primary" />
        {mobileOpen ? 'Hide roadmap' : 'Show roadmap'}
      </Button>
      <div className={cn(mobileOpen ? 'block' : 'hidden', 'lg:block')}>{aside}</div>
    </div>
  );
}
