"use client";

import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { useMemo, useState } from "react";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryOptions() {
  return getCountries()
    .map((code) => {
      const dial = getCountryCallingCode(code as CountryCode);
      const name = regionNames.of(code) ?? code;
      return { code, dial: `+${dial}`, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function CountryPicker({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (iso: string, dial: string) => void;
  id?: string;
}) {
  const options = useMemo(() => countryOptions(), []);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(s) ||
        o.code.toLowerCase().includes(s) ||
        o.dial.includes(s),
    );
  }, [options, q]);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm text-zinc-400">
        Country code
      </label>
      <input
        type="search"
        placeholder="Search country or +code…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-cyan-500/40 placeholder:text-zinc-500 focus:ring-2"
      />
      <select
        id={id}
        value={value}
        onChange={(e) => {
          const iso = e.target.value;
          const row = options.find((o) => o.code === iso);
          if (row) onChange(row.code, row.dial.replace("+", ""));
        }}
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
      >
        <option value="">Select country</option>
        {filtered.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name} ({o.dial})
          </option>
        ))}
      </select>
    </div>
  );
}
