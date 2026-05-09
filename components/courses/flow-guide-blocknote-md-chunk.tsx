'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { LESSON_MARKDOWN_PROSE } from '@/components/courses/markdown-lesson-body';
import { cn } from '@/lib/utils';

type Props = {
  markdown: string;
  className?: string;
};

/** Lightweight markdown inside BlockNote custom blocks (sanitized, GFM). */
export function FlowGuideBlockNoteMd({ markdown, className }: Props) {
  return (
    <div className={cn(LESSON_MARKDOWN_PROSE, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
