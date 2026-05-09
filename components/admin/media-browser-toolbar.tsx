'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const KINDS = [
  { value: '', label: 'All types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'pdf', label: 'PDF' },
  { value: 'attachment', label: 'Other' },
] as const;

export function MediaBrowserToolbar({ defaultQ }: { defaultQ: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = useCallback(
    (formData: FormData) => {
      const q = String(formData.get('q') ?? '').trim();
      const kind = String(formData.get('kind') ?? '');
      const next = new URLSearchParams();
      if (q) next.set('q', q);
      if (kind) next.set('kind', kind);
      startTransition(() => {
        router.push(`/admin/media${next.toString() ? `?${next}` : ''}`);
      });
    },
    [router]
  );

  return (
    <form
      action={(fd) => apply(fd)}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <label htmlFor="media-q" className="text-xs font-medium text-stone-600">
          Search
        </label>
        <Input
          id="media-q"
          name="q"
          defaultValue={defaultQ}
          placeholder="File name or path"
          className="border-stone-200 bg-white text-stone-950 placeholder:text-stone-400"
        />
      </div>
      <div className="w-full space-y-1.5 sm:w-44">
        <label htmlFor="media-kind" className="text-xs font-medium text-stone-600">
          Type
        </label>
        <select
          id="media-kind"
          name="kind"
          defaultValue={searchParams.get('kind') ?? ''}
          className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-950"
        >
          {KINDS.map((k) => (
            <option
              key={k.value || 'all'}
              value={k.value}
              className="bg-white text-stone-950"
            >
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={pending}
        variant="outline"
        className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
      >
        {pending ? 'Applying…' : 'Apply'}
      </Button>
    </form>
  );
}
