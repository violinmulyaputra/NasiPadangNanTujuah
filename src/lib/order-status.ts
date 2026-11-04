import type { OrderStatus } from "@/types/order";

export const ORDER_STATUSES: OrderStatus[] = ["menunggu_bayar", "diproses", "diantar", "selesai"];

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  ORDER_STATUSES.includes(value as OrderStatus);

export const isValidTransition = (from: OrderStatus, to: OrderStatus) =>
  Math.abs(ORDER_STATUSES.indexOf(from) - ORDER_STATUSES.indexOf(to)) === 1;

export const nextStatus = (status: OrderStatus): OrderStatus | null =>
  ORDER_STATUSES[ORDER_STATUSES.indexOf(status) + 1] ?? null;

export const previousStatus = (status: OrderStatus): OrderStatus | null =>
  ORDER_STATUSES[ORDER_STATUSES.indexOf(status) - 1] ?? null;
