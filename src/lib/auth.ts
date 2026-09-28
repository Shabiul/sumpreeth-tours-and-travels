import "server-only";
import bcrypt from "bcryptjs";
import { db, unwrap } from "./supabase";

/**
 * Resolve the active admin password hash.
 * Priority: SiteSettings.adminPasswordHash (set via the Settings screen) → env.
 */
async function getAdminHash(): Promise<string | null> {
  const settings = unwrap<{ adminPasswordHash: string | null } | null>(
    await db.from("SiteSettings").select("adminPasswordHash").eq("id", "singleton").maybeSingle(),
  );
  if (settings?.adminPasswordHash) return settings.adminPasswordHash;
  return process.env.ADMIN_PASSWORD_HASH ?? null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await getAdminHash();
  if (!hash) {
    throw new Error(
      "No admin password configured. Set ADMIN_PASSWORD_HASH or run `npm run seed`.",
    );
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** The configured admin login ID (defaults to "admin"). */
export async function getAdminId(): Promise<string> {
  try {
    const s = unwrap<{ adminId: string } | null>(
      await db.from("SiteSettings").select("adminId").eq("id", "singleton").maybeSingle(),
    );
    return (s?.adminId || process.env.ADMIN_ID || "admin").trim();
  } catch {
    return process.env.ADMIN_ID || "admin";
  }
}

/** Constant-time-ish check of the ID + password pair. */
export async function verifyAdminCredentials(
  id: string,
  password: string,
): Promise<boolean> {
  const expectedId = await getAdminId();
  const idOk = id.trim().toLowerCase() === expectedId.toLowerCase();
  // Always run the password compare so timing doesn't leak whether the ID matched.
  const pwOk = await verifyAdminPassword(password).catch(() => false);
  return idOk && pwOk;
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 10);
  const { error } = await db.from("SiteSettings").update({ adminPasswordHash: hash }).eq("id", "singleton");
  if (error) throw new Error(error.message);
}
