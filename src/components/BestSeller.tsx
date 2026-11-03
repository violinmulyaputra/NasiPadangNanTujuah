import { createClient } from "@/lib/supabase/server";
import Reveal from "./Reveal";
import CoverFlowCarousel, { type CarouselItem } from "./CoverFlowCarousel";
import SectionHeading from "./SectionHeading";
// Komponen server: mengambil menu populer dari Supabase lalu mengirimnya ke carousel (client).
// Klien server membaca cookies(), jadi seksi ini dirender per permintaan dan dibungkus
// <Suspense> di page.tsx.
export default async function BestSeller() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("slug, name, description, category, image_url")
    .eq("is_popular", true)
    .order("sort_order");

  if (error) {
    console.error("Gagal memuat menu populer:", error.message);
    return null;
  }

  const items: CarouselItem[] = (data ?? [])
    // Menu tanpa foto dilewati: next/image butuh src
    .filter((row) => row.image_url)
    .map((row) => ({
      tag: `#${row.category}`,
      titleLine1: row.name,
      desc: row.description,
      img: row.image_url,
      ctaText: "Lihat Menu",
      ctaUrl: "/menu",
    }));

  return (
    <CoverFlowCarousel items={items} label="Menu terlaris">
      <Reveal index={0}>
        <SectionHeading
          title={
            <>
              Hidangan <span className="text-brand">Andalan</span>
            </>
          }
          subtitle="Inilah hidangan yang paling disukai oleh pelanggan kami"
        />
      </Reveal>
    </CoverFlowCarousel>
  );
}
