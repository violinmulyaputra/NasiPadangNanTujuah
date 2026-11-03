// Kenali jenis gambar dari magic bytes (isi berkas), bukan dari nama atau Content-Type.
// Hanya JPEG, PNG, dan WebP yang diterima sebagai bukti bayar.

export type ImageType = { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) =>
  bytes.length >= offset + sig.length && sig.every((b, i) => bytes[offset + i] === b);

export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  // "RIFF" <4 byte ukuran> "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8))
    return { mime: "image/webp", ext: "webp" };
  return null;
}
