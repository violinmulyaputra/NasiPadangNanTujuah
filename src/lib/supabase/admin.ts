import "server-only";
import { createClient } from "@supabase/supabase-js";

// Klien Supabase dengan service role key: melewati RLS. Hanya untuk Server Actions
// dan Route Handlers, setelah input divalidasi. Jangan diimpor dari komponen client.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
