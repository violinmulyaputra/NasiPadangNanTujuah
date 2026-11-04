import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Admin = { id: string; email: string };

export const getAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data, error: dbError } = await createAdminClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (dbError) {
    console.error("Gagal memeriksa admin_users:", dbError);
    return null;
  }
  return data ? { id: user.id, email: user.email ?? "" } : null;
});

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
