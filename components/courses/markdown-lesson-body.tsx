'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

type Props = {
  markdown: string;
  className?: string;
};

export function MarkdownLessonBody({ markdown, className }: Props) {
  return (
    <div
      className={cn(
        'w-full rounded-3xl border border-[hsl(var(--lesson-border)/0.38)] bg-[hsl(var(--lesson-wash)/0.45)] p-6 shadow-[0_22px_55px_-44px_hsl(var(--primary)/0.22)] sm:p-8',
        'space-y-5 text-[1.02rem] leading-[1.75] text-[hsl(var(--lesson-ink))]',
        '[&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-[hsl(var(--lesson-ink))]',
        '[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[hsl(var(--lesson-ink))]',
        '[&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[hsl(var(--lesson-ink))]',
        '[&_p]:text-[hsl(var(--lesson-muted))] [&_p]:leading-[1.78]',
        '[&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-[0.2em] hover:[&_a]:underline',
        '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[hsl(var(--lesson-muted))]',
        '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-[hsl(var(--lesson-muted))]',
        '[&_li]:my-1.5',
        '[&_blockquote]:my-6 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-primary/15 [&_blockquote]:bg-gradient-to-br [&_blockquote]:from-primary/[0.06] [&_blockquote]:to-transparent [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:not-italic [&_blockquote]:leading-relaxed [&_blockquote]:text-[hsl(var(--lesson-muted))]',
        '[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:text-sm',
        '[&_hr]:my-8 [&_hr]:border-border/60',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left',
        '[&_td]:border [&_td]:border-border/70 [&_td]:px-3 [&_td]:py-2',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
