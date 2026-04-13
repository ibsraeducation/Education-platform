"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-400">
        The page you requested doesn’t exist or you don’t have access.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white"
        >
          Go home
        </Link>
        <Link
          href="/articles"
          className="rounded-xl border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:border-white/30 hover:text-white"
        >
          View articles
        </Link>
      </div>
    </div>
  );
}

