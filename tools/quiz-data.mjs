const Q = (c, qes, qen, opts) => ({
  c,
  q: { es: qes, en: qen },
  o: opts.map(([es, en]) => ({ es, en })),
});

export const LESSON_QUIZZES = {
  'module-1/lesson-01.html': [
    Q(1, 'Según la lección, ¿qué es más fiable que la motivación para sostener el cambio?', 'According to the lesson, what is more reliable than motivation for sustaining change?', [
      ['Más metas ambiciosas', 'Bigger goals'],
      ['Estructura y sistemas que no dependan del estado de ánimo', 'Structure and systems that do not depend on mood'],
      ['Esperar sentirse inspirado', 'Waiting to feel inspired'],
      ['Evitar todo lo difícil', 'Avoiding everything difficult'],
    ]),
    Q(2, 'La lección presenta operar “sin sistema” como:', 'The lesson frames operating “without a system” as:', [
      ['Un rasgo permanente de personalidad', 'A permanent personality trait'],
      ['Algo que no se puede cambiar', 'Something you cannot change'],
      ['Un problema de diseño que puedes corregir', 'A design problem you can fix'],
      ['Una ventaja en entornos creativos', 'An advantage in creative environments'],
    ]),
    Q(1, '¿Qué afirma la lección sobre depender de “tener ganas”?', 'What does the lesson say about depending on “feeling like it”?', [
      ['Es la forma más ética de trabajar', 'It is the most ethical way to work'],
      ['Es poco fiable para lo importante y repetible', 'It is unreliable for what matters and repeats'],
      ['Siempre aumenta con el tiempo', 'It always increases over time'],
      ['Reemplaza la necesidad de calendario', 'It replaces the need for a calendar'],
    ]),
  ],
  'module-1/lesson-02.html': [
    Q(1, 'El autosabotaje se entiende mejor como:', 'Self-sabotage is best understood as:', [
      ['Falta de inteligencia', 'Lack of intelligence'],
      ['Regulación emocional mal dirigida', 'Misdirected emotional regulation'],
      ['Pereza moral', 'Moral laziness'],
      ['Una elección consciente de fracasar', 'A conscious choice to fail'],
    ]),
    Q(1, 'Negociar contigo una y otra vez suele:', 'Negotiating with yourself again and again usually:', [
      ['Aumentar la claridad a largo plazo', 'Increase long-term clarity'],
      ['Protegerte del malestar a corto plazo', 'Protect you from short-term discomfort'],
      ['Eliminar la necesidad de hábitos', 'Eliminate the need for habits'],
      ['Hacer el cambio inevitable', 'Make change inevitable'],
    ]),
    Q(1, 'Interrumpir el sabotaje empieza por:', 'Interrupting sabotage starts with:', [
      ['Ignorar todas las emociones', 'Ignoring all emotions'],
      ['Ver el patrón e intervenir antes', 'Seeing the pattern and intervening earlier'],
      ['Subir la exigencia de golpe', 'Raising demands suddenly'],
      ['Evitar cualquier descanso', 'Avoiding any rest'],
    ]),
  ],
  'module-1/lesson-03.html': [
    Q(1, 'Las intenciones de implementación usan el formato:', 'Implementation intentions use the format:', [
      ['“Quiero ser mejor persona”', '“I want to be a better person”'],
      ['“Si [situación], entonces [acción específica]”', '“If [situation], then [specific action]”'],
      ['“Algún día haré ejercicio”', '“Someday I will exercise”'],
      ['“Seré más disciplinado”', '“I will be more disciplined”'],
    ]),
    Q(1, '¿Qué problema resuelve la especificidad del plan si-entonces?', 'What problem does if-then plan specificity solve?', [
      ['Hace el plan más largo de leer', 'It makes the plan longer to read'],
      ['Reduce la vaguedad que impide ejecutar', 'It reduces vagueness that blocks execution'],
      ['Elimina la necesidad de calendario', 'It removes the need for a calendar'],
      ['Garantiza resultados sin esfuerzo', 'It guarantees results without effort'],
    ]),
    Q(0, 'Pre-decidir la respuesta al disparador ayuda porque:', 'Pre-deciding the response to the cue helps because:', [
      ['Evita el punto de decisión donde entra el sabotaje', 'It removes the decision point where sabotage enters'],
      ['Hace que no necesites sueño', 'It means you do not need sleep'],
      ['Reemplaza el seguimiento', 'It replaces tracking'],
      ['Solo funciona para deporte', 'It only works for sports'],
    ]),
  ],
  'module-1/lesson-04.html': [
    Q(1, 'Las trampas de pensamiento alimentan el ciclo de sabotaje porque:', 'Thought traps fuel the sabotage cycle because:', [
      ['Siempre son 100% ciertas', 'They are always 100% true'],
      ['Distorsionan la lectura de la realidad y justifican la evitación', 'They distort reality and justify avoidance'],
      ['Solo ocurren a otras personas', 'They only happen to other people'],
      ['Son imposibles de detectar', 'They are impossible to notice'],
    ]),
    Q(1, 'Nombrar la trampa suele servir para:', 'Naming the trap usually helps you:', [
      ['Evitar toda responsabilidad', 'Avoid all responsibility'],
      ['Crear distancia y poder elegir otra respuesta', 'Create distance and choose another response'],
      ['Eliminar emociones por completo', 'Eliminate emotions completely'],
      ['Demostrar que tienes razón', 'Prove you are right'],
    ]),
    Q(1, '¿Qué relación tiene la reestructuración cognitiva con el sabotaje?', 'How does cognitive restructuring relate to sabotage?', [
      ['No tiene relación', 'It is unrelated'],
      ['Cuestiona pensamientos automáticos y prueba alternativas', 'It questions automatic thoughts and tests alternatives'],
      ['Solo sirve para memorizar', 'It is only for memorization'],
      ['Reemplaza la acción externa', 'It replaces external action'],
    ]),
  ],
  'module-1/lesson-05.html': [
    Q(1, 'El diseño del entorno apunta a:', 'Environment design aims to:', [
      ['Depender solo de la fuerza de voluntad', 'Rely on willpower alone'],
      ['Hacer lo correcto más fácil y lo incorrecto más costoso', 'Make the right thing easier and the wrong thing costlier'],
      ['Tener el espacio perfecto antes de empezar', 'Have a perfect space before starting'],
      ['Evitar todo estímulo sensorial', 'Avoid all sensory input'],
    ]),
    Q(1, 'La “arquitectura conductual” sugiere cambiar primero:', 'Behavioral architecture suggests changing first:', [
      ['Tu personalidad', 'Your personality'],
      ['El entorno antes que pelear solo con la voluntad', 'The environment before only fighting willpower'],
      ['La opinión de los demás', 'Other people’s opinions'],
      ['Tu nombre', 'Your name'],
    ]),
    Q(0, 'Reducir fricción hacia un hábito deseado implica:', 'Reducing friction toward a desired habit means:', [
      ['Hacer el primer paso ridículamente fácil', 'Making the first step ridiculously easy'],
      ['Subir el listón hasta fallar', 'Raising the bar until you fail'],
      ['Eliminar el descanso', 'Removing rest'],
      ['Esperar motivación', 'Waiting for motivation'],
    ]),
  ],
  'module-1/lesson-06.html': [
    Q(1, 'La higiene de atención trata tu atención como:', 'Attention hygiene treats your attention as:', [
      ['Ilimitada y gratuita', 'Unlimited and free'],
      ['Un recurso finito que debe protegerse', 'A finite resource to protect'],
      ['Algo secundario al trabajo', 'Secondary to work'],
      ['Solo relevante para creativos', 'Only relevant for creatives'],
    ]),
    Q(1, '¿Qué papel juegan los disparadores digitales en el sabotaje?', 'What role do digital triggers play in sabotage?', [
      ['Ninguno', 'None'],
      ['Secuestran micro-decisiones y fragmentan el foco', 'They hijack micro-decisions and fragment focus'],
      ['Siempre mejoran el estado de ánimo', 'They always improve mood'],
      ['Solo afectan a adolescentes', 'They only affect teens'],
    ]),
    Q(1, 'Una barrera útil frente a distracciones es:', 'A useful barrier against distractions is:', [
      ['Abrir todas las apps “solo un segundo”', 'Opening all apps “just a second”'],
      ['Diseñar defaults y límites antes del impulso', 'Designing defaults and limits before the urge'],
      ['Multitarea constante', 'Constant multitasking'],
      ['Ignorar el sueño', 'Ignoring sleep'],
    ]),
  ],
  'module-1/lesson-07.html': [
    Q(0, 'La fatiga de decisiones explica que:', 'Decision fatigue explains that:', [
      ['Más decisiones pequeñas pueden erosionar la calidad de decisiones posteriores', 'More small decisions can erode later decision quality'],
      ['Las decisiones no importan', 'Decisions do not matter'],
      ['Solo afecta a CEOs', 'It only affects CEOs'],
      ['Se cura con más cafeína siempre', 'It is always cured with more caffeine'],
    ]),
    Q(0, 'Diseñar para “decidir menos” incluye:', 'Designing to “decide less” includes:', [
      ['Crear rutinas, defaults y listas cortas', 'Creating routines, defaults, and short lists'],
      ['Maximizar opciones en cada momento', 'Maximizing options at every moment'],
      ['Evitar cualquier plan', 'Avoiding any plan'],
      ['Cambiar de opinión cada hora', 'Changing your mind every hour'],
    ]),
    Q(1, 'Empaquetar decisiones significa:', 'Batching decisions means:', [
      ['Tomar muchas decisiones en el peor momento', 'Making many decisions at the worst time'],
      ['Agrupar elecciones similares en un bloque dedicado', 'Grouping similar choices in a dedicated block'],
      ['Delegar todo a otros siempre', 'Delegating everything always'],
      ['Eliminar la comida', 'Eliminating meals'],
    ]),
  ],
  'module-1/lesson-08.html': [
    Q(1, 'Tu primera semana con estructura real prioriza:', 'Your first week with real structure prioritizes:', [
      ['Perfección en todo ámbito', 'Perfection in every domain'],
      ['Arquitectura mínima viable y repetible', 'Minimum viable, repeatable architecture'],
      ['Cero sueño para demostrar compromiso', 'Zero sleep to show commitment'],
      ['Copiar el calendario de un influencer', 'Copying an influencer’s calendar'],
    ]),
    Q(0, '¿Por qué importa que la semana sea “real” y no ideal?', 'Why does a “real” week matter versus an ideal one?', [
      ['Porque lo ideal siempre falla en la vida real', 'Because the ideal usually fails in real life'],
      ['Porque lo ideal es más fácil', 'Because the ideal is easier'],
      ['Porque no hay que medir nada', 'Because you should not measure anything'],
      ['Porque el descanso no cuenta', 'Because rest does not count'],
    ]),
    Q(1, 'Integrar lo aprendido en la semana implica:', 'Integrating what you learned into the week means:', [
      ['Olvidar lo anterior', 'Forgetting the earlier material'],
      ['Convertir principios en anclas concretas en el calendario', 'Turning principles into concrete calendar anchors'],
      ['Solo leer más teoría', 'Only reading more theory'],
      ['Evitar el laboratorio', 'Avoiding the lab'],
    ]),
  ],
  'module-1/lesson-09.html': [
    Q(1, 'El laboratorio de integración del Módulo 1 busca:', 'The Module 1 integration lab aims to:', [
      ['Introducir temas del Módulo 5', 'Introduce Module 5 topics'],
      ['Sintetizar y consolidar antes del Módulo 2', 'Synthesize and consolidate before Module 2'],
      ['Eliminar ejercicios previos', 'Remove prior exercises'],
      ['Sustituir el seguimiento semanal', 'Replace weekly tracking'],
    ]),
    Q(1, '¿Qué señal de “listo para el siguiente módulo” suele buscarse?', 'What “ready for the next module” signal is usually sought?', [
      ['Cero errores para siempre', 'Zero errors forever'],
      ['Tener piezas conectadas: estructura, entorno y planes si-entonces', 'Having connected pieces: structure, environment, if-then plans'],
      ['Abandonar el calendario', 'Abandoning the calendar'],
      ['Evitar revisar el progreso', 'Avoiding progress review'],
    ]),
    Q(1, 'La integración no es:', 'Integration is not:', [
      ['Un repaso breve y coherente de lo vivido en práctica', 'A brief, coherent review of what you practiced'],
      ['Solo teoría sin aplicación', 'Theory only without application'],
      ['Un chequeo de consistencia del sistema', 'A consistency check of the system'],
      ['Preparación mental para más disciplina', 'Mental prep for more discipline'],
    ]),
  ],
  'module-2/lesson-01.html': [
    Q(1, 'El “impuesto de la negociación” describe:', 'The “negotiation tax” describes:', [
      ['Que negociar siempre acelera el trabajo', 'That negotiating always speeds work'],
      ['El coste cognitivo y temporal de re-decidir lo ya decidido', 'The cognitive and time cost of re-deciding what was already decided'],
      ['Que no hay que tomar decisiones', 'That you should not make decisions'],
      ['Solo aplica a equipos grandes', 'It only applies to large teams'],
    ]),
    Q(1, 'La disciplina real prioriza:', 'Real discipline prioritizes:', [
      ['Esperar el impulso correcto', 'Waiting for the right urge'],
      ['Ejecución sin reabrir la negociación en el momento crítico', 'Execution without reopening negotiation at the critical moment'],
      ['Cambiar de meta cada día', 'Changing the goal every day'],
      ['Evitar todo compromiso público', 'Avoiding all public commitment'],
    ]),
    Q(1, 'Cada micro-negociación suele:', 'Each micro-negotiation usually:', [
      ['Fortalecer la identidad', 'Strengthen identity'],
      ['Erosionar la confianza en tus propios acuerdos contigo', 'Erode trust in your agreements with yourself'],
      ['Eliminar la fatiga', 'Remove fatigue'],
      ['Sustituir al calendario', 'Replace the calendar'],
    ]),
  ],
  'module-2/lesson-02.html': [
    Q(1, 'El protocolo de cero negociación busca:', 'The zero-negotiation protocol aims to:', [
      ['Aumentar debates internos', 'Increase internal debates'],
      ['Cerrar la puerta al “solo esta vez” en el disparador acordado', 'Close the door to “just this once” at the agreed trigger'],
      ['Evitar descansos', 'Avoid rest'],
      ['Eliminar emociones', 'Remove emotions'],
    ]),
    Q(1, 'Un disparador claro en el protocolo sirve para:', 'A clear trigger in the protocol helps:', [
      ['Confundirte más', 'Confuse you more'],
      ['Reducir la ambigüedad sobre cuándo actuar', 'Reduce ambiguity about when to act'],
      ['Postergar decisiones para siempre', 'Postpone decisions forever'],
      ['Sustituir el seguimiento', 'Replace tracking'],
    ]),
    Q(1, 'La negociación reaparece sobre todo cuando:', 'Negotiation reappears especially when:', [
      ['Hay malestar y buscas alivio inmediato', 'There is discomfort and you seek immediate relief'],
      ['Estás descansado y con energía', 'You are rested and energized'],
      ['Ya completaste el hábito', 'You already completed the habit'],
      ['No hay presión externa', 'There is no external pressure'],
    ]),
  ],
  'module-2/lesson-03.html': [
    Q(1, 'El bucle del hábito (simplificado) incluye:', 'The habit loop (simplified) includes:', [
      ['Solo motivación', 'Motivation only'],
      ['Señal → rutina → recompensa (y ajuste consciente)', 'Cue → routine → reward (and conscious tuning)'],
      ['Solo fuerza de voluntad', 'Willpower only'],
      ['Evitar todo patrón', 'Avoiding all patterns'],
    ]),
    Q(1, 'Diseñar hábitos implica observar:', 'Designing habits involves observing:', [
      ['Solo el resultado final', 'Only the final outcome'],
      ['Qué señal inicia el bucle y qué recompensa cierra el circuito', 'What cue starts the loop and what reward closes the circuit'],
      ['Solo errores ajenos', 'Only others’ mistakes'],
      ['Ignorar el contexto', 'Ignoring context'],
    ]),
    Q(1, 'Hacer el hábito “demasiado grande” al inicio suele:', 'Making the habit “too big” at the start usually:', [
      ['Aumentar la sostenibilidad', 'Increase sustainability'],
      ['Romper la consistencia por sobrecarga', 'Break consistency through overload'],
      ['Eliminar la necesidad de entorno', 'Remove the need for environment'],
      ['Garantizar flow inmediato', 'Guarantee immediate flow'],
    ]),
  ],
  'module-2/lesson-04.html': [
    Q(1, 'Ingeniería de fricción apunta a:', 'Friction engineering aims to:', [
      ['Hacer lo difícil aún más difícil siempre', 'Always make the hard thing harder'],
      ['Subir coste de lo que sabes que te sabotea y bajar coste de lo correcto', 'Raise the cost of what sabotages you and lower the cost of the right thing'],
      ['Eliminar todo obstáculo aunque sea malo', 'Remove every obstacle even if harmful'],
      ['Evitar medir resultados', 'Avoid measuring results'],
    ]),
    Q(1, 'Un ejemplo de reducir fricción sería:', 'An example of reducing friction would be:', [
      ['Esconder lo que necesitas hasta “merecerlo”', 'Hiding what you need until you “deserve” it'],
      ['Preparar el entorno la noche anterior', 'Preparing the environment the night before'],
      ['Añadir 10 pasos extra al inicio', 'Adding 10 extra steps at the start'],
      ['Depender de recordar en el último minuto', 'Depending on last-minute memory'],
    ]),
    Q(1, 'La fricción mal diseñada contra el hábito deseado:', 'Poorly designed friction against the desired habit:', [
      ['Siempre ayuda', 'Always helps'],
      ['Te empuja al camino por defecto del sabotaje', 'Pushes you toward sabotage’s default path'],
      ['No importa si eres disciplinado', 'Does not matter if you are disciplined'],
      ['Solo afecta a principiantes', 'Only affects beginners'],
    ]),
  ],
  'module-2/lesson-05.html': [
    Q(1, 'La acción mínima viable protege:', 'Minimum viable action protects:', [
      ['Solo días perfectos', 'Only perfect days'],
      ['La consistencia en días bajos de energía o ánimo', 'Consistency on low-energy or low-mood days'],
      ['Eliminar el descanso', 'Removing rest'],
      ['Evitar todo seguimiento', 'Avoiding all tracking'],
    ]),
    Q(1, 'El “piso” del sistema se refiere a:', 'The system “floor” refers to:', [
      ['El máximo posible cada día', 'The maximum possible every day'],
      ['Lo mínimo no negociable que preserva la cadena', 'The non-negotiable minimum that preserves the chain'],
      ['Ignorar calidad', 'Ignoring quality'],
      ['Copiar a otros sin adaptar', 'Copying others without adapting'],
    ]),
    Q(1, 'Si el mínimo es cero en la práctica, el sistema:', 'If the minimum is effectively zero, the system:', [
      ['Es más honesto', 'Is more honest'],
      ['Colapsa a “días de cero” repetidos', 'Collapses into repeated “zero days”'],
      ['Siempre mejora solo', 'Always improves on its own'],
      ['No necesita revisión', 'Needs no review'],
    ]),
  ],
  'module-2/lesson-06.html': [
    Q(1, 'Tratar el calendario como contrato implica:', 'Treating the calendar as a contract implies:', [
      ['Llenarlo sin priorizar', 'Filling it without prioritizing'],
      ['Compromisos explícitos con bloques que protegen lo esencial', 'Explicit commitments with blocks that protect essentials'],
      ['Eliminar tiempo libre', 'Removing free time'],
      ['Evitar ajustes', 'Avoiding adjustments'],
    ]),
    Q(1, 'El time-blocking avanzado busca:', 'Advanced time-blocking seeks to:', [
      ['Solo apariencia de ocupación', 'Only the appearance of busyness'],
      ['Alinear tiempo con no-negociables antes que reactivo', 'Align time with non-negotiables before the reactive'],
      ['Responder todo al instante', 'Replying to everything instantly'],
      ['Eliminar deep work', 'Eliminating deep work'],
    ]),
    Q(1, 'Romper el contrato sin revisión consciente suele:', 'Breaking the contract without conscious review usually:', [
      ['Enseñar flexibilidad útil', 'Teach useful flexibility'],
      ['Corroer la credibilidad interna con tu palabra', 'Erode internal credibility with your word'],
      ['Mejorar el descanso siempre', 'Always improve rest'],
      ['No tener coste', 'Have no cost'],
    ]),
  ],
  'module-2/lesson-07.html': [
    Q(1, 'Seguimiento sin espiral de vergüenza significa:', 'Tracking without a shame spiral means:', [
      ['Castigarte por cada fallo', 'Punishing yourself for every miss'],
      ['Usar datos para ajustar el sistema, no para atacarte', 'Use data to tune the system, not to attack yourself'],
      ['Ocultar métricas', 'Hiding metrics'],
      ['Evitar cualquier registro', 'Avoiding any log'],
    ]),
    Q(1, 'Un buen marco para el seguimiento es:', 'A good framing for tracking is:', [
      ['Solo juicio moral diario', 'Only daily moral judgment'],
      ['Curiosidad + experimentación', 'Curiosity + experimentation'],
      ['Compararte solo con influencers', 'Comparing only to influencers'],
      ['Eliminar metas', 'Removing goals'],
    ]),
    Q(1, 'La vergüenza como motor principal tiende a:', 'Shame as the main driver tends to:', [
      ['Sostener hábitos años', 'Sustain habits for years'],
      ['Agotarse y generar evitación del propio sistema', 'Burn out and create avoidance of your own system'],
      ['Mejorar la calidad del sueño', 'Improve sleep quality'],
      ['Hacer el seguimiento más preciso', 'Make tracking more accurate'],
    ]),
  ],
  'module-2/lesson-08.html': [
    Q(1, 'El protocolo de recuperación prioriza:', 'The recovery protocol prioritizes:', [
      ['Demostrar perfección', 'Proving perfection'],
      ['Volver al sistema rápido con reglas claras post-fallo', 'Returning to the system quickly with clear post-failure rules'],
      ['Eliminar el hábito tras un fallo', 'Removing the habit after one miss'],
      ['Ignorar causas', 'Ignoring causes'],
    ]),
    Q(1, 'Un fallo tratado como dato permite:', 'Treating a miss as data allows:', [
      ['Esconder el problema', 'Hiding the problem'],
      ['Ajustar fricción, mínimos o entorno', 'Adjust friction, minimums, or environment'],
      ['Subir la exigencia sin análisis', 'Raising demands without analysis'],
      ['Evitar responsabilidad', 'Avoiding responsibility'],
    ]),
    Q(1, 'La recuperación no es lo mismo que:', 'Recovery is not the same as:', [
      ['Racionalizar otro “solo hoy” sin límite', 'Rationalizing another “just today” with no limit'],
      ['Reanudar en el siguiente ancla acordada', 'Resuming at the next agreed anchor'],
      ['Revisar qué falló en el sistema', 'Reviewing what failed in the system'],
      ['Bajar el mínimo temporalmente con intención', 'Temporarily lowering the minimum on purpose'],
    ]),
  ],
  'module-2/lesson-09.html': [
    Q(1, 'El laboratorio del Módulo 2 integra sobre todo:', 'The Module 2 lab mainly integrates:', [
      ['Teoría del Módulo 4', 'Module 4 theory'],
      ['Protocolo, hábitos, fricción, calendario y recuperación', 'Protocol, habits, friction, calendar, and recovery'],
      ['Solo motivación', 'Motivation only'],
      ['Eliminar seguimiento', 'Removing tracking'],
    ]),
    Q(1, 'Antes del Módulo 3, lo esperable es tener:', 'Before Module 3, you should have:', [
      ['Cero estructura', 'Zero structure'],
      ['Una arquitectura de ejecución que ya corriste en la vida real', 'An execution architecture you already ran in real life'],
      ['Solo listas de deseos', 'Wishlists only'],
      ['Ningún mínimo', 'No minimums'],
    ]),
    Q(1, 'La integración del módulo sirve para:', 'The module integration serves to:', [
      ['Saltarse la práctica', 'Skipping practice'],
      ['Ver si las piezas encajan en un sistema coherente', 'See if pieces fit a coherent system'],
      ['Evitar revisión semanal', 'Avoid weekly review'],
      ['Copiar sin adaptar', 'Copy without adapting'],
    ]),
  ],
  'module-3/lesson-01.html': [
    Q(1, 'La identidad en este módulo se trata como:', 'Identity in this module is treated as:', [
      ['Fija e inmutable siempre', 'Fixed and always immutable'],
      ['Arquitectura construida con evidencia y práctica repetida', 'Architecture built with evidence and repeated practice'],
      ['Solo etiquetas en redes', 'Only social labels'],
      ['Algo que no afecta hábitos', 'Something that does not affect habits'],
    ]),
    Q(1, '“Cómo te construiste” apunta a:', '“How you were built” points to:', [
      ['Ignorar tu historia', 'Ignoring your history'],
      ['Ver influencias acumuladas (mensajes, experiencias, refuerzos)', 'Seeing accumulated influences (messages, experiences, reinforcements)'],
      ['Culpar siempre a otros', 'Always blaming others'],
      ['Evitar cualquier cambio', 'Avoiding any change'],
    ]),
    Q(1, 'Reconstruir identidad implica:', 'Rebuilding identity implies:', [
      ['Borrar memoria', 'Erasing memory'],
      ['Nuevos votos de evidencia coherentes con la dirección elegida', 'New evidence votes aligned with the chosen direction'],
      ['Solo afirmaciones vacías', 'Empty affirmations only'],
      ['Evitar acción', 'Avoiding action'],
    ]),
  ],
  'module-3/lesson-02.html': [
    Q(1, 'El lenguaje interno influye porque:', 'Internal language matters because:', [
      ['No tiene efecto en conducta', 'It has no effect on behavior'],
      ['Guía qué comportamientos “encajan” con tu autodescripción', 'It guides which behaviors “fit” your self-description'],
      ['Solo afecta a escritores', 'It only affects writers'],
      ['Elimina emociones', 'It removes emotions'],
    ]),
    Q(1, 'Cambiar frases absolutistas (“siempre/nunca”) ayuda a:', 'Shifting absolutist language (“always/never”) helps you:', [
      ['Evitar responsabilidad', 'Avoid responsibility'],
      ['Aumentar precisión y flexibilidad útil', 'Increase precision and useful flexibility'],
      ['Eliminar estándares', 'Remove standards'],
      ['Justificar abandono', 'Justify quitting'],
    ]),
    Q(1, 'Una narrativa rígida de “quién eres” puede:', 'A rigid story of “who you are” can:', [
      ['Facilitar cualquier cambio', 'Make any change easy'],
      ['Limitar comportamientos “incongruentes” con esa historia', 'Limit behaviors “incongruent” with that story'],
      ['Mejorar el sueño siempre', 'Always improve sleep'],
      ['Eliminar autocriticismo', 'Remove self-criticism'],
    ]),
  ],
  'module-3/lesson-03.html': [
    Q(1, '“Actuar como si” funciona mejor cuando:', '“Act as if” works best when:', [
      ['Niegas emociones', 'You deny emotions'],
      ['Va acompañado de acciones pequeñas creíbles y apoyo emocional', 'It pairs with small believable actions and emotional support'],
      ['Es solo teatro sin práctica', 'It is theater without practice'],
      ['Evitas feedback', 'You avoid feedback'],
    ]),
    Q(1, 'Un límite psicológico real es:', 'A real psychological limit is:', [
      ['Que identidad cambia sin coste', 'That identity change has no cost'],
      ['Que puede haber duelo, fatiga o resistencia legítima', 'There can be grief, fatigue, or legitimate resistance'],
      ['Que no existe', 'That it does not exist'],
      ['Que solo importa la motivación', 'That only motivation matters'],
    ]),
    Q(1, 'Usar “como si” como máscara tóxica sería:', 'Using “as if” as a toxic mask would be:', [
      ['Pequeños votos de evidencia', 'Small evidence votes'],
      ['Forzar una persona falsa sin alineación ni límites', 'Forcing a false persona without alignment or boundaries'],
      ['Pedir apoyo', 'Asking for support'],
      ['Ajustar el mínimo', 'Adjusting the minimum'],
    ]),
  ],
  'module-3/lesson-04.html': [
    Q(1, 'Evidencia de identidad se construye con:', 'Identity evidence is built with:', [
      ['Solo intenciones', 'Intentions only'],
      ['Votos repetidos de acción a bajo umbral', 'Repeated low-threshold action votes'],
      ['Comparaciones en redes', 'Social comparisons'],
      ['Evitar seguimiento', 'Avoiding tracking'],
    ]),
    Q(1, 'Consistencia de bajo umbral prioriza:', 'Low-threshold consistency prioritizes:', [
      ['Picos esporádicos enormes', 'Rare huge spikes'],
      ['Repetibilidad sobre brillo', 'Repeatability over brilliance'],
      ['Perfección diaria', 'Daily perfection'],
      ['Cero descanso', 'Zero rest'],
    ]),
    Q(1, 'Sin evidencia acumulada, la nueva identidad:', 'Without accumulated evidence, the new identity:', [
      ['Se sostiene igual', 'Holds just the same'],
      ['Sigue sintiéndose “falsa” o frágil', 'Still feels “fake” or fragile'],
      ['No necesita práctica', 'Needs no practice'],
      ['Es automática', 'Is automatic'],
    ]),
  ],
  'module-3/lesson-05.html': [
    Q(1, 'El duelo de quien eras aparece porque:', 'Grieving who you were shows up because:', [
      ['El cambio no tiene coste emocional', 'Change has no emotional cost'],
      ['Dejas roles/narrativas que daban pertenencia o seguridad', 'You leave roles/narratives that gave belonging or safety'],
      ['Solo pasa si fallas', 'It only happens if you fail'],
      ['Es señal de debilidad', 'It is a sign of weakness'],
    ]),
    Q(1, 'Integrar el duelo sin abandonar el cambio implica:', 'Integrating grief without abandoning change means:', [
      ['Ignorar la pérdida', 'Ignoring the loss'],
      ['Honrar lo que funcionó y elegir el siguiente capítulo', 'Honor what worked and choose the next chapter'],
      ['Volver siempre al pasado', 'Always returning to the past'],
      ['Eliminar límites', 'Removing boundaries'],
    ]),
    Q(1, 'Confundir duelo con “no es para mí” puede:', 'Confusing grief with “not for me” can:', [
      ['Ayudar a decidir bien', 'Help you decide well'],
      ['Hacerte salir antes de completar el arco de transición', 'Make you exit before completing the transition arc'],
      ['Mejorar la paciencia', 'Improve patience'],
      ['Eliminar resistencia', 'Remove resistance'],
    ]),
  ],
  'module-3/lesson-06.html': [
    Q(1, 'El laboratorio de identidad busca:', 'The identity lab aims to:', [
      ['Evitar síntesis', 'Avoid synthesis'],
      ['Unir lenguaje, evidencia, límites y dirección en un perfil vivo', 'Unite language, evidence, limits, and direction in a living profile'],
      ['Solo teoría', 'Theory only'],
      ['Copiar identidad ajena', 'Copying someone else’s identity'],
    ]),
    Q(1, 'Antes del Módulo 4, lo clave es:', 'Before Module 4, the key is:', [
      ['Ignorar enfoque', 'Ignoring focus'],
      ['Tener identidad en movimiento alineada con sistemas ya construidos', 'Having moving identity aligned with systems you built'],
      ['Eliminar hábitos', 'Removing habits'],
      ['Evitar descanso', 'Avoiding rest'],
    ]),
    Q(1, 'Un perfil “en movimiento” significa:', 'A “moving” profile means:', [
      ['Congelado para siempre', 'Frozen forever'],
      ['Revisable con nuevas evidencias y contexto', 'Revisable with new evidence and context'],
      ['Solo para mostrar a otros', 'Only for showing others'],
      ['Sin acción', 'Without action'],
    ]),
  ],
  'module-4/lesson-01.html': [
    Q(1, 'La atención tratada como recurso finito implica:', 'Treating attention as finite implies:', [
      ['Gastarla sin cuidado', 'Spending it carelessly'],
      ['Recuperarla con descanso y límites, no solo con fuerza', 'Recovering it with rest and limits, not only force'],
      ['Ignorar el sueño', 'Ignoring sleep'],
      ['Multitarea infinita', 'Infinite multitasking'],
    ]),
    Q(1, 'La neurociencia del enfoque respalda:', 'The neuroscience of focus supports:', [
      ['Que puedes estar 100% ON todo el día', 'You can be 100% ON all day'],
      ['Ciclos de esfuerzo focal + recuperación real', 'Cycles of focused effort + real recovery'],
      ['Eliminar pausas', 'Removing breaks'],
      ['Solo cafeína', 'Caffeine only'],
    ]),
    Q(1, 'Confundir estimulación con enfoque profundo lleva a:', 'Confusing stimulation with deep focus leads to:', [
      ['Mejor calidad de trabajo', 'Better work quality'],
      ['Agotamiento y trabajo superficial', 'Burnout and shallow work'],
      ['Más creatividad siempre', 'More creativity always'],
      ['Menos decisiones', 'Fewer decisions'],
    ]),
  ],
  'module-4/lesson-02.html': [
    Q(1, 'El estado de flujo requiere típicamente:', 'Flow state typically requires:', [
      ['Cero desafío', 'Zero challenge'],
      ['Equilibrio entre desafío y habilidad + feedback claro', 'Balance of challenge and skill + clear feedback'],
      ['Solo presión extrema', 'Extreme pressure only'],
      ['Evitar metas', 'Avoiding goals'],
    ]),
    Q(0, 'Un inhibidor común del flujo es:', 'A common flow inhibitor is:', [
      ['Interrupciones constantes y multitarea', 'Constant interruptions and multitasking'],
      ['Un solo bloque de tiempo', 'A single time block'],
      ['Un objetivo claro', 'A clear objective'],
      ['Descanso planificado', 'Planned rest'],
    ]),
    Q(1, 'Los catalizadores incluyen:', 'Catalysts include:', [
      ['Ambigüedad total sobre el siguiente paso', 'Total ambiguity about the next step'],
      ['Ritual de inicio y entorno preparado', 'A start ritual and prepared environment'],
      ['Caos en el escritorio siempre', 'A messy desk always'],
      ['Cero límites digitales', 'No digital boundaries'],
    ]),
  ],
  'module-4/lesson-03.html': [
    Q(1, 'Diseñar una sesión profunda empieza por:', 'Designing a deep session starts with:', [
      ['Abrir todas las notificaciones', 'Opening all notifications'],
      ['Definir duración, objetivo medible y reglas anti-interrupción', 'Defining duration, measurable goal, and anti-interruption rules'],
      ['Trabajar hasta colapsar', 'Working until collapse'],
      ['Evitar preparación', 'Avoiding preparation'],
    ]),
    Q(1, 'Una sesión sin objetivo claro suele:', 'A session without a clear objective usually:', [
      ['Aumentar foco', 'Increase focus'],
      ['Derivar a correo y tareas reactivas', 'Drift into email and reactive tasks'],
      ['Garantizar flow', 'Guarantee flow'],
      ['Eliminar fatiga', 'Remove fatigue'],
    ]),
    Q(1, 'Cerrar la sesión con revisión breve ayuda a:', 'Closing with a brief review helps:', [
      ['Evitar aprendizaje', 'Avoid learning'],
      ['Consolidar avance y ajustar próxima sesión', 'Consolidate progress and tune the next session'],
      ['Eliminar métricas', 'Remove metrics'],
      ['Ignorar interrupciones', 'Ignore interruptions'],
    ]),
  ],
  'module-4/lesson-04.html': [
    Q(1, 'Gestión de distracción digital realista implica:', 'Realistic digital distraction management involves:', [
      ['Solo “más fuerza de voluntad”', 'Only “more willpower”'],
      ['Diseño de entorno digital + acuerdos con el cuerpo/energía', 'Digital environment design + agreements with your body/energy'],
      ['Eliminar internet', 'Removing the internet'],
      ['Nunca descansar', 'Never resting'],
    ]),
    Q(1, 'Notificaciones como default suelen:', 'Notifications as default usually:', [
      ['Proteger el foco', 'Protect focus'],
      ['Fragmentar atención y robar arranques de sesión', 'Fragment attention and steal session starts'],
      ['Eliminar ansiedad', 'Remove anxiety'],
      ['Mejorar memoria siempre', 'Always improve memory'],
    ]),
    Q(1, 'La neurociencia sugiere que pelear notificaciones sin diseño:', 'Neuroscience suggests fighting notifications without design:', [
      ['Es suficiente siempre', 'Is always enough'],
      ['Pierde contra sistemas optimizados para capturarte', 'Loses against systems built to capture you'],
      ['Elimina hábitos', 'Removes habits'],
      ['No aplica a adultos', 'Does not apply to adults'],
    ]),
  ],
  'module-4/lesson-05.html': [
    Q(1, 'Recuperación de atención es:', 'Attention recovery is:', [
      ['Pereza', 'Laziness'],
      ['Parte del sistema de rendimiento, no premio opcional', 'Part of the performance system, not an optional treat'],
      ['Solo entretenimiento', 'Only entertainment'],
      ['Incompatible con disciplina', 'Incompatible with discipline'],
    ]),
    Q(1, 'Sin recuperación, el trabajo profundo tiende a:', 'Without recovery, deep work tends to:', [
      ['Mejorar siempre', 'Always improve'],
      ['Degradarse en calidad y sostenibilidad', 'Degrade in quality and sustainability'],
      ['Eliminar errores', 'Remove mistakes'],
      ['Subir motivación', 'Raise motivation'],
    ]),
    Q(1, 'Señales de necesitar recuperación incluyen:', 'Signals you need recovery include:', [
      ['Hiperenfoque sostenible infinito', 'Infinitely sustainable hyperfocus'],
      ['Irritabilidad, niebla y micro-abandono de sesiones', 'Irritability, fog, and micro-abandoning sessions'],
      ['Cero fatiga', 'Zero fatigue'],
      ['Solo hambre', 'Only hunger'],
    ]),
  ],
  'module-4/lesson-06.html': [
    Q(1, 'El laboratorio de trabajo profundo integra:', 'The deep work lab integrates:', [
      ['Solo teoría de motivación', 'Motivation theory only'],
      ['Neurociencia, diseño de sesión, digital y recuperación', 'Neuroscience, session design, digital, and recovery'],
      ['Eliminar calendario', 'Removing the calendar'],
      ['Evitar métricas', 'Avoiding metrics'],
    ]),
    Q(1, 'Antes del Módulo 5 conviene tener:', 'Before Module 5 it helps to have:', [
      ['Cero protocolo de foco', 'Zero focus protocol'],
      ['Un protocolo de sesión que ya probaste en la vida real', 'A session protocol you tested in real life'],
      ['Solo deseos', 'Wishes only'],
      ['Multitarea como meta', 'Multitasking as a goal'],
    ]),
    Q(1, 'Un protocolo vivo es aquel que:', 'A living protocol is one that:', [
      ['Nunca cambia', 'Never changes'],
      ['Se ajusta con datos de tus sesiones reales', 'Adjusts with data from your real sessions'],
      ['Ignora el cansancio', 'Ignores fatigue'],
      ['Elimina revisiones', 'Removes reviews'],
    ]),
  ],
  'module-5/lesson-01.html': [
    Q(1, 'Sostener sistemas sin momentum constante implica:', 'Sustaining systems without constant momentum means:', [
      ['Depender de picos emocionales', 'Depending on emotional spikes'],
      ['Diseñar para valles: mínimos, recuperación y revisiones', 'Designing for valleys: minimums, recovery, and reviews'],
      ['Abandonar al primer bajón', 'Quitting at the first dip'],
      ['Ignorar señales de agotamiento', 'Ignoring burnout signals'],
    ]),
    Q(1, 'Los valles son:', 'Valleys are:', [
      ['Señal de que nunca funcionó', 'Proof it never worked'],
      ['Parte normal del ciclo; el sistema debe sobrevivirlos', 'A normal part of the cycle; the system must survive them'],
      ['Razón para duplicar exigencia siempre', 'Reason to always double demands'],
      ['Evitables por completo siempre', 'Always fully avoidable'],
    ]),
    Q(1, 'Un sistema frágil ante valles:', 'A system fragile to valleys:', [
      ['Tiene mínimos claros', 'Has clear minimums'],
      ['Colapsa a cero repetido sin protocolo de retorno', 'Collapses to repeated zeros with no return protocol'],
      ['Incluye descanso', 'Includes rest'],
      ['Se revisa semanalmente', 'Is reviewed weekly'],
    ]),
  ],
  'module-5/lesson-02.html': [
    Q(1, 'La revisión semanal/mensual busca:', 'Weekly/monthly review aims to:', [
      ['Castigarte por productividad', 'Punish you for productivity'],
      ['Detectar deriva lenta y re-alinear sistema antes del colapso', 'Detect slow drift and realign the system before collapse'],
      ['Eliminar planes', 'Remove plans'],
      ['Solo listar logros para redes', 'Only list wins for social media'],
    ]),
    Q(1, 'Sin revisión, los sistemas suelen:', 'Without review, systems tend to:', [
      ['Mantenerse perfectos solos', 'Stay perfect on their own'],
      ['Oxidarse en silencio hasta fallar en crisis', 'Rust quietly until they fail in crisis'],
      ['Eliminar la necesidad de ajustes', 'Remove the need for tweaks'],
      ['Mejorar automáticamente', 'Improve automatically'],
    ]),
    Q(1, 'Una buena revisión incluye:', 'A good review includes:', [
      ['Solo culpa', 'Blame only'],
      ['Datos + decisiones de ajuste concretas', 'Data + concrete adjustment decisions'],
      ['Ignorar emociones', 'Ignoring emotions'],
      ['Evitar calendario', 'Avoiding the calendar'],
    ]),
  ],
  'module-5/lesson-03.html': [
    Q(1, 'Crecimiento sostenible contrasta con:', 'Sustainable growth contrasts with:', [
      ['Adaptación gradual', 'Gradual adaptation'],
      ['Explotar recursos internos hasta el colapso', 'Exploiting internal resources until collapse'],
      ['Descanso planificado', 'Planned rest'],
      ['Revisiones regulares', 'Regular reviews'],
    ]),
    Q(1, 'A 5 años, “florecer” vs “explotar” se nota en:', 'Over 5 years, “flourish” vs “explode” shows in:', [
      ['Solo ingresos del mes', 'Only monthly income'],
      ['Capacidad sostenida de energía, relaciones y profundidad', 'Sustained capacity for energy, relationships, and depth'],
      ['Número de pantallas', 'Number of screens'],
      ['Horas sin dormir', 'Hours without sleep'],
    ]),
    Q(1, 'Ajustar cuando la vida cambia es:', 'Adjusting when life changes is:', [
      ['Fracaso del sistema', 'Failure of the system'],
      ['Función normal del sistema vivo', 'A normal function of a living system'],
      ['Razón para abandonar identidad', 'Reason to abandon identity'],
      ['Opcional si eres disciplinado', 'Optional if you are disciplined'],
    ]),
  ],
  'module-5/lesson-04.html': [
    Q(1, 'El documento final de sistema de vida busca:', 'The final life-system document aims to:', [
      ['Impresionar a otros', 'Impress others'],
      ['Integrar módulos en un mapa accionable y revisable', 'Integrate modules into an actionable, reviewable map'],
      ['Sustituir el descanso', 'Replace rest'],
      ['Eliminar revisiones', 'Remove reviews'],
    ]),
    Q(1, 'Un buen documento vivo debe:', 'A good living document should:', [
      ['Ser estático para siempre', 'Be static forever'],
      ['Tener gatillos de revisión y señales de alerta temprana', 'Have review triggers and early warning signals'],
      ['Ocultar fallos', 'Hide failures'],
      ['Evitar mínimos', 'Avoid minimums'],
    ]),
    Q(1, 'Al terminar el curso, la meta es:', 'When finishing the course, the goal is:', [
      ['Perfección sin ajustes', 'Perfection without tweaks'],
      ['Sistema propio que sobrevive valles y cambios de vida', 'Your own system that survives valleys and life changes'],
      ['Cero revisiones', 'Zero reviews'],
      ['Dependencia total de motivación', 'Total dependence on motivation'],
    ]),
  ],
};

