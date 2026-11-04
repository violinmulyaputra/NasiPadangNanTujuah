"use server";

import { refresh, revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-auth";
import { MENU_CACHE_TAG } from "@/lib/menu";
import { validateMenuEdit } from "@/lib/menu-validation";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { isOrderStatus, isValidTransition } from "@/lib/order-status";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { statusLabel } from "@/components/OrderTimeline";
import type { MenuEditState } from "@/types/menu";
import type { AdminActionResult, OrderStatus } from "@/types/order";

// Satu pesan untuk semua kegagalan login, supaya tidak membocorkan apakah email ada,
// sandinya salah, atau akunnya bukan admin.
const LOGIN_FAILED = "Email atau kata sandi salah.";
const NOT_ADMIN = "Sesi admin berakhir. Silakan masuk lagi.";
const GENERIC_ERROR = "Perubahan gagal disimpan. Coba lagi beberapa saat lagi.";
const ORDER_NOT_FOUND = "Pesanan tidak ditemukan.";

const fail = (message: string): AdminActionResult => ({ status: "error", message });

// Jeda acak sekitar 300 ms pada login gagal: memperlambat tebakan dan menyamarkan waktu.
const failureDelay = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));

export type SignInState = { message: string } | null;

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  // Server Action bisa dipanggil langsung dengan isi apa pun, bukan hanya dari form.
  if (!(formData instanceof FormData)) return { message: LOGIN_FAILED };
  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    email.length > 254 ||
    !password ||
    password.length > 200
  ) {
    await failureDelay();
    return { message: LOGIN_FAILED };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) {
    if (error && error.status !== 400) console.error("Login admin gagal:", error);
    await failureDelay();
    return { message: LOGIN_FAILED };
  }

  const { data: admin, error: dbError } = await createAdminClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (dbError) console.error("Gagal memeriksa admin_users saat login:", dbError);
  if (!admin) {
    // Akun Supabase biasa (bukan admin): sesi langsung dicabut.
    await supabase.auth.signOut();
    await failureDelay();
    return { message: LOGIN_FAILED };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Gagal keluar:", error);
  redirect("/admin/login");
}

// Pindah status satu langkah (maju, atau mundur untuk koreksi). updated_at diisi trigger
// orders_set_updated_at. Halaman lacak pelanggan membaca status tanpa cache, jadi status
// baru tampil pada muatan berikutnya; refresh() memperbarui halaman admin ini.
export async function updateOrderStatus(rawCode: unknown, rawStatus: unknown): Promise<AdminActionResult> {
  if (!(await getAdmin())) return fail(NOT_ADMIN);
  const code = normalizeOrderCode(rawCode);
  if (!code) return fail(ORDER_NOT_FOUND);
  if (!isOrderStatus(rawStatus)) return fail("Status tidak dikenal.");
  const newStatus: OrderStatus = rawStatus;

  try {
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("status, proof_uploaded_at")
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    if (!order) return fail(ORDER_NOT_FOUND);
    const current = order.status as OrderStatus;
    if (!isValidTransition(current, newStatus))
      return fail(`Status tidak bisa dipindah dari ${statusLabel(current)} ke ${statusLabel(newStatus)}.`);

    // Syarat status lama diulang: bila status berubah di tab lain, tidak ada yang tertimpa.
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("code", code)
      .eq("status", current)
      .select("code");
    if (updateError) throw updateError;
    if (updated.length === 0) return fail("Pesanan baru saja berubah. Muat ulang halaman lalu coba lagi.");

    refresh();
    const warning =
      current === "menunggu_bayar" && !order.proof_uploaded_at ? " Catatan: pesanan ini belum punya bukti bayar." : "";
    return { status: "success", message: `Status diubah ke ${statusLabel(newStatus)}.${warning}` };
  } catch (error) {
    console.error("Gagal mengubah status pesanan:", error);
    return fail(GENERIC_ERROR);
  }
}

