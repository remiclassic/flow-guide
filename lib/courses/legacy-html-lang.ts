import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';

export type CheerioEl = cheerio.Cheerio<AnyNode>;

export function normalizeWs(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Inline HTML fragment → markdown-ish text with basic strong/em + line breaks. */
export function htmlFragmentToMarkdown(html: string | null | undefined): string {
  if (!html) return '';
  let s = html.replace(/\r/g, '');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  for (let i = 0; i < 8; i++) {
    const next = s
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
    if (next === s) break;
    s = next;
  }
  const stripped = s.replace(/<[^>]+>/g, '');
  return stripped
    .split('\n')
    .map((line) => normalizeWs(line))
    .join('\n')
    .trim();
}

export function langRichText(
  $: cheerio.CheerioAPI,
  $el: CheerioEl,
  lang: 'en' | 'es'
): string {
  const spans = $el.find(`span.${lang}`);
  if (spans.length === 0) {
    return normalizeWs($el.text());
  }
  const parts: string[] = [];
  spans.each((_, node) => {
    const html = $(node).html();
    const t = htmlFragmentToMarkdown(html ?? '');
    if (t) parts.push(t);
  });
  return parts.join('\n\n').trim();
}

export function langPlainFromSpans(
  $: cheerio.CheerioAPI,
  $root: CheerioEl,
  lang: 'en' | 'es'
): string {
  const parts: string[] = [];
  $root.find(`span.${lang}`).each((_, node) => {
    parts.push(normalizeWs($(node).text()));
  });
  return parts.filter(Boolean).join(' ').trim();
}
