import type { CoachServerSnapshot, CoachTone, DailyFocusResult } from '@/lib/coach/types';

function pick(tone: CoachTone, lines: Record<CoachTone, string>): string {
  return lines[tone];
}

/** Daily focus copy — grounded in progress data; tone shifts voice only. */
export function buildDailyFocus(
  s: CoachServerSnapshot,
  tone: CoachTone
): DailyFocusResult {
  const grounded = 'Grounded in your journey';

  if (!s.primaryCourseSlug) {
    return {
      kind: 'no_course',
      headline: pick(tone, {
        calm: 'Choose a course to anchor your rhythm.',
        motivational: 'Name your program—your momentum starts with one clear yes.',
        strategic: 'Pick a focus course so your goals have a home.',
        direct: 'Add a course to open your coaching path.',
      }),
      sublabel: grounded,
      bullets: [
        'When you’re ready, browse the library and choose where to begin.',
        'Your coach adapts based on your learning journey—not generic advice.',
      ],
    };
  }

  if (!s.unlocked) {
    const next = s.nextLesson;
    return {
      kind: 'locked',
      headline: pick(tone, {
        calm: 'Your lessons are waiting whenever you choose to return.',
        motivational: 'Unlock access and pick up right where your ambition points.',
        strategic: 'Restore full access to align daily actions with your syllabus.',
        direct: 'Subscribe to continue—your next lesson is already lined up.',
      }),
      sublabel: grounded,
      bullets: [
        next
          ? `After you continue, your natural next step is ${next.titleEn}.`
          : 'Your path stays in order—ready when you are.',
        'Your progress updates as you move through lessons.',
      ],
    };
  }

  if (s.ratio.total <= 0) {
    return {
      kind: 'empty_outline',
      headline: pick(tone, {
        calm: 'This space is almost ready—content is on the way.',
        motivational: 'Fresh curriculum is landing soon—stay curious.',
        strategic: 'Hold steady—new lessons will appear here shortly.',
        direct: 'Lessons aren’t published yet—check back soon.',
      }),
      sublabel: grounded,
      bullets: ['Nothing to complete here yet—we’ll meet you when lessons go live.'],
    };
  }

  if (s.ratio.percent >= 100) {
    return {
      kind: 'course_complete',
      headline: pick(tone, {
        calm: 'Beautiful work—you’ve walked every lesson in this path.',
        motivational: 'You closed the loop. Celebrate, then share what stuck.',
        strategic: 'Course complete—shift from collecting lessons to integrating them.',
        direct: 'Path done. Revisit what felt thin or teach someone else.',
      }),
      sublabel: grounded,
      bullets: [
        'Consider revisiting two lessons that felt rushed—depth loves a second pass.',
        'Optional: jot one habit you want to keep practicing this month.',
      ],
    };
  }

  const inactive =
    s.daysSinceLastCompletion != null &&
    s.daysSinceLastCompletion >= 4 &&
    s.ratio.completed > 0;

  if (inactive) {
    const d = s.daysSinceLastCompletion ?? 0;
    return {
      kind: 'reengage',
      headline: pick(tone, {
        calm: `It’s been ${d} days—welcome back, gently.`,
        motivational: `${d} days off the mat—one small win brings you back.`,
        strategic: `${d} days since your last lesson—re-enter at the next open step.`,
        direct: `${d} days quiet. Open your next lesson when you can.`,
      }),
      sublabel: grounded,
      bullets: [
        s.nextLesson
          ? `Your next natural step: ${s.nextLesson.titleEn}.`
          : 'Your roadmap still knows where you left off.',
        'Pauses are normal—momentum often returns in a single focused sitting.',
      ],
    };
  }

  if (s.nearCompleteModule && s.nextLesson) {
    const m = s.nearCompleteModule;
    return {
      kind: 'finish_module',
      headline: pick(tone, {
        calm: `You’re one lesson from completing ${m.titleEn}.`,
        motivational: `One more lesson finishes ${m.titleEn}—finish strong.`,
        strategic: `Close ${m.titleEn}: one lesson clears the whole module.`,
        direct: `Last lesson in ${m.titleEn}. Wrap it.`,
      }),
      sublabel: grounded,
      bullets: [
        `Lean into ${s.nextLesson.titleEn} next.`,
        `${m.titleEn}: ${m.completed}/${m.total} lessons—you’re almost there.`,
      ],
    };
  }

  const busyWeek =
    s.lessonsCompletedThisUtcWeek >= 3 || s.completionsLast7Days >= 4;

  if (busyWeek && s.ratio.percent < 95) {
    return {
      kind: 'reflection',
      headline: pick(tone, {
        calm: 'You’ve been moving—give what you learned room to settle.',
        motivational: 'Big week of lessons—capture what actually stuck.',
        strategic: 'Busy lesson week—capture takeaways before you pile on more.',
        direct: 'Heavy lesson week—pause with your journal before diving deeper.',
      }),
      sublabel: grounded,
      bullets: [
        `You’ve finished ${s.lessonsCompletedThisUtcWeek} lesson${s.lessonsCompletedThisUtcWeek === 1 ? '' : 's'} this week.`,
        'Spend ten quiet minutes in your reflection space.',
        'A short pause helps ideas become habits.',
      ],
    };
  }

  if (s.nextLesson) {
    return {
      kind: 'next_lesson',
      headline: pick(tone, {
        calm: `Today’s invitation: gentle progress on ${s.nextLesson.titleEn}.`,
        motivational: `Lean in—you’re building something with ${s.nextLesson.titleEn}.`,
        strategic: `Next move on your path: ${s.nextLesson.titleEn}.`,
        direct: `${s.nextLesson.titleEn} is next.`,
      }),
      sublabel: grounded,
      bullets: [
        `Continue with ${s.nextLesson.titleEn} in ${s.nextLesson.moduleTitleEn}.`,
        `You’re ${s.ratio.percent}% through—small sessions still move mountains.`,
      ],
    };
  }

  return {
    kind: 'next_lesson',
    headline: pick(tone, {
      calm: 'Stay with your roadmap—your next step is ready.',
      motivational: 'Keep showing up—the path opens one lesson at a time.',
      strategic: 'Review your overview and choose the next module to open.',
      direct: 'Head to your course overview for what’s next.',
    }),
    sublabel: grounded,
    bullets: ['Skim your journey map and choose the next block that fits your week.'],
  };
}

