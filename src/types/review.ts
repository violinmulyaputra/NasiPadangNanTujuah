export type Review = {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  is_sample: boolean;
  created_at: string;
};

export type ReviewStats = {
  average_rating: number;
  review_count: number;
};

export type ReviewField = "author_name" | "rating" | "comment";

// Bentuk state untuk useActionState di form ulasan.
export type ReviewFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<ReviewField, string>>;
};

// Filter daftar ulasan admin (F5). "baru" = 7 hari terakhir.
export type AdminReviewFilter = "semua" | "tampil" | "tersembunyi" | "contoh" | "baru";

// Satu baris ulasan untuk admin, termasuk yang disembunyikan.
export type AdminReview = Review & { is_visible: boolean };
