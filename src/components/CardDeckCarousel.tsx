"use client";

// Diadaptasi dari komponen 21st.dev "Card Deck Carousel": foto bertumpuk seperti setumpuk cetakan.
// Kartu teratas bisa dilempar (seret lalu lepas), lalu masuk lagi ke dasar tumpukan. Tombol dan
// panah keyboard melakukan lemparan yang sama; "sebelumnya" menarik kartu terbawah ke atas.
// CSS, transisi, bayangan, dan gerak asli dipertahankan (lihat "Pengecualian komponen 21st.dev"
// di docs/DESIGN.md). Penyesuaian: next/image, warna dan font lewat token, teks Indonesia,
// tanpa lanskap lukisan bawaan, dan tanpa putar otomatis.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type Slide = {
  image: string;
  title: string;
  caption: string;
  alt: string;
};

export type CardDeckCarouselProps = {
  slides: Slide[];
  /** CSS aspect-ratio kartu */
  aspect?: string;
  /** Kemiringan terbesar (derajat) kartu di belakang */
  scatter?: number;
  /** Atribut sizes untuk next/image, sesuai lebar kartu (--cd-w) */
  sizes: string;
  className?: string;
  ariaLabel: string;
};

function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

/** Pose diam kartu pada kedalaman `depth`. Hanya empat teratas yang terlihat. */
function deckPose(depth: number, tilt: number, reduce = false) {
  const d = Math.min(depth, 3);
  return {
    y: d ? -d * 16 : 0,
    scale: 1 - d * 0.055,
    rot: depth === 0 || reduce ? 0 : tilt,
    opacity: depth > 3 ? 0 : 1,
    shade: 1 - d * 0.07,
  };
}

/** Kemiringan tetap yang tampak acak per kartu, dalam [-max, max] derajat. */
function tiltFor(i: number, max: number): number {
  const u = (((i + 1) * 2654435761) >>> 0) / 4294967296;
  return (u * 2 - 1) * max;
}

/** Apakah seretan berakhir sebagai lemparan? dx dalam px, vx dalam px/ms, w = lebar kartu. */
function isThrow(dx: number, vx: number, w: number): boolean {
  return Math.abs(dx) > w * 0.28 || (Math.abs(vx) > 0.55 && Math.abs(dx) > 24);
}

// CSS bawaan komponen. Diubah hanya: warna dan font lewat token, tinggi mengikuti isi (bukan
// 100svh), judul boleh membungkus agar tidak terpotong, keterangan memakai --color-muted
// supaya kontrasnya cukup, hover dan fokus panah merah brand (bukan hitam) seperti panah Best
// Seller, dan penghitung halaman dihapus (nomor foto tetap dibacakan lewat
// live region).
const CD_CSS = [
  ".cd-root{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(28px,5vh,52px);overflow:hidden;background:var(--cd-bg);color:var(--cd-ink);outline:none;padding:24px 16px;box-sizing:border-box}",
  ".cd-root:focus-visible{box-shadow:inset 0 0 0 2px var(--cd-ink)}",
  ".cd-deck{position:relative;width:var(--cd-w);aspect-ratio:var(--cd-aspect);touch-action:pan-y}",
  ".cd-card{position:absolute;inset:0;border-radius:18px;overflow:hidden;background:var(--color-line);box-shadow:0 1px 2px rgba(0,0,0,.08),0 30px 60px -30px rgba(0,0,0,.45);transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease,filter .4s ease;will-change:transform}",
  ".cd-card[data-top='1']{cursor:grab}",
  ".cd-card[data-drag='1']{cursor:grabbing;transition:none}",
  ".cd-card[data-fly='1']{transition:transform .45s cubic-bezier(.3,.5,.3,1),opacity .45s ease}",
  ".cd-card[data-snap='1']{transition:none}",
  ".cd-card img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none;user-select:none}",
  ".cd-meta{display:flex;align-items:center;gap:clamp(16px,3vw,32px);width:100%;max-width:560px}",
  ".cd-cap{flex:1;min-width:0;overflow:hidden;padding-bottom:.2em}",
  ".cd-cap>*{display:block;animation:cd-in .6s cubic-bezier(.2,.8,.2,1) both}",
  ".cd-title{font:600 clamp(18px,2.2vw,24px)/1.15 var(--font-display);letter-spacing:-.01em}",
  ".cd-sub{margin-top:4px;font:400 13px/1.4 var(--font-sans);color:var(--color-muted);animation-delay:.05s}",
  ".cd-btn{appearance:none;border:1px solid var(--cd-line);background:transparent;color:inherit;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease,color .15s ease}",
  ".cd-btn:hover,.cd-btn:focus-visible{background:var(--color-brand);border-color:var(--color-brand);color:var(--color-paper)}",
  ".cd-btn:focus-visible{outline:2px solid var(--cd-ink);outline-offset:2px}",
  ".cd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
  "@keyframes cd-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}",
  "@media (prefers-reduced-motion:reduce){.cd-card,.cd-card[data-fly='1']{transition:opacity .3s ease}.cd-cap>*{animation:none}}",
].join("\n");

type Override = { i: number; x: number; y: number; r: number; mode: "drag" | "fly" | "snap" };

