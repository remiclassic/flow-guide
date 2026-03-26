/* ── GLOW FLOW METHOD - COURSE LOGIC ── */

const CURRICULUM = [
  {
    id: 'module-1',
    numEs: 'Módulo 01', numEn: 'Module 01',
    titleEs: 'Reset Mental', titleEn: 'Mental Reset',
    descEs: 'Entiende el mecanismo del autosabotaje y construye la estructura que reemplaza la motivación.',
    descEn: 'Understand the mechanism of self-sabotage and build the structure that replaces motivation.',
    path: 'module-1/',
    lessons: [
      { id: 'mod1-l01', numEs: 'Lección 01', numEn: 'Lesson 01', titleEs: 'Por qué la estructura supera a la motivación', titleEn: 'Why Structure Beats Motivation', path: 'module-1/lesson-01.html' },
      { id: 'mod1-l02', numEs: 'Lección 02', numEn: 'Lesson 02', titleEs: 'Cómo funciona realmente el autosabotaje', titleEn: 'How Self-Sabotage Actually Works', path: 'module-1/lesson-02.html' },
      { id: 'mod1-l03', numEs: 'Lección 03', numEn: 'Lesson 03', titleEs: 'Intenciones de implementación: el plan si-entonces', titleEn: 'Implementation Intentions: The If-Then Plan', path: 'module-1/lesson-03.html' },
      { id: 'mod1-l04', numEs: 'Lección 04', numEn: 'Lesson 04', titleEs: 'Trampas de pensamiento que te mantienen atascado', titleEn: 'Thought Traps That Keep You Stuck', path: 'module-1/lesson-04.html' },
      { id: 'mod1-l05', numEs: 'Lección 05', numEn: 'Lesson 05', titleEs: 'Diseño del entorno: tu ambiente trabaja para ti o contra ti', titleEn: 'Environment Design: Your Space Works For or Against You', path: 'module-1/lesson-05.html' },
      { id: 'mod1-l06', numEs: 'Lección 06', numEn: 'Lesson 06', titleEs: 'Higiene de atención: la guerra por tu mente', titleEn: 'Attention Hygiene: The War for Your Mind', path: 'module-1/lesson-06.html' },
      { id: 'mod1-l07', numEs: 'Lección 07', numEn: 'Lesson 07', titleEs: 'Fatiga de decisiones: diseña para decidir menos', titleEn: 'Decision Fatigue: Design to Decide Less', path: 'module-1/lesson-07.html' },
      { id: 'mod1-l08', numEs: 'Lección 08', numEn: 'Lesson 08', titleEs: 'Tu primera semana con estructura real', titleEn: 'Your First Week With Real Structure', path: 'module-1/lesson-08.html' },
      { id: 'mod1-l09', numEs: 'Laboratorio 01', numEn: 'Lab 01', titleEs: 'Laboratorio de Integración: Módulo 1', titleEn: 'Integration Lab: Module 1', path: 'module-1/lesson-09.html' },
    ]
  },
  {
    id: 'module-2',
    numEs: 'Módulo 02', numEn: 'Module 02',
    titleEs: 'Disciplina Real', titleEn: 'Real Discipline',
    descEs: 'Deja de negociar contigo. Aprende a ejecutar sin depender de emociones.',
    descEn: 'Stop negotiating with yourself. Learn to execute without depending on your emotions.',
    path: 'module-2/',
    lessons: [
      { id: 'mod2-l01', numEs: 'Lección 01', numEn: 'Lesson 01', titleEs: 'El impuesto de la negociación', titleEn: 'The Negotiation Tax', path: 'module-2/lesson-01.html' },
      { id: 'mod2-l02', numEs: 'Lección 02', numEn: 'Lesson 02', titleEs: 'El protocolo de cero negociación', titleEn: 'The Zero-Negotiation Protocol', path: 'module-2/lesson-02.html' },
      { id: 'mod2-l03', numEs: 'Lección 03', numEn: 'Lesson 03', titleEs: 'Diseño de hábitos: el bucle que te define', titleEn: 'Habit Design: The Loop That Defines You', path: 'module-2/lesson-03.html' },
      { id: 'mod2-friction', numEs: 'Lección 03b', numEn: 'Lesson 03b', titleEs: 'Ingeniería de fricción: haz lo correcto más fácil', titleEn: 'Friction Engineering: Make the Right Thing Easier', path: 'module-2/lesson-04b.html' },
      { id: 'mod2-l04', numEs: 'Lección 04', numEn: 'Lesson 04', titleEs: 'Acción mínima viable: el sistema a prueba de fallos', titleEn: 'Minimum Viable Action: The Failsafe System', path: 'module-2/lesson-04.html' },
      { id: 'mod2-l05', numEs: 'Lección 05', numEn: 'Lesson 05', titleEs: 'El calendario como contrato', titleEn: 'Your Calendar as a Contract', path: 'module-2/lesson-05.html' },
      { id: 'mod2-l06', numEs: 'Lección 06', numEn: 'Lesson 06', titleEs: 'Seguimiento sin espiral de vergüenza', titleEn: 'Tracking Without the Shame Spiral', path: 'module-2/lesson-06.html' },
      { id: 'mod2-l07', numEs: 'Lección 07', numEn: 'Lesson 07', titleEs: 'Protocolo de recuperación de fallos', titleEn: 'Failure Recovery Protocol', path: 'module-2/lesson-07.html' },
      { id: 'mod2-l08', numEs: 'Lección 08', numEn: 'Lesson 08', titleEs: 'Disciplina y el entorno social: proteger lo que construyes', titleEn: 'Discipline and the Social Environment: Protecting What You Build', path: 'module-2/lesson-08.html' },
      { id: 'mod2-l09', numEs: 'Laboratorio 02', numEn: 'Lab 02', titleEs: 'Laboratorio de Integración: Módulo 2', titleEn: 'Integration Lab: Module 2', path: 'module-2/lesson-09.html' },
    ]
  },
  {
    id: 'module-3',
    numEs: 'Módulo 03', numEn: 'Module 03',
    titleEs: 'Identidad', titleEn: 'Identity',
    descEs: 'Conviértete en la persona que naturalmente vive los sistemas que has construido.',
    descEn: 'Become the person who naturally lives the systems you have built.',
    path: 'module-3/',
    lessons: [
      { id: 'mod3-l01', numEs: 'Lección 01', numEn: 'Lesson 01', titleEs: 'Identidad como arquitectura: cómo te construiste y cómo reconstruirte', titleEn: 'Identity as architecture: how you were built and how to rebuild', path: 'module-3/lesson-01.html' },
      { id: 'mod3-l02', numEs: 'Lección 02', numEn: 'Lesson 02', titleEs: 'El lenguaje interno: cómo las palabras sobre ti te construyen o te destruyen', titleEn: 'Internal language: how words about yourself build or destroy you', path: 'module-3/lesson-02.html' },
      { id: 'mod3-l03', numEs: 'Lección 03', numEn: 'Lesson 03', titleEs: '"Actuar como si": la técnica real y sus límites psicológicos', titleEn: '"Act as if": the real technique and its psychological limits', path: 'module-3/lesson-03.html' },
      { id: 'mod3-l04', numEs: 'Lección 04', numEn: 'Lesson 04', titleEs: 'Construir evidencia de identidad: votos y consistencia de bajo umbral', titleEn: 'Building identity evidence: votes and low-threshold consistency', path: 'module-3/lesson-04.html' },
      { id: 'mod3-l05', numEs: 'Lección 05', numEn: 'Lesson 05', titleEs: 'El duelo de quien eras: por qué el cambio de identidad duele', titleEn: 'Grieving who you were: why identity change hurts', path: 'module-3/lesson-05.html' },
      { id: 'mod3-l06', numEs: 'Laboratorio 03', numEn: 'Lab 03', titleEs: 'Laboratorio de integración: tu perfil de identidad completo', titleEn: 'Integration Lab: your complete identity profile', path: 'module-3/lesson-06.html' },
    ]
  },
  {
    id: 'module-4',
    numEs: 'Módulo 04', numEn: 'Module 04',
    titleEs: 'Enfoque Profundo', titleEn: 'Deep Focus',
    descEs: 'Domina la habilidad que separa el trabajo ordinario del extraordinario.',
    descEn: 'Master the skill that separates ordinary work from extraordinary.',
    path: 'module-4/',
    lessons: [
      { id: 'mod4-l01', numEs: 'Lección 01', numEn: 'Lesson 01', titleEs: 'La neurociencia del enfoque: tu atención es finita y recuperable', titleEn: 'The neuroscience of focus: your attention is finite and recoverable', path: 'module-4/lesson-01.html' },
      { id: 'mod4-l02', numEs: 'Lección 02', numEn: 'Lesson 02', titleEs: 'El estado de flujo: condiciones, catalizadores e inhibidores', titleEn: 'The flow state: conditions, catalysts and inhibitors', path: 'module-4/lesson-02.html' },
      { id: 'mod4-l03', numEs: 'Lección 03', numEn: 'Lesson 03', titleEs: 'Diseño de la sesión de trabajo profundo', titleEn: 'Designing the deep work session', path: 'module-4/lesson-03.html' },
      { id: 'mod4-l04', numEs: 'Lección 04', numEn: 'Lesson 04', titleEs: 'Gestión de la distracción digital: neurociencia vs. fuerza de voluntad', titleEn: 'Digital distraction management: neuroscience vs. willpower', path: 'module-4/lesson-04.html' },
      { id: 'mod4-l05', numEs: 'Lección 05', numEn: 'Lesson 05', titleEs: 'Recuperación de la atención: el descanso como parte del sistema', titleEn: 'Attention recovery: rest as part of the performance system', path: 'module-4/lesson-05.html' },
      { id: 'mod4-l06', numEs: 'Laboratorio 04', numEn: 'Lab 04', titleEs: 'Laboratorio de integración: tu protocolo de trabajo profundo', titleEn: 'Integration Lab: your deep work protocol', path: 'module-4/lesson-06.html' },
    ]
  },
  {
    id: 'module-5',
    numEs: 'Módulo 05', numEn: 'Module 05',
    titleEs: 'Integración y Sostenibilidad', titleEn: 'Integration & Sustainability',
    descEs: 'Sostén lo que construiste. Diseña para el largo plazo, no para el sprint.',
    descEn: 'Sustain what you built. Design for the long term, not the sprint.',
    path: 'module-5/',
    lessons: [
      { id: 'mod5-l01', numEs: 'Lección 01', numEn: 'Lesson 01', titleEs: 'Sostener sin momentum: cómo los sistemas sobreviven a los valles', titleEn: 'Sustaining without momentum: how systems survive valleys', path: 'module-5/lesson-01.html' },
      { id: 'mod5-l02', numEs: 'Lección 02', numEn: 'Lesson 02', titleEs: 'Revisión semanal y mensual: el sistema que evita el colapso lento', titleEn: 'Weekly and monthly review: the system that prevents slow collapse', path: 'module-5/lesson-02.html' },
      { id: 'mod5-l03', numEs: 'Lección 03', numEn: 'Lesson 03', titleEs: 'Crecimiento sostenible: explotar vs. florecer en 5 años', titleEn: 'Sustainable growth: exploding vs. flourishing in 5 years', path: 'module-5/lesson-03.html' },
      { id: 'mod5-l04', numEs: 'Lab Final', numEn: 'Final Lab', titleEs: 'Laboratorio final: tu documento de sistema de vida completo', titleEn: 'Final Lab: your complete life system document', path: 'module-5/lesson-04.html' },
    ]
  }
];

