import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";
import { CategoriesManager } from "@/components/categories-manager";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) notFound();

  const categories = await prisma.category.findMany({
    where: { authorId: session.user.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { articles: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Organize articles for your dashboard and the student article list.
          </p>
        </div>
        <Link
          href="/admin/articles"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Articles
        </Link>
      </div>
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
