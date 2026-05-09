import * as cheerio from 'cheerio';
import type { Lesson, LessonContentBlocks } from '@/lib/db/schema';
import type { LegacyLessonExtract } from '@/lib/courses/legacy-html-extract';
import { langRichText, type CheerioEl } from '@/lib/courses/legacy-html-lang';
import {
  appendStructuredLessonBlocks,
  contentBlock,
  type PartialBlockJson,
} from '@/lib/courses/legacy-to-blocknote';

function outcomesFromDom($: cheerio.CheerioAPI, $box: CheerioEl): PartialBlockJson {
  const title = langRichText($, $box.find('h5').first(), 'en');
  const lines: string[] = [];
  $box.find('ul.outcomes-list li').each((_, li) => {
    const t = langRichText($, $(li), 'en');
    if (t) lines.push(`- ${t}`);
  });
  return {
    type: 'flowOutcomes',
    props: {
      title: title || 'By the end of this lesson',
      bulletsText: lines.join('\n'),
    },
  };
}

function keyInsightFromCallout($: cheerio.CheerioAPI, $co: CheerioEl): PartialBlockJson {
  const label = langRichText($, $co.find('.callout-label').first(), 'en');
  const body = langRichText($, $co.find('p').first(), 'en');
  return {
    type: 'flowKeyInsight',
    props: {
      label: label || 'Key point',
      bodyMd: body,
    },
  };
}

function vignetteFromDom($: cheerio.CheerioAPI, $vg: CheerioEl): PartialBlockJson {
  const kicker = langRichText($, $vg.find('.vignette-label').first(), 'en');
  const title = langRichText($, $vg.find('h4').first(), 'en');
  const introP = $vg.children('p').first();
  const intro = introP.length ? langRichText($, introP, 'en') : '';
  const columns: { title: string; body: string }[] = [];
  $vg.find('.vignette-col').each((_, col) => {
    const $c = $(col);
    const ht = langRichText($, $c.find('h5').first(), 'en');
    const body = langRichText($, $c.find('p').first(), 'en');
    columns.push({ title: ht, body });
  });
  return {
    type: 'flowVignette',
    props: {
      kicker,
      title,
      introMd: intro,
      columnsJson: JSON.stringify(columns),
    },
  };
}

function frameworkFromDom($: cheerio.CheerioAPI, $fw: CheerioEl): PartialBlockJson {
  const kicker = langRichText($, $fw.find('.framework-label').first(), 'en');
  const title = langRichText($, $fw.find('h4').first(), 'en');
  const items: string[] = [];
  $fw.find('ul.framework-steps > li').each((idx, li) => {
    const text = langRichText($, $(li), 'en');
    if (text) items.push(`${idx + 1}. ${text}`);
  });
  return {
    type: 'flowFramework',
    props: {
      kicker,
      title,
      bodyMd: items.join('\n\n'),
    },
  };
}

function pullQuoteFromDom($: cheerio.CheerioAPI, $q: CheerioEl): PartialBlockJson {
  const raw = langRichText($, $q, 'en').replace(/^"+|"+$/g, '');
  return {
    type: 'flowPullQuote',
    props: { bodyMd: raw },
  };
}

function integrationBlocksFromDom($: cheerio.CheerioAPI, $n: CheerioEl): PartialBlockJson[] {
  const h = langRichText($, $n.find('h5').first(), 'en');
  const p = langRichText($, $n.find('p').first(), 'en');
  const out: PartialBlockJson[] = [];
  if (h) out.push(contentBlock('heading', h, { level: 2 }));
  if (p) out.push(contentBlock('paragraph', p));
  return out;
}

