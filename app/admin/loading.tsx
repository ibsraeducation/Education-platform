export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-8 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[4.5rem] animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}
