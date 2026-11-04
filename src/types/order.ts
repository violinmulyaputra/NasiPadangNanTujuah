import type { Selections } from "@/lib/menu-options";

export type OrderStatus = "menunggu_bayar" | "diproses" | "diantar" | "selesai";

export type PaymentMethod = "transfer" | "qris";

export type UploadProofResult =
  | { status: "success"; uploadedAt: string; uploadCount: number }
  | { status: "error"; message: string };

export type PaymentInitialState = {
  paymentMethod: PaymentMethod | null;
  proofUploadedAt: string | null;
  proofUploadCount: number;
};

export type OrderPaymentStatus = {
  code: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod | null;
  proofUploaded: boolean;
  proofUploadedAt: string | null;
  proofUploadCount: number;
};

export type DeliveryZone = { code: string; name: string; fee: number };

export type OrderItemInput = { menuItemId: string; selections: Selections; quantity: number };

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: string;
  notes: string;
  items: OrderItemInput[];
  website?: string;
};

export type OrderField =
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "deliveryAddress"
  | "deliveryZone"
  | "notes"
  | "items";

export type OrderSummaryLine = { name: string; optionLabels: string[]; quantity: number; lineTotal: number };

export type CreateOrderResult =
  | {
      status: "success";
      code: string;
      items: OrderSummaryLine[];
      subtotal: number;
      deliveryFee: number;
      total: number;
    }
  | { status: "error"; message: string; fieldErrors: Partial<Record<OrderField, string>> };

export type OrderTracking = {
  code: string;
  status: OrderStatus;
  createdAt: string;
  zoneName: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  proofUploadedAt: string | null;
  proofUploadCount: number;
  items: OrderSummaryLine[];
};

export type AdminOrderFilter = "semua" | OrderStatus | "verifikasi" | "hari-ini";

export type AdminOrderRow = {
  code: string;
  createdAt: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  proofUploaded: boolean;
};

export type AdminOrderDetail = Omit<OrderTracking, "items"> & {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string | null;
  isPaid: boolean;
  paidAt: string | null;
  updatedAt: string;
  proofUrl: string | null;
  items: (OrderSummaryLine & { unitPrice: number })[];
};

export type AdminActionResult = { status: "success" | "error"; message: string };
