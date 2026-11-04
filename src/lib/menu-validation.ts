import { CONTROL_CHARS, charLength } from "@/lib/review-validation";

// Validasi ubah menu oleh admin (F5). Modul murni: dipakai server (wajib) dan bisa dipakai klien.
// Batas sama dengan constraint menu_items di supabase/schema.sql (price > 0).
export const MENU_NAME_MIN = 2;
export const MENU_NAME_MAX = 80;
export const MENU_DESC_MIN = 10;
export const MENU_DESC_MAX = 300;
export const MENU_PRICE_MIN = 1;
export const MENU_PRICE_MAX = 1_000_000;

export type MenuEditField = "name" | "description" | "price";
export type MenuEditInput = { name: string; description: string; price: number };

export type MenuEditValidation =
  | { ok: true; data: MenuEditInput }
  | { ok: false; fieldErrors: Partial<Record<MenuEditField, string>> };

export function validateMenuEdit(raw: { name: unknown; description: unknown; price: unknown }): MenuEditValidation {
  const fieldErrors: Partial<Record<MenuEditField, string>> = {};

  // Nama satu baris: spasi beruntun jadi satu.
  const name = (typeof raw.name === "string" ? raw.name : "").replace(/\s+/g, " ").trim();
  if (charLength(name) < MENU_NAME_MIN || charLength(name) > MENU_NAME_MAX)
    fieldErrors.name = `Nama ${MENU_NAME_MIN} sampai ${MENU_NAME_MAX} karakter.`;
  else if (CONTROL_CHARS.test(name)) fieldErrors.name = "Nama berisi karakter yang tidak diizinkan.";

  const description = (typeof raw.description === "string" ? raw.description : "").trim();
  if (charLength(description) < MENU_DESC_MIN || charLength(description) > MENU_DESC_MAX)
    fieldErrors.description = `Deskripsi ${MENU_DESC_MIN} sampai ${MENU_DESC_MAX} karakter.`;
  else if (CONTROL_CHARS.test(description)) fieldErrors.description = "Deskripsi berisi karakter yang tidak diizinkan.";

  // Hanya angka bulat Rupiah: "25000". Titik, koma, minus, dan desimal ditolak.
  const priceRaw = typeof raw.price === "string" ? raw.price.trim() : "";
  const price = /^\d{1,7}$/.test(priceRaw) ? Number(priceRaw) : NaN;
  if (!Number.isInteger(price) || price < MENU_PRICE_MIN || price > MENU_PRICE_MAX)
    fieldErrors.price = "Harga berupa angka bulat Rupiah, 1 sampai 1.000.000, tanpa titik atau desimal.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, data: { name, description, price } };
}