export const MODULE_QUIZZES = {
  'module-1': [
    Q(1, 'Idea central del Módulo 1:', 'Core idea of Module 1:', [
      ['La motivación es el mejor motor a largo plazo', 'Motivation is the best long-term engine'],
      ['La estructura y los sistemas sustituyen la dependencia del estado de ánimo', 'Structure and systems replace mood dependence'],
      ['No hace falta entender el sabotaje', 'You do not need to understand sabotage'],
      ['Solo importa trabajar más horas', 'Only working more hours matters'],
    ]),
    Q(1, 'El autosabotaje se modela principalmente como:', 'Self-sabotage is mainly modeled as:', [
      ['Falta de carácter', 'Lack of character'],
      ['Regulación emocional desviada hacia la evitación', 'Emotional regulation skewed toward avoidance'],
      ['Algo aleatorio', 'Something random'],
      ['Un signo de baja inteligencia', 'A sign of low intelligence'],
    ]),
    Q(0, 'Las intenciones de implementación sirven para:', 'Implementation intentions help you:', [
      ['Vaguear menos y atar situación → acción concreta', 'Vague less and bind situation → concrete action'],
      ['Evitar planificar', 'Avoid planning'],
      ['Sustituir el sueño', 'Replace sleep'],
      ['Eliminar emociones', 'Remove emotions'],
    ]),
    Q(1, 'Diseño del entorno + higiene de atención comparten:', 'Environment design + attention hygiene share:', [
      ['Que no importan para la disciplina', 'That they do not matter for discipline'],
      ['Reducir fricción hacia lo importante y proteger el foco', 'Reduce friction toward what matters and protect focus'],
      ['Que solo aplican en oficinas', 'That they only apply in offices'],
      ['Que requieren equipo caro', 'That they require expensive gear'],
    ]),
    Q(1, 'Antes del Módulo 2, el Módulo 1 deja como base:', 'Before Module 2, Module 1 leaves as a base:', [
      ['Ignorar el calendario', 'Ignoring the calendar'],
      ['Arquitectura mínima realista y mapa del sabotaje', 'Minimal realistic architecture and a sabotage map'],
      ['Solo teoría sin práctica', 'Theory only without practice'],
      ['Evitar revisiones', 'Avoiding reviews'],
    ]),
  ],
  'module-2': [
    Q(1, 'El Módulo 2 se centra sobre todo en:', 'Module 2 focuses most on:', [
      ['Esperar inspiración', 'Waiting for inspiration'],
      ['Ejecutar sin reabrir la negociación en el momento crítico', 'Executing without reopening negotiation at the critical moment'],
      ['Eliminar calendarios', 'Removing calendars'],
      ['Evitar hábitos', 'Avoiding habits'],
    ]),
    Q(1, 'Los mínimos viables existen para:', 'Minimum viable actions exist to:', [
      ['Demostrar perfección', 'Prove perfection'],
      ['Proteger la cadena en días malos', 'Protect the chain on bad days'],
      ['Eliminar seguimiento', 'Remove tracking'],
      ['Evitar recuperación', 'Avoid recovery'],
    ]),
    Q(1, 'El calendario como contrato implica:', 'The calendar as a contract implies:', [
      ['Rellenar huecos sin prioridad', 'Filling gaps without priority'],
      ['Bloques explícitos que protegen no-negociables', 'Explicit blocks that protect non-negotiables'],
      ['Solo apariencia de ocupación', 'Only the appearance of busyness'],
      ['Cero descanso', 'Zero rest'],
    ]),
    Q(0, 'El seguimiento sano se distingue porque:', 'Healthy tracking is distinct because:', [
      ['Usa datos para ajustar el sistema sin atacarte', 'It uses data to tune the system without attacking you'],
      ['Castiga cada fallo', 'It punishes every miss'],
      ['Oculta métricas', 'It hides metrics'],
      ['Elimina revisiones', 'It removes reviews'],
    ]),
    Q(1, 'El protocolo de recuperación enseña a:', 'The recovery protocol teaches you to:', [
      ['Abandonar tras un fallo', 'Quit after a miss'],
      ['Volver al sistema con reglas claras tras desviarte', 'Return to the system with clear rules after drifting'],
      ['Ignorar causas', 'Ignore causes'],
      ['Subir exigencia sin análisis', 'Raise demands without analysis'],
    ]),
  ],
  'module-3': [
    Q(1, 'La identidad aquí se entiende como:', 'Identity here is understood as:', [
      ['Etiqueta fija', 'A fixed label'],
      ['Arquitectura construida con votos de evidencia', 'Architecture built with evidence votes'],
      ['Solo estética', 'Aesthetics only'],
      ['Independiente del comportamiento', 'Independent of behavior'],
    ]),
    Q(1, 'El lenguaje interno potente:', 'Powerful internal language:', [
      ['No influye en acciones', 'Does not influence actions'],
      ['Moldea qué comportamientos encajan con “quién eres”', 'Shapes which behaviors fit “who you are”'],
      ['Elimina límites', 'Removes limits'],
      ['Sustituye descanso', 'Replaces rest'],
    ]),
    Q(1, '“Actuar como si” funciona mejor con:', '“Act as if” works best with:', [
      ['Solo teatro', 'Theater only'],
      ['Acciones pequeñas creíbles y apoyo emocional', 'Small believable actions and emotional support'],
      ['Negar emociones', 'Denying emotions'],
      ['Cero límites', 'Zero boundaries'],
    ]),
    Q(1, 'El duelo de identidad aparece cuando:', 'Identity grief appears when:', [
      ['Todo es fácil', 'Everything is easy'],
      ['Sueltas narrativas que daban seguridad o pertenencia', 'You release narratives that gave safety or belonging'],
      ['Nunca cambias', 'You never change'],
      ['Solo ganas logros', 'You only rack up wins'],
    ]),
    Q(1, 'El laboratorio de integración cierra con:', 'The integration lab closes with:', [
      ['Teoría aislada', 'Isolated theory'],
      ['Un perfil vivo de identidad alineado a tus sistemas', 'A living identity profile aligned with your systems'],
      ['Eliminar hábitos', 'Removing habits'],
      ['Evitar el Módulo 4', 'Skipping Module 4'],
    ]),
  ],
  'module-4': [
    Q(1, 'La atención en este módulo se trata como:', 'Attention in this module is treated as:', [
      ['Infinita', 'Infinite'],
      ['Recurso finito con ciclos de esfuerzo y recuperación', 'A finite resource with effort and recovery cycles'],
      ['Secundaria', 'Secondary'],
      ['Solo para artistas', 'Only for artists'],
    ]),
    Q(1, 'El flujo suele requerir:', 'Flow usually requires:', [
      ['Cero desafío', 'Zero challenge'],
      ['Balance desafío/habilidad y foco protegido', 'Challenge/skill balance and protected focus'],
      ['Multitarea constante', 'Constant multitasking'],
      ['Solo presión extrema', 'Extreme pressure only'],
    ]),
    Q(1, 'Una sesión profunda bien diseñada tiene:', 'A well-designed deep session has:', [
      ['Objetivo vago', 'A vague objective'],
      ['Duración clara, resultado medible y reglas anti-interrupción', 'Clear duration, measurable outcome, anti-interruption rules'],
      ['Notificaciones abiertas', 'Notifications on'],
      ['Cero cierre', 'No closing'],
    ]),
    Q(1, 'La gestión de distracción digital realista incluye:', 'Realistic digital distraction management includes:', [
      ['Solo fuerza de voluntad', 'Willpower only'],
      ['Diseño del entorno digital + límites conscientes', 'Digital environment design + conscious limits'],
      ['Eliminar internet', 'Removing the internet'],
      ['Trabajar hasta colapsar', 'Working until collapse'],
    ]),
    Q(1, 'La recuperación de atención es:', 'Attention recovery is:', [
      ['Opcional si eres fuerte', 'Optional if you are strong'],
      ['Parte del sistema de rendimiento', 'Part of the performance system'],
      ['Pereza', 'Laziness'],
      ['Incompatible con disciplina', 'Incompatible with discipline'],
    ]),
  ],
  'module-5': [
    Q(1, 'Sostener sistemas a largo plazo requiere:', 'Sustaining systems long-term requires:', [
      ['Momentum emocional constante', 'Constant emotional momentum'],
      ['Sobrevivir valles con mínimos, revisiones y recuperación', 'Surviving valleys with minimums, reviews, and recovery'],
      ['Abandonar al primer bajón', 'Quitting at the first dip'],
      ['Ignorar señales de agotamiento', 'Ignoring burnout signals'],
    ]),
    Q(1, 'Las revisiones semanales/mensuales sirven para:', 'Weekly/monthly reviews help you:', [
      ['Solo culparte', 'Only blame yourself'],
      ['Detectar deriva temprana y re-alinear', 'Detect early drift and realign'],
      ['Eliminar planes', 'Remove plans'],
      ['Evitar datos', 'Avoid data'],
    ]),
    Q(1, 'Crecimiento sostenible contrasta con:', 'Sustainable growth contrasts with:', [
      ['Adaptación gradual', 'Gradual adaptation'],
      ['Quemar recursos internos hasta el colapso', 'Burning internal resources until collapse'],
      ['Descanso planificado', 'Planned rest'],
      ['Ajustes cuando la vida cambia', 'Adjusting when life changes'],
    ]),
    Q(1, 'Un documento vivo de sistema de vida debe:', 'A living life-system document should:', [
      ['Ser estático para siempre', 'Be static forever'],
      ['Incluir gatillos de revisión y señales de alerta', 'Include review triggers and warning signals'],
      ['Ocultar fallos', 'Hide failures'],
      ['Eliminar mínimos', 'Remove minimums'],
    ]),
    Q(1, 'Al cerrar el curso, el objetivo principal es:', 'At course close, the main objective is:', [
      ['Perfección inmutable', 'Immutable perfection'],
      ['Un sistema tuyo que sobrevive valles y cambios', 'A system of your own that survives valleys and change'],
      ['Cero revisiones', 'Zero reviews'],
      ['Dependencia de picos motivacionales', 'Dependence on motivational spikes'],
    ]),
  ],
};
