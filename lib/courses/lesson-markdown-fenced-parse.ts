/** Parsers for fenced legacy-style lesson blocks (` ```fg-* ` in markdown). */

export type FgVignetteColumn = { title: string; body: string };

export type FgVignetteParsed = {
  kicker: string;
  title: string;
  intro: string;
  columns: FgVignetteColumn[];
};

export type FgFrameworkParsed = {
  kicker: string;
  title: string;
  bodyMd: string;
};

/** 
 * Vignette format:
 * ```
 * Real example
 * ## Mariana vs Andrea
 * Intro paragraph(s)…
 *
 * ### Left title
 * Body markdown…
 *
 * ### Right title
 * Body…
 * ```
 */
export function parseFgVignette(raw: string): FgVignetteParsed {
  const md = raw.trim();
  const blocks = md.split(/\n(?=### )/);
  const head = blocks[0] ?? '';
  const colBlocks = blocks.slice(1);
  const headLines = head.split('\n');
  let i = 0;
  const kicker = (headLines[i++] ?? '').trim();
  while (headLines[i]?.trim() === '') i++;
  const titleLine = headLines[i++] ?? '';
  const title = titleLine.replace(/^##\s+/, '').trim();
  const intro = headLines.slice(i).join('\n').trim();
  const columns = colBlocks
    .map((block) => {
      const lines = block.trim().split('\n');
      const t = (lines[0] ?? '').replace(/^###\s+/, '').trim();
      const body = lines.slice(1).join('\n').trim();
      return { title: t, body };
    })
    .filter((c) => c.title.length > 0 || c.body.length > 0);
  return { kicker, title, intro, columns };
}

/**
 * Framework format:
 * ```
 * MARCO DE TRABAJO
 * ## Los 3 pilares…
 *
 * 1. **Step:** …
 * ```
 */
export function parseFgFramework(raw: string): FgFrameworkParsed {
  const lines = raw.trim().split('\n');
  let i = 0;
  const kicker = (lines[i++] ?? '').trim();
  while (lines[i]?.trim() === '') i++;
  const titleLine = lines[i++] ?? '';
  const title = titleLine.replace(/^##\s+/, '').trim();
  const bodyMd = lines.slice(i).join('\n').trim();
  return { kicker, title, bodyMd };
}

export function splitLeadingH2(md: string): { title: string; rest: string } {
  const lines = md.trimStart().split('\n');
  let i = 0;
  while (lines[i]?.trim() === '') i++;
  const line = lines[i];
  if (line?.startsWith('## ')) {
    const title = line.replace(/^##\s+/, '').trim();
    const rest = lines.slice(i + 1).join('\n');
    return { title, rest };
  }
  return { title: '', rest: md };
}

/**
 * Optional success panel after a markdown horizontal rule (`---`), matching legacy `.exercise-success`:
 *
 * ```
 * ## Exercise title
 * Intro…
 * 1. **Step:** …
 *
 * ---
 * ### You'll know it worked when…
 * Closing paragraph.
 * ```
 */
export function splitFgExerciseSuccess(md: string): {
  mainMd: string;
  successLabel: string;
  successBodyMd: string;
} {
  const trimmed = md.trim();
  const sep = /\n---\s*\n/;
  const match = sep.exec(trimmed);
  if (!match || match.index === undefined) {
    return { mainMd: trimmed, successLabel: '', successBodyMd: '' };
  }
  const mainMd = trimmed.slice(0, match.index).trim();
  const tail = trimmed.slice(match.index + match[0].length).trim();
  const lines = tail.split('\n');
  const first = lines[0] ?? '';
  if (first.startsWith('### ')) {
    const successLabel = first.replace(/^###\s+/, '').trim();
    const successBodyMd = lines.slice(1).join('\n').trim();
    return { mainMd, successLabel, successBodyMd };
  }
  return { mainMd, successLabel: '', successBodyMd: tail };
}
