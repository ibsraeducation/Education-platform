import { ArticleView } from "@/components/article-view";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const session = await auth();
  if (!session?.user) notFound();

  const article = await prisma.article.findFirst({
    where: { slug, published: true },
  });
  if (!article) notFound();

  const isStudent = session.user.role === Role.STUDENT;
  const trackViews = isStudent;

  // Watermark shown only to students (not admins previewing)
  const watermarkName = isStudent
    ? session.user.name ??
      [session.user.firstName, session.user.lastName].filter(Boolean).join(" ")
    : undefined;

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <Link
          href="/articles"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← All articles
        </Link>
      </div>
      <ArticleView
        article={article}
        trackViews={trackViews}
        watermarkName={watermarkName}
      />
    </div>
  );
}
