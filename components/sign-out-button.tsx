"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "rounded-lg border border-white/15 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white"
      }
    >
      Sign out
    </button>
  );
}