export type CoachFeedCard = {
  id: string;
  title: string;
  body: string;
  toneVariant: 'celebrate' | 'steady' | 'nudge';
};

export function buildCoachFeed(s: CoachServerSnapshot, tone: CoachTone): CoachFeedCard[] {
  const cards: CoachFeedCard[] = [];

  if (!s.primaryCourseSlug) {
    cards.push({
      id: 'library',
      title: pick(tone, {
        calm: 'Your coaching space is ready for a course.',
        motivational: 'Choose your arena—you’re built for this.',
        strategic: 'Anchor your goals by picking one primary program.',
        direct: 'Select a course to begin.',
      }),
      body: 'Once you choose a path, notes and nudges will feel more personal.',
      toneVariant: 'nudge',
    });
    return cards;
  }

  if (!s.unlocked) {
    cards.push({
      id: 'unlock',
      title: pick(tone, {
        calm: 'Full access keeps lessons and progress in one gentle flow.',
        motivational: 'Unlock and let your streak wake back up.',
        strategic: 'Restore access to resume measurable momentum.',
        direct: 'Renew to keep lessons open.',
      }),
      body: 'Review options whenever it feels right—your place is saved.',
      toneVariant: 'nudge',
    });
    return cards;
  }

  if (s.nearCompleteModule) {
    const m = s.nearCompleteModule;
    cards.push({
      id: 'near-module',
      title: `One lesson away from finishing ${m.titleEn}`,
      body: pick(tone, {
        calm: 'A quiet milestone is close—finish at your pace.',
        motivational: 'Push once more—then savor the win.',
        strategic: 'Closing the module clears mental clutter for what’s next.',
        direct: `Complete the last lesson in ${m.titleEn}.`,
      }),
      toneVariant: 'steady',
    });
  }

  if (s.lessonsCompletedThisUtcWeek > 0) {
    cards.push({
      id: 'week-count',
      title: `${s.lessonsCompletedThisUtcWeek} lesson${s.lessonsCompletedThisUtcWeek === 1 ? '' : 's'} this week`,
      body: pick(tone, {
        calm: 'Rhythm is showing—honor rest as much as pace.',
        motivational: 'That cadence is fuel—keep stacking wins.',
        strategic: 'Pair this pace with one reflection so insights stick.',
        direct: 'Strong week. Hold or beat this rhythm.',
      }),
      toneVariant: 'celebrate',
    });
  }

  if (s.completionsLast7Days > s.completionsPrior7Days) {
    cards.push({
      id: 'momentum',
      title: pick(tone, {
        calm: 'Your pace has lifted compared with last week.',
        motivational: 'You’re accelerating—feel that lift.',
        strategic: 'Recent completions outpaced the week before.',
        direct: 'You’re up versus last week—stay with it.',
      }),
      body: `About ${s.completionsLast7Days} lessons recently, compared with ${s.completionsPrior7Days} the week before.`,
      toneVariant: 'celebrate',
    });
  } else if (s.ratio.completed > 0 && s.completionsLast7Days === 0) {
    cards.push({
      id: 'quiet-week',
      title: pick(tone, {
        calm: 'A softer week—ease back with one small sitting.',
        motivational: 'Reset with a single focused win.',
        strategic: 'Quiet stretch—schedule one short learning block.',
        direct: 'No lessons last week. Do one today.',
      }),
      body: 'This is an in-app note—no pings, just a gentle heads-up.',
      toneVariant: 'nudge',
    });
  }

  if (s.daysSinceLastCompletion != null && s.daysSinceLastCompletion >= 3) {
    cards.push({
      id: 'away',
      title: `Away for ${s.daysSinceLastCompletion} days`,
      body: pick(tone, {
        calm: 'Come back softly—your seat is saved.',
        motivational: `Day ${s.daysSinceLastCompletion + 1} can be fresh start energy.`,
        strategic: 'Re-enter before the curve feels steep again.',
        direct: `It's been ${s.daysSinceLastCompletion} days—open your next lesson.`,
      }),
      toneVariant: 'nudge',
    });
  }

  if (s.nextLesson && s.ratio.total > 0) {
    const remain = s.ratio.total - s.ratio.completed;
    cards.push({
      id: 'milestone',
      title:
        remain === 1
          ? 'One lesson until your course is complete'
          : `${remain} lessons until your course is complete`,
      body: pick(tone, {
        calm: 'Each lesson is a pocket of calm progress.',
        motivational: `${remain} reps until the finish-line feeling.`,
        strategic: `${remain} lessons remain—spread them across calm blocks.`,
        direct: `${remain} lessons left—chip away.`,
      }),
      toneVariant: 'steady',
    });
  }

  if (s.completionStreakDays >= 2) {
    cards.push({
      id: 'streak',
      title: `${s.completionStreakDays}-day learning streak`,
      body: pick(tone, {
        calm: 'Rhythm matters more than speed.',
        motivational: 'Consistency is showing—protect it kindly.',
        strategic: 'Guard these streak days—they compound quietly.',
        direct: `Keep the ${s.completionStreakDays}-day streak alive.`,
      }),
      toneVariant: 'celebrate',
    });
  }

  return cards.slice(0, 8);
}

