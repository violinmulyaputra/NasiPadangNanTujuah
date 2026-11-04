"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/ulasan", label: "Ulasan" },
  { href: "/admin/menu", label: "Menu" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi admin" className="mt-4">
      <ul className="flex flex-wrap gap-2">
        {LINKS.map(({ href, label }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none",
                  active ? "bg-ink text-paper" : "bg-card text-ink hover:text-brand-strong",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
