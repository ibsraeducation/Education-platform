import Link from "next/link";
import { auth } from "@/auth";
import { Role } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  const role = session?.user?.role;

  // Auth is the main entrypoint.
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-400/90">
        Blog & learning CMS
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Publish rich lessons.{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
          Track student readers.
        </span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
        Admins publish articles with video, audio, Markdown or LaTeX, bylines,
        and social footers. Students sign up with verified-style profiles and
        read the library while you see who engaged.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href={role === Role.ADMIN ? "/admin" : "/articles"}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
