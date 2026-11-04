import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin | Nasi Padang Nan Tujuah", template: "%s | Admin Nasi Padang Nan Tujuah" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
