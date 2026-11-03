"use client";

// Diadaptasi dari komponen 21st.dev "card-2" (ReviewSummaryCard). Animasi asli dipertahankan
// (kartu naik dan memudar, bintang bertingkat, angka menghitung naik 1,5 detik), tetapi dipicu
// saat kartu masuk layar (sekali), bukan saat mount. Token proyek menggantikan token shadcn,
// format angka id-ID, teks bahasa Indonesia, dan bintang mendukung setengah.
import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { StarIcon } from "./StarIcon";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

const countFormat = new Intl.NumberFormat("id-ID");

function ratingLabel(rating: number) {
  if (rating >= 4.5) return "Sangat Baik";
  if (rating >= 3.5) return "Baik";
  if (rating >= 2.5) return "Cukup";
  return "Kurang";
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const starVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.2 + i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

const instant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

type Props = { rating: number; reviewCount: number; className?: string };

export default function ReviewSummaryCard({ rating, reviewCount, className }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const empty = reviewCount === 0;
  // Bulatkan ke satu desimal agar bintang, angka, dan predikat konsisten.
  const shown = Math.round(rating * 10) / 10;

  // Angka awal sudah final (HTML server); saat masuk layar diulang dari 0 bila gerak diizinkan.
  useEffect(() => {
    if (!inView || reduce || empty) return;
    const ratingControl = animate(0, shown, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        if (ratingRef.current) ratingRef.current.textContent = formatRating(value);
      },
    });
    const countControl = animate(0, reviewCount, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        if (countRef.current) countRef.current.textContent = countFormat.format(Math.round(value));
      },
    });
    return () => {
      ratingControl.stop();
      countControl.stop();
    };
  }, [inView, reduce, empty, shown, reviewCount]);

  const state = inView ? "visible" : "hidden";

  return (
    <motion.div
      ref={cardRef}
      data-reveal
      variants={reduce ? instant : cardVariants}
      initial="hidden"
      animate={state}
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-card border border-line bg-card p-6 text-center md:p-8",
        className,
      )}
    >
      {/* Varian bintang mengikuti state kartu induk */}
      <div className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span key={i} custom={i} variants={reduce ? instant : starVariants}>
            <StarIcon fill={empty ? 0 : shown - i} className="size-7 md:size-8" />
          </motion.span>
        ))}
      </div>

      {empty ? (
        <p className="mt-4 text-xl font-semibold text-ink md:text-2xl">Belum ada ulasan</p>
      ) : (
        <>
          {/* Angka beranimasi disembunyikan dari pembaca layar; kalimat di bawahnya statis */}
          <p aria-hidden className="mt-4 font-display text-4xl font-bold tracking-tight text-ink tabular-nums">
            <span ref={ratingRef}>{formatRating(shown)}</span>
            <span className="text-2xl font-semibold md:text-3xl">
              {" "}(<span ref={countRef}>{countFormat.format(reviewCount)}</span> Ulasan)
            </span>
          </p>
          <p className="mt-2 text-sm text-muted md:text-base">
            {ratingLabel(shown)}: Dinilai {formatRating(shown)} dari {countFormat.format(reviewCount)} Ulasan.
          </p>
        </>
      )}
    </motion.div>
  );
}