// ── STORAGE KEYS ──
const STORAGE = {
  lang: 'gfm_lang',
  completed: 'gfm_completed',
  lastLesson: 'gfm_last_lesson'
};

/** Base path to /course (includes GitHub Pages repo prefix when present). */
function coursePrefix() {
  const p = location.pathname;
  const needle = '/course/';
  const idx = p.lastIndexOf(needle);
  if (idx !== -1) return p.slice(0, idx + '/course'.length);
  if (p.endsWith('/course')) return p;
  const j = p.indexOf('/course');
  if (j !== -1) return p.slice(0, j + '/course'.length);
  return '/course';
}
/** Absolute URL for a lesson path relative to course/ (e.g. module-1/lesson-01.html). */
function lessonUrl(relFromCourse) {
  const rel = String(relFromCourse).replace(/^\/+/, '');
  return coursePrefix() + '/' + rel;
}

// ── HELPERS ──
function getCompleted() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE.completed) || '[]')); }
  catch { return new Set(); }
}
function saveCompleted(set) {
  localStorage.setItem(STORAGE.completed, JSON.stringify([...set]));
}
function getLang() { return localStorage.getItem(STORAGE.lang) || 'es'; }
function saveLang(l) { localStorage.setItem(STORAGE.lang, l); }
function getLastLesson() { return localStorage.getItem(STORAGE.lastLesson) || null; }
function saveLastLesson(id) { localStorage.setItem(STORAGE.lastLesson, id); }

