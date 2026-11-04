"use client";

import { useState, useTransition } from "react";
import { statusLabel } from "@/components/OrderTimeline";
import { setOrderPaid, updateOrderStatus } from "@/lib/actions/admin";
import { nextStatus, previousStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { AdminActionResult, OrderStatus } from "@/types/order";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none";
const secondary = cn(
  "min-h-11 rounded-full border border-ink bg-paper px-5 text-sm font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong disabled:cursor-wait disabled:opacity-60",
  focusRing,
);

type Props = { code: string; status: OrderStatus; hasProof: boolean; isPaid: boolean };

export default function AdminOrderActions({ code, status, hasProof, isPaid }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const next = nextStatus(status);
  const previous = previousStatus(status);

  const run = (question: string, action: () => Promise<AdminActionResult>) => {
    if (!window.confirm(question)) return;
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await action());
      } catch {
        setResult({ status: "error", message: "Koneksi bermasalah. Coba lagi." });
      }
    });
  };

  const moveTo = (target: OrderStatus, isCorrection: boolean) => {
    const warning =
      status === "menunggu_bayar" && !hasProof ? "\n\nPerhatian: pesanan ini BELUM punya bukti bayar." : "";
    const verb = isCorrection ? "Kembalikan status (koreksi)" : "Pindahkan status";
    run(`${verb} pesanan ${code} dari ${statusLabel(status)} ke ${statusLabel(target)}?${warning}`, () =>
      updateOrderStatus(code, target),
    );
  };

  return (
    <div>
      {status === "menunggu_bayar" && !hasProof && (
        <p className="mb-3 text-sm font-semibold text-brand-strong">Belum ada bukti bayar untuk pesanan ini.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {next && (
          <button
            type="button"
            disabled={pending}
            onClick={() => moveTo(next, false)}
            className={cn(
              "min-h-11 rounded-full bg-brand-strong px-5 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60",
              focusRing,
            )}
          >
            Pindahkan ke {statusLabel(next)}
          </button>
        )}
        {previous && (
          <button type="button" disabled={pending} onClick={() => moveTo(previous, true)} className={secondary}>
            Kembalikan ke {statusLabel(previous)}
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              isPaid ? `Batalkan tanda lunas pesanan ${code}?` : `Tandai pesanan ${code} sudah lunas?`,
              () => setOrderPaid(code, !isPaid),
            )
          }
          className={secondary}
        >
          {isPaid ? "Batalkan tanda lunas" : "Tandai lunas"}
        </button>
      </div>
      <p
        aria-live="polite"
        className={cn(
          "mt-3 min-h-5 text-sm font-semibold",
          result?.status === "error" ? "text-brand-strong" : "text-ink",
        )}
      >
        {pending ? "Menyimpan..." : result?.message}
      </p>
    </div>
  );
}
