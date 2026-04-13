import { ArticleView } from "@/components/article-view";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";

export default async function AdminPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) notFound();
  const { id } = params;
  const article = await prisma.article.findFirst({
    where: { id, authorId: session.user.id },
  });
  if (!article) notFound();

  return (
    <div>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-6">
        <Link
          href="/admin/articles"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to list
        </Link>
        {article.published ? (
          <Link
            href={`/articles/${article.slug}`}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Open live student URL
          </Link>
        ) : (
          <span className="text-sm text-amber-400/90">
            Draft — not on student feed
          </span>
        )}
      </div>
      <ArticleView article={article} trackViews={false} previewBadge />
    </div>
  );
}
