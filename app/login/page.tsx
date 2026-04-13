import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { Role } from "@/lib/roles";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();
  const sp = searchParams;
  if (session?.user) {
    redirect(
      session.user.role === Role.ADMIN ? "/admin" : "/articles",
    );
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Admins and students use the same login. New students can{" "}
        <Link href="/register" className="text-cyan-400 hover:underline">
          register here
        </Link>
        .
      </p>
      <LoginForm callbackUrl={sp.callbackUrl} />
    </div>
  );
}
