import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let memoizedClient: SupabaseClient | undefined;
let memoizedForUrl: string | undefined;
let memoizedForServiceKey: string | undefined;

/**
 * Supabase project URL for server-side Storage / admin API.
 * Prefer `SUPABASE_URL` on the server; falls back to `NEXT_PUBLIC_SUPABASE_URL`
 * so teams that only set the public URL still get uploads working (same value).
 */
export function resolveSupabaseProjectUrl(): string | undefined {
  const primary = process.env.SUPABASE_URL?.trim();
  if (primary) return primary;
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

/** Storage bucket for course media / covers. Not a secret. */
export function getSupabaseMediaBucketName(): string {
  return (
    process.env.SUPABASE_MEDIA_BUCKET?.trim() ||
    process.env.SUPABASE_STORAGE_BUCKET?.trim() ||
    'course-media'
  );
}

export type SupabaseStorageConfigError = {
  missingVariables: string[];
  message: string;
};

/**
 * When non-null, Storage uploads cannot run. Use in API routes for precise 503 bodies.
 */
export function getSupabaseStorageConfigurationError(): SupabaseStorageConfigError | null {
  const url = resolveSupabaseProjectUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url && serviceKey) return null;

  const missingVariables: string[] = [];
  if (!url) {
    missingVariables.push(
      'SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL (same https://<ref>.supabase.co value)'
    );
  }
  if (!serviceKey) {
    missingVariables.push(
      'SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role; server-only)'
    );
  }

  return {
    missingVariables,
    message: `Supabase Storage is not configured. Add to .env / Vercel: ${missingVariables.join(
      '; '
    )}. Never put the service role key in client code or NEXT_PUBLIC_* vars.`,
  };
}

/**
 * Server-only Storage client; null when env is not configured.
 * Rebuilds the client when `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` or
 * `SUPABASE_SERVICE_ROLE_KEY` change in-process (e.g. dev env refresh).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = resolveSupabaseProjectUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    return null;
  }

  if (
    memoizedClient &&
    memoizedForUrl === url &&
    memoizedForServiceKey === serviceKey
  ) {
    return memoizedClient;
  }

  memoizedForUrl = url;
  memoizedForServiceKey = serviceKey;
  memoizedClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return memoizedClient;
}

/** Tests or rare hot-fix: drop memoized client. */
export function resetSupabaseAdminClientCache(): void {
  memoizedClient = undefined;
  memoizedForUrl = undefined;
  memoizedForServiceKey = undefined;
}
