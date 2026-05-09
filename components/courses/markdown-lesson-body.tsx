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
        // Base typography
        'text-[1.02rem] leading-[1.85] text-[hsl(var(--lesson-ink))]',
        // Headings — strong top margin signals section breaks
        '[&_h1]:mt-2 [&_h1]:mb-5 [&_h1]:text-[clamp(1.7rem,3.5vw,2.2rem)] [&_h1]:font-extrabold [&_h1]:tracking-[-0.04em] [&_h1]:leading-[1.1] [&_h1]:text-[hsl(260_28%_13%)]',
        '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-[clamp(1.25rem,2.5vw,1.6rem)] [&_h2]:font-[780] [&_h2]:tracking-[-0.03em] [&_h2]:leading-[1.2] [&_h2]:text-[hsl(260_28%_14%)]',
        '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[1rem] [&_h3]:font-[760] [&_h3]:tracking-[0.05em] [&_h3]:uppercase [&_h3]:text-[hsl(262_55%_38%)]',
        // Paragraphs
        '[&_p]:text-[hsl(260_18%_30%)] [&_p]:leading-[1.85] [&_p]:my-4',
        // Links
        '[&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-[0.2em] hover:[&_a]:underline',
        // Lists
        '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[hsl(260_18%_30%)] [&_ul]:space-y-2',
        '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-[hsl(260_18%_30%)] [&_ol]:space-y-2',
        '[&_li]:leading-[1.8] [&_li]:py-0.5',
        // Blockquote — card with absolute left accent rail (avoid grid: multi-p causes vertical text bug)
        '[&_blockquote]:relative [&_blockquote]:block [&_blockquote]:my-7 [&_blockquote]:overflow-hidden',
        '[&_blockquote]:rounded-[1rem] [&_blockquote]:border [&_blockquote]:border-[hsl(var(--lesson-border)/0.5)]',
        '[&_blockquote]:bg-[linear-gradient(135deg,hsl(var(--primary)/0.05),hsl(var(--lesson-wash)/0.7))]',
        '[&_blockquote]:pl-5 [&_blockquote]:pr-5 [&_blockquote]:py-4 [&_blockquote]:not-italic [&_blockquote]:text-[hsl(260_18%_36%)] [&_blockquote]:leading-[1.8]',
        // Code
        '[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:my-6',
        // Horizontal rule
        '[&_hr]:my-10 [&_hr]:border-[hsl(var(--lesson-border)/0.6)]',
        // Tables
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-6',
        '[&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border/70 [&_td]:px-3 [&_td]:py-2',
        // Strong / em
        '[&_strong]:font-bold [&_strong]:text-[hsl(260_24%_18%)]',
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
