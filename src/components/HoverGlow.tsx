import { cn } from "@/lib/utils";

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
