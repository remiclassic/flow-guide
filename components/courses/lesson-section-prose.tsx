'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

type Props = {
  markdown: string;
  className?: string;
};

/** Inline markdown block without outer lesson card — for reflection / action steps. */
export function LessonSectionProse({ markdown, className }: Props) {
  const trimmed = markdown.trim();
  if (!trimmed) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-muted/10 px-5 py-4 text-[15px] leading-relaxed',
        '[&_p]:text-muted-foreground [&_p]:leading-relaxed',
        '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground',
        '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-muted-foreground',
        '[&_strong]:text-foreground',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {trimmed}
      </ReactMarkdown>
    </div>
  );
}
