"use client";

import { Check, Minus, Plus, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { formatRupiah } from "@/lib/format";
import { defaultSelections, getOptionGroups, type Selections } from "@/lib/menu-options";
import { calculateLineTotal, calculateUnitPrice, MAX_QUANTITY, MIN_QUANTITY } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";
import MenuPhoto from "./MenuPhoto";

type Props = {
  item: MenuItem | null;
  openKey: number;
  onSubmit: (item: MenuItem, selections: Selections, quantity: number) => void;
  onClose: () => void;
};

const stepperClass =
  "inline-flex size-11 items-center justify-center rounded-full border-2 border-brand-strong text-brand-strong transition-colors duration-150 hover:bg-brand-strong hover:text-paper disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent";

export default function MenuDetailDialog({ item, openKey, onSubmit, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const shownKey = useRef(0);

  // Activity (cacheComponents) menjalankan ulang efek saat halaman tampil lagi; buka hanya untuk klik baru
  useEffect(() => {
    if (openKey === shownKey.current) return;
    shownKey.current = openKey;
    ref.current?.showModal();
  }, [openKey]);

  // tutup saat halaman disembunyikan Activity agar kembali ke /menu selalu tertutup
  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  const hasGroups = item ? getOptionGroups(item).length > 0 : false;

  return (
    <dialog
      ref={ref}
      aria-label={item?.name}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      className={cn(
        "m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-clip rounded-card bg-card p-0 text-ink backdrop:bg-ink/50",
        "scale-96 opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-250 ease-out open:scale-100 open:opacity-100 starting:open:scale-96 starting:open:opacity-0 motion-reduce:transition-none",
        hasGroups ? "max-w-[760px]" : "max-w-md",
      )}
    >
      {item && (
        <DialogBody
          key={openKey}
          item={item}
          hasGroups={hasGroups}
          onClose={() => ref.current?.close()}
          onSubmit={(selections, quantity) => {
            onSubmit(item, selections, quantity);
            ref.current?.close();
          }}
        />
      )}
    </dialog>
  );
}

function DialogBody({
  item,
  hasGroups,
  onClose,
  onSubmit,
}: {
  item: MenuItem;
  hasGroups: boolean;
  onClose: () => void;
  onSubmit: (selections: Selections, quantity: number) => void;
}) {
  const groups = getOptionGroups(item);
  const [selections, setSelections] = useState(() => defaultSelections(groups));
  const [quantity, setQuantity] = useState(1);
  const unitPrice = calculateUnitPrice(item.price, groups, selections);
  const total = calculateLineTotal(unitPrice, quantity);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(selections, quantity);
  };

  return (
    <form onSubmit={submit} className="relative flex max-h-[90dvh] flex-col">
      <button
        type="button"
        autoFocus
        aria-label="Tutup"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-paper text-ink shadow-card-side hover:text-brand-strong"
      >
        <X aria-hidden className="size-5" />
      </button>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          hasGroups && "md:grid md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:overflow-hidden",
        )}
      >
        <div className={cn("flex flex-col p-6 pt-14", hasGroups ? "md:min-h-0 md:overflow-y-auto md:p-8 md:pr-4" : "md:p-8")}>
          <MenuPhoto
            src={item.image_url}
            alt={item.name}
            sizes="(min-width: 768px) 280px, 160px"
            eager
            className="mx-auto size-40 rounded-card md:size-[min(280px,26dvh)]"
          />
          <h2 className="mt-6 text-center text-lg font-semibold text-brand-strong uppercase">{item.name}</h2>
          <span aria-hidden className="mx-auto mt-3 h-0.5 w-14 bg-brand" />
          <p className="mt-4 text-sm text-ink">{item.description}</p>
          <p className="mt-4">
            <span className="font-bold">{formatRupiah(item.price)}</span>
            <span className="text-xs text-muted">/porsi</span>
          </p>

          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              disabled={quantity <= MIN_QUANTITY}
              onClick={() => setQuantity((q) => q - 1)}
              className={stepperClass}
            >
              <Minus aria-hidden className="size-5" />
            </button>
            <output aria-label="Jumlah" className="min-w-8 text-center text-lg font-semibold">
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Tambah jumlah"
              disabled={quantity >= MAX_QUANTITY}
              onClick={() => setQuantity((q) => q + 1)}
              className={stepperClass}
            >
              <Plus aria-hidden className="size-5" />
            </button>
          </div>
        </div>

        {hasGroups && (
          <div className="divide-y divide-line px-6 pb-6 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:p-8 md:pl-4">
            {groups.map((group) => (
              <fieldset key={group.id} className="py-4 first:pt-0 last:pb-0">
                <legend className="float-left mb-2 w-full text-xs font-semibold tracking-wider text-brand-strong uppercase">
                  {group.label}
                </legend>
                <div className="clear-left">
                  {group.choices.map((choice) => (
                    <label key={choice.id} className="relative flex min-h-11 cursor-pointer items-center justify-between gap-4 py-1">
                      <span>
                        <span className="block text-sm">{choice.label}</span>
                        <span className="block text-xs text-muted">{formatRupiah(choice.price)}</span>
                      </span>
                      <input
                        type="radio"
                        name={group.id}
                        value={choice.id}
                        checked={selections[group.id] === choice.id}
                        onChange={() => setSelections((s) => ({ ...s, [group.id]: choice.id }))}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded border-2 border-line text-transparent peer-checked:border-brand-strong peer-checked:bg-brand-strong peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 bg-brand/10 px-6 py-4 md:px-8">
        <p aria-live="polite" className="text-2xl font-bold">
          <span className="sr-only">Total </span>
          {formatRupiah(total)}
        </p>
        <button
          type="submit"
          className="min-h-11 rounded-full bg-brand-strong px-8 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-brand-dark"
        >
          Tambah
        </button>
      </div>
    </form>
  );
}
