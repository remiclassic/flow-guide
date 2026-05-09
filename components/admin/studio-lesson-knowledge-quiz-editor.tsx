'use client';

import { useMemo } from 'react';
import type {
  KnowledgeQuizData,
  KnowledgeQuizItem,
} from '@/lib/courses/knowledge-quiz';
import {
  emptyKnowledgeQuiz,
  knowledgeQuizDataSchema,
} from '@/lib/courses/knowledge-quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const taClass =
  'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-950 shadow-inner outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70';

export function StudioLessonKnowledgeQuizEditor({
  value,
  onChange,
}: {
  value: KnowledgeQuizData;
  onChange: (next: KnowledgeQuizData) => void;
}) {
  const data = value;
  const patchData = (fn: (d: KnowledgeQuizData) => KnowledgeQuizData) => {
    onChange(fn(value));
  };

  const validation = useMemo(() => {
    if (data.items.length === 0) return { ok: true as const, message: null as string | null };
    const r = knowledgeQuizDataSchema.safeParse(data);
    if (r.success) return { ok: true as const, message: null as string | null };
    return {
      ok: false as const,
      message: r.error.issues[0]?.message ?? 'Invalid quiz data',
    };
  }, [data]);

  const updateItem = (idx: number, patch: Partial<KnowledgeQuizItem>) => {
    patchData((d) => {
      const items = d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
      return { ...d, items };
    });
  };

  const addQuestion = () => {
    patchData((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          promptEn: 'Question text (English)',
          promptEs: '',
          correctIndex: 0,
          options: [
            { en: 'Option A', es: '' },
            { en: 'Option B', es: '' },
            { en: 'Option C', es: '' },
            { en: 'Option D', es: '' },
          ],
        },
      ],
    }));
  };

  const removeQuestion = (idx: number) => {
    patchData((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  };

  const addOption = (qIdx: number) => {
    patchData((d) => {
      const items = d.items.map((it, i) => {
        if (i !== qIdx) return it;
        const next = [...it.options, { en: '', es: '' }];
        const correct = Math.min(it.correctIndex, next.length - 1);
        return { ...it, options: next, correctIndex: correct };
      });
      return { ...d, items };
    });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    patchData((d) => {
      const items = d.items.map((it, i) => {
        if (i !== qIdx) return it;
        if (it.options.length <= 2) return it;
        const next = it.options.filter((_, j) => j !== oIdx);
        let correct = it.correctIndex;
        if (oIdx === correct) correct = 0;
        else if (oIdx < correct) correct -= 1;
        correct = Math.min(correct, next.length - 1);
        return { ...it, options: next, correctIndex: Math.max(0, correct) };
      });
      return { ...d, items };
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kq-intro-en">Quiz intro (English, optional)</Label>
          <textarea
            id="kq-intro-en"
            value={data.introEn ?? ''}
            onChange={(e) =>
              patchData((d) => ({ ...d, introEn: e.target.value || null }))
            }
            rows={3}
            className={taClass}
            placeholder="Short intro above the questions…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kq-intro-es">Quiz intro (Spanish, optional)</Label>
          <textarea
            id="kq-intro-es"
            value={data.introEs ?? ''}
            onChange={(e) =>
              patchData((d) => ({ ...d, introEs: e.target.value || null }))
            }
            rows={3}
            className={taClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-stone-300/80 bg-white"
          onClick={addQuestion}
        >
          <Plus className="mr-1.5 size-4" />
          Add question
        </Button>
        {data.items.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-stone-600"
            onClick={() => onChange(emptyKnowledgeQuiz())}
          >
            Clear all questions
          </Button>
        ) : null}
      </div>

      {!validation.ok ? (
        <p className="text-sm text-amber-800">
          Fix before saving: {validation.message}
        </p>
      ) : null}

      <div className="space-y-6">
        {data.items.map((item, qIdx) => (
          <div
            key={qIdx}
            className="rounded-2xl border border-stone-200/90 bg-[#fffaf2]/90 p-4 shadow-inner"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                Question {qIdx + 1}
              </p>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 shrink-0 text-red-700"
                onClick={() => removeQuestion(qIdx)}
                aria-label="Remove question"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Prompt (English)</Label>
                <textarea
                  value={item.promptEn}
                  onChange={(e) =>
                    updateItem(qIdx, { promptEn: e.target.value })
                  }
                  rows={3}
                  className={taClass}
                />
              </div>
              <div className="space-y-2">
                <Label>Prompt (Spanish, optional)</Label>
                <textarea
                  value={item.promptEs ?? ''}
                  onChange={(e) =>
                    updateItem(qIdx, { promptEs: e.target.value || null })
                  }
                  rows={3}
                  className={taClass}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Correct answer</Label>
              <select
                value={item.correctIndex}
                onChange={(e) =>
                  updateItem(qIdx, {
                    correctIndex: Number.parseInt(e.target.value, 10),
                  })
                }
                className="h-10 w-full max-w-xs rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-950"
              >
                {item.options.map((_, oIdx) => (
                  <option key={oIdx} value={oIdx}>
                    Option {oIdx + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-stone-600">Answer choices</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-stone-300/80 text-xs"
                  onClick={() => addOption(qIdx)}
                >
                  Add option
                </Button>
              </div>
              {item.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className="flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-white/90 p-3 sm:flex-row sm:items-end"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label className="text-[11px] text-stone-500">
                      Option {oIdx + 1} (EN)
                    </Label>
                    <Input
                      value={opt.en}
                      onChange={(e) => {
                        const v = e.target.value;
                        patchData((d) => {
                          const items = d.items.map((it, i) => {
                            if (i !== qIdx) return it;
                            const options = it.options.map((o, j) =>
                              j === oIdx ? { ...o, en: v } : o
                            );
                            return { ...it, options };
                          });
                          return { ...d, items };
                        });
                      }}
                      className="border-stone-200 bg-white text-stone-950"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label className="text-[11px] text-stone-500">
                      Option {oIdx + 1} (ES)
                    </Label>
                    <Input
                      value={opt.es ?? ''}
                      onChange={(e) => {
                        const v = e.target.value || null;
                        patchData((d) => {
                          const items = d.items.map((it, i) => {
                            if (i !== qIdx) return it;
                            const options = it.options.map((o, j) =>
                              j === oIdx ? { ...o, es: v } : o
                            );
                            return { ...it, options };
                          });
                          return { ...d, items };
                        });
                      }}
                      className="border-stone-200 bg-white text-stone-950"
                    />
                  </div>
                  {item.options.length > 2 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-9 shrink-0 text-red-700"
                      onClick={() => removeOption(qIdx, oIdx)}
                      aria-label="Remove option"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : (
                    <span className="w-9 shrink-0" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
