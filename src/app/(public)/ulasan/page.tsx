import type { Metadata } from "next";
import { Suspense } from "react";
import Reveal from "@/components/Reveal";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import ReviewSummaryCard from "@/components/ReviewSummaryCard";
import SectionHeading from "@/components/SectionHeading";
import { getReviewStats } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Ulasan | Nasi Padang Nan Tujuah",
  description:
    "Baca ulasan pelanggan Nasi Padang Nan Tujuah dan bagikan pengalaman bersantap Anda, dari rendang hingga es campur.",
};

// Ringkasan dibaca per permintaan (klien Supabase membaca cookies), jadi di dalam <Suspense>.
async function Summary() {
  const stats = await getReviewStats();
  return <ReviewSummaryCard rating={stats.average_rating} reviewCount={stats.review_count} />;
}

export default function ReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-(--container) flex-1 px-4 md:px-8">
      <section className="py-16 md:py-24">
        <h1 className="text-center font-display text-title-mobile leading-[1.15] font-bold text-ink md:text-[clamp(2rem,4vw,3.25rem)]">
          Ulasan <span className="text-brand">Pelanggan</span>
        </h1>
        <div className="mt-8 md:mt-12">
          <Suspense fallback={<div className="mx-auto h-[164px] w-full max-w-md rounded-card bg-card md:h-[188px]" />}>
            <Summary />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="bagikan" className="py-16 md:py-24">
        <Reveal index={0} className="text-center">
          <SectionHeading
            id="bagikan"
            title={
              <>
                <span className="text-brand">Bagikan</span> Pengalaman Anda!
              </>
            }
          />
        </Reveal>
        <Reveal index={1} className="mt-8 md:mt-12">
          <ReviewForm />
        </Reveal>
      </section>

      <section aria-labelledby="terkini" className="py-16 md:py-24">
        <Reveal index={0} className="text-center">
          <SectionHeading
            id="terkini"
            title={
              <>
                Ulasan <span className="text-brand">Terkini</span>
              </>
            }
          />
        </Reveal>
        <div className="mt-8 md:mt-12">
          <Suspense fallback={<div className="mx-auto h-96 w-full max-w-4xl rounded-card bg-card" />}>
            <ReviewList />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
