import "server-only";
import { randomInt } from "node:crypto";

// Tanpa karakter yang mudah tertukar: 0, O, 1, I, L. 31 karakter, 8 posisi
// (sekitar 2^39 kombinasi), dari CSPRNG jadi tidak bisa ditebak.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 8;

// Sama dengan constraint orders_code_format di database.
export const ORDER_CODE_PATTERN = /^NPT-[2-9A-HJKMNP-Z]{8}$/;

// Contoh: "NPT-7KQ2XH9M". Bentrok dengan kode lama ditangani pemanggil (coba ulang).
export function generateOrderCode(): string {
  let code = "NPT-";
  // randomInt tanpa bias modulo.
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}