export default function CardDeckCarousel({
  slides,
  aspect = "3 / 4",
  scatter = 6,
  sizes,
  className,
  ariaLabel,
}: CardDeckCarouselProps) {
  const n = slides.length;
  const [top, setTop] = useState(0);
  const [over, setOver] = useState<Override | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  // Salinan `top` untuk handler; diperbarui setelah render (aturan react-hooks/refs)
  const topRef = useRef(0);
  useEffect(() => {
    topRef.current = top;
  }, [top]);
  // Bernilai null saat render server, jadi hasil hydration tetap sama
  const reduce = useReducedMotion() ?? false;

  const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms);

  // Lempar kartu teratas ke arah (dirX, dirY), lalu selipkan ke dasar tumpukan.
  const throwTop = useCallback(
    (dirX: number, fromX = 0, fromY = 0, dirY = 0) => {
      const w = deckRef.current?.offsetWidth || 400;
      if (busy.current || n < 2) return;
      busy.current = true;
      const i = topRef.current;
      const sx = dirX >= 0 ? 1 : -1;
      setOver({ i, x: fromX + sx * w * 1.25, y: fromY + dirY * 0.4 - 40, r: sx * 16, mode: "fly" });
      later(
        () => {
          setOver(null);
          setTop((t) => wrap(t + 1, n));
          busy.current = false;
        },
        reduce ? 200 : 430,
      );
    },
    [n, reduce],
  );

  // Tarik kartu terbawah kembali ke atas dari kiri.
  const pullBack = useCallback(() => {
    const w = deckRef.current?.offsetWidth || 400;
    if (busy.current || n < 2) return;
    busy.current = true;
    const i = wrap(topRef.current - 1, n);
    setOver({ i, x: -w * 1.25, y: -40, r: -16, mode: "snap" });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOver({ i, x: 0, y: 0, r: 0, mode: "fly" });
        later(
          () => {
            setOver(null);
            setTop(i);
            busy.current = false;
          },
          reduce ? 200 : 450,
        );
      }),
    );
  }, [n, reduce]);

  // Menyeret kartu teratas
  const drag = useRef<null | { x: number; y: number; lx: number; lt: number; vx: number }>(null);
  const onDown = (e: React.PointerEvent) => {
    if (busy.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: e.timeStamp, vx: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.vx = 0.8 * ((e.clientX - d.lx) / dt) + 0.2 * d.vx;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    setOver({ i: topRef.current, x: dx, y: dy, r: reduce ? 0 : dx * 0.05, mode: "drag" });
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const w = deckRef.current?.offsetWidth || 400;
    if (isThrow(dx, d.vx, w)) throwTop(dx, dx, dy, dy);
    else setOver(null);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") throwTop(1);
    else if (e.key === "ArrowLeft") pullBack();
    else return;
    e.preventDefault();
  };

  const s = slides[top];

  return (
    <div
      className={["cd-root", className].filter(Boolean).join(" ")}
      style={{
        ["--cd-aspect" as string]: aspect,
        ["--cd-bg" as string]: "var(--color-paper)",
        ["--cd-ink" as string]: "var(--color-ink)",
        ["--cd-line" as string]: "color-mix(in srgb, var(--cd-ink) 18%, transparent)",
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <style>{CD_CSS}</style>
      <div ref={deckRef} className="cd-deck">
        {slides.map((sl, i) => {
          const depth = wrap(i - top, n);
          const p = deckPose(depth, tiltFor(i, scatter), reduce);
          const o = over && over.i === i ? over : null;
          const isTop = depth === 0;
          const transform = o
            ? "translate(" + o.x + "px," + o.y + "px) rotate(" + o.r + "deg)"
            : "translateY(" + p.y + "px) scale(" + p.scale + ") rotate(" + p.rot.toFixed(2) + "deg)";
          return (
            <div
              key={sl.image}
              className="cd-card"
              data-top={isTop ? "1" : "0"}
              data-drag={o?.mode === "drag" ? "1" : "0"}
              data-fly={o?.mode === "fly" ? "1" : "0"}
              data-snap={o?.mode === "snap" ? "1" : "0"}
              style={{
                transform,
                zIndex: o ? n + 1 : n - depth,
                opacity: o ? 1 : p.opacity,
                filter: o || isTop ? "none" : "brightness(" + p.shade + ")",
              }}
              aria-hidden={isTop ? undefined : true}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
            >
              <Image src={sl.image} alt={isTop ? sl.alt : ""} fill sizes={sizes} draggable={false} />
            </div>
          );
        })}
      </div>
      <div className="cd-meta">
        <button type="button" className="cd-btn" aria-label="Foto sebelumnya" onClick={pullBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <div className="cd-cap" key={top} aria-hidden="true">
          <span className="cd-title">{s.title}</span>
          <span className="cd-sub">{s.caption}</span>
        </div>
        <button type="button" className="cd-btn" aria-label="Foto berikutnya" onClick={() => throwTop(1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="cd-sr" aria-live="polite">
        {"Foto " + (top + 1) + " dari " + n + ": " + s.title + ". " + s.caption}
      </div>
    </div>
  );
}
