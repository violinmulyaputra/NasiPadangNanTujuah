"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";

const norm = (d: number) => ((d + 540) % 360) - 180; // sudut ke rentang -180..180

export default function SpinPlate({ src, alt }: { src: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const rotate = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef({ active: false, angle: 0, t: 0, v: 0 });
  const reduce = useReducedMotion();

  // Putaran dari scroll (1 putaran per 1440 px) dijumlahkan dengan putaran drag
  const { scrollY } = useScroll();
  const scrollRotate = useTransform(scrollY, (y) => y * 0.25);
  const totalRotate = useTransform([rotate, scrollRotate], ([a, b]: number[]) => a + b);

  // Putaran masuk saat halaman dibuka (dilewati jika pengguna mematikan animasi)
  useEffect(() => {
    if (reduce) return;
    rotate.set(-120);
    controls.current = animate(rotate, 0, { duration: 1.2, ease: "easeOut" });
    return () => controls.current?.stop();
  }, [reduce, rotate]);

  const angleOf = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return (
      (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) /
      Math.PI
    );
  };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    controls.current?.stop();
    drag.current = { active: true, angle: angleOf(e), t: performance.now(), v: 0 };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const a = angleOf(e);
    const d = norm(a - drag.current.angle);
    const now = performance.now();
    drag.current.v = (d / Math.max(now - drag.current.t, 1)) * 1000; // derajat/detik
    drag.current.angle = a;
    drag.current.t = now;
    rotate.set(rotate.get() + d);
  };

  const onUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const v = Math.max(-1440, Math.min(1440, drag.current.v));
    // meluncur pelan lalu berhenti
    controls.current = animate(rotate, rotate.get() + v * 0.6, { duration: 1.4, ease: "easeOut" });
  };

  // Bingkai tidak ikut berputar dan dipotong bulat: kotak yang diputar melebar sampai √2 kali
  // dan memicu scroll horizontal. Piringnya bulat, jadi yang terpotong hanya sudut transparan.
  return (
    <div
      ref={box}
      role="img"
      aria-label={alt}
      className="relative aspect-square w-full max-w-[480px] overflow-clip rounded-full"
    >
      <motion.div
        style={{ rotate: reduce ? rotate : totalRotate, touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
      >
        <Image
          src={src}
          alt=""
          fill
          priority
          draggable={false}
          sizes="(min-width: 1024px) 480px, 80vw"
          className="pointer-events-none object-contain"
        />
      </motion.div>
    </div>
  );
}
