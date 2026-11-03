import type { MenuCategory } from "@/types/menu";

// Opsi pesanan per menu. Modul murni: dipakai klien (form pilihan, keranjang)
// dan server (validasi ulang saat checkout F2). Setiap kelompok pilih SATU.

export type OptionChoice = {
  id: string;
  label: string;
  // Tambahan harga per porsi, integer Rupiah.
  price: number;
  // Teks ringkas untuk baris keranjang bila label saja kurang jelas ("Sedikit" -> "Gula sedikit").
  summary?: string;
};

export type OptionGroup = {
  id: string;
  label: string;
  choices: OptionChoice[];
  defaultChoiceId: string;
};

// id kelompok -> id pilihan.
export type Selections = Record<string, string>;

// Lauk (ayam, sapi, seafood): bawaan "Tidak pakai".
const SIDE_DISH_GROUPS: OptionGroup[] = [
  {
    id: "rice",
    label: "Pilihan Nasi",
    defaultChoiceId: "none",
    choices: [
      { id: "pulen", label: "Nasi pulen", price: 5000 },
      { id: "pera", label: "Nasi pera", price: 5000 },
      { id: "none", label: "Tidak pakai nasi", price: 0 },
    ],
  },
  {
    id: "curry",
    label: "Pilihan Gulai",
    defaultChoiceId: "none",
    choices: [
      { id: "cubadak", label: "Gulai cubadak", price: 5000 },
      { id: "cancang", label: "Gulai cancang", price: 10000 },
      { id: "none", label: "Tidak pakai gulai", price: 0 },
    ],
  },
  {
    id: "vegetable",
    label: "Pilihan Sayur",
    defaultChoiceId: "none",
    choices: [
      { id: "pucuk-ubi", label: "Daun pucuk ubi", price: 5000 },
      { id: "none", label: "Tidak pakai sayur", price: 0 },
    ],
  },
  {
    id: "sambal",
    label: "Pilihan Sambal",
    defaultChoiceId: "none",
    choices: [
      { id: "red", label: "Sambal cabai merah", price: 2500 },
      { id: "green", label: "Sambal cabai hijau", price: 2500 },
      { id: "none", label: "Tidak pakai sambal", price: 0 },
    ],
  },
];

const SUGAR_GROUP: OptionGroup = {
  id: "sugar",
  label: "Pilihan Gula",
  defaultChoiceId: "full",
  choices: [
    { id: "full", label: "Pakai", price: 0, summary: "Pakai gula" },
    { id: "less", label: "Sedikit", price: 0, summary: "Gula sedikit" },
    { id: "none", label: "Tidak pakai", price: 0, summary: "Tanpa gula" },
  ],
};

const ICE_GROUP: OptionGroup = {
  id: "ice",
  label: "Pilihan Es",
  defaultChoiceId: "full",
  choices: [
    { id: "full", label: "Pakai", price: 0, summary: "Pakai es" },
    { id: "less", label: "Sedikit", price: 0, summary: "Es sedikit" },
    { id: "none", label: "Tidak pakai", price: 0, summary: "Tanpa es" },
  ],
};

const DRINK_GROUPS: OptionGroup[] = [SUGAR_GROUP, ICE_GROUP];

// Pengecualian minuman, dicocokkan dengan nama menu (huruf besar kecil dan spasi diabaikan).
// Ubah di sini bila daftar minuman berubah.
export const DRINK_OPTION_EXCEPTIONS: Record<string, OptionGroup[]> = {
  "air mineral botol 330 ml": [],
  "es teh tawar": [ICE_GROUP],
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

export function getOptionGroups(item: { name: string; category: MenuCategory }): OptionGroup[] {
  switch (item.category) {
    case "Ayam":
    case "Sapi":
    case "Seafood":
      return SIDE_DISH_GROUPS;
    case "Minuman":
      return DRINK_OPTION_EXCEPTIONS[normalizeName(item.name)] ?? DRINK_GROUPS;
    default:
      // Sayuran dan buah: hanya jumlah.
      return [];
  }
}

export function defaultSelections(groups: OptionGroup[]): Selections {
  return Object.fromEntries(groups.map((g) => [g.id, g.defaultChoiceId]));
}

export type SelectionsValidation =
  | { ok: true; selections: Selections }
  | { ok: false; error: string };

// Input dari klien tidak dipercaya: tolak kelompok atau pilihan yang tidak dikenal,
// lalu lengkapi kelompok yang kosong dengan pilihan bawaan.
export function validateSelections(groups: OptionGroup[], selections: unknown): SelectionsValidation {
  const raw = selections ?? {};
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Format pilihan tidak valid." };
  }

  const result = defaultSelections(groups);
  for (const [groupId, choiceId] of Object.entries(raw)) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return { ok: false, error: `Kelompok pilihan tidak dikenal: ${groupId}` };
    if (choiceId === undefined || choiceId === null || choiceId === "") continue;
    if (typeof choiceId !== "string" || !group.choices.some((c) => c.id === choiceId)) {
      return { ok: false, error: `Pilihan tidak dikenal di ${group.label}.` };
    }
    result[groupId] = choiceId;
  }
  return { ok: true, selections: result };
}

// Label pilihan untuk baris keranjang: hanya pilihan yang berbeda dari bawaan,
// jadi "Tidak pakai ..." di lauk dan "Pakai" di minuman tidak ditampilkan.
export function selectionLabels(groups: OptionGroup[], selections: Selections): string[] {
  return groups.flatMap((g) => {
    const choiceId = selections[g.id];
    if (choiceId === g.defaultChoiceId) return [];
    const choice = g.choices.find((c) => c.id === choiceId);
    return choice ? [choice.summary ?? choice.label] : [];
  });
}
