'use client';

import { useEffect, useState } from 'react';

/** Scroll depth through `main` as 0–100 (immersive lesson layout scrolls inside main). */
export function useLessonScrollProgress(): number {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const update = () => {
      const max = main.scrollHeight - main.clientHeight;
      if (max <= 0) {
        setPct(100);
        return;
      }
      const raw = (main.scrollTop / max) * 100;
      setPct(Math.min(100, Math.max(0, Math.round(raw))));
    };

    update();
    main.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(main);

    return () => {
      main.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, []);

  return pct;
}
