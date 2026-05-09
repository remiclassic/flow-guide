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
        'w-full',
        // Base — magazine body
        'text-[1.045rem] leading-[1.85] text-[hsl(260_20%_28%)]',
        // H1 — used as top lesson heading
        '[&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-[clamp(1.5rem,3vw,1.95rem)] [&_h1]:font-[760] [&_h1]:tracking-[-0.03em] [&_h1]:leading-[1.15] [&_h1]:text-[hsl(260_28%_12%)]',
        // H2 — major section break, strong whitespace above
        '[&_h2]:mt-[2.75rem] [&_h2]:mb-4 [&_h2]:text-[clamp(1.35rem,2.4vw,1.7rem)] [&_h2]:font-[780] [&_h2]:tracking-[-0.03em] [&_h2]:leading-[1.2] [&_h2]:text-[hsl(260_28%_13%)] [&_h2:first-child]:mt-0',
        // H3 — small-caps label
        '[&_h3]:mt-[2rem] [&_h3]:mb-3 [&_h3]:text-[0.78rem] [&_h3]:font-[800] [&_h3]:tracking-[0.11em] [&_h3]:uppercase [&_h3]:leading-[1.4] [&_h3]:text-[hsl(262_55%_38%)] [&_h3:first-child]:mt-0',
        // Paragraphs — generous spacing between them
        '[&_p]:my-[0.95em] [&_p]:leading-[1.88] [&_p]:text-[hsl(260_20%_28%)]',
        // Links
        '[&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-[0.2em] hover:[&_a]:underline',
        // Lists
        '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2',
        '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2',
        '[&_li]:leading-[1.85] [&_li]:text-[hsl(260_20%_28%)] [&_li]:py-[0.3rem]',
        // Blockquote — card with left accent rail
        '[&_blockquote]:relative [&_blockquote]:block [&_blockquote]:my-8 [&_blockquote]:overflow-hidden',
        '[&_blockquote]:rounded-[1rem] [&_blockquote]:border [&_blockquote]:border-[hsl(var(--lesson-border)/0.5)]',
        '[&_blockquote]:bg-[linear-gradient(135deg,hsl(var(--primary)/0.04),hsl(var(--lesson-wash)/0.65))]',
        '[&_blockquote]:pl-8 [&_blockquote]:pr-6 [&_blockquote]:py-[1.4rem] [&_blockquote]:not-italic [&_blockquote]:text-[hsl(260_18%_34%)] [&_blockquote]:leading-[1.85] [&_blockquote]:text-[1.02rem]',
        '[&_blockquote_p]:my-0 [&_blockquote_p+p]:mt-[0.9rem]',
        // Code
        '[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:my-7',
        // Horizontal rule
        '[&_hr]:my-10 [&_hr]:border-[hsl(var(--lesson-border)/0.6)]',
        // Tables
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-6',
        '[&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border/70 [&_td]:px-3 [&_td]:py-2',
        // Strong / em
        '[&_strong]:font-bold [&_strong]:text-[hsl(260_24%_16%)]',
        '[&_em]:italic [&_em]:text-[hsl(260_20%_35%)]',
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
