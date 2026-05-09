import 'server-only';

type StorageLikeError = { message?: string; name?: string };

/**
 * Maps Supabase Storage client errors to HTTP status + JSON-safe bodies for `/api/admin/media/upload`.
 */
export function interpretStorageUploadFailure(
  bucket: string,
  err: StorageLikeError
): {
  status: number;
  error: string;
  message: string;
  detail?: string;
  bucket: string;
} {
  const raw = (err.message ?? String(err)).trim();
  const m = raw.toLowerCase();

  if (
    m.includes('bucket not found') ||
    m.includes('the resource was not found') ||
    (m.includes('not found') &&
      (m.includes('bucket') || m.includes('storage')))
  ) {
    return {
      status: 404,
      error: 'Storage bucket missing',
      message: `Bucket "${bucket}" was not found in this Supabase project. Create it (public recommended for course cards) — see scripts/supabase-storage-course-media.sql or Supabase → Storage.`,
      bucket,
      detail: raw || undefined,
    };
  }

  if (
    m.includes('invalid jwt') ||
    m.includes('jwt expired') ||
    m.includes('invalid api key') ||
    m.includes('unauthorized')
  ) {
    return {
      status: 401,
      error: 'Supabase authorization failed',
      message:
        'The service role key was rejected. Set SUPABASE_SERVICE_ROLE_KEY to the current service_role secret from Supabase → Project Settings → API (same project as the URL). Never use the anon key here.',
      bucket,
      detail: raw || undefined,
    };
  }

  if (m.includes('row-level security') || m.includes('violates row-level security')) {
    return {
      status: 403,
      error: 'Storage policy blocked upload',
      message:
        'Supabase Storage RLS blocked this upload. For the service role, ensure bucket policies allow inserts, or use the Supabase dashboard SQL snippet to create a public course-media bucket.',
      bucket,
      detail: raw || undefined,
    };
  }

  return {
    status: 500,
    error: 'Upload failed',
    message:
      'Supabase Storage returned an error. Check bucket name, project URL, and service role key.',
    bucket,
    detail: raw || undefined,
  };
}
