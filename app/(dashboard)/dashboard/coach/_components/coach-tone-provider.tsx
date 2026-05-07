'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CoachTone } from '@/lib/coach/types';
import { COACH_STORAGE_KEYS } from '@/lib/coach/storage-keys';

type Ctx = {
  tone: CoachTone;
  setTone: (t: CoachTone) => void;
};

const CoachToneContext = createContext<Ctx | null>(null);

function readTone(): CoachTone {
  if (typeof window === 'undefined') return 'calm';
  const raw = localStorage.getItem(COACH_STORAGE_KEYS.tone);
  if (
    raw === 'calm' ||
    raw === 'motivational' ||
    raw === 'strategic' ||
    raw === 'direct'
  ) {
    return raw;
  }
  return 'calm';
}

export function CoachToneProvider({ children }: { children: ReactNode }) {
  const [tone, setToneState] = useState<CoachTone>('calm');

  useEffect(() => {
    queueMicrotask(() => setToneState(readTone()));
  }, []);

  const setTone = useCallback((t: CoachTone) => {
    setToneState(t);
    try {
      localStorage.setItem(COACH_STORAGE_KEYS.tone, t);
    } catch {
      /* ignore quota */
    }
  }, []);

  const value = useMemo(() => ({ tone, setTone }), [tone, setTone]);
  return (
    <CoachToneContext.Provider value={value}>{children}</CoachToneContext.Provider>
  );
}

export function useCoachTone(): Ctx {
  const ctx = useContext(CoachToneContext);
  if (!ctx) throw new Error('useCoachTone must be used within CoachToneProvider');
  return ctx;
}
