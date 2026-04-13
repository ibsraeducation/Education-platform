"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
};

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Row[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: unknown };
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error ?? "Failed"),
        );
        return;
      }
      setName("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <form
        onSubmit={createCategory}
        className="rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <label className="mb-2 block text-sm text-zinc-400">New category</label>
        <div className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Case studies"
            required
            className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add"}
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        ) : null}
      </form>

      <ul className="space-y-2">
        {initialCategories.length === 0 ? (
          <li className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-zinc-500">
            No categories yet. Add one above, then assign it when editing an
            article.
          </li>
        ) : (
          initialCategories.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-xs text-zinc-500">
                  {c._count.articles} article
                  {c._count.articles !== 1 ? "s" : ""} · slug: {c.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(c.id)}
                disabled={deleting === c.id}
                className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-400/40 disabled:opacity-50"
              >
                {deleting === c.id ? "Removing…" : "Delete"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
