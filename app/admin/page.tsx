import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Admin dashboard</h1>
      <p className="mt-2 text-zinc-400">
        Create posts with media, Markdown or LaTeX, social footers, and track
        student readers.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/articles/new"
          className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 transition hover:border-cyan-400/50"
        >
          <h2 className="font-semibold text-cyan-200">New blog post</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Add video, audio, content, byline, icon, and social links.
          </p>
        </Link>
        <Link
          href="/admin/articles"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
        >
          <h2 className="font-semibold text-white">My published work</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Edit, preview, and open statistics per article.
          </p>
        </Link>
      </div>
    </div>
  );
}
