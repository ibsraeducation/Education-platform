import { ArticleForm } from "@/components/article-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) notFound();

  const categories = await prisma.category.findMany({
    where: { authorId: session.user.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <h1 className="text-2xl font-bold text-white">New blog post</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Article text is Markdown (stored as-is, rendered as HTML). Video uses
          YouTube; audio can be uploaded or linked.
        </p>
      </div>
      <ArticleForm mode="create" categories={categories} />
    </div>
  );
}
