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

const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const rupiahFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export const formatRupiah = (value: number) => `Rp${rupiahFormat.format(value)}`;

export const formatRating = (value: number) => ratingFormat.format(value);

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export const formatDateTime = (iso: string) => `${dateTimeFormat.format(new Date(iso))} WIB`;
