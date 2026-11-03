"use client";

// Diadaptasi dari komponen 21st.dev "3D coverflow carousel". Gerak coverflow 3D, blur pada panah,
// bayangan, dan transisi bawaan dipertahankan. Warnanya diganti tema terang proyek (latar paper,
// kartu surface, aksen merah brand), lihat "Pengecualian komponen 21st.dev" di docs/DESIGN.md.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

// Ikon inline (tanpa dependensi tambahan)
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
  items: CarouselItem[];
  /** Judul dan subjudul seksi, tampil di atas panggung kartu */
  children?: ReactNode;
  label: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

// Tombol panah: paper dengan garis line, hover dan fokus brand (sama dengan panah Visit Us). Blur bawaan dipertahankan.
const arrowClass =
  "absolute top-[250px] z-40 flex size-[46px] -translate-y-1/2 md:top-[272px] cursor-pointer items-center justify-center rounded-full border border-line bg-paper text-ink shadow-control backdrop-blur-[8px] transition-all duration-150 hover:border-brand hover:bg-brand hover:text-paper focus-visible:border-brand focus-visible:bg-brand focus-visible:text-paper motion-reduce:transition-none";

export default function CoverFlowCarousel({
  items,
  children,
  label,
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const touchStartX = useRef(0);
  const reduce = useReducedMotion();
  const total = items.length;
  // Putar otomatis berhenti saat kursor atau fokus keyboard ada di carousel, dan mati
  // sepenuhnya untuk prefers-reduced-motion.
  const playing = autoplay && !reduce && !isHovered && !hasFocus && total > 1;
  const transition = (value: string) => (reduce ? "none" : value);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [playing, autoplayDelay, nextSlide]);

  // Panah kiri/kanan hanya saat fokus ada di dalam carousel, bukan di seluruh halaman
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (items.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative w-full flex items-center justify-center overflow-hidden bg-paper py-16 md:py-24 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHasFocus(false);
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {children && <div className="mb-8 text-center">{children}</div>}

        {/* Panggung, panah, dan titik muncul bersama saat digulir. Pembungkus selalu relative,
            jadi posisi panah tidak melompat saat transform Reveal berakhir. */}
        <Reveal index={1} className="relative w-full">
          {/* Panggung coverflow 3D. Jarak geser kartu samping (--cf-1, --cf-2) mengikuti lebar
              kartu: 290 px di HP, 350 px mulai md. Di HP kartu 290 x 480 px: foto persegi 240 px (83% lebar
              kartu) di atas, teks lebih kecil di bawah. Di 1280 px tampil tiga kartu penuh dan dua
              kartu terluar terpotong di tepi. */}
          <div
            className="relative w-full h-[500px] flex justify-center items-center mb-8 [--cf-1:250px] [--cf-2:450px] md:h-[544px] md:[--cf-1:300px] md:[--cf-2:590px]"
            style={{ perspective: "1400px" }}
            aria-live={playing ? "off" : "polite"}
          >
            {items.map((item, idx) => {
              const offset = (idx - currentIndex + total) % total;

              let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
              let opacity = 0;
              let zIndex = 0;
              let filter = "blur(2px)";
              let isCenter = false;

              if (offset === 0) {
                isCenter = true;
                transform = "translateX(0px) scale(1) rotateY(0deg)";
                opacity = 1;
                zIndex = 30;
                filter = "none";
              } else if (offset === 1) {
                transform = "translateX(var(--cf-1)) scale(0.84) rotateY(-24deg)";
                opacity = 1;
                zIndex = 20;
                filter = "none";
              } else if (offset === 2) {
                transform = "translateX(var(--cf-2)) scale(0.68) rotateY(-38deg)";
                opacity = 1;
                zIndex = 10;
                filter = "blur(1px)";
              } else if (offset === total - 1) {
                transform = "translateX(calc(-1 * var(--cf-1))) scale(0.84) rotateY(24deg)";
                opacity = 1;
                zIndex = 20;
                filter = "none";
              } else if (offset === total - 2) {
                transform = "translateX(calc(-1 * var(--cf-2))) scale(0.68) rotateY(38deg)";
                opacity = 1;
                zIndex = 10;
                filter = "blur(1px)";
              }

              return (
                <div
                  key={item.img}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} dari ${total}: ${item.titleLine1}`}
                  aria-hidden={!isCenter}
                  onClick={() => !isCenter && goToSlide(idx)}
                  className={`absolute h-[480px] w-[290px] overflow-hidden rounded-card border border-line bg-surface/45 backdrop-blur-md md:h-[525px] md:w-[350px] ${
                    isCenter ? "shadow-card cursor-default" : "shadow-card-side cursor-pointer"
                  }`}
                  style={{
                    transform,
                    opacity,
                    zIndex,
                    filter,
                    transformOrigin: "center center",
                    transition: transition("all 800ms cubic-bezier(0.25, 1, 0.5, 1)"),
                  }}
                >
                  {/* Isi kartu (inert saat bukan kartu tengah: tidak bisa difokus). Foto di atas,
                      teks di bawah tanpa saling menimpa, jadi tidak perlu lapisan gelap. */}
                  <div
                    inert={!isCenter}
                    className="relative flex h-full w-full flex-col text-center"
                    style={{ padding: "20px 18px 22px" }}
                  >
                    {/* Tag */}
                    <span
                      className="absolute right-[22px] top-5 z-10 text-muted"
                      style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em" }}
                    >
                      {item.tag}
                    </span>

                    {/* Foto: WebP transparan, object-contain agar piring tidak terpotong */}
                    <div className="relative mx-auto mt-4 aspect-square w-[240px] shrink-0 md:mx-0 md:mt-5 md:aspect-auto md:min-h-0 md:w-auto md:flex-1">
                      <Image
                        src={item.img}
                        alt={item.titleLine1}
                        fill
                        sizes="(min-width: 768px) 350px, 240px"
                        className="drop-shadow-plate"
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    {/* Isi utama */}
                    <div
                      className="mt-auto"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "3px",
                        paddingTop: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      <h3
                        className="text-[1.25rem] text-ink md:text-[1.65rem]"
                        style={{
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          margin: 0,
                          lineHeight: 1.1,
                        }}
                      >
                        {item.titleLine1}
                      </h3>

                      {item.titleLine2 && (
                        <span
                          className="text-ink"
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            lineHeight: 1.2,
                          }}
                        >
                          {item.titleLine2}
                        </span>
                      )}

                      <div
                        className="bg-brand"
                        style={{ width: "34px", height: "2px", borderRadius: "2px", margin: "5px auto 4px" }}
                      />

                      {item.desc && (
                        <p
                          className="text-[0.8125rem] text-muted md:text-[0.82rem]"
                          style={{
                            maxWidth: "280px",
                            margin: "0 0 10px",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.desc}
                        </p>
                      )}

                      <Link
                        href={item.ctaUrl || "/menu"}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand h-10 px-[18px] text-[0.75rem] text-paper md:h-auto md:py-[7px] md:text-[0.72rem] no-underline transition-colors duration-200 hover:bg-brand-dark motion-reduce:transition-none"
                        style={{
                          fontWeight: 800,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span>{item.ctaText || "Lihat Menu"}</span>
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </div>

                  {/* Kartu samping diredupkan dengan lapisan krem, bukan gelap */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 bg-paper"
                    style={{
                      opacity: isCenter ? 0 : 0.55,
                      transition: transition("opacity 500ms ease"),
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Tombol panah */}
          <button type="button" onClick={prevSlide} aria-label="Menu sebelumnya" className={`${arrowClass} left-2`}>
            <ChevronLeftIcon />
          </button>

          <button type="button" onClick={nextSlide} aria-label="Menu berikutnya" className={`${arrowClass} right-2`}>
            <ChevronRightIcon />
          </button>

          {/* Titik halaman */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}>
            {items.map((item, idx) => (
              <button
                type="button"
                key={item.img}
                onClick={() => goToSlide(idx)}
                aria-label={`Tampilkan ${item.titleLine1}`}
                aria-current={idx === currentIndex}
                className={idx === currentIndex ? "bg-brand" : "bg-line"}
                style={{
                  height: "8px",
                  width: idx === currentIndex ? "28px" : "8px",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  transition: transition("all 300ms ease"),
                }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
