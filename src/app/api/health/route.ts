import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  await connection();

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Health check gagal:", error);
      return Response.json(
        { status: "error", message: error.message, code: error.code },
        { status: 500 },
      );
    }

    return Response.json({ status: "ok", menu: count ?? 0 });
  } catch (error) {
    console.error("Health check gagal:", error);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
