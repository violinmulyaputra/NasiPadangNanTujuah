import "server-only";
import { requireAdmin } from "@/lib/admin-auth";
import { first, type SearchParamValue } from "@/lib/admin-orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminReview, AdminReviewFilter } from "@/types/review";

export const REVIEWS_PER_PAGE = 20;
const MAX_PAGE = 10_000;
const FILTERS: AdminReviewFilter[] = ["semua", "tampil", "tersembunyi", "baru"];

export type ReviewListParams = { filter: AdminReviewFilter; page: number };

export function parseReviewListParams(params: Record<string, SearchParamValue>): ReviewListParams {
  const filter = first(params.filter) as AdminReviewFilter;
  const page = Number.parseInt(first(params.halaman), 10);
  return {
    filter: FILTERS.includes(filter) ? filter : "semua",
    page: Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1,
  };
}

export async function listReviews({ filter, page }: ReviewListParams) {
  await requireAdmin();
  const from = (page - 1) * REVIEWS_PER_PAGE;
  let request = createAdminClient()
    .from("reviews")
    .select("id, author_name, rating, comment, is_visible, is_sample, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + REVIEWS_PER_PAGE - 1);
  if (filter === "tampil") request = request.eq("is_visible", true);
  if (filter === "tersembunyi") request = request.eq("is_visible", false);
  if (filter === "baru") request = request.gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data, count, error } = await request;
  if (error?.code === "PGRST103") return { reviews: [] as AdminReview[], total: count ?? 0 };
  if (error) {
    console.error("Gagal membaca daftar ulasan admin:", error);
    throw new Error("Daftar ulasan gagal dimuat.");
  }
  const reviews: AdminReview[] = data.map((row) => ({ ...row, rating: Number(row.rating) }));
  return { reviews, total: count ?? 0 };
}
