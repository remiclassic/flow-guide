'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { reorderLessonsAction } from '@/lib/admin/course-actions';
import { Button } from '@/components/ui/button';

export function LessonOrderControls({
  courseSlug,
  moduleSlug,
  lessons,
}: {
  courseSlug: string;
  moduleSlug: string;
  lessons: { id: number; titleEn: string }[];
}) {
  const [order, setOrder] = useState(() => lessons.map((l) => l.id));
  const [pending, startTransition] = useTransition();

  function commit(next: number[]) {
    setOrder(next);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('moduleSlug', moduleSlug);
      fd.set('orderedIds', next.join(','));
      await reorderLessonsAction(fd);
    });
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    const tmp = next[idx]!;
    next[idx] = next[j]!;
    next[j] = tmp;
    commit(next);
  }

  const labels = new Map(lessons.map((l) => [l.id, l.titleEn]));

  return (
    <ul className="space-y-2">
      {order.map((id, idx) => (
        <li
          key={id}
          className="flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-[#fffaf2]/90 px-3 py-2"
        >
          <span className="flex-1 truncate text-sm font-medium text-stone-900">
            {labels.get(id)}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
            disabled={pending || idx === 0}
            onClick={() => move(idx, -1)}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
            disabled={pending || idx === order.length - 1}
            onClick={() => move(idx, 1)}
          >
            <ChevronDown className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
