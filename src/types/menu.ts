export type MenuCategory = "Ayam" | "Sapi" | "Seafood" | "Sayuran" | "Minuman" | "Buah";

export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
};

export type MenuEditState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"name" | "description" | "price", string>>;
};
