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
        'rounded-2xl border border-border/80 bg-muted/15 p-5 shadow-card-soft sm:p-6',
        'space-y-4 text-[15px] leading-relaxed text-foreground',
        '[&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight',
        '[&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight',
        '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold',
        '[&_p]:text-muted-foreground [&_p]:leading-relaxed',
        '[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline',
        '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground',
        '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground',
        '[&_li]:my-1',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/25 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
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
