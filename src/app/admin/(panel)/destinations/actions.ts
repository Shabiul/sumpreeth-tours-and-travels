"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, unwrap } from "@/lib/supabase";
import { newId } from "@/lib/id";
import { requireAdmin } from "@/lib/session";
import { destinationSchema, slugify } from "@/lib/validation";
import { formObject } from "@/lib/form";
import { encodeList } from "@/lib/packages";
import { revalidatePublic } from "@/lib/revalidate";
import { TAGS } from "@/lib/site";
import type { ActionResult } from "@/components/admin/form";

export async function saveDestinationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = destinationSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  try {
    // Slugs are stable identifiers, not derived from the name on every
    // save — regenerating one on edit would silently break any already
    // indexed or shared URL. Only a brand-new destination gets a fresh slug.
    let slug: string;
    if (id) {
      const { data: existing, error: findErr } = await db
        .from("Destination")
        .select("slug")
        .eq("id", id)
        .maybeSingle();
      if (findErr) throw findErr;
      if (!existing) return { error: "Destination not found." };
      slug = existing.slug as string;
    } else {
      const base = slugify(d.name) || "destination";
      slug = base;
      let n = 1;
      for (;;) {
        const { data: clash, error: clashErr } = await db
          .from("Destination")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (clashErr) throw clashErr;
        if (!clash) break;
        slug = `${base}-${++n}`;
      }
    }

    const now = new Date().toISOString();
    const data = {
      name: d.name,
      slug,
      category: d.category,
      state: d.state,
      description: d.description,
      imageUrl: d.imageUrl,
      distanceKm: d.distanceKm,
      highlights: encodeList((d.highlights ?? "").split("\n")),
      packageSlug: d.packageSlug || null,
      sortOrder: d.sortOrder,
      isActive: d.isActive,
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      updatedAt: now,
    };

    if (id) {
      const { error } = await db.from("Destination").update(data).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("Destination").insert({ id: newId(), ...data, createdAt: now });
      if (error) throw error;
    }
  } catch {
    return { error: "Could not save the destination." };
  }

  revalidatePublic(TAGS.destinations);
  revalidatePath("/destination");
  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}

export async function deleteDestinationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.from("Destination").delete().eq("id", id);
  revalidatePublic(TAGS.destinations);
  revalidatePath("/destination");
  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}

export async function toggleDestinationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = unwrap<{ isActive: boolean } | null>(
    await db.from("Destination").select("isActive").eq("id", id).maybeSingle(),
  );
  if (!current) return;
  await db
    .from("Destination")
    .update({ isActive: !current.isActive, updatedAt: new Date().toISOString() })
    .eq("id", id);
  revalidatePublic(TAGS.destinations);
  revalidatePath("/destination");
  revalidatePath("/admin/destinations");
}
