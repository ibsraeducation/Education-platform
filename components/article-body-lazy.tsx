"use client";

import dynamic from "next/dynamic";

const ArticleBody = dynamic(
  () => import("./article-body").then((m) => ({ default: m.ArticleBody })),
  {
    loading: () => (
      <div
        className="space-y-3 animate-pulse py-6"
        aria-busy
        aria-label="Loading article"
      >
        <div className="h-4 max-w-xl rounded bg-white/10" style={{ width: "80%" }} />
        <div className="h-4 w-full max-w-2xl rounded bg-white/[0.06]" />
        <div className="h-4 w-full max-w-2xl rounded bg-white/[0.06]" />
        <div className="h-4 max-w-lg rounded bg-white/[0.06]" style={{ width: "60%" }} />
      </div>
    ),
    ssr: true,
  },
);

export function ArticleBodyLazy({ markdown }: { markdown: string }) {
  return <ArticleBody markdown={markdown} />;
}
