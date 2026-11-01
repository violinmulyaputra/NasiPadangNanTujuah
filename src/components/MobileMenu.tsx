"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/nav-links";
import { CloseIcon, MenuIcon } from "./Icons";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="menu-hp"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-line/50 md:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        id="menu-hp"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-paper md:hidden"
      >
        <ul className="flex flex-col px-4 py-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-ink hover:text-brand"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
