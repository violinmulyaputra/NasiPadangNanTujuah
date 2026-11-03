import { MessagesSquare, Package, Users, type LucideIcon } from "lucide-react";

// Nomor restoran di footer, juga tujuan tautan wa.me halaman lacak (F4). Tanpa WhatsApp API.
export const RESTAURANT_PHONE = "6281200000707";
export const RESTAURANT_PHONE_DISPLAY = "0812-0000-0707";

// Data contoh fiktif. Nomor telepon tampil sebagai teks biasa, bukan tautan tel:
// (nomor contoh bisa saja milik orang sungguhan).
type Branch = { address: string; phone: string };
type City = { name: string; branches: Branch[] };

export type ContactCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  cities: City[];
  hoursLabel: string;
  hours: string;
};

const cities = (phones: [string, string, string, string]): City[] => [
  {
    name: "Semarang",
    branches: [
      { address: "Jl. Ahmad Yani No. 115", phone: phones[0] },
      { address: "Jl. Pandanaran No. 107", phone: phones[1] },
    ],
  },
  {
    name: "Yogyakarta",
    branches: [
      { address: "Jl. Jend. Sudirman No. 42", phone: phones[2] },
      { address: "Jl. Kaliurang No. 5", phone: phones[3] },
    ],
  },
];

export const contactCards: ContactCard[] = [
  {
    icon: MessagesSquare,
    title: "Informasi, Saran, dan Pertanyaan",
    description:
      "Hubungi kami untuk mengetahui jam buka, layanan restoran, maupun informasi seputar Nasi Padang Nan Tujuah. Kami juga menerima saran dan masukan untuk meningkatkan kenyamanan Anda.",
    cities: cities(["0812 0000 1101", "0812 0000 1102", "0812 0000 1103", "0812 0000 1104"]),
    hoursLabel: "Jam Layanan",
    hours: "Setiap hari • 09.00-17.00 WIB",
  },
  {
    icon: Users,
    title: "Reservasi Meja dan Kunjungan Rombongan",
    description:
      "Rencanakan santapan bersama keluarga, sahabat, atau rekan kerja di Nasi Padang Nan Tujuah. Saat melakukan reservasi, informasikan tanggal kedatangan, waktu, dan jumlah tamu.",
    cities: cities(["0813 0000 2201", "0813 0000 2202", "0813 0000 2203", "0813 0000 2204"]),
    hoursLabel: "Jam Operasional",
    hours: "Setiap hari • 09.00–22.00 WIB",
  },
  {
    icon: Package,
    title: "Pesanan Acara dan Kerja Sama",
    description:
      "Lengkapi acara Anda dengan hidangan Nasi Padang Nan Tujuah. Hubungi tim kami untuk pemesanan dalam jumlah besar, katering, kebutuhan konsumsi perusahaan, serta peluang kerja sama merek dan media.",
    cities: cities(["0815 0000 3301", "0813 0000 3302", "0813 0000 3303", "0813 0000 3304"]),
    hoursLabel: "Jam Layanan",
    hours: "Setiap hari • 07.00–18.00 WIB",
  },
];
