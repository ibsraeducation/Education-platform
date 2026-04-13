export default function ArticleSlugLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      <div
        className="mt-8 h-10 max-w-xl animate-pulse rounded-lg bg-white/10"
        style={{ width: "85%" }}
      />
      <div className="mt-6 h-4 w-48 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-10 aspect-video w-full animate-pulse rounded-2xl bg-white/5" />
      <div className="mt-10 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
        <div
          className="h-4 animate-pulse rounded bg-white/[0.06]"
          style={{ width: "75%" }}
        />
      </div>
    </div>
  );
}
