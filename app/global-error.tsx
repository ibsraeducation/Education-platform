"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="text-2xl font-bold text-white">
            A critical error occurred
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Please reload the page or try again.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
            <a
              href="/"
              className="rounded-xl border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:border-white/30 hover:text-white"
            >
              Go home
            </a>
          </div>
          {process.env.NODE_ENV === "development" ? (
            <pre className="mt-8 overflow-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-xs text-zinc-300">
              {error?.stack ?? String(error)}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}

