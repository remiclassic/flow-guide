/**
 * Replace Unicode em dash (U+2014) with commas, colons, semicolons, etc.
 * Run: node tools/fix-emdash.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const EM = '\u2014';

const SKIP_DIRS = new Set(['node_modules', '.git']);

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (/\.(html|js|mjs|css|md)$/i.test(e.name)) {
      yield p;
    }
  }
}

function transform(s) {
  if (!s.includes(EM)) return s;
  let o = s;

  // File / section headers in comments
  o = o.replace(new RegExp(`METHOD ${EM} COURSE`, 'g'), 'METHOD - COURSE');
  o = o.replace(new RegExp(`WORKBOOK ${EM} PRINT`, 'g'), 'WORKBOOK - PRINT');
  o = o.replace(new RegExp(`METHOD ${EM} COURSE LOGIC`, 'g'), 'METHOD - COURSE LOGIC');

  // CSS list marker (em dash in content: was common before replace)
  o = o.replace(/content:\s*'\u2014'/g, "content: '-'");

  // Structured labels: L01: Title → L01: Title
  o = o.replace(new RegExp(`\\b(L\\d{2}) ${EM} `, 'g'), '$1: ');
  o = o.replace(new RegExp(`\\b(Lab \\d{2}) ${EM} `, 'g'), '$1: ');
  o = o.replace(new RegExp(`\\b(Lab Final) ${EM} `, 'g'), 'Lab Final: ');
  o = o.replace(new RegExp(`\\b(Final Lab) ${EM} `, 'g'), 'Final Lab: ');

  // Module numbering in titles and copy
  o = o.replace(new RegExp(`(Módulo \\d{2}) ${EM} `, 'g'), '$1: ');
  o = o.replace(new RegExp(`(Module \\d{2}) ${EM} `, 'g'), '$1: ');
  o = o.replace(new RegExp(`Glow Flow Method ${EM} `, 'g'), 'Glow Flow Method: ');

  // Headings
  o = o.replace(new RegExp(`Final Exercise ${EM} `, 'g'), 'Final Exercise, ');
  o = o.replace(new RegExp(`Ejercicio Final ${EM} `, 'g'), 'Ejercicio Final, ');
  o = o.replace(new RegExp(`Workbook ${EM} `, 'g'), 'Workbook, ');
  o = o.replace(new RegExp(`Mini Reto ${EM} `, 'g'), 'Mini Reto, ');
  o = o.replace(new RegExp(`Mini Challenge ${EM} `, 'g'), 'Mini Challenge, ');
  o = o.replace(new RegExp(`Reto Final ${EM} `, 'g'), 'Reto Final, ');
  o = o.replace(new RegExp(`Final Challenge ${EM} `, 'g'), 'Final Challenge, ');

  o = o.replace(new RegExp(`(Día \\d) ${EM} `, 'g'), '$1: ');
  o = o.replace(new RegExp(`(Day \\d) ${EM} `, 'g'), '$1: ');

  // "Día X, diario" style (no capture for diario - use specific)
  o = o.replace(new RegExp(`7 días ${EM} diario`, 'g'), '7 días: diario');
  o = o.replace(new RegExp(`action plan ${EM} evidence`, 'g'), 'action plan: evidence');

  // Lab · Integración: X → Lab · Integración: X
  o = o.replace(new RegExp(`Integración ${EM} `, 'g'), 'Integración: ');
  o = o.replace(new RegExp(`Integration ${EM} `, 'g'), 'Integration: ');

  // Review / questions lines
  o = o.replace(new RegExp(`Review questions ${EM} module`, 'g'), 'Review questions: module');
  o = o.replace(new RegExp(`Preguntas de revisión del módulo y del curso completo`, 'g'), 'Preguntas de revisión del módulo y del curso completo'); // no-op

  // Parentheticals (summary: honor) → (summary: honor)
  o = o.replace(new RegExp(`\\(resumen ${EM} `, 'g'), '(resumen: ');
  o = o.replace(new RegExp(`\\(summary ${EM} `, 'g'), '(summary: ');

  // Goals months: "consolidación, meses" → "consolidación, meses"
  o = o.replace(new RegExp(`\\(consolidación ${EM} meses`, 'g'), '(consolidación, meses');
  o = o.replace(new RegExp(`\\(consolidation ${EM} months`, 'g'), '(consolidation, months');
  o = o.replace(new RegExp(`\\(expansión ${EM} meses`, 'g'), '(expansión, meses');
  o = o.replace(new RegExp(`\\(expansion ${EM} months`, 'g'), '(expansion, months');
  o = o.replace(new RegExp(`\\(crecimiento compuesto ${EM} meses`, 'g'), '(crecimiento compuesto, meses');
  o = o.replace(new RegExp(`\\(compound growth ${EM} months`, 'g'), '(compound growth, months');

  // course.js workbook title: mod.num + ': ' + title
  o = o.replace(new RegExp(`\\+ ' ${EM} ' \\+`, 'g'), "+ ': ' +");

  // Spanish / English contrast bridges
  o = o.replace(new RegExp(` ${EM} sino `, 'g'), ', sino ');
  o = o.replace(new RegExp(` ${EM} but `, 'g'), ', but ');
  o = o.replace(new RegExp(` ${EM} who `, 'g'), ', who ');
  o = o.replace(new RegExp(` ${EM} especially `, 'g'), ', especially ');
  o = o.replace(new RegExp(` ${EM} even `, 'g'), ', even ');
  o = o.replace(new RegExp(` ${EM} and `, 'g'), ', and ');
  o = o.replace(new RegExp(` ${EM} it's `, 'g'), "; it's ");
  o = o.replace(new RegExp(` ${EM} it comes `, 'g'), '; it comes ');
  o = o.replace(new RegExp(` ${EM} you're `, 'g'), "; you're ");
  o = o.replace(new RegExp(` ${EM} not `, 'g'), ', not ');
  o = o.replace(new RegExp(` ${EM} they `, 'g'), '; they ');
  o = o.replace(new RegExp(` ${EM} the `, 'g'), '; the ');
  o = o.replace(new RegExp(` ${EM} because `, 'g'), ', because ');
  o = o.replace(new RegExp(` ${EM} or `, 'g'), ', or ');
  o = o.replace(new RegExp(` ${EM} ya `, 'g'), '; ya ');
  o = o.replace(new RegExp(` ${EM} y `, 'g'), ', y ');
  o = o.replace(new RegExp(` ${EM} shrunk `, 'g'), ', shrunk ');
  o = o.replace(new RegExp(` ${EM} saying `, 'g'), ': saying ');
  o = o.replace(new RegExp(` ${EM} one vote `, 'g'), ': one vote ');
  o = o.replace(new RegExp(` ${EM} stop `, 'g'), ': stop ');
  o = o.replace(new RegExp(` ${EM} results `, 'g'), '; results ');
  o = o.replace(new RegExp(` ${EM} el `, 'g'), '; el ');
  o = o.replace(new RegExp(` ${EM} la `, 'g'), '; la ');
  o = o.replace(new RegExp(` ${EM} un `, 'g'), '; un ');
  o = o.replace(new RegExp(` ${EM} un voto `, 'g'), ': un voto ');
  o = o.replace(new RegExp(` ${EM} no te `, 'g'), ': no te ');

  // "lista; el resultado" after "sí"
  o = o.replace(new RegExp(`entre sí ${EM} el `, 'g'), 'entre sí; el ');

  // Remaining common: goal / outcome clauses ", para " → ", para "
  o = o.replace(new RegExp(` ${EM} para `, 'g'), ', para ');
  o = o.replace(new RegExp(` ${EM} so `, 'g'), ', so ');
  o = o.replace(new RegExp(` ${EM} decir `, 'g'), ': decir ');

  // Double em dash parenthetical ", or, " 
  o = o.replace(new RegExp(` ${EM} or ${EM} `, 'g'), ', or ');

  // Any remaining EM dash with spaces → comma (readable default)
  o = o.replace(new RegExp(` ${EM} `, 'g'), ', ');

  // Edge: em dash without spaces (rare)
  o = o.replace(new RegExp(EM, 'g'), ', ');

  return o;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const raw = fs.readFileSync(file, 'utf8');
  const next = transform(raw);
  if (next !== raw) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('updated:', path.relative(ROOT, file));
  }
}
console.log('files updated:', changed);
