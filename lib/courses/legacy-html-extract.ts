import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import type { KnowledgeQuizData } from '@/lib/courses/knowledge-quiz';

export type LegacyLessonExtract = {
  summaryEn: string | null;
  summaryEs: string | null;
  reflectionPromptEn: string | null;
  reflectionPromptEs: string | null;
  actionStepsEn: string | null;
  actionStepsEs: string | null;
  /** Lesson-level multiple choice (`.knowledge-quiz` without module variant). */
  knowledgeQuiz: KnowledgeQuizData | null;
  /** Primary learner markdown (English) — outcomes + sections + quotes + integration; excludes reflection, exercise, video script, quiz. */
  bodyMarkdownEn: string | null;
  estimatedMinutes: number | null;
  titleEnFromHtml: string | null;
  titleEsFromHtml: string | null;
};

type CheerioEl = cheerio.Cheerio<AnyNode>;

function normalizeWs(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Inline HTML fragment → markdown-ish text with basic strong/em + line breaks. */
function htmlFragmentToMarkdown(html: string | null | undefined): string {
  if (!html) return '';
  let s = html.replace(/\r/g, '');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // unwrap nested emphasis iteratively
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

function langRichText($: cheerio.CheerioAPI, $el: CheerioEl, lang: 'en' | 'es'): string {
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

function langPlainFromSpans($: cheerio.CheerioAPI, $root: CheerioEl, lang: 'en' | 'es'): string {
  const parts: string[] = [];
  $root.find(`span.${lang}`).each((_, node) => {
    parts.push(normalizeWs($(node).text()));
  });
  return parts.filter(Boolean).join(' ').trim();
}

export function extractEstimatedMinutesFromHtml(html: string): number | null {
  const m = html.match(/~\s*(\d+)\s*min/i);
  if (m) return Number.parseInt(m[1], 10);
  const m2 = html.match(/(\d+)\s*min(?:utes)?\s*read/i);
  if (m2) return Number.parseInt(m2[1], 10);
  return null;
}

function extractReflectionLists(
  $: cheerio.CheerioAPI,
  root: CheerioEl
): { en: string | null; es: string | null } {
  const block = root.find('.reflection-block').first();
  if (!block.length) return { en: null, es: null };
  const itemsEn: string[] = [];
  const itemsEs: string[] = [];
  block.find('ul.reflection-list li').each((_, li) => {
    const en = langPlainFromSpans($, $(li), 'en');
    const es = langPlainFromSpans($, $(li), 'es');
    if (en) itemsEn.push(en);
    if (es) itemsEs.push(es);
  });
  const fmt = (lines: string[]) =>
    lines.length ? lines.map((l) => `- ${l}`).join('\n') : null;
  return { en: fmt(itemsEn), es: fmt(itemsEs) };
}

function extractExerciseBlocks(
  $: cheerio.CheerioAPI,
  root: CheerioEl
): { en: string | null; es: string | null } {
  const block = root.find('.exercise-block').first();
  if (!block.length) return { en: null, es: null };

  const titleEn = langRichText($, block.find('.exercise-header h4').first(), 'en');
  const titleEs = langRichText($, block.find('.exercise-header h4').first(), 'es');

  const stepsEn: string[] = [];
  const stepsEs: string[] = [];

  block.find('ol.exercise-steps > li').each((idx, li) => {
    const $li = $(li);
    const lineEn = langRichText($, $li, 'en');
    const lineEs = langRichText($, $li, 'es');
    if (lineEn) stepsEn.push(`${idx + 1}. ${lineEn}`);
    if (lineEs) stepsEs.push(`${idx + 1}. ${lineEs}`);
  });

  const pack = (title: string | null, steps: string[]) => {
    const body = steps.join('\n');
    if (!title && !body) return null;
    const parts: string[] = [];
    if (title) parts.push(`**${title}**`);
    if (body) parts.push(body);
    return parts.join('\n\n');
  };

  return {
    en: pack(titleEn || null, stepsEn),
    es: pack(titleEs || null, stepsEs),
  };
}

function extractKnowledgeQuiz(
  $: cheerio.CheerioAPI,
  root: CheerioEl
): KnowledgeQuizData | null {
  const section = root.find('section.knowledge-quiz').first();
  if (!section.length) return null;
  if (section.hasClass('knowledge-quiz--module')) return null;

  const introEn = langRichText($, section.find('.kq-intro').first(), 'en') || null;
  const introEs = langRichText($, section.find('.kq-intro').first(), 'es') || null;

  const items: KnowledgeQuizData['items'] = [];

  section.find('.kq-item').each((_, el) => {
    const $item = $(el);
    const correctRaw = $item.attr('data-correct');
    const correctIndex =
      correctRaw != null ? Number.parseInt(correctRaw, 10) : Number.NaN;
    if (!Number.isFinite(correctIndex) || correctIndex < 0) return;

    const promptEn =
      langRichText($, $item.find('.kq-prompt').first(), 'en') || '';
    const promptEs =
      langRichText($, $item.find('.kq-prompt').first(), 'es') || null;

    const options: { en: string; es?: string | null }[] = [];
    $item.find('button.kq-opt').each((__, btn) => {
      const $btn = $(btn);
      const en = langRichText($, $btn, 'en') || '';
      const es = langRichText($, $btn, 'es') || null;
      if (en.trim()) options.push({ en: en.trim(), es: es?.trim() || null });
    });

    if (options.length < 2) return;
    if (correctIndex >= options.length) return;

    items.push({
      promptEn: promptEn.trim(),
      promptEs: promptEs?.trim() || null,
      correctIndex,
      options,
    });
  });

  if (items.length === 0) return null;
  return {
    introEn: introEn?.trim() || null,
    introEs: introEs?.trim() || null,
    items,
  };
}

function convertOutcomesBox($: cheerio.CheerioAPI, $box: CheerioEl): string {
  const heading = langRichText($, $box.find('h5').first(), 'en');
  const lines: string[] = [];
  if (heading) lines.push(`## ${heading}`);
  const bullets: string[] = [];
  $box.find('ul.outcomes-list li').each((_, li) => {
    const t = langRichText($, $(li), 'en');
    if (t) bullets.push(`- ${t}`);
  });
  if (bullets.length) lines.push(bullets.join('\n'));
  return lines.filter(Boolean).join('\n\n');
}

function convertCallout($: cheerio.CheerioAPI, $co: CheerioEl): string {
  const label = langRichText($, $co.find('.callout-label').first(), 'en');
  const body = langRichText($, $co.find('p').first(), 'en');
  const lines: string[] = [];
  if (label) lines.push(`**${label}**`);
  if (body) {
    lines.push(body.split('\n').map((l) => `> ${l}`).join('\n'));
  }
  return lines.join('\n\n');
}

function convertFrameworkBox($: cheerio.CheerioAPI, $fw: CheerioEl): string {
  const label = langRichText($, $fw.find('.framework-label').first(), 'en');
  const h4 = langRichText($, $fw.find('h4').first(), 'en');
  const lines: string[] = [];
  if (label || h4) lines.push(`### ${[label, h4].filter(Boolean).join(' · ')}`);

  $fw.find('ul.framework-steps > li').each((idx, li) => {
    const text = langRichText($, $(li), 'en');
    if (text) lines.push(`${idx + 1}. ${text}`);
  });
  return lines.join('\n\n');
}

function convertVignette($: cheerio.CheerioAPI, $vg: CheerioEl): string {
  const label = langRichText($, $vg.find('.vignette-label').first(), 'en');
  const h4 = langRichText($, $vg.find('h4').first(), 'en');
  const lines: string[] = [];
  if (label || h4) lines.push(`### ${[label, h4].filter(Boolean).join(' — ')}`);

  $vg.find('.vignette-col').each((_, col) => {
    const $c = $(col);
    const ht = langRichText($, $c.find('h5').first(), 'en');
    const body = langRichText($, $c.find('p').first(), 'en');
    if (ht) lines.push(`#### ${ht}`);
    if (body) lines.push(body);
  });
  return lines.join('\n\n');
}

function convertLessonQuote($: cheerio.CheerioAPI, $q: CheerioEl): string {
  const raw = langRichText($, $q, 'en').replace(/^"+|"+$/g, '');
  if (!raw) return '';
  return raw
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function convertIntegrationNote($: cheerio.CheerioAPI, $n: CheerioEl): string {
  const h = langRichText($, $n.find('h5').first(), 'en');
  const p = langRichText($, $n.find('p').first(), 'en');
  const lines: string[] = [];
  if (h) lines.push(`## ${h}`);
  if (p) lines.push(p);
  return lines.join('\n\n');
}

function convertLessonSection($: cheerio.CheerioAPI, $sec: CheerioEl): string {
  const chunks: string[] = [];
  $sec.children().each((_, child) => {
    const $c = $(child);
    const tag = (child.tagName || '').toLowerCase();

    if (tag === 'h2') {
      const t = langRichText($, $c, 'en');
      if (t) chunks.push(`## ${t}`);
      return;
    }
    if (tag === 'h3') {
      const t = langRichText($, $c, 'en');
      if (t) chunks.push(`### ${t}`);
      return;
    }
    if (tag === 'h4') {
      const t = langRichText($, $c, 'en');
      if (t) chunks.push(`#### ${t}`);
      return;
    }
    if (tag === 'p') {
      const t = langRichText($, $c, 'en');
      if (t) chunks.push(t);
      return;
    }
    if (tag === 'div') {
      const cls = $c.attr('class') ?? '';
      if (cls.includes('callout')) chunks.push(convertCallout($, $c));
      else if (cls.includes('vignette')) chunks.push(convertVignette($, $c));
      else if (cls.includes('framework-box')) chunks.push(convertFrameworkBox($, $c));
      return;
    }
  });
  return chunks.filter(Boolean).join('\n\n');
}

function buildBodyMarkdownEn($: cheerio.CheerioAPI): string | null {
  const inner = $('.content-inner').first();
  if (!inner.length) return null;

  const chunks: string[] = [];

  inner.children().each((_, el) => {
    const $el = $(el);
    const cls = $el.attr('class') ?? '';

    if (cls.includes('lesson-hero')) return;
    if (cls.includes('reflection-block')) return;
    if (cls.includes('exercise-block')) return;
    if (cls.includes('knowledge-quiz')) return;
    if ($el.is('details')) return;
    if (cls.includes('lesson-nav')) return;

    if (cls.includes('outcomes-box')) {
      chunks.push(convertOutcomesBox($, $el));
      return;
    }
    if (cls.includes('lesson-section')) {
      chunks.push(convertLessonSection($, $el));
      return;
    }
    if (cls.includes('lesson-quote')) {
      chunks.push(convertLessonQuote($, $el));
      return;
    }
    if (cls.includes('integration-note')) {
      chunks.push(convertIntegrationNote($, $el));
      return;
    }
  });

  const md = chunks.filter(Boolean).join('\n\n').trim();
  return md.length ? md : null;
}

export function extractLegacyLessonFromHtml(html: string): LegacyLessonExtract {
  const $ = cheerio.load(html);
  const root = $('body').length ? $('body') : $.root();

  const hero = $('.lesson-hero').first();
  const summaryEn = hero.length ? langRichText($, hero.find('p.lead').first(), 'en') : null;
  const summaryEs = hero.length ? langRichText($, hero.find('p.lead').first(), 'es') : null;

  const titleEnFromHtml = hero.length
    ? langPlainFromSpans($, hero.find('h1').first(), 'en')
    : null;
  const titleEsFromHtml = hero.length
    ? langPlainFromSpans($, hero.find('h1').first(), 'es')
    : null;

  const minutes =
    extractEstimatedMinutesFromHtml(html) ??
    extractEstimatedMinutesFromHtml(langPlainFromSpans($, $('.lesson-meta-row').first(), 'en'));

  const ref = extractReflectionLists($, root);
  const ex = extractExerciseBlocks($, root);
  const knowledgeQuiz = extractKnowledgeQuiz($, root);
  const bodyMarkdownEn = buildBodyMarkdownEn($);

  return {
    summaryEn: summaryEn?.length ? summaryEn : null,
    summaryEs: summaryEs?.length ? summaryEs : null,
    reflectionPromptEn: ref.en,
    reflectionPromptEs: ref.es,
    actionStepsEn: ex.en,
    actionStepsEs: ex.es,
    knowledgeQuiz,
    bodyMarkdownEn,
    estimatedMinutes: minutes,
    titleEnFromHtml: titleEnFromHtml?.length ? titleEnFromHtml : null,
    titleEsFromHtml: titleEsFromHtml?.length ? titleEsFromHtml : null,
  };
}
