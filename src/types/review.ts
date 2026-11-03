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