// ── LANGUAGE ──
function initLang() {
  const lang = getLang();
  document.body.classList.remove('lang-es', 'lang-en');
  document.body.classList.add('lang-' + lang);
  document.documentElement.lang = lang;
}
function toggleLang() {
  const current = getLang();
  const next = current === 'es' ? 'en' : 'es';
  saveLang(next);
  document.body.classList.remove('lang-es', 'lang-en');
  document.body.classList.add('lang-' + next);
  document.documentElement.lang = next;
}

// ── PROGRESS MATH ──
function totalLessons() { return CURRICULUM.reduce((s, m) => s + m.lessons.length, 0); }
function completedCount() { return getCompleted().size; }
function progressPct() { return Math.round((completedCount() / totalLessons()) * 100); }
function moduleProgress(moduleId) {
  const mod = CURRICULUM.find(m => m.id === moduleId);
  if (!mod) return 0;
  const done = getCompleted();
  const c = mod.lessons.filter(l => done.has(l.id)).length;
  return Math.round((c / mod.lessons.length) * 100);
}
function nextLesson() {
  const done = getCompleted();
  for (const mod of CURRICULUM) {
    for (const lesson of mod.lessons) {
      if (!done.has(lesson.id)) return lesson;
    }
  }
  return null;
}

// ── SIDEBAR BUILD ──
function buildSidebar(activeId) {
  const container = document.getElementById('sidebar-modules-container');
  if (!container) return;
  const done = getCompleted();
  const html = CURRICULUM.map(mod => {
    const modPct = moduleProgress(mod.id);
    const hasActive = mod.lessons.some(l => l.id === activeId);
    const isOpen = hasActive;
    const lessonHtml = mod.lessons.map(l => {
      const isActive = l.id === activeId;
      const isCompleted = done.has(l.id);
      const cls = [isActive ? 'active' : '', isCompleted ? 'completed' : ''].filter(Boolean).join(' ');
      const checkIcon = isCompleted ? '✓' : (isActive ? '▶' : '○');
      return `<a href="${lessonUrl(l.path)}" class="sidebar-lesson ${cls}" data-lesson-id="${l.id}">
        <span class="lesson-check">${checkIcon}</span>
        <span class="sidebar-lesson-title">
          <span class="es">${l.titleEs}</span>
          <span class="en">${l.titleEn}</span>
        </span>
      </a>`;
    }).join('');
    return `<div class="sidebar-module ${isOpen ? 'open' : ''}">
      <div class="sidebar-module-head" onclick="toggleModule(this)">
        <div>
          <div class="sidebar-module-num"><span class="es">${mod.numEs}</span><span class="en">${mod.numEn}</span></div>
          <div class="sidebar-module-title"><span class="es">${mod.titleEs}</span><span class="en">${mod.titleEn}</span></div>
        </div>
        <span class="sidebar-module-caret">▼</span>
      </div>
      <div class="sidebar-lessons">${lessonHtml}</div>
    </div>`;
  }).join('');
  container.innerHTML = html;

  // Update sidebar progress
  const total = totalLessons();
  const comp = completedCount();
  const pct = progressPct();
  const fill = document.querySelector('.sidebar-progress-fill');
  const pctEl = document.querySelector('.sidebar-progress-pct');
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.innerHTML = `${comp} / ${total} <span class="es">lecciones completadas</span><span class="en">lessons completed</span>`;
}

