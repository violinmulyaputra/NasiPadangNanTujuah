import type { ReviewField } from "@/types/review";

// Karakter kontrol selain tab, baris baru, dan carriage return.
export const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;
// Tautan: http(s)://, www., atau pola domain seperti contoh.com dan toko.co.id.
const URL_PATTERN =
  /(https?:\/\/|www\.|[a-z0-9-]+\.(com|id|net|org|co|io|me|xyz|info|biz|site|online|store|shop|link|ly|app|dev)\b)/i;

// Panjang dihitung per karakter Unicode, sama seperti char_length di PostgreSQL.
export const charLength = (s: string) => [...s].length;

export type ReviewInput = { author_name: string; rating: number; comment: string };

export type ReviewValidation =
  | { ok: true; data: ReviewInput }
  | { ok: false; fieldErrors: Partial<Record<ReviewField, string>> };

export function validateReview(raw: {
  author_name: unknown;
  rating: unknown;
  comment: unknown;
}): ReviewValidation {
  const fieldErrors: Partial<Record<ReviewField, string>> = {};

  const nameRaw = typeof raw.author_name === "string" ? raw.author_name : "";
  const commentRaw = typeof raw.comment === "string" ? raw.comment : "";
  const ratingRaw = typeof raw.rating === "string" ? raw.rating.trim() : "";

  // Nama satu baris: semua spasi beruntun jadi satu spasi.
  const author_name = nameRaw.replace(/\s+/g, " ").trim();
  // Komentar boleh beberapa paragraf: rapikan spasi per baris, maksimal satu baris kosong.
  const comment = commentRaw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  // Terima koma desimal ala Indonesia (4,5).
  const rating = ratingRaw === "" ? NaN : Number(ratingRaw.replace(",", "."));

  if (CONTROL_CHARS.test(nameRaw)) {
    fieldErrors.author_name = "Nama mengandung karakter yang tidak diizinkan.";
  } else if (charLength(author_name) < 2 || charLength(author_name) > 40) {
    fieldErrors.author_name = "Nama harus 2 sampai 40 karakter.";
  } else if (URL_PATTERN.test(author_name)) {
    fieldErrors.author_name = "Nama tidak boleh berisi tautan atau alamat situs.";
  }

  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5 || !Number.isInteger(rating * 2)) {
    fieldErrors.rating = "Pilih rating antara 0,5 sampai 5 bintang (kelipatan 0,5).";
  }

  if (CONTROL_CHARS.test(commentRaw)) {
    fieldErrors.comment = "Ulasan mengandung karakter yang tidak diizinkan.";
  } else if (charLength(comment) < 10 || charLength(comment) > 500) {
    fieldErrors.comment = "Ulasan harus 10 sampai 500 karakter.";
  } else if (URL_PATTERN.test(comment)) {
    fieldErrors.comment = "Ulasan tidak boleh berisi tautan atau alamat situs.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, data: { author_name, rating, comment } };
}
