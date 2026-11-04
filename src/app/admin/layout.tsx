import type { Metadata } from "next";

// Semua /admin/* (termasuk login) tidak diindeks. Proxy juga mengirim X-Robots-Tag.
// Halaman admin membaca cookie sesi, jadi selalu dirender per permintaan (tidak di-cache).
export const metadata: Metadata = {
  title: { default: "Admin | Nasi Padang Nan Tujuah", template: "%s | Admin Nasi Padang Nan Tujuah" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
