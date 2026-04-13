"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-400">
        An unexpected error occurred. Try again.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
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
  );
}

