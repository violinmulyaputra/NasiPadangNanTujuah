const MAX_SIDE = 1600;
const QUALITY = 0.8;

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

export async function compressImage(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob = await toBlob(canvas, "image/webp");
    if (blob?.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg");
    if (!blob || blob.type !== "image/jpeg" && blob.type !== "image/webp") return null;
    return new File([blob], blob.type === "image/webp" ? "bukti.webp" : "bukti.jpg", { type: blob.type });
  } catch {
    return null;
  }
}
