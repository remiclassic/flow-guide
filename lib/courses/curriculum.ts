/**
 * Canonical curriculum metadata ported from the legacy static course (`public/legacy`).
 * Used for DB seeding and progress calculations.
 */
export type CurriculumLesson = {
  id: string;
  numEs: string;
  numEn: string;
  titleEs: string;
  titleEn: string;
  /** Relative to `public/legacy/course/` */
  path: string;
};

export type CurriculumModule = {
  id: string;
  numEs: string;
  numEn: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  path: string;
  lessons: CurriculumLesson[];
};

export const GLOW_FLOW_COURSE_SLUG = 'glow-flow-method';

export const CURRICULUM: CurriculumModule[] = [
  {
    id: 'module-1',
    numEs: 'Módulo 01',
    numEn: 'Module 01',
    titleEs: 'Reset Mental',
    titleEn: 'Mental Reset',
    descEs:
      'Entiende el mecanismo del autosabotaje y construye la estructura que reemplaza la motivación.',
    descEn:
      'Understand the mechanism of self-sabotage and build the structure that replaces motivation.',
    path: 'module-1/',
    lessons: [
      {
        id: 'mod1-l01',
        numEs: 'Lección 01',
        numEn: 'Lesson 01',
        titleEs: 'Por qué la estructura supera a la motivación',
        titleEn: 'Why Structure Beats Motivation',
        path: 'module-1/lesson-01.html'
      },
      {
        id: 'mod1-l02',
        numEs: 'Lección 02',
        numEn: 'Lesson 02',
        titleEs: 'Cómo funciona realmente el autosabotaje',
        titleEn: 'How Self-Sabotage Actually Works',
        path: 'module-1/lesson-02.html'
      },
      {
        id: 'mod1-l03',
        numEs: 'Lección 03',
        numEn: 'Lesson 03',
        titleEs:
          'Intenciones de implementación: el plan si-entonces',
        titleEn: 'Implementation Intentions: The If-Then Plan',
        path: 'module-1/lesson-03.html'
      },
      {
        id: 'mod1-l04',
        numEs: 'Lección 04',
        numEn: 'Lesson 04',
        titleEs: 'Trampas de pensamiento que te mantienen atascado',
        titleEn: 'Thought Traps That Keep You Stuck',
        path: 'module-1/lesson-04.html'
      },
      {
        id: 'mod1-l05',
        numEs: 'Lección 05',
        numEn: 'Lesson 05',
        titleEs:
          'Diseño del entorno: tu ambiente trabaja para ti o contra ti',
        titleEn:
          'Environment Design: Your Space Works For or Against You',
        path: 'module-1/lesson-05.html'
      },
      {
        id: 'mod1-l06',
        numEs: 'Lección 06',
        numEn: 'Lesson 06',
        titleEs: 'Higiene de atención: la guerra por tu mente',
        titleEn: 'Attention Hygiene: The War for Your Mind',
        path: 'module-1/lesson-06.html'
      },
      {
        id: 'mod1-l07',
        numEs: 'Lección 07',
        numEn: 'Lesson 07',
        titleEs: 'Fatiga de decisiones: diseña para decidir menos',
        titleEn: 'Decision Fatigue: Design to Decide Less',
        path: 'module-1/lesson-07.html'
      },
      {
        id: 'mod1-l08',
        numEs: 'Lección 08',
        numEn: 'Lesson 08',
        titleEs: 'Tu primera semana con estructura real',
        titleEn: 'Your First Week With Real Structure',
        path: 'module-1/lesson-08.html'
      },
      {
        id: 'mod1-l09',
        numEs: 'Laboratorio 01',
        numEn: 'Lab 01',
        titleEs: 'Laboratorio de Integración: Módulo 1',
        titleEn: 'Integration Lab: Module 1',
        path: 'module-1/lesson-09.html'
      }
    ]
  },
  {
    id: 'module-2',
    numEs: 'Módulo 02',
    numEn: 'Module 02',
    titleEs: 'Disciplina Real',
    titleEn: 'Real Discipline',
    descEs:
      'Deja de negociar contigo. Aprende a ejecutar sin depender de emociones.',
    descEn:
      'Stop negotiating with yourself. Learn to execute without depending on your emotions.',
    path: 'module-2/',
    lessons: [
      {
        id: 'mod2-l01',
        numEs: 'Lección 01',
        numEn: 'Lesson 01',
        titleEs: 'El impuesto de la negociación',
        titleEn: 'The Negotiation Tax',
        path: 'module-2/lesson-01.html'
      },
      {
        id: 'mod2-l02',
        numEs: 'Lección 02',
        numEn: 'Lesson 02',
        titleEs: 'El protocolo de cero negociación',
        titleEn: 'The Zero-Negotiation Protocol',
        path: 'module-2/lesson-02.html'
      },
      {
        id: 'mod2-l03',
        numEs: 'Lección 03',
        numEn: 'Lesson 03',
        titleEs: 'Diseño de hábitos: el bucle que te define',
        titleEn: 'Habit Design: The Loop That Defines You',
        path: 'module-2/lesson-03.html'
      },
      {
        id: 'mod2-friction',
        numEs: 'Lección 03b',
        numEn: 'Lesson 03b',
        titleEs:
          'Ingeniería de fricción: haz lo correcto más fácil',
        titleEn: 'Friction Engineering: Make the Right Thing Easier',
        path: 'module-2/lesson-04b.html'
      },
      {
        id: 'mod2-l04',
        numEs: 'Lección 04',
        numEn: 'Lesson 04',
        titleEs: 'Acción mínima viable: el sistema a prueba de fallos',
        titleEn: 'Minimum Viable Action: The Failsafe System',
        path: 'module-2/lesson-04.html'
      },
      {
        id: 'mod2-l05',
        numEs: 'Lección 05',
        numEn: 'Lesson 05',
        titleEs: 'El calendario como contrato',
        titleEn: 'Your Calendar as a Contract',
        path: 'module-2/lesson-05.html'
      },
      {
        id: 'mod2-l06',
        numEs: 'Lección 06',
        numEn: 'Lesson 06',
        titleEs: 'Seguimiento sin espiral de vergüenza',
        titleEn: 'Tracking Without the Shame Spiral',
        path: 'module-2/lesson-06.html'
      },
      {
        id: 'mod2-l07',
        numEs: 'Lección 07',
        numEn: 'Lesson 07',
        titleEs: 'Protocolo de recuperación de fallos',
        titleEn: 'Failure Recovery Protocol',
        path: 'module-2/lesson-07.html'
      },
      {
        id: 'mod2-l08',
        numEs: 'Lección 08',
        numEn: 'Lesson 08',
        titleEs:
          'Disciplina y el entorno social: proteger lo que construyes',
        titleEn:
          'Discipline and the Social Environment: Protecting What You Build',
        path: 'module-2/lesson-08.html'
      },
      {
        id: 'mod2-l09',
        numEs: 'Laboratorio 02',
        numEn: 'Lab 02',
        titleEs: 'Laboratorio de Integración: Módulo 2',
        titleEn: 'Integration Lab: Module 2',
        path: 'module-2/lesson-09.html'
      }
    ]
  },
  {
    id: 'module-3',
    numEs: 'Módulo 03',
    numEn: 'Module 03',
    titleEs: 'Identidad',
    titleEn: 'Identity',
    descEs:
      'Conviértete en la persona que naturalmente vive los sistemas que has construido.',
    descEn:
      'Become the person who naturally lives the systems you have built.',
    path: 'module-3/',
    lessons: [
      {
        id: 'mod3-l01',
        numEs: 'Lección 01',
        numEn: 'Lesson 01',
        titleEs:
          'Identidad como arquitectura: cómo te construiste y cómo reconstruirte',
        titleEn:
          'Identity as architecture: how you were built and how to rebuild',
        path: 'module-3/lesson-01.html'
      },
      {
        id: 'mod3-l02',
        numEs: 'Lección 02',
        numEn: 'Lesson 02',
        titleEs:
          'El lenguaje interno: cómo las palabras sobre ti te construyen o te destruyen',
        titleEn:
          'Internal language: how words about yourself build or destroy you',
        path: 'module-3/lesson-02.html'
      },
      {
        id: 'mod3-l03',
        numEs: 'Lección 03',
        numEn: 'Lesson 03',
        titleEs:
          '"Actuar como si": la técnica real y sus límites psicológicos',
        titleEn:
          '"Act as if": the real technique and its psychological limits',
        path: 'module-3/lesson-03.html'
      },
      {
        id: 'mod3-l04',
        numEs: 'Lección 04',
        numEn: 'Lesson 04',
        titleEs:
          'Construir evidencia de identidad: votos y consistencia de bajo umbral',
        titleEn:
          'Building identity evidence: votes and low-threshold consistency',
        path: 'module-3/lesson-04.html'
      },
      {
        id: 'mod3-l05',
        numEs: 'Lección 05',
        numEn: 'Lesson 05',
        titleEs:
          'El duelo de quien eras: por qué el cambio de identidad duele',
        titleEn:
          'Grieving who you were: why identity change hurts',
        path: 'module-3/lesson-05.html'
      },
      {
        id: 'mod3-l06',
        numEs: 'Laboratorio 03',
        numEn: 'Lab 03',
        titleEs:
          'Laboratorio de integración: tu perfil de identidad completo',
        titleEn: 'Integration Lab: your complete identity profile',
        path: 'module-3/lesson-06.html'
      }
    ]
  },
  {
    id: 'module-4',
    numEs: 'Módulo 04',
    numEn: 'Module 04',
    titleEs: 'Enfoque Profundo',
    titleEn: 'Deep Focus',
    descEs:
      'Domina la habilidad que separa el trabajo ordinario del extraordinario.',
    descEn:
      'Master the skill that separates ordinary work from extraordinary.',
    path: 'module-4/',
    lessons: [
      {
        id: 'mod4-l01',
        numEs: 'Lección 01',
        numEn: 'Lesson 01',
        titleEs:
          'La neurociencia del enfoque: tu atención es finita y recuperable',
        titleEn:
          'The neuroscience of focus: your attention is finite and recoverable',
        path: 'module-4/lesson-01.html'
      },
      {
        id: 'mod4-l02',
        numEs: 'Lección 02',
        numEn: 'Lesson 02',
        titleEs:
          'El estado de flujo: condiciones, catalizadores e inhibidores',
        titleEn:
          'The flow state: conditions, catalysts and inhibitors',
        path: 'module-4/lesson-02.html'
      },
      {
        id: 'mod4-l03',
        numEs: 'Lección 03',
        numEn: 'Lesson 03',
        titleEs: 'Diseño de la sesión de trabajo profundo',
        titleEn: 'Designing the deep work session',
        path: 'module-4/lesson-03.html'
      },
      {
        id: 'mod4-l04',
        numEs: 'Lección 04',
        numEn: 'Lesson 04',
        titleEs:
          'Gestión de la distracción digital: neurociencia vs. fuerza de voluntad',
        titleEn:
          'Digital distraction management: neuroscience vs. willpower',
        path: 'module-4/lesson-04.html'
      },
      {
        id: 'mod4-l05',
        numEs: 'Lección 05',
        numEn: 'Lesson 05',
        titleEs:
          'Recuperación de la atención: el descanso como parte del sistema',
        titleEn:
          'Attention recovery: rest as part of the performance system',
        path: 'module-4/lesson-05.html'
      },
      {
        id: 'mod4-l06',
        numEs: 'Laboratorio 04',
        numEn: 'Lab 04',
        titleEs:
          'Laboratorio de integración: tu protocolo de trabajo profundo',
        titleEn:
          'Integration Lab: your deep work protocol',
        path: 'module-4/lesson-06.html'
      }
    ]
  },
  {
    id: 'module-5',
    numEs: 'Módulo 05',
    numEn: 'Module 05',
    titleEs: 'Integración y Sostenibilidad',
    titleEn: 'Integration & Sustainability',
    descEs:
      'Sostén lo que construiste. Diseña para el largo plazo, no para el sprint.',
    descEn:
      'Sustain what you built. Design for the long term, not the sprint.',
    path: 'module-5/',
    lessons: [
      {
        id: 'mod5-l01',
        numEs: 'Lección 01',
        numEn: 'Lesson 01',
        titleEs:
          'Sostener sin momentum: cómo los sistemas sobreviven a los valles',
        titleEn:
          'Sustaining without momentum: how systems survive valleys',
        path: 'module-5/lesson-01.html'
      },
      {
        id: 'mod5-l02',
        numEs: 'Lección 02',
        numEn: 'Lesson 02',
        titleEs:
          'Revisión semanal y mensual: el sistema que evita el colapso lento',
        titleEn:
          'Weekly and monthly review: the system that prevents slow collapse',
        path: 'module-5/lesson-02.html'
      },
      {
        id: 'mod5-l03',
        numEs: 'Lección 03',
        numEn: 'Lesson 03',
        titleEs:
          'Crecimiento sostenible: explotar vs. florecer en 5 años',
        titleEn:
          'Sustainable growth: exploding vs. flourishing in 5 years',
        path: 'module-5/lesson-03.html'
      },
      {
        id: 'mod5-l04',
        numEs: 'Lab Final',
        numEn: 'Final Lab',
        titleEs:
          'Laboratorio final: tu documento de sistema de vida completo',
        titleEn:
          'Final Lab: your complete life system document',
        path: 'module-5/lesson-04.html'
      }
    ]
  }
];

export function totalLessonsInCurriculum(): number {
  return CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0);
}
