import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import AdminMenuItem from "@/components/AdminMenuItem";
import { listMenuForAdmin, MAX_MENU_QUERY, parseMenuListParams, type MenuFilter } from "@/lib/admin-menu";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/types/menu";

export const metadata: Metadata = { title: "Menu" };

const CATEGORIES: MenuCategory[] = ["Ayam", "Sapi", "Seafood", "Sayuran", "Minuman", "Buah"];
const FILTERS: { value: MenuFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "habis", label: "Tidak tersedia" },
  { value: "populer", label: "Hidangan Andalan" },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none";

function listHref(filter: MenuFilter, query: string) {
  const search = new URLSearchParams();
  if (filter !== "semua") search.set("filter", filter);
  if (query) search.set("q", query);
  const qs = search.toString();
  return qs ? `/admin/menu?${qs}` : "/admin/menu";
}

async function MenuManager({ searchParams }: { searchParams: PageProps<"/admin/menu">["searchParams"] }) {
  const params = parseMenuListParams(await searchParams);
  const items = await listMenuForAdmin(params);

  return (
    <>
      <nav aria-label="Filter menu" className="mt-4">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.value === params.filter;
            return (
              <li key={f.value}>
                <Link
                  href={listHref(f.value, params.query)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150",
                    focusRing,
                    active ? "bg-brand-strong text-paper" : "bg-card text-ink hover:text-brand-strong",
                  )}
                >
                  {f.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Form action="/admin/menu" className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        {params.filter !== "semua" && <input type="hidden" name="filter" value={params.filter} />}
        <div className="sm:w-72">
          <label htmlFor="cari-menu" className="text-sm font-semibold">
            Cari nama menu
          </label>
          <input
            id="cari-menu"
            name="q"
            type="search"
            defaultValue={params.query}
            maxLength={MAX_MENU_QUERY}
            autoComplete="off"
            className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-base text-ink focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className={cn(
            "min-h-11 rounded-full bg-ink px-5 font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong",
            focusRing,
          )}
        >
          Cari
        </button>
        {params.query && (
          <Link
            href={listHref(params.filter, "")}
            className={cn(
              "inline-flex min-h-11 items-center px-2 text-sm font-semibold underline underline-offset-4 hover:text-brand-strong",
              focusRing,
            )}
          >
            Hapus pencarian
          </Link>
        )}
      </Form>

      <p aria-live="polite" className="mt-4 text-sm text-muted">
        {items.length} menu.
      </p>

      {items.length === 0 ? (
        <p className="mt-3 rounded-card border border-line bg-card p-6 text-center text-muted">Tidak ada menu.</p>
      ) : (
        CATEGORIES.map((category) => {
          const group = items.filter((item) => item.category === category);
          if (group.length === 0) return null;
          return (
            <section key={category} aria-labelledby={`kategori-${category}`} className="mt-6">
              <h2 id={`kategori-${category}`} className="font-display text-xl font-semibold">
                {category} <span className="text-base font-normal text-muted">({group.length})</span>
              </h2>
              <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.map((item) => (
                  <li key={item.id}>
                    <AdminMenuItem item={item} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
}

export default function AdminMenuPage({ searchParams }: PageProps<"/admin/menu">) {
  return (
    <main>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Menu</h1>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            aria-label="Memuat menu"
            className="mt-4 h-96 animate-pulse rounded-card bg-line/60 motion-reduce:animate-none"
          />
        }
      >
        <MenuManager searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
