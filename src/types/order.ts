import type { Selections } from "@/lib/menu-options";

// Nilai kolom status di tabel orders (enum order_status).
export type OrderStatus = "menunggu_bayar" | "diproses" | "diantar" | "selesai";

// Nilai kolom payment_method di tabel orders (F3).
export type PaymentMethod = "transfer" | "qris";

// uploadCount: jumlah unggah sesudah unggahan ini (maksimal 3).
export type UploadProofResult =
  | { status: "success"; uploadedAt: string; uploadCount: number }
  | { status: "error"; message: string };

// Keadaan awal PaymentPanel (kosong untuk pesanan yang baru dibuat).
export type PaymentInitialState = {
  paymentMethod: PaymentMethod | null;
  proofUploadedAt: string | null;
  proofUploadCount: number;
};

// Data pembayaran NON-pribadi untuk halaman publik (F3, F4). Tanpa nama, email,
// telepon, alamat, atau jalur berkas bukti.
export type OrderPaymentStatus = {
  code: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod | null;
  proofUploaded: boolean;
  proofUploadedAt: string | null;
  proofUploadCount: number;
};

// Baris delivery_zones yang aktif.
export type DeliveryZone = { code: string; name: string; fee: number };

// Satu baris keranjang yang dikirim klien. Harga TIDAK ikut: server menghitung ulang.
export type OrderItemInput = { menuItemId: string; selections: Selections; quantity: number };

// Input createOrder dari form checkout (objek JSON).
export type OrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: string;
  notes: string;
  items: OrderItemInput[];
  // Kolom jebakan (honeypot), harus kosong.
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

// Ringkasan satu baris pesanan, dihitung server (untuk layar sukses).
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

// Data halaman lacak (F4). HANYA data non-pribadi: tanpa nama, email, telepon,
// alamat, catatan, jalur bukti bayar, atau id internal.
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
  // Untuk batas ganti bukti 3 kali di PaymentPanel.
  proofUploadCount: number;
  items: OrderSummaryLine[];
};

// Filter daftar pesanan admin (F5): empat status, ditambah "verifikasi" (menunggu_bayar
// dengan bukti terkirim) dan "hari-ini" (dibuat hari ini, Asia/Jakarta).
export type AdminOrderFilter = "semua" | OrderStatus | "verifikasi" | "hari-ini";

// Satu baris daftar pesanan admin. Hanya untuk halaman admin.
export type AdminOrderRow = {
  code: string;
  createdAt: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  proofUploaded: boolean;
};

// Detail pesanan untuk admin, termasuk data pemesan. JANGAN dipakai di halaman publik.
// proofUrl: signed URL berumur pendek, bukan jalur berkas.
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
