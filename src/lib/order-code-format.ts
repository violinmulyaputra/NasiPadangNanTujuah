export const ORDER_CODE_PATTERN = /^NPT-[2-9A-HJKMNP-Z]{8}$/;

export const normalizeOrderCode = (raw: unknown) => {
  const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  return ORDER_CODE_PATTERN.test(code) ? code : null;
};

export const TRACK_NOT_FOUND = "Pesanan tidak ditemukan. Periksa kembali kode Anda.";
export const TRACK_RATE_LIMITED = "Terlalu sering mencari. Coba lagi nanti.";