function toggleModule(el) {
  el.parentElement.classList.toggle('open');
}

// ── SCROLL PROGRESS (lesson pages) ──
function initScrollProgress() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
}

// ── SIDEBAR TOGGLE (mobile) ──
function initSidebarToggle() {
  const btn = document.querySelector('.btn-sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay && overlay.classList.toggle('active');
  });
  overlay && overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

// ── MARK COMPLETE ──
function initMarkComplete(lessonId) {
  const btn = document.getElementById('btn-complete');
  if (!btn || !lessonId) return;
  const done = getCompleted();
  if (done.has(lessonId)) {
    btn.classList.add('done');
    btn.querySelector('.es') && (btn.querySelector('.es').textContent = '✓ Completada');
    btn.querySelector('.en') && (btn.querySelector('.en').textContent = '✓ Completed');
  }
  btn.addEventListener('click', () => {
    const set = getCompleted();
    set.add(lessonId);
    saveCompleted(set);
    saveLastLesson(lessonId);
    btn.classList.add('done');
    btn.querySelector('.es') && (btn.querySelector('.es').textContent = '✓ Completada');
    btn.querySelector('.en') && (btn.querySelector('.en').textContent = '✓ Completed');
    buildSidebar(lessonId);
    updateDashboardProgress();
  });
}

