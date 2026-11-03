import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SpotlightCard from "@/components/SpotlightCard";
import { contactCards, type ContactCard } from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "Kontak | Nasi Padang Nan Tujuah",
  description:
    "Hubungi Nasi Padang Nan Tujuah di Semarang dan Yogyakarta untuk informasi, reservasi meja, pesanan acara, dan kerja sama.",
};

// Foto hero 16:9 (1920x1080), memudar sendiri ke paper di sisi kanan dan bawah.
const HERO_PHOTO = "/images/kontak/hero.webp";

const Rule = () => <div aria-hidden className="my-6 h-px w-14 bg-ink" />;

function CardBody({ card }: { card: ContactCard }) {
  const Icon = card.icon;
  return (
    <SpotlightCard className="h-full px-6 pt-10 pb-6 md:pt-12">
      {/* Ikon menimpa tepi atas kartu, sejajar padding kiri */}
      <span
        aria-hidden
        className="absolute top-0 left-6 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-brand md:size-14"
      >
        <Icon className="size-6 text-paper" />
      </span>
      <h2 className="text-[1.0625rem] leading-snug font-semibold text-brand-strong md:text-lg">{card.title}</h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink">{card.description}</p>
      <Rule />
      <div className="flex flex-col gap-4">
        {card.cities.map((city) => (
          <div key={city.name}>
            <h3 className="text-[0.9375rem] font-semibold text-ink">{city.name}</h3>
            <div className="mt-2 flex flex-col gap-3">
              {city.branches.map((branch) => (
                <address key={branch.address} className="text-sm leading-relaxed text-ink not-italic">
                  {branch.address}
                  <br />
                  Telepon: {branch.phone}
                </address>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Rule />
      <p className="text-[0.9375rem] font-semibold text-ink">{card.hoursLabel}</p>
      <p className="mt-1 text-sm text-ink">{card.hours}</p>
    </SpotlightCard>
  );
}

export default function ContactPage() {
  return (
    <main className="flex-1">
      {/* Band judul: foto 16:9 sebagai latar penuh, judul rata kanan menimpa foto */}
      <section className="relative flex min-h-60 items-center overflow-hidden md:min-h-80">
        {/* Foto dekoratif tanpa animasi (elemen LCP); posisi atas agar lampu gantung terlihat */}
        <Image
          src={HERO_PHOTO}
          alt=""
          aria-hidden
          fill
          preload
          sizes="100vw"
          className="object-cover object-top"
        />
        {/* Scrim paper di bawah teks, kepekatan terendah yang lolos pengukuran kontras (lihat
            DESIGN.md): yang menentukan kata merah "Hubungi". HP rata 30% karena teks selebar
            layar; mulai md 0% di kiri naik ke 20% di tengah, jadi sisi kiri foto tetap jelas. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-paper/30 md:bg-transparent md:bg-linear-to-r md:from-paper/0 md:via-paper/20 md:via-50% md:to-paper/20"
        />
        {/* Band pendek memotong tepi bawah foto yang sudah pudar, jadi dipudarkan ke paper */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-paper/0 to-paper" />
        <div className="relative z-10 mx-auto w-full max-w-(--container) px-4 py-12 text-right md:px-8">
          <h1 className="font-display text-title-mobile leading-[1.15] font-bold text-balance text-ink md:text-[clamp(2rem,4vw,3.25rem)]">
            <span className="text-brand">Hubungi</span> Kami
          </h1>
          <p className="mt-3 text-base text-ink md:text-lg">Hubungi Nasi Padang Nan Tujuah sesuai kebutuhan Anda.</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-(--container) px-4 py-16 md:px-8 md:py-24">
        {/* Jarak baris 48 px memberi ruang ikon yang menimpa tepi atas kartu.
            isolate: z-10 kartu yang di-hover tetap di dalam grid, tidak menimpa navbar. */}
        <ul className="isolate mx-auto grid max-w-xl grid-cols-1 items-stretch gap-y-12 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {contactCards.map((card, i) => (
            <li key={card.title}>
              <Reveal index={i} className="h-full">
                <CardBody card={card} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
