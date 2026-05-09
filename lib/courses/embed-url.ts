import type { EmbedProvider } from '@/lib/courses/lesson-asset-metadata';

export type ParsedEmbed = {
  provider: EmbedProvider;
  embedSrc: string;
};

/**
 * Derive a safe iframe src from a user-provided watch URL (YouTube / Vimeo).
 */
export function parseVideoEmbedUrl(input: string): ParsedEmbed | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = url.searchParams.get('v');
    if (v && /^[\w-]{6,}$/.test(v)) {
      return {
        provider: 'youtube',
        embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}`,
      };
    }
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'embed' && pathParts[1] && /^[\w-]{6,}$/.test(pathParts[1])) {
      return {
        provider: 'youtube',
        embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(pathParts[1])}`,
      };
    }
    return null;
  }

  if (host === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0];
    if (id && /^[\w-]{6,}$/.test(id)) {
      return {
        provider: 'youtube',
        embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
      };
    }
    return null;
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id =
      parts[0] === 'video' ? parts[1] : parts[0] === 'channels' ? undefined : parts[0];
    if (id && /^\d+$/.test(id)) {
      return {
        provider: 'vimeo',
        embedSrc: `https://player.vimeo.com/video/${encodeURIComponent(id)}`,
      };
    }
    return null;
  }

  return null;
}
