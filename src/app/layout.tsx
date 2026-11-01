import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Font variabel: semua bobot tersedia. Fraunces hanya normal, judul tidak boleh miring.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: "normal",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nasi Padang Nan Tujuah",
  description: "Pesan nasi Padang langsung dari dapur kami, diantar ke rumah Anda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
