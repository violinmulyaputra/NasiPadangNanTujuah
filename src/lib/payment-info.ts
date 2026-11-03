// Data pembayaran CONTOH untuk restoran fiktif (proyek portofolio).
// Rekening dan QRIS ini tidak sungguhan; tidak ada uang yang berpindah.

export const BANK_TRANSFER = {
  bankName: "Bank Jono",
  accountNumber: "0000 1234 5678",
  accountHolder: "Nasi Padang Nan Tujuah",
} as const;

// Gambar QRIS contoh dengan QR diburamkan, sengaja tidak bisa dipindai.
export const QRIS_IMAGE = "/images/pembayaran/qris.webp";

// Sama dengan file_size_limit bucket payment-proofs.
export const MAX_PROOF_BYTES = 2 * 1024 * 1024;
export const MAX_PROOF_UPLOADS = 3;
