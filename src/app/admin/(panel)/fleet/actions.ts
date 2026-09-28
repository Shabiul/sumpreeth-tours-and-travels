"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, unwrap } from "@/lib/supabase";
import { newId } from "@/lib/id";
import { requireAdmin } from "@/lib/session";
import { vehicleSchema, parseFeatures, slugify } from "@/lib/validation";
import { encodeFeatures } from "@/lib/features";
import { formObject } from "@/lib/form";
import { revalidatePublic } from "@/lib/revalidate";
import { TAGS } from "@/lib/site";
import type { ActionResult } from "@/components/admin/form";

export async function saveVehicleAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const raw = formObject(formData);

  const parsed = vehicleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  // Slugs are stable identifiers, not derived from the name on every save —
  // regenerating one on edit would silently break any already indexed or
  // shared URL. Only a brand-new vehicle gets a fresh slug.
  let slug: string;
  if (id) {
    const { data: existing, error: findErr } = await db
      .from("Vehicle")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) return { error: "Vehicle not found." };
    slug = existing.slug as string;
  } else {
    const base = slugify(v.name) || "vehicle";
    slug = base;
    for (let i = 2; i < 50; i++) {
      const { data: clash, error: clashErr } = await db
        .from("Vehicle")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (clashErr) throw clashErr;
      if (!clash) break;
      slug = `${base}-${i}`;
    }
  }

  const now = new Date().toISOString();
  const data = {
    name: v.name,
    slug,
    category: v.category,
    seats: v.seats,
    features: encodeFeatures(parseFeatures(v.features)),
    imageUrl: v.imageUrl,
    images: encodeFeatures(parseFeatures(v.images ?? "")),
    sortOrder: v.sortOrder,
    isActive: v.isActive,
    quoteOnRequest: v.quoteOnRequest,
    oneWayRate: v.oneWayRate,
    oneWayNote: v.oneWayNote || null,
    roundTripPerKm: v.roundTripPerKm,
    minKmPerDay: v.minKmPerDay,
    driverBata: v.driverBata,
    roundTripNote: v.roundTripNote || null,
    localPackageRate: v.localPackageRate,
    localExtraPerKm: v.localExtraPerKm,
    localExtraPerHr: v.localExtraPerHr,
    updatedAt: now,
  };

  try {
    if (id) {
      const { error } = await db.from("Vehicle").update(data).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("Vehicle").insert({ id: newId(), ...data, createdAt: now });
      if (error) throw error;
    }
  } catch {
    return { error: "Could not save the vehicle." };
  }

  revalidatePublic(TAGS.vehicles);
  revalidatePath("/admin/fleet");
  redirect("/admin/fleet");
}

export async function deleteVehicleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.from("Vehicle").delete().eq("id", id);
  revalidatePublic(TAGS.vehicles);
  revalidatePath("/admin/fleet");
  redirect("/admin/fleet");
}

export async function toggleVehicleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = unwrap<{ isActive: boolean } | null>(
    await db.from("Vehicle").select("isActive").eq("id", id).maybeSingle(),
  );
  if (!current) return;
  await db
    .from("Vehicle")
    .update({ isActive: !current.isActive, updatedAt: new Date().toISOString() })
    .eq("id", id);
  revalidatePublic(TAGS.vehicles);
  revalidatePath("/admin/fleet");
}
