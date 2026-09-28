import "server-only";
import bcrypt from "bcryptjs";
import { db, unwrap } from "./supabase";
import type { AdminOtp } from "./types";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Generate a fresh 6-digit code, store its hash, return the plaintext. */
export async function issueOtp(): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const { error } = await db.from("AdminOtp").upsert({
    id: "singleton",
    codeHash,
    expiresAt,
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return code;
}

type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "locked" | "mismatch" };

/** Check a submitted code; on success the row is deleted (single use). */
export async function verifyOtp(code: string): Promise<VerifyResult> {
  const row = unwrap<AdminOtp | null>(
    await db.from("AdminOtp").select("*").eq("id", "singleton").maybeSingle(),
  );
  if (!row) return { ok: false, reason: "missing" };
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await db.from("AdminOtp").delete().eq("id", "singleton");
    return { ok: false, reason: "expired" };
  }
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "locked" };

  const match = await bcrypt.compare(code.trim(), row.codeHash).catch(() => false);
  if (!match) {
    await db.from("AdminOtp").update({ attempts: row.attempts + 1 }).eq("id", "singleton");
    return { ok: false, reason: "mismatch" };
  }

  await db.from("AdminOtp").delete().eq("id", "singleton");
  return { ok: true };
}
