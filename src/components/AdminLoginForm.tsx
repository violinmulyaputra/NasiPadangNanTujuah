"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/admin";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-card border border-line bg-card p-6">
      <div>
        <label htmlFor="admin-email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          maxLength={254}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="text-sm font-semibold">
          Kata sandi
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={inputClass}
        />
      </div>
      <p role="alert" aria-live="assertive" className="min-h-6 text-sm font-semibold text-brand-strong">
        {state?.message}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-full bg-brand-strong px-4 font-semibold text-paper transition-colors duration-150 hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
