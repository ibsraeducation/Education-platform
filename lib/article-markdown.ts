import type { Article } from "@prisma/client";
import { ContentFormat } from "@/lib/roles";

/**
 * CMS stores article body as Markdown; we parse and render HTML for display.
 * Legacy rows marked LATEX are normalized for the Markdown pipeline when needed.
 */
export function markdownForDisplay(article: Article): string {
  const c = article.content;
  if (article.contentFormat !== ContentFormat.LATEX) return c;
  if (c.startsWith("$") || c.startsWith("\\")) return c;
  return `$$\n${c}\n$$`;
}
