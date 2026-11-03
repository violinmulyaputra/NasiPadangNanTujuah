"use server";

import { getIpHash } from "@/lib/ip-hash";
import { getOptionGroups, selectionLabels, validateSelections } from "@/lib/menu-options";
import { generateOrderCode } from "@/lib/order-code";
import { validateOrderInput } from "@/lib/order-validation";
import { calculateLineTotal, calculateUnitPrice } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MenuCategory } from "@/types/menu";
import type { CreateOrderResult, OrderSummaryLine } from "@/types/order";

const MAX_PER_HOUR = 5;
const MIN_GAP_MS = 10_000;
const MAX_CODE_TRIES = 5;
const RATE_LIMIT_MESSAGE = "Terlalu sering mengirim. Coba lagi nanti.";
const GENERIC_ERROR = "Pesanan gagal dibuat. Coba lagi beberapa saat lagi.";
const CHECK_FIELDS = "Periksa lagi isian yang ditandai.";

const fail = (message: string, fieldErrors: Extract<CreateOrderResult, { status: "error" }>["fieldErrors"] = {}) =>
  ({ status: "error", message, fieldErrors }) as const;

// Membuat pesanan dari form checkout (pop-up keranjang). Input objek JSON dari klien.
// Harga dari klien TIDAK dipakai: harga, ketersediaan, dan ongkir dibaca dari database,
// lalu dihitung ulang dengan pricing.ts. Status awal selalu menunggu_bayar (default DB).
export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  // Kolom jebakan terisi: pura-pura sukses tanpa menyimpan apa pun.
  const honeypot = (input as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", code: generateOrderCode(), items: [], subtotal: 0, deliveryFee: 0, total: 0 };
  }

  const parsed = validateOrderInput(input);
  if (!parsed.ok) return fail(CHECK_FIELDS, parsed.fieldErrors);
  const { customer, items } = parsed;

  try {
    const supabase = createAdminClient();
    const ipHash = await getIpHash();

    // shortcut: cek lalu tulis tidak atomik, kiriman serentak bisa lolos sedikit di atas
    // batas; pindah ke fungsi SQL bila spam serentak jadi masalah (sama dengan ulasan).
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: attempts, error: attemptsError } = await supabase
      .from("order_attempts")
      .select("created_at")
      .eq("ip_hash", ipHash)
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (attemptsError) throw attemptsError;
    const last = attempts[0] ? new Date(attempts[0].created_at).getTime() : 0;
    if (attempts.length >= MAX_PER_HOUR || Date.now() - last < MIN_GAP_MS) return fail(RATE_LIMIT_MESSAGE);

    // Dicatat sebelum menu dan zona dicek, jadi kiriman berulang dengan data salah ikut terhitung.
    const { error: logError } = await supabase.from("order_attempts").insert({ ip_hash: ipHash });
    if (logError) throw logError;

    const { data: zone, error: zoneError } = await supabase
      .from("delivery_zones")
      .select("code, fee")
      .eq("code", customer.deliveryZone)
      .eq("is_active", true)
      .maybeSingle();
    if (zoneError) throw zoneError;
    if (!zone) return fail(CHECK_FIELDS, { deliveryZone: "Zona pengiriman tidak tersedia. Pilih zona lain." });

    const ids = [...new Set(items.map((i) => i.menuItemId))];
    const { data: menuRows, error: menuError } = await supabase
      .from("menu_items")
      .select("id, name, category, price, is_available")
      .in("id", ids);
    if (menuError) throw menuError;
    const menu = new Map(menuRows.map((m) => [m.id as string, m]));

    // line_total dan total adalah kolom generated di DB, jadi tidak dikirim.
    const lines = [];
    const summary: OrderSummaryLine[] = [];
    let subtotal = 0;
    for (const item of items) {
      const m = menu.get(item.menuItemId);
      if (!m) return fail(CHECK_FIELDS, { items: "Ada menu yang sudah tidak tersedia. Perbarui keranjang Anda." });
      if (!m.is_available) return fail(CHECK_FIELDS, { items: `${m.name} sedang habis. Hapus dari keranjang untuk melanjutkan.` });

      const groups = getOptionGroups({ name: m.name, category: m.category as MenuCategory });
      const checked = validateSelections(groups, item.selections);
      if (!checked.ok) return fail(CHECK_FIELDS, { items: `Pilihan ${m.name} tidak valid. Perbarui keranjang Anda.` });

      const unitPrice = calculateUnitPrice(m.price, groups, checked.selections);
      const lineTotal = calculateLineTotal(unitPrice, item.quantity);
      subtotal += lineTotal;
      const optionLabels = selectionLabels(groups, checked.selections);
      summary.push({ name: m.name, optionLabels, quantity: item.quantity, lineTotal });
      lines.push({
        menu_item_id: m.id,
        name: m.name,
        base_price: m.price,
        unit_price: unitPrice,
        quantity: item.quantity,
        selections: checked.selections,
        option_labels: optionLabels,
      });
    }

    const deliveryFee = zone.fee as number;
    const total = subtotal + deliveryFee;

    const order = {
      customer_name: customer.customerName,
      customer_email: customer.customerEmail,
      customer_phone: customer.customerPhone,
      delivery_address: customer.deliveryAddress,
      delivery_zone: zone.code,
      delivery_fee: deliveryFee,
      notes: customer.notes,
      subtotal,
    };
    // Satu rpc = satu transaksi: orders dan order_items tersimpan bersama atau tidak sama sekali.
    for (let i = 0; i < MAX_CODE_TRIES; i++) {
      const code = generateOrderCode();
      const { data: orderId, error } = await supabase.rpc("create_order", {
        p_code: code,
        p_order: order,
        p_items: lines,
      });
      if (error) throw error;
      // null = kode bentrok dengan pesanan lain, coba kode baru.
      if (orderId) return { status: "success", code, items: summary, subtotal, deliveryFee, total };
    }
    throw new Error(`Kode pesanan bentrok ${MAX_CODE_TRIES} kali`);
  } catch (error) {
    // Detail error hanya di log server, tidak dikirim ke klien.
    console.error("Gagal membuat pesanan:", error);
    return fail(GENERIC_ERROR);
  }
}
