import "server-only";
import { createClient } from "@supabase/supabase-js";

// Klien anon TANPA cookies untuk data publik di dalam "use cache" (cookies() tidak
// boleh dipakai di sana). Tetap patuh RLS.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
