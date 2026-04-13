import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";
import { DeleteArticleButton } from "@/components/delete-article-button";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) notFound();

  const categoryFilter =
    typeof searchParams.category === "string" ? searchParams.category : "";

  const [categories, articles] = await Promise.all([
    prisma.category.findMany({
      where: { authorId: session.user.id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.article.findMany({
      where: {
        authorId: session.user.id,
        ...(categoryFilter ? { categoryId: categoryFilter } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        _count: { select: { views: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Your articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90"
        >
          New post
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/admin/articles"
            className={`rounded-full border px-3 py-1 text-xs transition ${
              !categoryFilter
                ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                : "border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/articles?category=${encodeURIComponent(c.id)}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                categoryFilter === c.id
                  ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      <ul className="mt-8 space-y-3">
        {articles.length === 0 ? (
          <li className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-zinc-500">
            No articles in this view.{" "}
            {categoryFilter ? (
              <Link href="/admin/articles" className="text-cyan-400 hover:underline">
                Clear filter
              </Link>
            ) : (
              "Create your first post."
            )}
          </li>
        ) : (
          articles.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/15 hover:bg-white/[0.07]"
            >
              <div className="min-w-0">
                <p className="font-medium text-white">{a.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {a.published ? (
                    <span className="text-emerald-400/90">Published</span>
                  ) : (
                    <span className="text-amber-400/90">Draft</span>
                  )}
                  {a.category ? (
                    <>
                      {" · "}
                      <span className="text-zinc-400">{a.category.name}</span>
                    </>
                  ) : null}
                  {" · "}
                  {a._count.views} view{a._count.views !== 1 ? "s" : ""}
                  {" · "}
                  {a.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/30 hover:text-white"
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/articles/${a.id}/preview`}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/30 hover:text-white"
                >
                  Preview
                </Link>
                <Link
                  href={`/admin/articles/${a.id}/stats`}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 transition hover:border-cyan-400/50 hover:text-cyan-200"
                >
                  Statistics
                </Link>
                <DeleteArticleButton articleId={a.id} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
