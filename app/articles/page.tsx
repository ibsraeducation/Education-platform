import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categoryFilter =
    typeof searchParams.category === "string" ? searchParams.category : "";

  const [categoryFilters, articles] = await Promise.all([
    prisma.category.findMany({
      where: { articles: { some: { published: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.article.findMany({
      where: {
        published: true,
        ...(categoryFilter ? { categoryId: categoryFilter } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        publishName: true,
        authorIconUrl: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Articles</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {session.user.role === Role.STUDENT
          ? "Read and learn from published posts."
          : "Browse published content (student view)."}
      </p>

      {categoryFilters.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/articles"
            className={`rounded-full border px-3 py-1 text-xs transition ${
              !categoryFilter
                ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                : "border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
            }`}
          >
            All
          </Link>
          {categoryFilters.map((c) => (
            <Link
              key={c.id}
              href={`/articles?category=${encodeURIComponent(c.id)}`}
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

      <ul className="mt-10 space-y-4">
        {articles.length === 0 ? (
          <li className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-500">
            No articles in this category.{" "}
            {categoryFilter ? (
              <Link href="/articles" className="text-cyan-400 hover:underline">
                View all
              </Link>
            ) : null}
          </li>
        ) : (
          articles.map((a) => (
            <li key={a.id}>
              <Link
                href={`/articles/${a.slug}`}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-500/30 hover:bg-white/[0.07]"
              >
                {a.authorIconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.authorIconUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-600/30 text-sm font-bold text-white">
                    {a.publishName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{a.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {a.publishName} · {a.updatedAt.toLocaleDateString()}
                    {a.category?.name ? (
                      <span className="text-zinc-600">
                        {" "}
                        · {a.category.name}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
