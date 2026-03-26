import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LESSON_QUIZZES, MODULE_QUIZZES } from './quiz-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const courseRoot = path.join(__dirname, '..', 'course');

const wrongLesEs = 'No es la mejor opción. Repasa la lección para afianzar el concepto.';
const wrongLesEn = 'Not the best fit. Re-read the lesson to strengthen the idea.';
const rightLesEs = 'Correcto.';
const rightLesEn = 'Correct.';
const wrongModEs = 'No encaja del todo. Repasa las lecciones del módulo si quieres reforzar.';
const wrongModEn = 'Not quite. Review module lessons if you want to strengthen this.';
const rightModEs = 'Correcto — buena señal de comprensión del módulo.';
const rightModEn = 'Correct — solid sign you understand the module.';

function itemsToHtml(items, isModule) {
  const wes = isModule ? wrongModEs : wrongLesEs;
  const wen = isModule ? wrongModEn : wrongLesEn;
  const res = isModule ? rightModEs : rightLesEs;
  const ren = isModule ? rightModEn : rightLesEn;
  return items
    .map(
      ({ c, q, o }) => `
        <div class="kq-item" data-correct="${c}">
          <p class="kq-prompt"><span class="es">${q.es}</span><span class="en">${q.en}</span></p>
          <div class="kq-options" role="group">
${o
  .map(
    (opt, i) =>
      `            <button type="button" class="kq-opt" data-i="${i}"><span class="es">${opt.es}</span><span class="en">${opt.en}</span></button>`
  )
  .join('\n')}
          </div>
          <div class="kq-after kq-after-wrong" hidden><p><span class="es">${wes}</span><span class="en">${wen}</span></p></div>
          <div class="kq-after kq-after-right" hidden><p><span class="es">${res}</span><span class="en">${ren}</span></p></div>
        </div>`
    )
    .join('\n');
}

function wrapLesson(itemsHtml) {
  return `      <section class="knowledge-quiz" aria-labelledby="kq-lesson-h">
        <h3 id="kq-lesson-h" class="kq-heading"><span class="es">Comprueba tu comprensión</span><span class="en">Check your understanding</span></h3>
        <p class="kq-intro"><span class="es">Tres preguntas de opción múltiple. No afectan tu progreso del curso: sirven para que veas qué tan claro te quedó el tema.</span><span class="en">Three multiple-choice questions. They do not affect course progress — they help you see how clear the ideas are.</span></p>
        <div class="kq-score" aria-live="polite"></div>${itemsHtml}
      </section>

`;
}

function wrapModule(itemsHtml) {
  return `      <section class="knowledge-quiz knowledge-quiz--module" aria-labelledby="kq-mod-h">
        <h3 id="kq-mod-h" class="kq-heading"><span class="es">Cuestionario del módulo</span><span class="en">Module quiz</span></h3>
        <p class="kq-intro"><span class="es">Preguntas que integran ideas de todo el módulo. Úsalas para evaluar si dominas los conceptos clave antes de seguir.</span><span class="en">Questions that integrate ideas from the whole module. Use them to gauge whether you own the key concepts before moving on.</span></p>
        <div class="kq-score" aria-live="polite"></div>${itemsHtml}
      </section>

`;
}

function walkLessons(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkLessons(p, acc);
    else if (ent.name.startsWith('lesson-') && ent.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function injectLesson(file) {
  const rel = path.relative(courseRoot, file).replace(/\\/g, '/');
  const items = LESSON_QUIZZES[rel];
  if (!items) throw new Error(`Missing LESSON_QUIZZES["${rel}"]`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('class="knowledge-quiz"')) {
    console.log('skip (already has quiz):', rel);
    return;
  }
  const needle = '<div class="lesson-nav"';
  const i = s.indexOf(needle);
  if (i === -1) throw new Error('lesson-nav not found: ' + rel);
  const html = wrapLesson(itemsToHtml(items, false));
  s = s.slice(0, i) + html + s.slice(i);
  fs.writeFileSync(file, s);
  console.log('injected lesson:', rel);
}

function injectModuleIndex(n) {
  const rel = `module-${n}/index.html`;
  const file = path.join(courseRoot, `module-${n}`, 'index.html');
  const items = MODULE_QUIZZES[`module-${n}`];
  if (!items) throw new Error(`Missing MODULE_QUIZZES["module-${n}"]`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('class="knowledge-quiz"')) {
    console.log('skip module (already has quiz):', rel);
    return;
  }
  const html = wrapModule(itemsToHtml(items, true));

  if (n <= 2) {
    const needle = '<div class="lesson-nav" style="margin-top:3rem;">';
    const j = s.indexOf(needle);
    if (j === -1) throw new Error('module 1/2 nav needle not found: ' + rel);
    s = s.slice(0, j) + html + s.slice(j);
  } else {
    const re =
      /(\s*<div id="module-lessons-dynamic"><\/div>\s*<\/div>)\s*<\/div>\s*(<script src="\.\.\/assets\/course\.js"><\/script>)/;
    if (!re.test(s)) throw new Error('module 3–5 dynamic block not found: ' + rel);
    s = s.replace(re, `$1\n${html}    </div>\n    $2`);
  }
  fs.writeFileSync(file, s);
  console.log('injected module index:', rel);
}

for (const f of walkLessons(courseRoot)) injectLesson(f);
for (let n = 1; n <= 5; n++) injectModuleIndex(n);
console.log('Done.');
