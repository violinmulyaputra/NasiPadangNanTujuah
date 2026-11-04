import { statusLabel } from "@/components/OrderTimeline";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        status === "menunggu_bayar" && "border-brand-strong text-brand-strong",
        status === "diproses" && "border-ink bg-ink text-paper",
        status === "diantar" && "border-ink text-ink",
        status === "selesai" && "border-line text-muted",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
