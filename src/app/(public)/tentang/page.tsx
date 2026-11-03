import type { Metadata } from "next";
import Image from "next/image";
import HoverGlow from "@/components/HoverGlow";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ValuesAccordion from "@/components/ValuesAccordion";

// Foto cerita 3:2 (1200x800).
const STORY_PHOTO_1 = "/images/tentang/story-1.webp";
const STORY_PHOTO_2 = "/images/tentang/story-2.webp";
// Rasio tampil sama di semua lebar layar.
const PHOTO_ASPECT = "aspect-[3/2]";
// Lebar tampil: 4/9 kolom di HP, 320 px mulai md, 400 px mulai lg.
const PHOTO_SIZES = "(min-width: 1024px) 400px, (min-width: 768px) 320px, calc((100vw - 48px) * 4 / 9)";

export const metadata: Metadata = {
  title: "Tentang | Nasi Padang Nan Tujuah",
  description:
    "Kisah Nasi Padang Nan Tujuah, dari perjalanan belajar masakan Minangkabau di Sumatera Barat hingga hadir di Semarang.",
};

// HP: foto 4fr, teks 5fr. Mulai md tiap baris satu kelompok di tengah: foto lebar tetap dan teks
// maksimal 30rem. Kedua baris memakai lebar trek yang sama, jadi tepi kiri dan kanannya sejajar.
const rowClass = "grid items-center gap-4 md:justify-center md:gap-12 lg:gap-16";
const row1Cols =
  "grid-cols-[4fr_5fr] md:grid-cols-[320px_minmax(0,30rem)] lg:grid-cols-[400px_minmax(0,30rem)]";
const row2Cols =
  "grid-cols-[5fr_4fr] md:grid-cols-[minmax(0,30rem)_320px] lg:grid-cols-[minmax(0,30rem)_400px]";
// relative: teks dilukis di atas cahaya hover foto di sebelahnya.
const textClass = "relative text-sm leading-relaxed text-ink md:text-lg lg:text-xl";
const accentClass = "font-semibold text-brand-strong";

// Hover hanya di perangkat dengan kursor: foto membesar dan cahaya krem muncul di belakangnya.
// Yang dianimasikan hanya opacity dan scale.
function StoryPhoto({ src, alt, preload }: { src: string; alt: string; preload?: boolean }) {
  return (
    <div className="group relative">
      <HoverGlow />
      <div
        className={`relative overflow-hidden rounded-card transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.04] ${PHOTO_ASPECT}`}
      >
        <Image src={src} alt={alt} fill sizes={PHOTO_SIZES} preload={preload} className="object-cover object-center" />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-(--container) flex-1 px-4 md:px-8">
      <section className="py-16 md:py-24">
        <h1 className="text-center font-display text-title-mobile leading-[1.15] font-bold text-ink md:text-[clamp(2rem,4vw,3.25rem)]">
          <span className="block">Tentang</span>
          <span className="block text-brand">Nasi Padang Nan Tujuah</span>
        </h1>

        <div className="mt-12 flex flex-col gap-12 md:mt-16 md:gap-16">
          {/* Baris 1: foto kiri, teks kanan */}
          <div className={`${rowClass} ${row1Cols}`}>
            <Reveal index={0}>
              <StoryPhoto
                src={STORY_PHOTO_1}
                alt="Aneka lauk Padang dalam piring putih, di antaranya rendang, ayam pop, gulai, dendeng balado, dan ikan goreng"
                preload
              />
            </Reveal>
            <Reveal index={1}>
              <p className={textClass}>
                Nasi Padang Nan Tujuah berawal dari{" "}
                <strong className={accentClass}>kecintaan seorang anak</strong> yang berasal dari Semarang
                terhadap kekayaan cita rasa <strong className={accentClass}>masakan Minangkabau</strong>.
                Kecintaan tersebut mendorongnya melakukan perjalanan ke{" "}
                <strong className={accentClass}>Sumatera Barat</strong> untuk mempelajari resep dan teknik
                memasak langsung dari para juru masak setempat.
              </p>
            </Reveal>
          </div>

          {/* Baris 2: teks kiri, foto kanan (juga di HP) */}
          <div className={`${rowClass} ${row2Cols}`}>
            <Reveal index={0} className="order-2">
              <StoryPhoto
                src={STORY_PHOTO_2}
                alt="Bangunan restoran Nasi Padang Nan Tujuah beratap gonjong khas Minangkabau dengan lampu menyala saat senja dan hujan"
              />
            </Reveal>
            <Reveal index={1}>
              <p className={textClass}>
                Sekembalinya ke Semarang, ia mengembangkan resep yang dipelajari dengan tetap{" "}
                <strong className={accentClass}>mempertahankan karakter autentiknya</strong>. Dari
                perjalanan inilah, Nan Tujuah hadir sebagai restoran yang menyajikan{" "}
                <strong className={accentClass}>masakan Padang</strong> dalam suasana nyaman dengan
                pelayanan hangat.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="nilai" className="py-16 md:py-24">
        <Reveal index={0} className="text-center">
          <SectionHeading
            id="nilai"
            title={
              <>
                <span className="text-brand">7 Nilai</span> Nasi Padang Nan Tujuah
              </>
            }
          />
        </Reveal>
        {/* Modal dirender lewat portal ke body, jadi tidak terkena transform Reveal */}
        <Reveal index={1} className="mt-8 md:mt-12">
          <ValuesAccordion />
        </Reveal>
      </section>
    </main>
  );
}