export type InsightRow = { label: string; value: string; detail: string };

export function buildInsights(s: CoachServerSnapshot, tone: CoachTone): InsightRow[] {
  const rows: InsightRow[] = [];

  rows.push({
    label: 'Your course journey',
    value: `${s.ratio.percent}%`,
    detail: pick(tone, {
      calm: 'Your progress updates as you move through lessons.',
      motivational: 'Every percent is proof you showed up.',
      strategic: 'Completion shows how far you’ve traveled overall.',
      direct: `${s.ratio.completed} of ${s.ratio.total} lessons done.`,
    }),
  });

  rows.push({
    label: 'Time still ahead',
    value: `~${s.estimatedMinutesRemaining} min`,
    detail: pick(tone, {
      calm: 'A gentle estimate based on typical lesson length.',
      motivational: 'Readable chunks—one sitting at a time.',
      strategic: 'Use this to plan calm blocks on your calendar.',
      direct: 'Rough minutes left—plan accordingly.',
    }),
  });

  rows.push({
    label: 'This week’s lessons',
    value: String(s.lessonsCompletedThisUtcWeek),
    detail: pick(tone, {
      calm: 'How many lessons you’ve wrapped this week.',
      motivational: 'Weekly wins deserve to be seen.',
      strategic: 'Baseline for your weekly rhythm targets.',
      direct: 'Counts lessons finished this week.',
    }),
  });

  rows.push({
    label: 'Recent rhythm',
    value: `${s.completionsLast7Days} · ${s.completionsPrior7Days}`,
    detail: pick(tone, {
      calm: 'Last seven days beside the seven before—no judgment, just signal.',
      motivational: 'Beat your own yesterday.',
      strategic: 'Compare windows to spot drift early.',
      direct: 'This week vs last week.',
    }),
  });

  rows.push({
    label: 'Where you’re strongest right now',
    value: s.strongestModuleTitle ?? '—',
    detail: pick(tone, {
      calm: 'The module where your attention has already landed.',
      motivational: 'Lean into the lane with traction.',
      strategic: 'Finish strong here before switching contexts.',
      direct: 'Most progress among active modules.',
    }),
  });

  rows.push({
    label: 'Modules finished this week',
    value: String(s.modulesCompletedThisUtcWeek),
    detail: pick(tone, {
      calm: 'Whole-module wins matter—even when no one claps.',
      motivational: 'Closing modules builds serious confidence.',
      strategic: 'Useful when you zoom out on your season.',
      direct: 'Modules fully completed this week.',
    }),
  });

  return rows;
}

