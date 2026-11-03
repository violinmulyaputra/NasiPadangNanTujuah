// Memindai public/images/menu/*.webp lalu menulis supabase/seed-foto-menu.sql
// berisi UPDATE image_url hanya untuk foto yang ada. Tanpa dependensi.
// Jalankan dari root proyek: node scripts/generate-menu-photo-sql.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photoDir = path.join(root, "public", "images", "menu");
const outFile = path.join(root, "supabase", "seed-foto-menu.sql");
// Sama dengan check slug di supabase/schema.sql; nama berkas lain dilewati.
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slugs = [];
for (const file of fs.readdirSync(photoDir).sort()) {
  if (path.extname(file) !== ".webp") continue;
  const slug = path.basename(file, ".webp");
  if (SLUG.test(slug)) slugs.push(slug);
  else console.warn(`Dilewati, nama berkas bukan slug: ${file}`);
}

const header = `-- =============================================================================
-- Foto menu: isi image_url untuk menu yang fotonya ada di public/images/menu/.
-- Berkas ini DIBUAT OTOMATIS oleh scripts/generate-menu-photo-sql.mjs, jangan
-- diedit manual. Hanya UPDATE, aman dijalankan ulang. Menu yang belum punya
-- foto tidak disentuh.
-- Jumlah foto: ${slugs.length}
-- =============================================================================
`;
const body = slugs
  .map((slug) => `update public.menu_items\nset image_url = '/images/menu/${slug}.webp'\nwhere slug = '${slug}';\n`)
  .join("\n");

fs.writeFileSync(outFile, `${header}\n${body}`, "utf8");
console.log(`${slugs.length} foto ditulis ke ${path.relative(root, outFile)}: ${slugs.join(", ")}`);
