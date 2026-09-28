"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/session";
import { siteSettingsSchema } from "@/lib/validation";
import { formObject } from "@/lib/form";
import { TAGS } from "@/lib/site";
import type { ActionResult } from "@/components/admin/form";

export async function saveContentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  try {
    const { error } = await db.from("SiteSettings").upsert({
      id: "singleton",
      ...d,
      facebookUrl: d.facebookUrl || null,
      instagramUrl: d.instagramUrl || null,
      youtubeUrl: d.youtubeUrl || null,
      updatedAt: new Date().toISOString(),
    });
    if (error) throw error;
  } catch {
    return { error: "Could not save site content." };
  }

  revalidateTag(TAGS.settings, "max");
  revalidatePath("/", "layout");
  return { ok: true, message: "Site content updated. Public pages will refresh shortly." };
}
