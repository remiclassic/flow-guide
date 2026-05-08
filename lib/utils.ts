import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe delay for `setTimeout` / `setInterval`. Node emits TimeoutNegativeWarning
 * when the delay is negative; NaN/Infinity also behave badly.
 */
export function safeTimeoutDelay(ms: number, fallback = 1): number {
  if (!Number.isFinite(ms)) return fallback
  return Math.max(fallback, Math.floor(ms))
}
