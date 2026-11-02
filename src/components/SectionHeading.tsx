import type { ReactNode } from "react";

// Judul dan subjudul seksi beranda. Di HP judul memakai token yang sama dengan judul Hero
// (text-title-mobile) dan boleh membungkus ke dua baris (text-balance), mulai md clamp(1.75rem, 4vw, 3rem).
export default function SectionHeading({
  title,
  subtitle,
  id,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
}) {
  return (
    <>
      <h2 id={id} className="text-balance font-display text-title-mobile leading-[1.15] font-bold text-ink md:text-[clamp(1.75rem,4vw,3rem)]">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base text-muted md:text-xl">{subtitle}</p>}
    </>
  );
}
