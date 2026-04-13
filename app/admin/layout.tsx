import Link from "next/link";
import { auth } from "@/auth";
import { Role } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== Role.ADMIN) {
    redirect("/articles");
  }
  return (
    <div className="border-b border-white/10 bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3 sm:px-6">
        <Link
          href="/admin"
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          Overview
        </Link>
        <Link
          href="/admin/articles"
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          My blogs
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          Categories
        </Link>
      </div>
      {children}
    </div>
  );
}