// ── DASHBOARD ──
function buildDashboard() {
  const done = getCompleted();
  const total = totalLessons();
  const comp = done.size;
  const pct = progressPct();

  // Stats
  const elComp = document.getElementById('dash-completed');
  const elTotal = document.getElementById('dash-total');
  const elPct = document.getElementById('dash-pct');
  const elFill = document.getElementById('dash-fill');
  if (elComp) elComp.textContent = comp;
  if (elTotal) elTotal.textContent = total;
  if (elPct) elPct.textContent = pct + '%';
  if (elFill) elFill.style.width = pct + '%';

  // Continue button
  const next = nextLesson();
  const contBtn = document.getElementById('btn-continue');
  if (contBtn && next) {
    contBtn.href = lessonUrl(next.path);
    contBtn.querySelector('.es') && (contBtn.querySelector('.es').textContent = `Continuar → ${next.titleEs}`);
    contBtn.querySelector('.en') && (contBtn.querySelector('.en').textContent = `Continue → ${next.titleEn}`);
  } else if (contBtn && !next) {
    contBtn.href = lessonUrl('capstone.html');
    contBtn.querySelector('.es') && (contBtn.querySelector('.es').textContent = '🎉 Ver Proyecto Final →');
    contBtn.querySelector('.en') && (contBtn.querySelector('.en').textContent = '🎉 View Capstone Project →');
  }

  // Module cards
  CURRICULUM.forEach(mod => {
    const pctEl = document.getElementById(`mod-pct-${mod.id}`);
    if (pctEl) pctEl.textContent = moduleProgress(mod.id) + '%';
    const listEl = document.getElementById(`mod-lessons-${mod.id}`);
    if (!listEl) return;
    const items = mod.lessons.map(l => {
      const isCompleted = done.has(l.id);
      return `<a href="${lessonUrl(l.path)}" class="dash-lesson ${isCompleted ? 'completed' : ''}">
        <div class="dash-lesson-left">
          <span class="dash-lesson-num">${l.numEs.split(' ')[1] || l.numEs}</span>
          <span class="dash-lesson-title"><span class="es">${l.titleEs}</span><span class="en">${l.titleEn}</span></span>
        </div>
        <span class="dash-check">${isCompleted ? '✓' : '○'}</span>
      </a>`;
    }).join('');
    listEl.innerHTML = items;
  });
}
function updateDashboardProgress() {
  // Call if on dashboard
  if (document.getElementById('dash-fill')) buildDashboard();
}

