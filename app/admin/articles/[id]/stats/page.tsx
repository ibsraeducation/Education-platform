import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";

export default async function ArticleStatsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) notFound();
  const { id } = params;

  const article = await prisma.article.findFirst({
    where: { id, authorId: session.user.id },
    select: { id: true, title: true, slug: true },
  });
  if (!article) notFound();

  const totalViews = await prisma.articleView.count({
    where: { articleId: id },
  });
  const distinct = await prisma.articleView.groupBy({
    by: ["studentId"],
    where: { articleId: id },
  });
  const views = await prisma.articleView.findMany({
    where: { articleId: id },
    orderBy: { viewedAt: "desc" },
    take: 200,
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/articles"
        className="text-sm text-cyan-400 hover:text-cyan-300"
      >
        ← Articles
      </Link>
      <h1 className="mt-6 text-2xl font-bold text-white">Statistics</h1>
      <p className="mt-2 text-zinc-400">{article.title}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-500">Total views (events)</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalViews}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-500">Unique students</p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">
            {distinct.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-500">Live link</p>
          {article.slug ? (
            <Link
              href={`/articles/${article.slug}`}
              className="mt-2 inline-block text-sm text-violet-300 hover:underline"
            >
              /articles/{article.slug}
            </Link>
          ) : null}
        </div>
      </div>
      <h2 className="mt-12 text-lg font-semibold text-white">Recent views</h2>
      <p className="text-sm text-zinc-500">
        Each student visit creates a row (multiple opens count separately).
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {views.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  No student views recorded yet.
                </td>
              </tr>
            ) : (
              views.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3 text-zinc-300">
                    {v.viewedAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {v.student.firstName} {v.student.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {v.student.email}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
