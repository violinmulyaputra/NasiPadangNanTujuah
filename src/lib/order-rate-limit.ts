import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AttemptKind = "order" | "proof";

// Batas laju per hash IP di tabel order_attempts, dipisah per jenis percobaan.
// Mengembalikan false bila batas terlampaui; bila lolos, percobaan langsung dicatat,
// jadi kiriman berulang dengan data salah ikut terhitung.
// shortcut: cek lalu tulis tidak atomik, kiriman serentak bisa lolos sedikit di atas
// batas; pindah ke fungsi SQL bila spam serentak jadi masalah (sama dengan ulasan).
export async function takeAttempt(
  supabase: SupabaseClient,
  ipHash: string,
  kind: AttemptKind,
  { maxPerHour, minGapMs }: { maxPerHour: number; minGapMs: number },
): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: attempts, error } = await supabase
    .from("order_attempts")
    .select("created_at")
    .eq("ip_hash", ipHash)
    .eq("kind", kind)
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const last = attempts[0] ? new Date(attempts[0].created_at).getTime() : 0;
  if (attempts.length >= maxPerHour || Date.now() - last < minGapMs) return false;

  const { error: logError } = await supabase.from("order_attempts").insert({ ip_hash: ipHash, kind });
  if (logError) throw logError;
  return true;
}
