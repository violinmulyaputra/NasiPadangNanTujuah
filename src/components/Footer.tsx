import Image from "next/image";
import Link from "next/link";
import { RESTAURANT_PHONE, RESTAURANT_PHONE_DISPLAY } from "@/lib/contact-info";
import { navLinks } from "@/lib/nav-links";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from "./Icons";

// Restoran fiktif: akun media sosial belum ada, tautan sengaja kosong.
const socials = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "X", Icon: XIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "LinkedIn", Icon: LinkedInIcon },
];

const headingClass = "font-display text-lg font-semibold text-ink";
const linkClass = "text-muted hover:text-brand";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="mx-auto grid max-w-(--container) gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1.5fr_1fr] md:px-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex w-fit items-center gap-3">
            <Image
              src="/images/logo/logo.png"
              alt=""
              width={480}
              height={344}
              className="h-12 w-auto"
            />
            <span className="font-display text-xl font-semibold text-ink">Nasi Padang Nan Tujuah</span>
          </Link>
          <p className="max-w-xs text-muted">
            Restoran dengan sentuhan arsitektur Minangkabau dan cahaya hangat yang siap menyambut Anda
            untuk menikmati kelezatan masakan Padang.
          </p>
        </div>

        <nav aria-labelledby="footer-quick-links" className="flex flex-col gap-4">
          <h2 id="footer-quick-links" className={headingClass}>
            Quick Links
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" className={linkClass}>
                Beranda
              </Link>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/pesanan" className={linkClass}>
                Lacak Pesanan
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-4">
          <h2 className={headingClass}>Contact</h2>
          {/* Pengaman: email panjang boleh patah agar kolom grid tidak melebar */}
          <address className="flex flex-col gap-2 not-italic text-muted [overflow-wrap:anywhere]">
            <a href={`tel:+${RESTAURANT_PHONE}`} className={linkClass}>
              {RESTAURANT_PHONE_DISPLAY}
            </a>
            <a href="mailto:info@nasipadangnantujuah.com" className={linkClass}>
              info@nasipadangnantujuah.com
            </a>
          </address>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className={headingClass}>Follow Us</h2>
          <ul className="flex gap-2">
            {socials.map(({ label, Icon }) => (
              <li key={label}>
                <a
                  href="#"
                  aria-label={label}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink hover:border-brand hover:text-brand"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-(--container) px-4 py-6 text-sm text-muted md:px-8">
          © 2026 Nasi Padang Nan Tujuah. Semua hal yang berkaitan dengan restoran dan pembayaran bersifat
          fiktif.
        </p>
      </div>
    </footer>
  );
}