// ── KNOWLEDGE CHECK QUIZZES (lesson + module) ──
function initKnowledgeQuizzes() {
  document.querySelectorAll('.knowledge-quiz').forEach((quiz) => {
    const scoreEl = quiz.querySelector('.kq-score');
    const items = [...quiz.querySelectorAll('.kq-item')];
    let answered = 0;
    let correctCount = 0;

    quiz.addEventListener('click', (e) => {
      const btn = e.target.closest('.kq-opt');
      if (!btn || !quiz.contains(btn)) return;
      const item = btn.closest('.kq-item');
      if (!item || item.classList.contains('kq-done')) return;

      item.classList.add('kq-done');
      const correct = parseInt(item.dataset.correct, 10);
      const picked = parseInt(btn.dataset.i, 10);
      const opts = item.querySelectorAll('.kq-opt');
      opts.forEach((b) => { b.disabled = true; });

      if (picked === correct) {
        correctCount++;
        btn.classList.add('kq-pick-right');
        item.querySelector('.kq-after-right')?.removeAttribute('hidden');
      } else {
        btn.classList.add('kq-pick-wrong');
        if (opts[correct]) opts[correct].classList.add('kq-reveal');
        item.querySelector('.kq-after-wrong')?.removeAttribute('hidden');
      }

      answered++;
      if (answered !== items.length || !scoreEl) return;

      const allRight = correctCount === items.length;
      scoreEl.innerHTML =
        '<p class="kq-score-inner"><span class="es">Resultado: ' +
        correctCount + '/' + items.length + ' correctas. ' +
        (allRight ? '¡Muy buena comprensión de este bloque!' : 'Usa esto para decidir qué repasar.') +
        '</span><span class="en">Score: ' +
        correctCount + '/' + items.length + ' correct. ' +
        (allRight ? 'Strong grasp of this section!' : 'Use this to decide what to review.') +
        '</span></p>';
    });
  });
}

// ── MODULE WORKBOOK INJECTION ──
function injectModuleWorkbook(lessonId) {
  const mod = CURRICULUM.find(m => m.lessons.some(l => l.id === lessonId));
  if (!mod) return;

  const num = mod.id.replace('module-', '').padStart(2, '0');
  const pdfUrl = lessonUrl(`pdf/module-${num}.html`);

  const block = document.createElement('div');
  block.className = 'lesson-workbook';
  block.innerHTML =
    '<div class="lesson-workbook-icon">📄</div>' +
    '<div class="lesson-workbook-body">' +
      '<div class="lesson-workbook-label"><span class="es">Cuaderno de trabajo del módulo</span><span class="en">Module workbook</span></div>' +
      '<p class="lesson-workbook-title"><span class="es">' + mod.numEs + ': ' + mod.titleEs + '</span><span class="en">' + mod.numEn + ': ' + mod.titleEn + '</span></p>' +
      '<p class="lesson-workbook-desc"><span class="es">Marcos clave, espacios para escribir, plan de 7 días y preguntas de revisión de este módulo.</span><span class="en">Key frameworks, writing spaces, 7-day action plan, and review questions for this module.</span></p>' +
    '</div>' +
    '<a href="' + pdfUrl + '" target="_blank" rel="noopener" class="lesson-workbook-btn">' +
      '<span class="es">📥 Abrir workbook</span><span class="en">📥 Open workbook</span>' +
    '</a>';

  const nav = document.querySelector('.lesson-nav');
  if (nav) {
    nav.parentNode.insertBefore(block, nav);
  } else {
    document.querySelector('.content-inner')?.appendChild(block);
  }
}

// ── NAV HIDE ON SCROLL ──
function initNavHide() {
  const nav = document.getElementById('course-nav');
  if (!nav) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.style.transform = (y > lastY && y > 80) ? 'translateY(-100%)' : 'translateY(0)';
    lastY = y;
  }, { passive: true });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initScrollProgress();
  initSidebarToggle();
  initNavHide();
  initKnowledgeQuizzes();

  // If on a lesson page
  const lessonId = document.body.dataset.lessonId;
  if (lessonId) {
    buildSidebar(lessonId);
    initMarkComplete(lessonId);
    saveLastLesson(lessonId);
    injectModuleWorkbook(lessonId);
  }

  // If on dashboard
  if (document.getElementById('dash-fill')) {
    buildDashboard();
  }
  // If on module overview page - update sidebar without active
  const moduleId = document.body.dataset.moduleId;
  if (moduleId && !lessonId) {
    buildSidebar(null);
  }
});
