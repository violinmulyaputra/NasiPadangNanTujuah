import Link from "next/link";
import SpinPlate from "./SpinPlate";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-(--container) grid-cols-[minmax(0,calc(60vw_-_24px))_minmax(0,1fr)] grid-rows-[1fr_auto_auto_1fr] items-center gap-x-[2vw] overflow-x-clip py-12 pl-6 [grid-template-areas:'._plate'_'title_plate'_'text_plate'_'._plate'] md:grid-cols-[minmax(min-content,1fr)_minmax(0,1fr)] md:gap-x-12 md:px-8 md:py-24">
      <h1 className="font-display text-title-mobile leading-[1.15] font-bold text-pretty text-ink [grid-area:title] md:text-[clamp(2rem,4vw,3.25rem)]">
        <span className="md:block md:whitespace-nowrap">Dengan beberapa</span>{" "}
        <span className="md:block md:whitespace-nowrap">
          kali <span className="text-brand">ketukan,</span>
        </span>{" "}
        <span className="md:block md:whitespace-nowrap">Nasi Padang Nan Tujuah</span>{" "}
        <span className="md:block md:whitespace-nowrap">
          siap <span className="text-brand">diantarkan!</span>
        </span>
      </h1>

      <div className="mt-4 flex flex-col gap-6 [grid-area:text] md:mt-6">
        <p className="max-w-[32rem] text-sm text-muted md:text-lg">
          Sekarang, Anda bisa menikmati cita rasa khas Minangkabau yang otentik ala Nasi Padang Nan
          Tujuah di rumah Anda masing-masing.
        </p>
        <Link
          href="/menu"
          className="w-fit rounded-full bg-brand px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-paper hover:bg-ink md:px-8 md:py-4 md:text-base"
        >
          Pesan Sekarang
        </Link>
      </div>

      <div className="flex [grid-area:plate] md:justify-end">
        <div className="w-[48vw] shrink-0 md:w-full md:max-w-[480px]">
          <SpinPlate
            src="/images/hero/nasi-padang.webp"
            alt="Sepiring nasi Padang dengan rendang, telur dadar, daun singkong, dan sambal lado"
          />
        </div>
      </div>
    </section>
  );
}
