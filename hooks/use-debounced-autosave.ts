'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { safeTimeoutDelay } from '@/lib/utils';

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'error';

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Debounced autosave: tracks dirty/saving/error, avoids redundant writes, surfaces last server time.
 */
export function useDebouncedAutosave({
  value,
  initial,
  delayMs = 1000,
  onSave,
}: {
  value: string;
  initial: string;
  delayMs?: number;
  onSave: (
    body: string
  ) => Promise<{ ok: boolean; savedAt?: string | null }>;
}) {
  const delayMsSafe = safeTimeoutDelay(delayMs, 1);
  const lastPersisted = useRef(initial);
  const valueRef = useRef(value);
  const onSaveRef = useRef(onSave);
  const runPersistRef = useRef<() => Promise<void>>(async () => {});
  const persistGen = useRef(0);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<AutosaveStatus>(() =>
    value === initial ? 'idle' : 'dirty'
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  /** Until true, skip navigator/window — SSR and first client paint must match. */
  const [mounted, setMounted] = useState(false);
  /** Optimistic true pre-mount; real `navigator.onLine` applied in useEffect only. */
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setMounted(true);
    setOnline(
      typeof window !== 'undefined' && typeof navigator !== 'undefined'
        ? navigator.onLine
        : true
    );
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  const runPersist = useCallback(async () => {
    const toSave = valueRef.current;
    if (toSave === lastPersisted.current) {
      setStatus('idle');
      return;
    }
    if (!online) {
      setStatus('error');
      return;
    }
    const myGen = ++persistGen.current;
    setStatus('saving');
    try {
      const r = await onSaveRef.current(toSave);
      if (myGen !== persistGen.current) return;
      if (!r.ok) {
        setStatus('error');
        return;
      }
      lastPersisted.current = toSave;
      if (r.savedAt) setSavedAt(r.savedAt);
      if (valueRef.current !== toSave) {
        setStatus('dirty');
        debounceTimer.current = setTimeout(() => {
          void runPersistRef.current();
        }, delayMsSafe);
        return;
      }
      setStatus('idle');
    } catch {
      if (myGen !== persistGen.current) return;
      setStatus('error');
    }
  }, [delayMsSafe, online]);

  useEffect(() => {
    runPersistRef.current = runPersist;
  }, [runPersist]);

  const schedulePersist = useCallback(() => {
    clearTimer();
    debounceTimer.current = setTimeout(() => {
      void runPersistRef.current();
    }, delayMsSafe);
  }, [clearTimer, delayMsSafe]);

  const flush = useCallback(async () => {
    clearTimer();
    await runPersistRef.current();
  }, [clearTimer]);

  useEffect(() => {
    if (value === lastPersisted.current) {
      setStatus((s) => {
        if (s === 'idle') return s;
        return 'idle';
      });
      return;
    }

    setStatus((s) => (s === 'error' ? 'dirty' : 'dirty'));
    if (!online) {
      setStatus('error');
      return;
    }
    schedulePersist();

    return clearTimer;
  }, [value, schedulePersist, clearTimer, online]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (valueRef.current === lastPersisted.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const label = useMemo(() => {
    if (!mounted) {
      if (status === 'saving') return 'Saving…';
      if (status === 'error') return 'Save failed';
      if (status === 'dirty') return 'Unsaved changes';
      return 'Saved';
    }
    if (!online) return 'Offline — will retry when connected';
    if (status === 'saving') return 'Saving…';
    if (status === 'error') return 'Save failed';
    if (status === 'dirty') return 'Unsaved changes';
    if (savedAt) return `Saved ${formatSavedAt(savedAt)}`;
    return 'Saved';
  }, [mounted, online, status, savedAt]);

  /** Expose connectivity only after mount so UI styling matches hydration-safe label. */
  const onlineForUi = mounted ? online : true;

  return { status, flush, savedAt, label, online: onlineForUi };
}
