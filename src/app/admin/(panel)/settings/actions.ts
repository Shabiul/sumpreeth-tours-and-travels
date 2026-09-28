"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/session";
import { verifyAdminPassword, setAdminPassword } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validation";
import { formObject } from "@/lib/form";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/components/admin/form";
import { seedSettingsIfMissing } from "../content/ensure";

export async function changePasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const limit = rateLimit(`pwchange:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return {
      error: `Too many attempts. Try again in ${Math.ceil(
        limit.retryAfterSec / 60,
      )} minute(s).`,
    };
  }

  const parsed = passwordChangeSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { currentPassword, newPassword } = parsed.data;

  let ok = false;
  try {
    ok = await verifyAdminPassword(currentPassword);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Login not configured." };
  }
  if (!ok) {
    return { error: "Current password is incorrect.", fieldErrors: { currentPassword: ["Incorrect"] } };
  }

  await seedSettingsIfMissing();
  await setAdminPassword(newPassword);

  return {
    ok: true,
    message: "Password updated. Use the new password next time you sign in.",
  };
}

export async function currentPasswordSource(): Promise<"database" | "environment" | "none"> {
  const { data: s } = await db.from("SiteSettings").select("adminPasswordHash").eq("id", "singleton").maybeSingle();
  if (s?.adminPasswordHash) return "database";
  if (process.env.ADMIN_PASSWORD_HASH) return "environment";
  return "none";
}

export async function getCurrentAdminId(): Promise<string> {
  const { data: s } = await db.from("SiteSettings").select("adminId").eq("id", "singleton").maybeSingle();
  return s?.adminId || "admin";
}

const adminIdSchema = z
  .string()
  .trim()
  .min(3, "At least 3 characters")
  .max(60)
  .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dot, dash and underscore only");

export async function changeAdminIdAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = adminIdSchema.safeParse(formData.get("adminId"));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted field.",
      fieldErrors: { adminId: [parsed.error.issues[0]?.message ?? "Invalid"] },
    };
  }

  await seedSettingsIfMissing();
  await db
    .from("SiteSettings")
    .update({ adminId: parsed.data, updatedAt: new Date().toISOString() })
    .eq("id", "singleton");

  return { ok: true, message: `Login ID updated to "${parsed.data}".` };
}
