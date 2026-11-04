import { isValidQuantity } from "@/lib/pricing";
import { charLength, CONTROL_CHARS } from "@/lib/review-validation";
import type { OrderField, OrderItemInput } from "@/types/order";

export const MAX_ORDER_LINES = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CustomerData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: string;
  notes: string | null;
};

export type OrderValidation =
  | { ok: true; customer: CustomerData; items: OrderItemInput[] }
  | { ok: false; fieldErrors: Partial<Record<OrderField, string>> };

const str = (v: unknown) => (typeof v === "string" ? v : "");
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

export function normalizePhone(raw: string): string | null {
  const compact = raw.replace(/[\s.()-]/g, "");
  const local = compact.startsWith("+62") ? `0${compact.slice(3)}` : compact.startsWith("62") ? `0${compact.slice(2)}` : compact;
  if (!/^08\d{7,12}$/.test(local)) return null;
  return `62${local.slice(1)}`;
}

export function validateOrderInput(raw: unknown): OrderValidation {
  const input = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const fieldErrors: Partial<Record<OrderField, string>> = {};

  const nameRaw = str(input.customerName);
  const emailRaw = str(input.customerEmail);
  const phoneRaw = str(input.customerPhone);
  const addressRaw = str(input.deliveryAddress);
  const zoneRaw = str(input.deliveryZone);
  const notesRaw = str(input.notes);

  const customerName = oneLine(nameRaw);
  const customerEmail = oneLine(emailRaw).toLowerCase();
  const customerPhone = normalizePhone(phoneRaw);
  const deliveryAddress = oneLine(addressRaw);
  const deliveryZone = zoneRaw.trim();
  const notes = oneLine(notesRaw);

  if (CONTROL_CHARS.test(nameRaw)) fieldErrors.customerName = "Nama mengandung karakter yang tidak diizinkan.";
  else if (charLength(customerName) < 2 || charLength(customerName) > 60)
    fieldErrors.customerName = "Nama harus 2 sampai 60 karakter.";

  if (CONTROL_CHARS.test(emailRaw)) fieldErrors.customerEmail = "Email mengandung karakter yang tidak diizinkan.";
  else if (customerEmail === "") fieldErrors.customerEmail = "Email wajib diisi.";
  else if (charLength(customerEmail) > 120) fieldErrors.customerEmail = "Email maksimal 120 karakter.";
  else if (!EMAIL.test(customerEmail)) fieldErrors.customerEmail = "Format email tidak valid, contoh: nama@contoh.com.";

  if (CONTROL_CHARS.test(phoneRaw) || !customerPhone)
    fieldErrors.customerPhone = "Nomor telepon harus diawali 08 atau +62, berisi 9 sampai 14 angka.";

  if (CONTROL_CHARS.test(addressRaw)) fieldErrors.deliveryAddress = "Alamat mengandung karakter yang tidak diizinkan.";
  else if (charLength(deliveryAddress) < 10 || charLength(deliveryAddress) > 200)
    fieldErrors.deliveryAddress = "Alamat harus 10 sampai 200 karakter.";

  if (deliveryZone === "") fieldErrors.deliveryZone = "Pilih zona pengiriman.";

  if (CONTROL_CHARS.test(notesRaw)) fieldErrors.notes = "Catatan mengandung karakter yang tidak diizinkan.";
  else if (charLength(notes) > 200) fieldErrors.notes = "Catatan maksimal 200 karakter.";

  const items: OrderItemInput[] = [];
  if (!Array.isArray(input.items) || input.items.length === 0) {
    fieldErrors.items = "Keranjang masih kosong.";
  } else if (input.items.length > MAX_ORDER_LINES) {
    fieldErrors.items = `Maksimal ${MAX_ORDER_LINES} baris pesanan.`;
  } else {
    for (const it of input.items as unknown[]) {
      const item = (typeof it === "object" && it !== null ? it : {}) as Record<string, unknown>;
      const sel = item.selections ?? {};
      if (
        typeof item.menuItemId !== "string" || !UUID.test(item.menuItemId) ||
        typeof item.quantity !== "number" || !isValidQuantity(item.quantity) ||
        typeof sel !== "object" || sel === null || Array.isArray(sel)
      ) {
        fieldErrors.items = "Isi keranjang tidak valid. Perbarui keranjang Anda.";
        break;
      }
      items.push({ menuItemId: item.menuItemId, quantity: item.quantity, selections: sel as Record<string, string> });
    }
  }

  if (Object.keys(fieldErrors).length > 0 || !customerPhone) return { ok: false, fieldErrors };
  return {
    ok: true,
    customer: { customerName, customerEmail, customerPhone, deliveryAddress, deliveryZone, notes: notes || null },
    items,
  };
}
