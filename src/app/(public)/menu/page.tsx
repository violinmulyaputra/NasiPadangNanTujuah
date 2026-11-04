import type { Metadata } from "next";
import { Suspense } from "react";
import MenuBrowser from "@/components/MenuBrowser";
import { getMenuItems } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Menu | Nasi Padang Nan Tujuah",
  description:
    "Lihat 44 hidangan Nasi Padang Nan Tujuah, dari rendang dan ayam pop hingga es campur, lalu pesan langsung dari dapur kami.",
};

async function MenuList() {
  const items = await getMenuItems().catch((e: unknown) => {
    console.error(e);
    return null;
  });
  if (items) return <MenuBrowser items={items} />;
  return (
    <p role="alert" className="mt-16 text-center text-muted">
      Menu belum bisa dimuat. Muat ulang halaman sebentar lagi.
    </p>
  );
}

function MenuSkeleton() {
  return (
    <div aria-hidden>
      <div className="mt-8 flex flex-wrap justify-center gap-2 md:mt-10">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-10 w-20 rounded-full bg-card" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-24 pt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="relative mx-auto h-72 w-full max-w-md rounded-card bg-card sm:max-w-none">
            <div className="absolute top-0 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface sm:size-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-(--container) px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-center font-display text-title-mobile leading-[1.15] font-bold text-balance md:text-[clamp(2rem,4vw,3.25rem)]">
          <span className="block text-ink">Menu Hidangan</span>
          <span className="block text-brand">Nasi Padang Nan Tujuah</span>
        </h1>
        <p className="mt-4 text-center text-ink">Pilih dan pesan menu favorit Anda.</p>

        <Suspense fallback={<MenuSkeleton />}>
          <MenuList />
        </Suspense>
      </div>
    </main>
  );
}
