"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

/**
 * Renders stored Markdown to HTML in the article template (react-markdown → HTML).
 * Math: use `$...$` or `$$...$$` (KaTeX).
 */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-a:text-cyan-400 prose-code:text-violet-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
