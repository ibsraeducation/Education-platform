import type { Article } from "@prisma/client";
import { ArticleBodyLazy } from "@/components/article-body-lazy";
import { ArticleSocialFooter } from "@/components/article-social-footer";
import { MediaEmbeds } from "@/components/media-embeds";
import { ViewTracker } from "@/components/view-tracker";
import { markdownForDisplay } from "@/lib/article-markdown";

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function ArticleView({
  article,
  trackViews,
  previewBadge,
  watermarkName,
}: {
  article: Article;
  trackViews: boolean;
  previewBadge?: boolean;
  watermarkName?: string;
}) {
  const markdown = markdownForDisplay(article);
  const mins = readingTime(article.content);
  const initial = article.publishName.slice(0, 1).toUpperCase();

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      {trackViews ? <ViewTracker slug={article.slug} /> : null}

      {/* Preview badge */}
      {previewBadge ? (
        <div className="pt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Preview — not necessarily published
          </span>
        </div>
      ) : null}

      {/* Hero header */}
      <header className="pb-10 pt-12">
        {/* Category / eyebrow — decorative top accent */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-cyan-500 to-transparent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400/80">
            Article
          </span>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-white/8 pb-8">
          {/* Author */}
          <div className="flex items-center gap-3">
            {article.authorIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS URL
              <img
                src={article.authorIconUrl}
                alt={article.publishName}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-white/15 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-500/40 to-violet-600/40 text-base font-bold text-white shadow-lg">
                {initial}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {article.publishName}
              </p>
              <p className="text-xs text-zinc-500">
                {article.updatedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Divider */}
          <span className="hidden h-4 w-px bg-white/10 sm:block" />

          {/* Reading time */}
          <span className="text-xs text-zinc-500">
            {mins} min read
          </span>
        </div>
      </header>

      {/* Media */}
      {(article.videoUrl || article.audioUrl) ? (
        <div className="mb-10">
          <MediaEmbeds
            articleSlug={article.slug}
            videoUrl={article.videoUrl}
            audioUrl={article.audioUrl}
            watermarkName={watermarkName}
          />
        </div>
      ) : null}

      {/* Body */}
      <div className="relative">
        {/* Decorative left accent bar */}
        <div
          className="pointer-events-none absolute -left-4 top-0 hidden w-px bg-gradient-to-b from-cyan-500/30 via-violet-500/20 to-transparent sm:block"
          style={{ height: "min(100%, 320px)" }}
          aria-hidden="true"
        />
        <ArticleBodyLazy markdown={markdown} />
      </div>

      {/* Author bio card */}
      <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-4">
          {article.authorIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS URL
            <img
              src={article.authorIconUrl}
              alt={article.publishName}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full border border-white/15 object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-500/40 to-violet-600/40 text-xl font-bold text-white shadow-xl">
              {initial}
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Written by
            </p>
            <p className="mt-0.5 text-base font-semibold text-white">
              {article.publishName}
            </p>
          </div>
        </div>
      </div>

      {/* Social footer */}
      <ArticleSocialFooter
        socialTwitter={article.socialTwitter}
        socialYoutube={article.socialYoutube}
        socialInstagram={article.socialInstagram}
        socialFacebook={article.socialFacebook}
        socialLinkedin={article.socialLinkedin}
      />
    </article>
  );
}
