"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await clientIp();
  const limit = rateLimit(`login:${ip}`, 6, 15 * 60 * 1000);
  if (!limit.ok) {
    return {
      error: `Too many attempts. Try again in ${Math.ceil(
        limit.retryAfterSec / 60,
      )} minute(s).`,
    };
  }

  const parsed = adminLoginSchema.safeParse({
    id: formData.get("id"),
    password: formData.get("password"),
    remember: formData.get("remember") ? "true" : "false",
  });
  if (!parsed.success) return { error: "Enter your ID and password." };

  let ok = false;
  try {
    ok = await verifyAdminCredentials(parsed.data.id, parsed.data.password);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Login is not configured yet.",
    };
  }
  if (!ok) return { error: "Incorrect ID or password." };

  await createSession(parsed.data.remember);
  const from = String(formData.get("from") ?? "/admin");
  redirect(from.startsWith("/admin") ? from : "/admin");
}
