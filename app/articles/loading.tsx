export default function ArticlesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/[0.06]" />
      <ul className="mt-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-white/10" />
            <div className="flex-1 space-y-2 pt-1">
              <div
                className="h-5 max-w-md animate-pulse rounded bg-white/10"
                style={{ width: "66%" }}
              />
              <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
