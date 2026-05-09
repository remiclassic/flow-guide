import { z } from 'zod';

const optionSchema = z.object({
  en: z.string().min(1).max(2000),
  es: z.string().max(2000).optional().nullable(),
});

const itemSchema = z
  .object({
    promptEn: z.string().min(1).max(4000),
    promptEs: z.string().max(4000).optional().nullable(),
    correctIndex: z.number().int().min(0).max(20),
    options: z.array(optionSchema).min(2).max(8),
  })
  .refine((d) => d.correctIndex < d.options.length, {
    message: 'correctIndex must reference an option',
  });

export const knowledgeQuizDataSchema = z.object({
  introEn: z.string().max(4000).optional().nullable(),
  introEs: z.string().max(4000).optional().nullable(),
  items: z.array(itemSchema).max(20),
});

export type KnowledgeQuizData = z.infer<typeof knowledgeQuizDataSchema>;
export type KnowledgeQuizItem = KnowledgeQuizData['items'][number];
export type KnowledgeQuizOption = KnowledgeQuizItem['options'][number];

export const emptyKnowledgeQuiz = (): KnowledgeQuizData => ({
  introEn: null,
  introEs: null,
  items: [],
});

/** Studio editor: always returns a valid in-memory quiz object (possibly empty). */
export function normalizeKnowledgeQuizForStudio(
  raw: KnowledgeQuizData | null | undefined
): KnowledgeQuizData {
  if (!raw?.items?.length) return emptyKnowledgeQuiz();
  const parsed = knowledgeQuizDataSchema.safeParse(raw);
  return parsed.success ? parsed.data : emptyKnowledgeQuiz();
}

export function parseKnowledgeQuizFromUnknown(
  raw: unknown
): KnowledgeQuizData | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return null;
    try {
      return parseKnowledgeQuizFromUnknown(JSON.parse(t));
    } catch {
      return null;
    }
  }
  if (typeof raw !== 'object') return null;
  const parsed = knowledgeQuizDataSchema.safeParse(raw);
  if (!parsed.success) return null;
  if (parsed.data.items.length === 0) return null;
  return parsed.data;
}

export function normalizeKnowledgeQuizForDb(
  data: KnowledgeQuizData | null
): KnowledgeQuizData | null {
  if (!data || data.items.length === 0) return null;
  const parsed = knowledgeQuizDataSchema.safeParse(data);
  if (!parsed.success) return null;
  return parsed.data;
}
