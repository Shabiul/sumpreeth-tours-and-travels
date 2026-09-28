"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, unwrap } from "@/lib/supabase";
import { newId } from "@/lib/id";
import { requireAdmin } from "@/lib/session";
import { faqSchema } from "@/lib/validation";
import { formObject } from "@/lib/form";
import { revalidatePublic } from "@/lib/revalidate";
import { TAGS } from "@/lib/site";
import type { ActionResult } from "@/components/admin/form";

export async function saveFaqAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = faqSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const now = new Date().toISOString();

  try {
    if (id) {
      const { error } = await db.from("FaqItem").update({ ...data, updatedAt: now }).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("FaqItem").insert({ id: newId(), ...data, createdAt: now, updatedAt: now });
      if (error) throw error;
    }
  } catch {
    return { error: "Could not save the FAQ." };
  }

  revalidatePublic(TAGS.faqs);
  revalidatePath("/contact");
  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.from("FaqItem").delete().eq("id", id);
  revalidatePublic(TAGS.faqs);
  revalidatePath("/contact");
  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

export async function toggleFaqAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = unwrap<{ isActive: boolean } | null>(
    await db.from("FaqItem").select("isActive").eq("id", id).maybeSingle(),
  );
  if (!current) return;
  await db
    .from("FaqItem")
    .update({ isActive: !current.isActive, updatedAt: new Date().toISOString() })
    .eq("id", id);
  revalidatePublic(TAGS.faqs);
  revalidatePath("/contact");
  revalidatePath("/admin/faqs");
}
