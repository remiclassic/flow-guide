'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { safeTimeoutDelay } from '@/lib/utils';

const MAX_UNDO = 80;

/**
 * Debounced undo stack: rapid edits collapse into one history entry after `debounceMs`.
 */
export function useDebouncedUndoable<T>(initial: T, debounceMs = 450) {
  const debounceMsSafe = safeTimeoutDelay(debounceMs, 1);
  const [present, setPresent] = useState(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPrev = useRef<T | null>(null);

  const [caps, setCaps] = useState({ canUndo: false, canRedo: false });

  const recomputeCaps = useCallback(() => {
    setCaps({
      canUndo: past.current.length > 0 || pendingPrev.current !== null,
      canRedo: future.current.length > 0,
    });
  }, []);

  const flushDebounce = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingPrev.current !== null) {
      past.current = [
        ...past.current.slice(-(MAX_UNDO - 1)),
        structuredClone(pendingPrev.current),
      ];
      future.current = [];
      pendingPrev.current = null;
    }
    recomputeCaps();
  }, [recomputeCaps]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setPresent((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        if (resolved === prev) return prev;

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        } else {
          pendingPrev.current = structuredClone(prev);
        }

        debounceTimer.current = setTimeout(() => {
          flushDebounce();
        }, debounceMsSafe);

        queueMicrotask(recomputeCaps);
        return resolved;
      });
    },
    [debounceMsSafe, flushDebounce, recomputeCaps]
  );

  const reset = useCallback(
    (next: T) => {
      flushDebounce();
      past.current = [];
      future.current = [];
      setPresent(next);
      recomputeCaps();
    },
    [flushDebounce, recomputeCaps]
  );

  const undo = useCallback(() => {
    flushDebounce();
    setPresent((current) => {
      if (past.current.length === 0) return current;
      const prev = past.current.pop()!;
      future.current.push(structuredClone(current));
      queueMicrotask(recomputeCaps);
      return prev;
    });
  }, [flushDebounce, recomputeCaps]);

  const redo = useCallback(() => {
    flushDebounce();
    setPresent((current) => {
      if (future.current.length === 0) return current;
      const n = future.current.pop()!;
      past.current.push(structuredClone(current));
      queueMicrotask(recomputeCaps);
      return n;
    });
  }, [flushDebounce, recomputeCaps]);

  useEffect(() => () => flushDebounce(), [flushDebounce]);

  return {
    present,
    set,
    reset,
    undo,
    redo,
    canUndo: caps.canUndo,
    canRedo: caps.canRedo,
  };
}
