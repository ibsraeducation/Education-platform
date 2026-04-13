import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { auth } from "@/auth";
import { Role } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === Role.ADMIN ? "/admin" : "/articles");
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Student registration</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-400 hover:underline">
          Sign in
        </Link>
      </p>
      <RegisterForm />
    </div>
  );
}
