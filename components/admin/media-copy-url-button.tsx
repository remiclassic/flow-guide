'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

export function MediaCopyUrlButton({ url }: { url: string }) {
  const [label, setLabel] = useState('Copy link');

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setLabel('Copied!');
      window.setTimeout(() => setLabel('Copy link'), 2000);
    } catch {
      setLabel('Copy failed');
      window.setTimeout(() => setLabel('Copy link'), 2000);
    }
  }, [url]);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
      onClick={() => void onCopy()}
    >
      {label}
    </Button>
  );
}
