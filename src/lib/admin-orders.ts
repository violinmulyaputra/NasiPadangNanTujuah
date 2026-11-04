import "server-only";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { isOrderStatus } from "@/lib/order-status";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminOrderDetail,
  AdminOrderFilter,
  AdminOrderRow,
  OrderStatus,
  PaymentMethod,
} from "@/types/order";


export const ORDERS_PER_PAGE = 20;
export const PROOF_BUCKET = "payment-proofs";
const PROOF_URL_TTL_SECONDS = 60;
const MAX_PAGE = 10_000;
export const MAX_QUERY_LENGTH = 12;

const DAY_MS = 24 * 60 * 60 * 1000;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

const startOfTodayJakarta = () =>
  new Date(Math.floor((Date.now() + JAKARTA_OFFSET_MS) / DAY_MS) * DAY_MS - JAKARTA_OFFSET_MS).toISOString();

export type SearchParamValue = string | string[] | undefined;
export const first = (value: SearchParamValue) => (Array.isArray(value) ? value[0] : value) ?? "";

export type OrderListParams = {
  filter: AdminOrderFilter;
  query: string;
  queryValid: boolean;
  page: number;
};

export function parseOrderListParams(params: Record<string, SearchParamValue>): OrderListParams {
  const status = first(params.status);
  const filter: AdminOrderFilter =
    isOrderStatus(status) || status === "verifikasi" || status === "hari-ini" ? status : "semua";
  const query = first(params.q).trim().toUpperCase().slice(0, MAX_QUERY_LENGTH);
  const page = Number.parseInt(first(params.halaman), 10);
  return {
    filter,
    query,
    queryValid: query === "" || /^[A-Z0-9-]+$/.test(query),
    page: Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1,
  };
}

type Filterable = {
  eq(column: string, value: string): Filterable;
  not(column: string, operator: string, value: null): Filterable;
  gte(column: string, value: string): Filterable;
};

function applyFilter<T>(query: T, filter: AdminOrderFilter): T {
  const q = query as unknown as Filterable;
  const filtered =
    filter === "semua"
      ? q
      : filter === "verifikasi"
        ? q.eq("status", "menunggu_bayar").not("proof_uploaded_at", "is", null)
        : filter === "hari-ini"
          ? q.gte("created_at", startOfTodayJakarta())
          : q.eq("status", filter);
  return filtered as unknown as T;
}

export async function listOrders({ filter, query, queryValid, page }: OrderListParams) {
  await requireAdmin();
  if (!queryValid) return { rows: [] as AdminOrderRow[], total: 0 };

  const from = (page - 1) * ORDERS_PER_PAGE;
  let request = createAdminClient()
    .from("orders")
    .select("code, created_at, customer_name, total, status, proof_uploaded_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ORDERS_PER_PAGE - 1);
  request = applyFilter(request, filter);
  if (query) request = request.ilike("code", `%${query}%`);

  const { data, count, error } = await request;
  if (error?.code === "PGRST103") return { rows: [] as AdminOrderRow[], total: count ?? 0 };
  if (error) {
    console.error("Gagal membaca daftar pesanan admin:", error);
    throw new Error("Daftar pesanan gagal dimuat.");
  }
  const rows: AdminOrderRow[] = data.map((row) => ({
    code: row.code,
    createdAt: row.created_at,
    customerName: row.customer_name,
    total: row.total,
    status: row.status as OrderStatus,
    proofUploaded: row.proof_uploaded_at !== null,
  }));
  return { rows, total: count ?? 0 };
}

export async function getDashboardCounts() {
  await requireAdmin();
  const supabase = createAdminClient();
  const count = async (filter: AdminOrderFilter) => {
    const { count, error } = await applyFilter(
      supabase.from("orders").select("id", { count: "exact", head: true }),
      filter,
    );
    if (error) {
      console.error("Gagal menghitung pesanan:", error);
      throw new Error("Ringkasan gagal dimuat.");
    }
    return count ?? 0;
  };
  const countOther = async (request: PromiseLike<{ count: number | null; error: unknown }>) => {
    const { count, error } = await request;
    if (error) {
      console.error("Gagal menghitung ringkasan:", error);
      throw new Error("Ringkasan gagal dimuat.");
    }
    return count ?? 0;
  };
  const [verifikasi, menungguBayar, diproses, diantar, hariIni, ulasanBaru, menuHabis] = await Promise.all([
    count("verifikasi"),
    count("menunggu_bayar"),
    count("diproses"),
    count("diantar"),
    count("hari-ini"),
    countOther(
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * DAY_MS).toISOString()),
    ),
    countOther(supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("is_available", false)),
  ]);
  return { verifikasi, menungguBayar, diproses, diantar, hariIni, ulasanBaru, menuHabis };
}

export async function getAdminOrder(rawCode: string): Promise<AdminOrderDetail | null> {
  await requireAdmin();
  const code = normalizeOrderCode(rawCode);
  if (!code) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "code, status, created_at, updated_at, customer_name, customer_email, customer_phone, delivery_address, notes, delivery_fee, subtotal, total, is_paid, paid_at, payment_method, payment_proof_path, proof_uploaded_at, proof_upload_count, delivery_zones(name), order_items(name, quantity, option_labels, unit_price, line_total)",
    )
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error("Gagal membaca detail pesanan admin:", error);
    throw new Error("Pesanan gagal dimuat.");
  }
  if (!data) return null;

  let proofUrl: string | null = null;
  if (data.payment_proof_path) {
    const { data: signed, error: signError } = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(data.payment_proof_path, PROOF_URL_TTL_SECONDS);
    if (signError) console.error("Gagal membuat signed URL bukti bayar:", signError);
    proofUrl = signed?.signedUrl ?? null;
  }

  const zone = Array.isArray(data.delivery_zones) ? data.delivery_zones[0] : data.delivery_zones;
  return {
    code: data.code,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    customerPhone: data.customer_phone,
    deliveryAddress: data.delivery_address,
    notes: data.notes,
    zoneName: zone?.name ?? "",
    deliveryFee: data.delivery_fee,
    subtotal: data.subtotal,
    total: data.total,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    paymentMethod: data.payment_method as PaymentMethod | null,
    proofUploadedAt: data.proof_uploaded_at,
    proofUploadCount: data.proof_upload_count,
    proofUrl,
    items: data.order_items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      optionLabels: item.option_labels,
      unitPrice: item.unit_price,
      lineTotal: item.line_total,
    })),
  };
}
