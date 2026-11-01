import Link from "next/link";
import SpinPlate from "./SpinPlate";

// Komponen server: judul dan teks tampil langsung tanpa menunggu animasi.
export default function Hero() {
  return (
    // Selalu dua kolom. Di HP kolom teks berakhir di 62% layar dan piring 42vw langsung di
    // sebelahnya (tanpa gap), jadi yang keluar di kanan hanya 4vw, kurang dari 10% diameter.
    // overflow-x-clip di sini supaya bagian itu tidak memunculkan scroll horizontal.
    // Kolom teks tidak pernah lebih sempit dari baris terpanjang judul (min-content).
    <section className="mx-auto grid max-w-(--container) grid-cols-[minmax(min-content,calc(62vw_-_24px))_minmax(0,1fr)] items-center overflow-x-clip py-12 pl-6 md:grid-cols-[minmax(min-content,1fr)_minmax(0,1fr)] md:gap-12 md:px-8 md:py-24">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Selalu 4 baris. Baris 3 selebar 12,21em: di 4.5vw ia muat di kolom 62vw - 24px mulai
            360 px. Di bawah 340 px hanya baris 3 yang boleh membungkus. */}
        <h1 className="font-display text-[clamp(1rem,4.5vw,1.5rem)] leading-[1.15] font-bold text-ink md:text-[clamp(2rem,4vw,3.25rem)]">
          <span className="block whitespace-nowrap">Dengan beberapa</span>{" "}
          <span className="block whitespace-nowrap">
            kali <span className="text-brand">ketukan,</span>
          </span>{" "}
          <span className="block min-[340px]:whitespace-nowrap">Nasi Padang Nan Tujuah</span>{" "}
          <span className="block whitespace-nowrap">
            siap <span className="text-brand">diantarkan!</span>
          </span>
        </h1>
        {/* pr-3 di HP: kolom menempel ke piring, paragraf diberi ruang agar tidak menyentuhnya */}
        <p className="max-w-[32rem] pr-3 text-sm text-muted md:pr-0 md:text-lg">
          Sekarang, Anda bisa menikmati cita rasa khas Minangkabau yang otentik ala Nasi Padang Nan
          Tujuah di rumah Anda masing-masing.
        </p>
        <Link
          href="/menu"
          className="w-fit rounded-full bg-brand px-5 py-3 text-sm font-semibold whitespace-nowrap text-paper hover:bg-ink md:px-8 md:py-4 md:text-base"
        >
          Pesan Sekarang
        </Link>
      </div>

      <div className="flex md:justify-end">
        <div className="w-[clamp(140px,42vw,260px)] shrink-0 md:w-full md:max-w-[480px]">
          <SpinPlate
            src="/images/hero/nasi-padang.webp"
            alt="Sepiring nasi Padang dengan rendang, telur dadar, daun singkong, dan sambal lado"
          />
        </div>
      </div>
    </section>
  );
}
