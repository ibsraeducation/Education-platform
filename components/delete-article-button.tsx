"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/admin/articles/${articleId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-zinc-400">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-400/60 hover:text-red-200 disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/25"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
    >
      Delete
    </button>
  );
}
