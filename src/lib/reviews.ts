import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Review, ReviewStats } from "@/types/review";

// Query baca ulasan memakai klien server anon (patuh RLS: hanya is_visible).
// Klien ini membaca cookies(), jadi pemanggilnya dirender per permintaan dan
// perlu dibungkus <Suspense>, sama seperti BestSeller.

export async function getReviewStats(): Promise<ReviewStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_stats")
    .select("average_rating, review_count")
    .single();

  if (error) {
    console.error("Gagal memuat statistik ulasan:", error.message);
    return { average_rating: 0, review_count: 0 };
  }
  // numeric dari PostgREST bisa berupa string, jadi dikonversi ke number.
  return {
    average_rating: Number(data.average_rating),
    review_count: Number(data.review_count),
  };
}

export async function getLatestReviews(limit = 10): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, comment, is_sample, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Gagal memuat ulasan:", error.message);
    return [];
  }
  return data.map((row) => ({ ...row, rating: Number(row.rating) }));
}