function emitLessonSection($: cheerio.CheerioAPI, $sec: CheerioEl, blocks: PartialBlockJson[]) {
  $sec.children().each((_, child) => {
    const $c = $(child);
    const tag = (child.tagName || '').toLowerCase();

    if (tag === 'h2') {
      const t = langRichText($, $c, 'en');
      if (t) blocks.push(contentBlock('heading', t, { level: 2 }));
      return;
    }
    if (tag === 'h3') {
      const t = langRichText($, $c, 'en');
      if (t) blocks.push(contentBlock('heading', t, { level: 3 }));
      return;
    }
    if (tag === 'h4') {
      const t = langRichText($, $c, 'en');
      if (t) blocks.push(contentBlock('heading', t, { level: 3 }));
      return;
    }
    if (tag === 'p') {
      const t = langRichText($, $c, 'en');
      if (t) blocks.push(contentBlock('paragraph', t));
      return;
    }
    if (tag === 'div') {
      const cls = $c.attr('class') ?? '';
      if (cls.includes('callout')) {
        blocks.push(keyInsightFromCallout($, $c));
        return;
      }
      if (cls.includes('vignette')) {
        blocks.push(vignetteFromDom($, $c));
        return;
      }
      if (cls.includes('framework-box')) {
        blocks.push(frameworkFromDom($, $c));
        return;
      }
    }
  });
}

function exerciseFromDom($: cheerio.CheerioAPI, $block: CheerioEl): PartialBlockJson {
  const iconEmoji = $block.find('.exercise-icon').first().text().trim() || '✍️';
  const title = langRichText($, $block.find('.exercise-header h4').first(), 'en');
  const introEl = $block.find('.exercise-header + p').first();
  const introMd = introEl.length ? langRichText($, introEl, 'en') : '';
  const steps: string[] = [];
  $block.find('ol.exercise-steps > li').each((idx, li) => {
    const t = langRichText($, $(li), 'en');
    if (t) steps.push(`${idx + 1}. ${t}`);
  });
  const successLabel = langRichText($, $block.find('.exercise-success-label').first(), 'en');
  const successBody = langRichText($, $block.find('.exercise-success p').first(), 'en');

  return {
    type: 'flowLessonExercise',
    props: {
      eyebrow: 'Lesson exercise',
      title,
      iconEmoji,
      introMd,
      stepsMd: steps.join('\n\n'),
      successLabel:
        successLabel.trim() ||
        "You'll know it worked when...",
      successBodyMd: successBody,
    },
  };
}

/**
 * Build BlockNote JSON directly from legacy lesson HTML (structured Flow Guide blocks).
 */
export function legacyHtmlToBlockNoteBlocks(html: string): LessonContentBlocks {
  const $ = cheerio.load(html);
  const inner = $('.content-inner').first();
  const blocks: PartialBlockJson[] = [];

  if (!inner.length) {
    return blocks as LessonContentBlocks;
  }

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
      blocks.push(outcomesFromDom($, $el));
      return;
    }
    if (cls.includes('lesson-section')) {
      emitLessonSection($, $el, blocks);
      return;
    }
    if (cls.includes('lesson-quote')) {
      blocks.push(pullQuoteFromDom($, $el));
      return;
    }
    if (cls.includes('integration-note')) {
      blocks.push(...integrationBlocksFromDom($, $el));
    }
  });

  const $ex = $('.exercise-block').first();
  if ($ex.length) {
    blocks.push(exerciseFromDom($, $ex));
  }

  return blocks as LessonContentBlocks;
}

export function lessonToBlockNoteBlocksFromHtml(args: {
  html: string;
  lesson: Pick<Lesson, 'reflectionPromptEn' | 'actionStepsEn'>;
  extracted?: Pick<LegacyLessonExtract, 'reflectionPromptEn' | 'actionStepsEn'> | null;
}): LessonContentBlocks {
  const blocks: PartialBlockJson[] = [
    ...(legacyHtmlToBlockNoteBlocks(args.html) as PartialBlockJson[]),
  ];
  const hasExercise = blocks.some((b) => b.type === 'flowLessonExercise');
  appendStructuredLessonBlocks(blocks, args.lesson, args.extracted, {
    skipActionSteps: hasExercise,
  });
  return blocks as LessonContentBlocks;
}
