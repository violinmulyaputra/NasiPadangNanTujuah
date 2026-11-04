"use server";

import { getIpHash } from "@/lib/ip-hash";
import { getOptionGroups, selectionLabels, validateSelections } from "@/lib/menu-options";
import { generateOrderCode } from "@/lib/order-code";
import { takeAttempt } from "@/lib/order-rate-limit";
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
const SOLD_OUT_MESSAGE =
  "Menu yang dipilih sedang habis. Hapus dari keranjang untuk lanjut. Mohon refresh halaman agar tanda habis muncul.";

const fail = (message: string, fieldErrors: Extract<CreateOrderResult, { status: "error" }>["fieldErrors"] = {}) =>
  ({ status: "error", message, fieldErrors }) as const;

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
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

    const allowed = await takeAttempt(supabase, ipHash, "order", { maxPerHour: MAX_PER_HOUR, minGapMs: MIN_GAP_MS });
    if (!allowed) return fail(RATE_LIMIT_MESSAGE);

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

    const lines = [];
    const summary: OrderSummaryLine[] = [];
    let subtotal = 0;
    for (const item of items) {
      const m = menu.get(item.menuItemId);
      if (!m?.is_available) return fail(CHECK_FIELDS, { items: SOLD_OUT_MESSAGE });

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
    for (let i = 0; i < MAX_CODE_TRIES; i++) {
      const code = generateOrderCode();
      const { data: orderId, error } = await supabase.rpc("create_order", {
        p_code: code,
        p_order: order,
        p_items: lines,
      });
      if (error) throw error;
      if (orderId) return { status: "success", code, items: summary, subtotal, deliveryFee, total };
    }
    throw new Error(`Kode pesanan bentrok ${MAX_CODE_TRIES} kali`);
  } catch (error) {
    console.error("Gagal membuat pesanan:", error);
    return fail(GENERIC_ERROR);
  }
}
