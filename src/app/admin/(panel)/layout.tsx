import { Suspense } from "react";
import AdminNav from "@/components/AdminNav";
import { signOut } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";

async function AdminAccount() {
  const admin = await requireAdmin();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="min-w-0 truncate text-sm text-muted" title={admin.email}>
        {admin.email}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="min-h-10 shrink-0 rounded-full border border-ink bg-paper px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-(--container) flex-1 px-4 py-6 md:px-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="font-display text-xl font-semibold">Dashboard Admin</p>
        <Suspense fallback={<div className="h-10" />}>
          <AdminAccount />
        </Suspense>
      </div>
      <Suspense fallback={<div className="mt-4 h-10" />}>
        <AdminNav />
      </Suspense>
      <div className="mt-6">{children}</div>
    </div>
  );
}
