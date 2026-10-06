'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';
    try {
      return marked.parse(content) as string;
    } catch (e) {
      console.error('Failed to parse markdown:', e);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`prose prose-sm max-w-none text-ink leading-relaxed
        [&>h1]:font-heading [&>h1]:font-black [&>h1]:text-xl [&>h1]:text-ink [&>h1]:mt-4 [&>h1]:mb-2 [&>h1]:uppercase
        [&>h2]:font-heading [&>h2]:font-bold [&>h2]:text-lg [&>h2]:text-ink [&>h2]:mt-3.5 [&>h2]:mb-2 [&>h2]:border-b [&>h2]:border-border/60 [&>h2]:pb-1
        [&>h3]:font-heading [&>h3]:font-bold [&>h3]:text-base [&>h3]:text-ink [&>h3]:mt-3 [&>h3]:mb-1.5
        [&>h4]:font-heading [&>h4]:font-semibold [&>h4]:text-sm [&>h4]:text-ink [&>h4]:mt-2.5 [&>h4]:mb-1
        [&>p]:my-2 [&>p]:text-zinc-700
        [&>strong]:font-bold [&>strong]:text-ink
        [&>em]:italic [&>em]:text-zinc-600
        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2.5 [&>ul]:space-y-1
        [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2.5 [&>ol]:space-y-1
        [&>li]:text-zinc-700 [&>li]:leading-normal
        [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-3.5 [&>blockquote]:py-1 [&>blockquote]:my-3 [&>blockquote]:bg-orange-50/50 [&>blockquote]:rounded-r-lg [&>blockquote]:text-zinc-700 [&>blockquote]:italic
        [&>table]:w-full [&>table]:my-3 [&>table]:border-collapse [&>table]:border [&>table]:border-border [&>table]:rounded-lg [&>table]:overflow-hidden [&>table]:text-xs
        [&_th]:bg-surface [&_th]:border [&_th]:border-border [&_th]:p-2.5 [&_th]:font-mono [&_th]:font-bold [&_th]:text-left [&_th]:text-zinc-800
        [&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_td]:text-zinc-700
        [&_code]:font-mono [&_code]:bg-zinc-100 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
        [&>pre]:bg-zinc-900 [&>pre]:text-zinc-100 [&>pre]:p-3.5 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:my-3 [&>pre]:font-mono [&>pre]:text-xs
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
