import Image from "next/image";
import Link from "next/link";
import { navLinks } from "@/lib/nav-links";
import CartPanel from "./CartPanel";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <nav
        aria-label="Navigasi utama"
        className="relative mx-auto flex h-16 max-w-(--container) items-center justify-between gap-4 px-4 md:px-8"
      >
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo/logo.png"
            alt="Nasi Padang Nan Tujuah"
            width={480}
            height={344}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-medium text-ink hover:text-brand">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <CartPanel />
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
