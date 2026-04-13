import type { Article } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { markdownForDisplay } from "./article-markdown";
import { ContentFormat } from "./roles";

function article(partial: Pick<Article, "content" | "contentFormat">): Article {
  const now = new Date();
  return {
    id: "id",
    slug: "slug",
    title: "t",
    videoUrl: null,
    audioUrl: null,
    content: partial.content,
    contentFormat: partial.contentFormat,
    publishName: "Author",
    authorIconUrl: null,
    socialTwitter: null,
    socialYoutube: null,
    socialInstagram: null,
    socialFacebook: null,
    socialLinkedin: null,
    published: true,
    categoryId: null,
    authorId: "author",
    createdAt: now,
    updatedAt: now,
  };
}

describe("markdownForDisplay", () => {
  it("returns markdown as-is for MARKDOWN format", () => {
    const md = "# Hi\n\nBody";
    expect(markdownForDisplay(article({ content: md, contentFormat: "MARKDOWN" }))).toBe(
      md,
    );
  });

  it("returns legacy LATEX with delimiters unchanged", () => {
    expect(
      markdownForDisplay(
        article({ content: "$x^2$", contentFormat: ContentFormat.LATEX }),
      ),
    ).toBe("$x^2$");
  });

  it("returns legacy LATEX with backslash unchanged", () => {
    expect(
      markdownForDisplay(
        article({ content: "\\frac{a}{b}", contentFormat: ContentFormat.LATEX }),
      ),
    ).toBe("\\frac{a}{b}");
  });

  it("wraps plain legacy LATEX in display math block", () => {
    expect(
      markdownForDisplay(
        article({ content: "E = mc^2", contentFormat: ContentFormat.LATEX }),
      ),
    ).toBe("$$\nE = mc^2\n$$");
  });
});