// Tandai lunas atau batalkan tanda lunas (PRD F5). paid_at mengikuti is_paid
// (constraint orders_paid_at_consistent).
export async function setOrderPaid(rawCode: unknown, paid: unknown): Promise<AdminActionResult> {
  if (!(await getAdmin())) return fail(NOT_ADMIN);
  const code = normalizeOrderCode(rawCode);
  if (!code) return fail(ORDER_NOT_FOUND);
  if (typeof paid !== "boolean") return fail(GENERIC_ERROR);

  try {
    const { data: updated, error } = await createAdminClient()
      .from("orders")
      .update({ is_paid: paid, paid_at: paid ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
      .eq("code", code)
      .eq("is_paid", !paid)
      .select("code");
    if (error) throw error;
    if (updated.length === 0) return fail("Pesanan tidak ditemukan atau sudah berubah. Muat ulang halaman.");
    refresh();
    return { status: "success", message: paid ? "Pesanan ditandai lunas." : "Tanda lunas dibatalkan." };
  } catch (error) {
    console.error("Gagal mengubah tanda lunas:", error);
    return fail(GENERIC_ERROR);
  }
}

// id baris (uuid) dari klien dicek bentuknya sebelum dipakai di query.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value: unknown): value is string => typeof value === "string" && UUID_PATTERN.test(value);

// ---------------------------------------------------------------------------
// Ulasan (moderasi). /ulasan publik dan view review_stats dibaca per permintaan
// tanpa "use cache" (patuh RLS is_visible), jadi perubahan langsung terlihat pada muatan
// berikutnya. revalidatePath("/ulasan") sama seperti submitReview, refresh() untuk halaman admin.
// ---------------------------------------------------------------------------

export async function setReviewVisible(id: unknown, visible: unknown): Promise<AdminActionResult> {
  if (!(await getAdmin())) return fail(NOT_ADMIN);
  if (!isUuid(id) || typeof visible !== "boolean") return fail("Ulasan tidak ditemukan.");
  try {
    const { data, error } = await createAdminClient()
      .from("reviews")
      .update({ is_visible: visible })
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (data.length === 0) return fail("Ulasan tidak ditemukan.");
  } catch (error) {
    console.error("Gagal mengubah tampilan ulasan:", error);
    return fail(GENERIC_ERROR);
  }
  revalidatePath("/ulasan");
  refresh();
  return { status: "success", message: visible ? "Ulasan ditampilkan lagi." : "Ulasan disembunyikan." };
}

export async function deleteReview(id: unknown): Promise<AdminActionResult> {
  if (!(await getAdmin())) return fail(NOT_ADMIN);
  if (!isUuid(id)) return fail("Ulasan tidak ditemukan.");
  try {
    const { data, error } = await createAdminClient().from("reviews").delete().eq("id", id).select("id");
    if (error) throw error;
    if (data.length === 0) return fail("Ulasan tidak ditemukan.");
  } catch (error) {
    console.error("Gagal menghapus ulasan:", error);
    return fail(GENERIC_ERROR);
  }
  revalidatePath("/ulasan");
  refresh();
  return { status: "success", message: "Ulasan dihapus permanen." };
}

// ---------------------------------------------------------------------------
// Menu. /menu memakai "use cache" bertag MENU_CACHE_TAG, jadi setiap perubahan memanggil
// updateTag (permintaan berikutnya menunggu data baru, bukan data basi). Hidangan Andalan
// di beranda dibaca per permintaan. Pesanan lama tidak berubah: order_items menyimpan
// salinan nama dan harga. Slug, kategori, gambar, dan urutan tidak bisa diubah di sini.
// ---------------------------------------------------------------------------

type MenuFlag = "is_available" | "is_popular";

async function setMenuFlag(id: unknown, flag: MenuFlag, value: unknown): Promise<AdminActionResult> {
  if (!(await getAdmin())) return fail(NOT_ADMIN);
  if (!isUuid(id) || typeof value !== "boolean") return fail("Menu tidak ditemukan.");
  let name: string;
  try {
    const { data, error } = await createAdminClient()
      .from("menu_items")
      .update({ [flag]: value })
      .eq("id", id)
      .select("name");
    if (error) throw error;
    if (data.length === 0) return fail("Menu tidak ditemukan.");
    name = data[0].name;
  } catch (error) {
    console.error("Gagal mengubah menu:", error);
    return fail(GENERIC_ERROR);
  }
  updateTag(MENU_CACHE_TAG);
  refresh();
  const message =
    flag === "is_available"
      ? `${name} ${value ? "tersedia lagi" : "ditandai habis"}.`
      : `${name} ${value ? "masuk" : "dikeluarkan dari"} Hidangan Andalan.`;
  return { status: "success", message };
}

export async function setMenuAvailable(id: unknown, available: unknown) {
  return setMenuFlag(id, "is_available", available);
}

export async function setMenuPopular(id: unknown, popular: unknown) {
  return setMenuFlag(id, "is_popular", popular);
}

// Ubah nama, deskripsi, dan harga (FormData id, name, description, price) lewat useActionState.
export async function updateMenuItem(_prev: MenuEditState, formData: FormData): Promise<MenuEditState> {
  const error = (message: string): MenuEditState => ({ status: "error", message, fieldErrors: {} });
  if (!(await getAdmin())) return error(NOT_ADMIN);
  if (!(formData instanceof FormData)) return error(GENERIC_ERROR);
  const id = formData.get("id");
  if (!isUuid(id)) return error("Menu tidak ditemukan.");

  const result = validateMenuEdit({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
  });
  if (!result.ok) return { status: "error", message: "Periksa kembali isian.", fieldErrors: result.fieldErrors };

  try {
    const { data, error: dbError } = await createAdminClient()
      .from("menu_items")
      .update(result.data)
      .eq("id", id)
      .select("id");
    if (dbError) throw dbError;
    if (data.length === 0) return error("Menu tidak ditemukan.");
  } catch (e) {
    console.error("Gagal menyimpan menu:", e);
    return error(GENERIC_ERROR);
  }
  updateTag(MENU_CACHE_TAG);
  refresh();
  return { status: "success", message: `${result.data.name} disimpan.`, fieldErrors: {} };
}
