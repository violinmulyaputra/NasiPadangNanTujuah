import type { OptionGroup, Selections } from "@/lib/menu-options";

// Perhitungan harga, modul murni yang dipakai bersama klien dan server.
// PENTING: total di klien (keranjang) hanya untuk tampilan. Saat checkout (F2)
// SERVER wajib menghitung ulang memakai modul ini dari harga menu_items di
// database dan selections yang sudah lolos validateSelections, bukan dari
// unitPrice atau total kiriman klien.

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 20;

export const isValidQuantity = (quantity: number) =>
  Number.isInteger(quantity) && quantity >= MIN_QUANTITY && quantity <= MAX_QUANTITY;

// Untuk input di klien: bulatkan dan jepit ke 1 sampai 20.
export const clampQuantity = (quantity: number) =>
  Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(quantity) || MIN_QUANTITY));

// Harga satu porsi = harga dasar + harga pilihan terpilih (selections sudah divalidasi).
export function calculateUnitPrice(basePrice: number, groups: OptionGroup[], selections: Selections): number {
  return groups.reduce((sum, group) => {
    const choice = group.choices.find((c) => c.id === selections[group.id]);
    if (!choice) throw new Error(`Pilihan untuk ${group.label} tidak valid.`);
    return sum + choice.price;
  }, basePrice);
}

export function calculateLineTotal(unitPrice: number, quantity: number): number {
  if (!isValidQuantity(quantity)) {
    throw new RangeError(`Jumlah harus ${MIN_QUANTITY} sampai ${MAX_QUANTITY}.`);
  }
  return unitPrice * quantity;
}
