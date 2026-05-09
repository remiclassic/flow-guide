'use client';

import { useEffect, useState } from 'react';

function resolveScrollRoot(): HTMLElement {
  const main = document.querySelector('main');
  if (main instanceof HTMLElement && main.scrollHeight > main.clientHeight + 2) {
    return main;
  }
  return document.documentElement;
}

/**
 * Scroll depth 0–100: prefers `main` when it is the scroll container (dashboard immersive),
 * otherwise the document root (e.g. admin preview where `main` does not overflow).
 */
export function useLessonScrollProgress(): number {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const main = document.querySelector('main');

    const update = () => {
      const root = resolveScrollRoot();
      const max = root.scrollHeight - root.clientHeight;
      if (max <= 0) {
        setPct(100);
        return;
      }
      const raw = (root.scrollTop / max) * 100;
      setPct(Math.min(100, Math.max(0, Math.round(raw))));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    main?.addEventListener('scroll', update, { passive: true });

    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    if (main instanceof HTMLElement) ro.observe(main);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      main?.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  return pct;
}
