import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Satu bintang dengan isi sebagian: fill 0 kosong, 0.5 setengah, 1 penuh.
// Bintang kosong warna line, isi warna brand (komponen Testimoni tidak punya warna bintang).
export function StarIcon({ fill, className }: { fill: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span aria-hidden className={cn("relative inline-block size-6 shrink-0", className)}>
      <Star className="size-full text-line" fill="currentColor" strokeWidth={1.5} />
      {pct > 0 && (
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
          {/* Lebar ikon mengikuti induk penuh, bukan potongan */}
          <Star
            className="h-full w-auto max-w-none text-brand"
            style={{ aspectRatio: "1" }}
            fill="currentColor"
            strokeWidth={1.5}
          />
        </span>
      )}
    </span>
  );
}

// Lima bintang statis untuk nilai 0 sampai 5 (kelipatan 0,5).
export function StarRow({ value, className, starClassName }: { value: number; className?: string; starClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-0.5", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} fill={value - i} className={starClassName} />
      ))}
    </span>
  );
}
