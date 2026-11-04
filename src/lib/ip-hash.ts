import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getIpHash(given?: Headers): Promise<string> {
  const salt = process.env.REVIEW_IP_SALT;
  if (!salt) throw new Error("REVIEW_IP_SALT belum diisi");

  const h = given ?? (await headers());
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
