import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

export const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "menunggu_bayar", label: "Menunggu pembayaran" },
  { status: "diproses", label: "Diproses" },
  { status: "diantar", label: "Diantar" },
  { status: "selesai", label: "Selesai" },
];

export const statusLabel = (status: OrderStatus) => ORDER_STEPS.find((s) => s.status === status)?.label ?? status;

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = ORDER_STEPS.findIndex((s) => s.status === status);

  return (
    <div>
      <p className="sr-only">Status saat ini: {statusLabel(status)}</p>
      <ol className="flex flex-col md:flex-row">
        {ORDER_STEPS.map((step, i) => {
          const done = i < current || (i === current && status === "selesai");
          const isCurrent = i === current;
          return (
            <li
              key={step.status}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex gap-4 pb-6 last:pb-0 md:flex-1 md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center"
            >
              {i < ORDER_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-10 bottom-0 left-[19px] w-0.5 md:top-[19px] md:right-[calc(-50%+20px)] md:bottom-auto md:left-[calc(50%+20px)] md:h-0.5 md:w-auto",
                    i < current ? "bg-ink" : "bg-line",
                  )}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold",
                  done && "border-ink bg-ink text-paper",
                  isCurrent && !done && "border-brand-strong bg-brand-strong text-paper ring-4 ring-brand/20",
                  !done && !isCurrent && "border-line bg-paper text-muted",
                )}
              >
                {done ? <Check className="size-5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="flex flex-col pt-2 md:pt-0">
                <span className={cn("font-semibold", !done && !isCurrent && "text-muted")}>{step.label}</span>
                {isCurrent && <span className="text-sm font-semibold text-brand-strong">Saat ini</span>}
                {done && !isCurrent && <span className="sr-only">(sudah lewat)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
