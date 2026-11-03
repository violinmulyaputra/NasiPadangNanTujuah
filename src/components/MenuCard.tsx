import { Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";
import HoverGlow from "./HoverGlow";
import MenuPhoto from "./MenuPhoto";

type Props = {
  item: MenuItem;
  eager: boolean;
  onAdd: (item: MenuItem, trigger: HTMLButtonElement) => void;
};

// Kartu menu: foto piring menimpa tepi atas kartu (garis tengah foto = tepi atas kartu).
export default function MenuCard({ item, eager, onAdd }: Props) {
  const soldOut = !item.is_available;

  return (
    // Hover sama dengan kartu Ulasan Terkini: HoverGlow + hover-lift (kecuali menu habis).
    // Scale dipasang di dalam pembungkus Reveal, jadi tidak bentrok dengan transform Reveal;
    // foto ikut membesar karena berada di dalam elemen yang di-scale.
    <div className="group relative mx-auto h-full w-full max-w-md sm:max-w-none">
      {/* -top-20: cahaya juga mencakup foto yang menimpa tepi atas kartu (56 sampai 64 px) */}
      {!soldOut && <HoverGlow className="-top-20 -z-10" />}
      <article
        className={cn(
          "relative flex h-full flex-col rounded-card bg-card px-6 pt-16 pb-6 sm:pt-[72px]",
          !soldOut && "hover-lift",
        )}
      >
      <MenuPhoto
        src={item.image_url}
        alt={item.name}
        sizes="(min-width: 640px) 128px, 112px"
        eager={eager}
        className={cn(
          "absolute top-0 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 sm:size-32",
          soldOut && "opacity-50",
        )}
      />
      {soldOut && (
        <span className="absolute top-3 right-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">
          Habis
        </span>
      )}

      <div className={cn("flex flex-1 flex-col", soldOut && "opacity-70")}>
        <h3 className="text-center font-semibold text-brand-strong uppercase">{item.name}</h3>
        <span aria-hidden className="mx-auto mt-3 h-0.5 w-14 bg-brand" />
        <p className="mt-4 line-clamp-3 text-sm text-ink">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p>
            <span className="font-bold text-ink">{formatRupiah(item.price)}</span>
            <span className="text-xs text-muted">/porsi</span>
          </p>
          <button
            type="button"
            disabled={soldOut}
            aria-label={soldOut ? `${item.name} sedang habis` : `Tambah ${item.name} ke keranjang`}
            aria-haspopup="dialog"
            onClick={(e: MouseEvent<HTMLButtonElement>) => onAdd(item, e.currentTarget)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-strong text-paper transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            <Plus aria-hidden className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      </article>
    </div>
  );
}
