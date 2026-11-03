import CardDeckCarousel, { type Slide } from "./CardDeckCarousel";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

// Foto suasana 354 x 472 px (3:4), urut sesuai docs/DESIGN.md
const slides: Slide[] = [
  {
    image: "/images/suasana/restoran-minang.webp",
    title: "Nuansa Minang yang Mewah",
    caption:
      "Restoran dengan sentuhan arsitektur Minangkabau dan cahaya hangat yang siap menyambut Anda untuk menikmati kelezatan masakan Padang.",
    alt: "Bangunan Nasi Padang Nan Tujuah beratap gonjong merah khas Minangkabau, diterangi lampu hangat pada malam hari",
  },
  {
    image: "/images/suasana/interior-kayu.webp",
    title: "Nyaman di Setiap Sudut",
    caption:
      "Interior bernuansa kayu dengan pencahayaan yang lembut, menghadirkan suasana hangat untuk bersantap bersama orang-orang terdekat.",
    alt: "Ruang makan dengan pilar kayu melengkung, meja panjang, dan kursi krem di bawah lampu lembut",
  },
  {
    image: "/images/suasana/pelayanan.webp",
    title: "Disajikan dengan Sepenuh Hati",
    caption:
      "Setiap hidangan ditata dengan cermat, membawa kehangatan pelayanan khas rumah makan Padang ke meja Anda.",
    alt: "Pelayan berseragam merah menata piring-piring berisi lauk Padang",
  },
  {
    image: "/images/suasana/beragam-lauk.webp",
    title: "Beragam Lauk, Kaya Cita Rasa",
    caption:
      "Dari rendang berbumbu pekat hingga gulai berkuah gurih, nikmati beragam hidangan khas Padang yang saling melengkapi dalam satu santapan.",
    alt: "Aneka lauk Padang dalam piring-piring putih, antara lain rendang, gulai, ayam goreng, dan daun singkong",
  },
  {
    image: "/images/suasana/rempah.webp",
    title: "Cita Rasa Berawal dari Rempah",
    caption:
      "Racikan cabai, kunyit, ketumbar, dan aneka rempah menghadirkan warna, aroma, serta rasa yang khas pada setiap masakan.",
    alt: "Rempah dalam mangkuk kayu: kunyit bubuk, cabai bubuk, ketumbar, merica, dan jahe",
  },
];

// Alamat cabang: data contoh fiktif
const branches = [
  { city: "Semarang", addresses: ["Jl. Ahmad Yani No. 115", "Jl. Pandanaran No. 107"] },
  { city: "Yogyakarta", addresses: ["Jl. Jend. Sudirman No. 42", "Jl. Kaliurang No. 5"] },
];

export default function VisitUs() {
  return (
    <section className="bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <div className="grid gap-8 md:grid-cols-[3fr_2fr] md:gap-12">
          {/* Lebar kartu 260 px di HP, 320 px mulai md; rasio 3:4 */}
          <Reveal index={1}>
            <CardDeckCarousel
              slides={slides}
              ariaLabel="Foto suasana restoran"
              sizes="(min-width: 768px) 320px, 260px"
              className="[--cd-w:260px] md:[--cd-w:320px]"
            />
          </Reveal>

          {/* Judul seksi rata kiri di atas daftar cabang (sesuai sketsa). Mulai md kolom ini
              setinggi padding carousel + kartu 320 x 427 px, jadi isinya sejajar di tengah kartu. */}
          <div className="flex flex-col md:h-[calc(48px_+_320px_*_4_/_3)] md:justify-center">
            <Reveal index={0}>
              <SectionHeading
                title={
                  <>
                    Kunjungi <span className="text-brand">Kami!</span>
                  </>
                }
              />
            </Reveal>
            <Reveal index={1} className="mt-6 divide-y divide-line">
              {branches.map((b) => (
                <div key={b.city} className="py-6 first:pt-0 last:pb-0">
                  <h3 className="font-semibold text-ink">{b.city}</h3>
                  <ul className="mt-2 flex flex-col gap-1 text-muted">
                    {b.addresses.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
