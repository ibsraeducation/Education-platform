import Link from "next/link";
import { auth } from "@/auth";
import { Role } from "@/lib/roles";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/login"
          className="text-lg font-semibold tracking-tight text-white"
        >
          IBSRA <span className="text-cyan-400">Education Blogs</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-4">
          {session ? (
            <>
              {role === Role.ADMIN ? (
                <>
                  <Link
                    href="/admin"
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/articles"
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    My blogs
                  </Link>
                </>
              ) : null}
              {role === Role.STUDENT || role === Role.ADMIN ? (
                <Link
                  href="/articles"
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Articles
                </Link>
              ) : null}
              <span className="hidden text-sm text-zinc-500 sm:inline">
                {session.user?.firstName} {session.user?.lastName}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-sm font-medium text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
              >
                Student sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
