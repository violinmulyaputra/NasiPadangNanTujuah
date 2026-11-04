import { cn } from "@/lib/utils";

// Cahaya krem buram di belakang elemen saat hover (foto cerita Tentang, kartu ulasan).
// Induk wajib "group relative". Hanya (hover: hover) dan (pointer: fine), sama dengan utilitas hover-lift.
// Kepekatan lewat alpha warna (80 persen), opacity lapisan hanya 0 atau 1; blur statis 32 px.
// Inset 16 px karena scale 1.04 foto menutup sekitar 8 px tiap sisi.
export default function HoverGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-4 rounded-card bg-cream-glow/80 opacity-0 blur-[32px] transition-opacity duration-300 ease-out [@media(pointer:fine)]:group-hover:opacity-100",
        className,
      )}
    />
  );
}
