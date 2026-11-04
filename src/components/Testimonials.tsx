// Diadaptasi dari komponen 21st.dev "Testimonials with Marquee". Gradien lembut kartu, border-t,
// avatar shadcn, dan gerak marquee dipertahankan (lihat "Pengecualian komponen 21st.dev" di
// docs/DESIGN.md). Komponen server: marquee murni CSS (animate-marquee dari globals.css).
// Isi: ulasan sungguhan dari pengunjung (is_visible lewat RLS, terbaru dulu, maksimal 6).
import Link from "next/link";
import { Suspense } from "react";
import { Avatar, AvatarFallback } from "./Avatar";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { formatDate } from "@/lib/format";
import { getLatestReviews } from "@/lib/reviews";
import type { Review } from "@/types/review";

const MAX_REVIEWS = 6;
// Di bawah jumlah ini satu salinan daftar tidak memenuhi lebar layar, jadi marquee berlubang.
// Kartu ditampilkan diam dan rata tengah.
const MIN_FOR_MARQUEE = 4;

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => [...part][0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function TestimonialCard({ review }: { review: Review }) {
  return (
    // Lebar tetap agar semua kartu sejajar; tinggi ikut kartu tertinggi (flex stretch).
    <li className="flex w-[272px] shrink-0 flex-col rounded-lg border-t border-line bg-linear-to-b from-surface/50 to-surface/10 p-4 text-start transition-colors duration-300 hover:from-surface/60 hover:to-surface/20 md:w-[320px] md:p-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="text-sm font-semibold">{initials(review.author_name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col items-start gap-1">
          <h3 className="text-base leading-tight font-semibold break-words text-ink">{review.author_name}</h3>
          <time dateTime={review.created_at} className="text-sm text-muted">
            {formatDate(review.created_at)}
          </time>
        </div>
      </div>
      {/* Teks biasa (React meng-escape); dipotong 5 baris agar kartu tetap rapi */}
      <p className="mt-4 line-clamp-5 text-sm break-words whitespace-pre-line text-muted md:text-base">
        {review.comment}
      </p>
    </li>
  );
}

// Dibaca per permintaan (klien Supabase membaca cookies), jadi dibungkus <Suspense>.
async function ReviewMarquee() {
  const reviews = await getLatestReviews(MAX_REVIEWS);

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 px-4">
        <p className="max-w-md text-base text-muted md:text-lg">
          Belum ada ulasan. Jadilah yang pertama membagikan pengalaman Anda.
        </p>
        <Link
          href="/ulasan"
          className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
        >
          Tulis ulasan
        </Link>
      </div>
    );
  }

  if (reviews.length < MIN_FOR_MARQUEE) {
    return (
      <ul aria-label="Ulasan pelanggan" className="flex flex-wrap justify-center gap-4 px-4">
        {reviews.map((review) => (
          <TestimonialCard key={review.id} review={review} />
        ))}
      </ul>
    );
  }

  return (
    <div className="relative w-full">
      {/* Dua salinan daftar berjalan berurutan; salinan kedua hanya untuk efek bersambung
          (aria-hidden). Berhenti saat hover atau saat fokus di dalamnya. Untuk
          prefers-reduced-motion animasi mati (globals.css), salinan kedua disembunyikan,
          dan daftar bisa digulir horizontal. */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Ulasan pelanggan"
        className="group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] gap-(--gap) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:overflow-x-auto"
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className={`flex shrink-0 animate-marquee gap-(--gap) group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${
              copy === 1 ? "motion-reduce:hidden" : ""
            }`}
          >
            {reviews.map((review) => (
              <TestimonialCard key={review.id} review={review} />
            ))}
          </ul>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-linear-to-r from-paper motion-safe:sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-paper motion-safe:sm:block" />
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-paper py-16 text-ink md:py-24">
      <div className="mx-auto flex max-w-container flex-col items-center gap-8 text-center md:gap-16">
        <Reveal index={0} className="px-4">
          <SectionHeading
            title={
              <>
                Apa <span className="text-brand">Kata</span> Mereka
              </>
            }
            subtitle="Inilah pengalaman nyata dari tamu-tamu kami"
          />
        </Reveal>

        <Reveal index={1} className="w-full">
          <Suspense fallback={<div className="h-[220px] w-full" />}>
            <ReviewMarquee />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}
