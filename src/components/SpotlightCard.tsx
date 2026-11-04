"use client";

import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { className?: string; children: ReactNode };

function onPointerMove(e: PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "mouse") return;
  const card = e.currentTarget;
  const { left, top, width } = card.getBoundingClientRect();
  const scale = width / card.offsetWidth;
  card.style.setProperty("--mx", `${(e.clientX - left) / scale}px`);
  card.style.setProperty("--my", `${(e.clientY - top) / scale}px`);
}

export default function SpotlightCard({ className, children }: Props) {
  return (
    <div
      onPointerMove={onPointerMove}
      className={cn("spotlight-card hover-lift relative rounded-card border border-line bg-card hover:z-10", className)}
    >
      {children}
    </div>
  );
}
