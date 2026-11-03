// Format tampilan bersama (Rupiah, tanggal, rating). Aman dipakai di server dan client.

const ratingFormat = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

// 4.5 -> "4,5"
export const formatRating = (value: number) => ratingFormat.format(value);

// "2026-11-02T11:30:00Z" -> "2 November 2026"
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
