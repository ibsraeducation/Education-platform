"use client";

import { Gender } from "@/lib/roles";
import dynamic from "next/dynamic";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CountryPicker = dynamic(
  () => import("@/components/country-picker").then((m) => m.CountryPicker),
  { ssr: false },
);

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryIso, setCountryIso] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("");
  const [whatsappNationalNumber, setWhatsappNationalNumber] = useState("");
  const [gender, setGender] = useState<typeof Gender.MALE | typeof Gender.FEMALE>(
    Gender.MALE,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!whatsappCountryCode) {
      setError("Please select your WhatsApp country code.");
      return;
    }
    const national = whatsappNationalNumber.replace(/\D/g, "");
    if (national.length < 4) {
      setError("Enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          whatsappCountryCode,
          whatsappNationalNumber: national,
          gender,
          password,
          confirmPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string | Record<string, string[]>;
      };
      if (!res.ok) {
        if (typeof data.error === "string") {
          setError(data.error);
        } else if (data.error) {
          setError(JSON.stringify(data.error));
        } else {
          setError("Registration failed.");
        }
        return;
      }
      const sign = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (sign?.error) {
        router.push("/login");
        return;
      }
      router.push("/articles");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">First name</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Last name</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
        />
      </div>
      <CountryPicker
        id="country"
        value={countryIso}
        onChange={(iso, dial) => {
          setCountryIso(iso);
          setWhatsappCountryCode(dial);
        }}
      />
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm text-zinc-400">
          WhatsApp number (without country code)
        </label>
        <input
          id="phone"
          inputMode="numeric"
          required
          value={whatsappNationalNumber}
          onChange={(e) => setWhatsappNationalNumber(e.target.value)}
          placeholder="e.g. 501234567"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
        />
      </div>
      <div>
        <span className="mb-2 block text-sm text-zinc-400">Gender</span>
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="gender"
              checked={gender === Gender.MALE}
              onChange={() => setGender(Gender.MALE)}
              className="h-4 w-4"
            />
            <span className="text-sm text-zinc-200">Male</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="gender"
              checked={gender === Gender.FEMALE}
              onChange={() => setGender(Gender.FEMALE)}
              className="h-4 w-4"
            />
            <span className="text-sm text-zinc-200">Female</span>
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">
          Confirm password
        </label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none ring-cyan-500/40 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create student account"}
      </button>
    </form>
  );
}
