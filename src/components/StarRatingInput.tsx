"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { StarIcon } from "./StarIcon";
import { formatRating } from "@/lib/format";

type Props = {
  value: number;
  onChange: (value: number) => void;
  name: string;
  labelId: string;
  describedBy?: string;
  invalid?: boolean;
};

function valueAt(el: HTMLElement, clientX: number) {
  const { left, width } = el.getBoundingClientRect();
  const raw = ((clientX - left) / width) * 5;
  return Math.min(5, Math.max(0.5, Math.ceil(raw * 2) / 2));
}

export default function StarRatingInput({ value, onChange, name, labelId, describedBy, invalid }: Props) {
  const starsRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!starsRef.current) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(valueAt(starsRef.current, e.clientX));
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!starsRef.current) return;
    const v = valueAt(starsRef.current, e.clientX);
    if (dragging.current) onChange(v);
    else if (e.pointerType === "mouse") setHover(v);
  }

  function endDrag() {
    dragging.current = false;
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const next: Record<string, number> = {
      ArrowRight: Math.min(5, Math.max(0.5, value + 0.5)),
      ArrowUp: Math.min(5, Math.max(0.5, value + 0.5)),
      ArrowLeft: Math.max(0.5, value - 0.5),
      ArrowDown: Math.max(0.5, value - 0.5),
      Home: 0.5,
      End: 5,
    };
    if (e.key in next) {
      e.preventDefault();
      onChange(next[e.key]);
    }
  }

  const text = (v: number) => (v ? `${formatRating(v)} dari 5` : "Belum dipilih");
  const valueText = text(value);

  return (
    <div className="flex items-center gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-valuemin={0.5}
        aria-valuemax={5}
        aria-valuenow={value || undefined}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => setHover(null)}
        className="cursor-pointer touch-pan-y rounded-lg p-1 outline-none select-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <div ref={starsRef} className="flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} fill={shown - i} className="size-9 md:size-8" />
          ))}
        </div>
      </div>
      <span aria-hidden className="min-w-[5.5rem] text-sm text-muted tabular-nums md:text-base">
        {text(shown)}
      </span>
      <input type="hidden" name={name} value={value || ""} />
    </div>
  );
}
