"use client";

import { ContentFormat } from "@/lib/roles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FaXTwitter,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

type Initial = {
  title: string;
  videoUrl: string;
  audioUrl: string;
  categoryId: string;
  content: string;
  publishName: string;
  authorIconUrl: string;
  socialTwitter: string;
  socialYoutube: string;
  socialInstagram: string;
  socialFacebook: string;
  socialLinkedin: string;
  published: boolean;
};

const defaultInitial: Initial = {
  title: "",
  videoUrl: "",
  audioUrl: "",
  categoryId: "",
  content: "",
  publishName: "",
  authorIconUrl: "",
  socialTwitter: "",
  socialYoutube: "",
  socialInstagram: "",
  socialFacebook: "",
  socialLinkedin: "",
  published: false,
};

const SOCIAL_FIELDS: {
  key: keyof Initial;
  label: string;
  Icon: IconType;
}[] = [
  { key: "socialTwitter", label: "X / Twitter", Icon: FaXTwitter },
  { key: "socialYoutube", label: "YouTube", Icon: FaYoutube },
  { key: "socialInstagram", label: "Instagram", Icon: FaInstagram },
  { key: "socialFacebook", label: "Facebook", Icon: FaFacebook },
  { key: "socialLinkedin", label: "LinkedIn", Icon: FaLinkedin },
];

export function ArticleForm({
  mode,
  articleId,
  initial,
  categories = [],
}: {
  mode: "create" | "edit";
  articleId?: string;
  initial?: Partial<Initial>;
  categories?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Initial>({
    ...defaultInitial,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/articles"
          : `/api/admin/articles/${articleId}`;
      const payload = {
        ...values,
        contentFormat: ContentFormat.MARKDOWN,
      };
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: unknown;
        article?: { id: string };
      };
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error ?? "Save failed"),
        );
        return;
      }
      if (mode === "create" && data.article?.id) {
        router.push(`/admin/articles/${data.article.id}/preview`);
        router.refresh();
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const field =
    (name: keyof Initial) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const v = e.target.value;
      if (name === "published") {
        setValues((s) => ({
          ...s,
          published: (e.target as HTMLInputElement).checked,
        }));
        return;
      }
      setValues((s) => ({ ...s, [name]: v }));
    };

  async function handleAudioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAudioUploadError(null);
    setAudioUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        setAudioUploadError(data.error ?? "Upload failed");
        return;
      }
      setValues((s) => ({ ...s, audioUrl: data.url ?? "" }));
    } finally {
      setAudioUploading(false);
    }
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      setValues((s) => ({ ...s, authorIconUrl: data.url ?? "" }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <div>
        <label className="mb-2 block text-sm text-zinc-400">Title</label>
        <input
          required
          value={values.title}
          onChange={field("title")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400">Category</label>
        <select
          value={values.categoryId}
          onChange={field("categoryId")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {categories.length === 0 ? (
          <p className="mt-1.5 text-xs text-zinc-500">
            <Link
              href="/admin/categories"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Create categories
            </Link>{" "}
            to organize articles in dashboards.
          </p>
        ) : null}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Video URL (YouTube only)
          </label>
          <input
            type="url"
            value={values.videoUrl}
            onChange={field("videoUrl")}
            placeholder="https://..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Audio (upload file)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={audioUploading || uploading}
              className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/35 hover:text-white disabled:opacity-50"
            >
              {audioUploading ? "Uploading…" : "Upload MP3 / audio…"}
            </button>
            {values.audioUrl ? (
              <button
                type="button"
                onClick={() => setValues((s) => ({ ...s, audioUrl: "" }))}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-zinc-400 hover:border-white/30 hover:text-white"
              >
                Clear audio
              </button>
            ) : null}
          </div>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/webm,audio/wav,audio/x-wav,audio/aac"
            className="hidden"
            onChange={handleAudioFile}
          />
          {audioUploadError ? (
            <p className="mt-1 text-xs text-red-400">{audioUploadError}</p>
          ) : null}
          {values.audioUrl ? (
            <>
              {!values.audioUrl.startsWith("/uploads/") ? (
                <p className="mt-2 text-xs text-red-300/80">
                  This article still has a link-based audio URL. Link audio is
                  disabled now — please clear it and upload a file.
                </p>
              ) : (
                <p className="mt-2 truncate text-xs text-zinc-500">
                  {values.audioUrl}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs text-zinc-600">
              Upload MP3, M4A, AAC, WebM, or WAV · max 40 MB
            </p>
          )}
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Uploaded files are stored on your server (no external links).
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-5 text-sm leading-relaxed text-zinc-300">
        <p className="font-semibold text-cyan-200/95">
          Article content: Markdown (CMS standard)
        </p>
        <p className="mt-3 text-zinc-400">
          We store <strong className="text-zinc-200">Markdown</strong> in the
          database and render <strong className="text-zinc-200">HTML</strong>{" "}
          for display — clean separation of content vs design.
        </p>
        <p className="mt-3 text-zinc-400">
          <span className="font-medium text-zinc-300">Flow:</span> you write
          Markdown → the CMS parses it → the article template renders HTML.
        </p>
        <p className="mt-3 text-zinc-400">
          <span className="font-medium text-zinc-300">Why Markdown:</span>{" "}
          universal for CMS tooling, easy to write and parse, and portable to
          HTML, PDF, or LaTeX exports later. Use{" "}
          <code className="rounded bg-black/30 px-1 text-violet-300">
            $...$</code>{" "}
          or{" "}
          <code className="rounded bg-black/30 px-1 text-violet-300">
            $$...$$</code>{" "}
          for math (KaTeX).
        </p>
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Article body (Markdown)
        </label>
        <textarea
          required
          rows={16}
          value={values.content}
          onChange={field("content")}
          placeholder={"# Heading\n\nIntro paragraph…\n\n$$E = mc^2$$"}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Publish name (byline)
          </label>
          <input
            required
            value={values.publishName}
            onChange={field("publishName")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Author picture
          </label>
          <div className="flex items-start gap-3">
            {values.authorIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.authorIconUrl}
                alt="Author preview"
                className="h-12 w-12 shrink-0 rounded-full border border-white/15 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-zinc-500">
                {values.publishName?.slice(0, 1).toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/35 hover:text-white disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Choose image…"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageFile}
              />
              {uploadError ? (
                <p className="mt-1 text-xs text-red-400">{uploadError}</p>
              ) : values.authorIconUrl ? (
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {values.authorIconUrl}
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-600">
                  JPEG, PNG, WebP or GIF · max 5 MB
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-300">
          Footer — social links
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(({ key, label, Icon }) => (
            <div key={key}>
              <label className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500">
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {label}
              </label>
              <input
                type="url"
                value={values[key] as string}
                onChange={field(key)}
                placeholder="https://"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
              />
            </div>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <input
          type="checkbox"
          checked={values.published}
          onChange={field("published")}
          className="h-4 w-4 rounded border-white/20"
        />
        <span className="text-sm text-zinc-200">Published (visible to students)</span>
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || uploading || audioUploading}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {loading ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/15 px-6 py-2.5 text-sm text-zinc-300 hover:border-white/30"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