export type ReminderCard = { id: string; title: string; body: string };

export function buildReminderDeck(s: CoachServerSnapshot, tone: CoachTone): ReminderCard[] {
  const items: ReminderCard[] = [];

  if (s.nextLesson && s.unlocked) {
    items.push({
      id: 'unfinished',
      title: pick(tone, {
        calm: 'Your next lesson is quietly saved for you.',
        motivational: 'Unfinished brilliance—finish the tape.',
        strategic: 'Close the open lesson before stacking new context.',
        direct: `Finish ${s.nextLesson.titleEn}.`,
      }),
      body: `${s.nextLesson.moduleTitleEn} · ${s.courseCtaLabel}`,
    });
  }

  if (s.nearCompleteModule) {
    items.push({
      id: 'milestone-soon',
      title: pick(tone, {
        calm: 'A milestone is near—close it when your energy feels steady.',
        motivational: 'Module finish line ahead.',
        strategic: 'Schedule one session to complete the module.',
        direct: `Complete ${s.nearCompleteModule.titleEn}.`,
      }),
      body: 'You’re closer than you think—one focused sitting can do it.',
    });
  }

  items.push({
    id: 'consistency',
    title: pick(tone, {
      calm: 'Small sessions beat occasional marathons.',
      motivational: 'Tiny wins protect your streak.',
      strategic: 'Cadence matters more than intensity spikes.',
      direct: 'Brief daily beats rare binge.',
    }),
    body: `Learning streak: ${s.completionStreakDays} day${s.completionStreakDays === 1 ? '' : 's'} with a completed lesson.`,
  });

  if (s.daysSinceLastCompletion != null && s.daysSinceLastCompletion >= 5) {
    items.push({
      id: 'gentle-nudge',
      title: pick(tone, {
        calm: 'No guilt—only an invitation to return.',
        motivational: 'Pause acknowledged—ignite gently.',
        strategic: 'Longer pause—restart before drift grows.',
        direct: 'Time to come back.',
      }),
      body: `About ${s.daysSinceLastCompletion} days since your last lesson—a soft checkpoint.`,
    });
  }

  return items.slice(0, 5);
}

/** Next-step suggestions aligned with syllabus + completions. */
export function buildPriorityBullets(s: CoachServerSnapshot): string[] {
  const items: string[] = [];
  if (!s.primaryCourseSlug) {
    items.push('Choose a course to bring your coaching view to life.');
    return items;
  }
  if (!s.unlocked) {
    items.push('When you’re ready, continue your membership—your progress travels with you.');
    if (s.nextLesson) {
      items.push(`Your first step after returning: “${s.nextLesson.titleEn}” in ${s.nextLesson.moduleTitleEn}.`);
    }
    return items.slice(0, 5);
  }
  if (s.ratio.total <= 0) {
    items.push('Lessons will appear here soon—thank you for your patience.');
    return items;
  }
  if (s.ratio.percent >= 100) {
    items.push('You’ve completed every lesson—celebrate, then revisit what felt fuzzy.');
    items.push('Capture takeaways while they’re fresh—you’ve earned the reflection.');
    return items.slice(0, 5);
  }

  if (s.nextLesson) {
    items.push(`Move forward with “${s.nextLesson.titleEn}” inside ${s.nextLesson.moduleTitleEn}.`);
  }

  const otherInProgress = s.modRows.filter(
    (r) =>
      r.percent > 0 &&
      r.percent < 100 &&
      r.titleEn !== s.nextLesson?.moduleTitleEn
  );
  for (const m of otherInProgress.slice(0, 2)) {
    items.push(`Keep nurturing ${m.titleEn} (${m.completed}/${m.total} lessons in motion).`);
  }

  const untouched = s.modRows.filter((r) => r.percent === 0);
  for (const m of untouched.slice(0, 2)) {
    items.push(`${m.titleEn} is waiting whenever you want a fresh chapter.`);
  }

  return items.slice(0, 5);
}
