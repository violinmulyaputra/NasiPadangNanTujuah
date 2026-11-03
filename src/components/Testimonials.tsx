// Diadaptasi dari komponen 21st.dev "Testimonials with Marquee". Gradien lembut kartu, border-t,
// avatar shadcn, dan gerak marquee dipertahankan (lihat "Pengecualian komponen 21st.dev" di
// docs/DESIGN.md). Komponen server: marquee murni CSS (animate-marquee dari globals.css).
import { Avatar, AvatarFallback } from "./Avatar";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

// Ulasan contoh fiktif (bukan pelanggan sungguhan)
const testimonials = [
  {
    name: "Rina Aprilia",
    city: "Semarang",
    text: "Paling suka rendangnya, empuk dan bumbunya berasa banget. Pas sampai juga masih hangat. Nasinya pas, nggak benyek.",
  },
  {
    name: "Bagas Pratama",
    city: "Yogyakarta",
    text: "Awalnya kirain ayam popnya bakal hambar, ternyata gurih. Dicocol pake sambal oranyenya juga bikin tambah enak, pedasnya masih aman sih buat saya.",
  },
  {
    name: "Dewi Lestari",
    city: "Semarang",
    text: "Udang baladonya enak, ada manis-manisnya sedikit. Kentangnya juga empuk sampai ikut saya habisin. Bakal pesan lagi sih.",
  },
  {
    name: "Fajar Nugroho",
    city: "Yogyakarta",
    text: "Ayam baladonya lumayan pedas buat saya, tapi malah bikin nambah nasi. Sambalnya banyak, nggak cuma di atas ayam.",
  },
  {
    name: "Maya Sari",
    city: "Semarang",
    text: "Habis makan ayam balado dilanjut minum es campur, beuh beneran cocok banget. Suka banget sama alpukat dan kelapa mudanya. Mantap banget bikin kenyang.",
  },
  {
    name: "Hendra Wijaya",
    city: "Yogyakarta",
    text: "Pesan kakap balado buat makan di rumah. Dapet sambel banyak banget, ikannya juga gurih. Untung kemasannya rapat, jadi minyak sambalnya nggak bocor.",
  },
];

type Testimonial = (typeof testimonials)[number];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function TestimonialCard({ name, city, text }: Testimonial) {
  return (
    // Lebar tetap agar semua kartu sejajar; tinggi ikut kartu tertinggi (flex stretch).
    <li className="flex w-[272px] shrink-0 flex-col rounded-lg border-t border-line bg-linear-to-b from-surface/50 to-surface/10 p-4 text-start transition-colors duration-300 hover:from-surface/60 hover:to-surface/20 md:w-[320px] md:p-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="text-sm font-semibold">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-base leading-none font-semibold text-ink">{name}</h3>
          <p className="text-sm text-muted">{city}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted md:text-base">{text}</p>
    </li>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-paper py-16 text-ink md:py-24">
      <div className="mx-auto flex max-w-container flex-col items-center gap-8 text-center md:gap-16">
        <Reveal index={0} className="px-4">
          <SectionHeading
            title={
              <>
                Apa <span className="text-brand">Kata</span> Mereka
              </>
            }
            subtitle="Inilah pengalaman nyata dari tamu-tamu kami"
          />
        </Reveal>

        {/* Dua salinan daftar berjalan berurutan; salinan kedua hanya untuk efek bersambung
            (aria-hidden). Berhenti saat hover atau saat fokus di dalamnya. Untuk
            prefers-reduced-motion animasi mati (globals.css), salinan kedua disembunyikan,
            dan daftar bisa digulir horizontal. */}
        <Reveal index={1} className="relative w-full">
          <div
            tabIndex={0}
            role="region"
            aria-label="Ulasan pelanggan"
            className="group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] gap-(--gap) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:overflow-x-auto"
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className={`flex shrink-0 animate-marquee gap-(--gap) group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${
                  copy === 1 ? "motion-reduce:hidden" : ""
                }`}
              >
                {testimonials.map((t) => (
                  <TestimonialCard key={t.name} {...t} />
                ))}
              </ul>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-linear-to-r from-paper motion-safe:sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-paper motion-safe:sm:block" />
        </Reveal>
      </div>
    </section>
  );
}
