import type { ReactNode } from "react";

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
