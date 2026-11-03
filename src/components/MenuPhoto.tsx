import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
};

// Foto piring menu (kartu dan pop-up). Tanpa image_url: piring netral, bukan gambar rusak.
export default function MenuPhoto({ src, alt, sizes, eager, className }: Props) {
  if (!src) {
    return (
      <div
        // alt kosong = dekoratif (mis. di keranjang, nama sudah tertulis di sebelahnya)
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        className={cn("flex items-center justify-center rounded-full border border-line bg-surface text-muted", className)}
      >
        <UtensilsCrossed aria-hidden className="size-1/3" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={320}
      height={320}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className={cn("object-contain drop-shadow-plate", className)}
    />
  );
}
