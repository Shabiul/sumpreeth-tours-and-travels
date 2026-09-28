"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, unwrap } from "@/lib/supabase";
import { newId } from "@/lib/id";
import { requireAdmin } from "@/lib/session";
import { testimonialSchema } from "@/lib/validation";
import { formObject } from "@/lib/form";
import { revalidatePublic } from "@/lib/revalidate";
import { TAGS } from "@/lib/site";
import type { ActionResult } from "@/components/admin/form";

export async function saveTestimonialAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = testimonialSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const t = parsed.data;
  const now = new Date().toISOString();
  const data = {
    authorName: t.authorName,
    location: t.location,
    rating: t.rating,
    quote: t.quote,
    imageUrl: t.imageUrl || null,
    sortOrder: t.sortOrder,
    isActive: t.isActive,
    updatedAt: now,
  };

  try {
    if (id) {
      const { error } = await db.from("Testimonial").update(data).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("Testimonial").insert({ id: newId(), ...data, createdAt: now });
      if (error) throw error;
    }
  } catch {
    return { error: "Could not save the testimonial." };
  }

  revalidatePublic(TAGS.testimonials);
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.from("Testimonial").delete().eq("id", id);
  revalidatePublic(TAGS.testimonials);
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function toggleTestimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = unwrap<{ isActive: boolean } | null>(
    await db.from("Testimonial").select("isActive").eq("id", id).maybeSingle(),
  );
  if (!current) return;
  await db
    .from("Testimonial")
    .update({ isActive: !current.isActive, updatedAt: new Date().toISOString() })
    .eq("id", id);
  revalidatePublic(TAGS.testimonials);
  revalidatePath("/admin/testimonials");
}
