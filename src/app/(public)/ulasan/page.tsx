import type { Metadata } from "next";
import Image from "next/image";
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

const HERO_PHOTO = "/images/ulasan/hero.webp";

async function Summary() {
  const stats = await getReviewStats();
  return <ReviewSummaryCard align="left" rating={stats.average_rating} reviewCount={stats.review_count} />;
}

export default function ReviewsPage() {
  return (
    <main className="flex-1">
      <section className="relative flex min-h-[380px] items-center overflow-hidden md:min-h-[460px]">
        <Image
          src={HERO_PHOTO}
          alt=""
          aria-hidden
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-paper/25 via-paper/25 via-60% to-paper/15 md:bg-none"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-linear-to-b from-paper/0 to-paper lg:block" />
        <div className="relative z-10 mx-auto w-full max-w-(--container) px-4 py-12 md:px-8 md:py-16">
          <h1 className="font-display text-title-mobile leading-[1.15] font-bold text-balance text-ink md:text-[clamp(2rem,4vw,3.25rem)]">
            Ulasan <span className="text-brand">Pelanggan</span>
          </h1>
          <div className="mt-6 max-w-[85%] sm:max-w-md md:mt-12">
            <Suspense fallback={<div className="h-[148px] w-full rounded-card bg-card md:h-[188px]" />}>
              <Summary />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-(--container) px-4 md:px-8">
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
      </div>
    </main>
  );
}
