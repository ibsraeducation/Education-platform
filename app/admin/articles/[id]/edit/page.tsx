import { ArticleForm } from "@/components/article-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) notFound();
  const { id } = params;
  const [article, categories] = await Promise.all([
    prisma.article.findFirst({
      where: { id, authorId: session.user.id },
    }),
    prisma.category.findMany({
      where: { authorId: session.user.id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!article) notFound();

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <h1 className="text-2xl font-bold text-white">Edit article</h1>
      </div>
      <ArticleForm
        mode="edit"
        articleId={article.id}
        categories={categories}
        initial={{
          title: article.title,
          videoUrl: article.videoUrl ?? "",
          audioUrl: article.audioUrl ?? "",
          categoryId: article.categoryId ?? "",
          content: article.content,
          publishName: article.publishName,
          authorIconUrl: article.authorIconUrl ?? "",
          socialTwitter: article.socialTwitter ?? "",
          socialYoutube: article.socialYoutube ?? "",
          socialInstagram: article.socialInstagram ?? "",
          socialFacebook: article.socialFacebook ?? "",
          socialLinkedin: article.socialLinkedin ?? "",
          published: article.published,
        }}
      />
    </div>
  );
}
