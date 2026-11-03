// Bentuk kode pesanan, aman dipakai di server dan client (tanpa crypto).
// Sama dengan constraint orders_code_format di database dan alfabet order-code.ts.
export const ORDER_CODE_PATTERN = /^NPT-[2-9A-HJKMNP-Z]{8}$/;

// " npt-7kq2xh9m " -> "NPT-7KQ2XH9M"; null bila bentuknya salah.
export const normalizeOrderCode = (raw: unknown) => {
  const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  return ORDER_CODE_PATTERN.test(code) ? code : null;
};

// Satu pesan untuk kode salah bentuk dan kode tidak ada, supaya keduanya tidak bisa dibedakan.
export const TRACK_NOT_FOUND = "Pesanan tidak ditemukan. Periksa kembali kode Anda.";
export const TRACK_RATE_LIMITED = "Terlalu sering mencari. Coba lagi nanti.";
