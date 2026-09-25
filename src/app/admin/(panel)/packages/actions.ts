"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { packageSchema, slugify } from "@/lib/validation";
import { encodeList, parseItineraryText, parseFaqText } from "@/lib/packages";
import { revalidatePublic } from "@/lib/revalidate";
import { TAGS } from "@/lib/site";
import type { ActionResult } from "@/components/admin/form";

export async function savePackageAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([k]) => k !== "category"),
  ) as Record<string, string>;

  const parsed = packageSchema.safeParse({
    ...raw,
    category: formData.getAll("category"),
  });
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const p = parsed.data;

  try {
    // Slugs are stable identifiers, not derived from the title on every
    // save — regenerating one on edit would silently break any already
    // indexed or shared URL. Only a brand-new package gets a fresh slug.
    let slug: string;
    if (id) {
      const existing = await prisma.tourPackage.findUnique({
        where: { id },
        select: { slug: true },
      });
      if (!existing) return { error: "Package not found." };
      slug = existing.slug;
    } else {
      const base = slugify(p.title) || "package";
      slug = base;
      let n = 1;
      while (await prisma.tourPackage.findFirst({ where: { slug }, select: { id: true } })) {
        slug = `${base}-${++n}`;
      }
    }

    const data = {
      title: p.title,
      slug,
      origin: p.origin,
      destination: p.destination,
      route: p.route,
      state: p.state,
      category: encodeList(p.category),
      durationDays: p.durationDays,
      durationNights: p.durationNights,
      distanceKm: p.distanceKm,
      startingPrice: p.startingPrice,
      priceType: p.priceType,
      shortDescription: p.shortDescription,
      description: p.description,
      featuredImage: p.featuredImage,
      gallery: encodeList((p.gallery ?? "").split(/[\n,]/)),
      itinerary: parseItineraryText(p.itinerary ?? ""),
      inclusions: encodeList((p.inclusions ?? "").split(/[\n,]/)),
      exclusions: encodeList((p.exclusions ?? "").split(/[\n,]/)),
      vehicleOptions: encodeList((p.vehicleOptions ?? "").split(/[\n,]/)),
      pickupLocations: encodeList((p.pickupLocations ?? "").split(/[\n,]/)),
      tags: encodeList((p.tags ?? "").split(/[\n,]/)),
      faq: parseFaqText(p.faq ?? ""),
      featured: p.featured,
      popular: p.popular,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
      seoTitle: p.seoTitle || null,
      seoDescription: p.seoDescription || null,
      seoKeywords: p.seoKeywords || null,
    };

    if (id) await prisma.tourPackage.update({ where: { id }, data });
    else await prisma.tourPackage.create({ data });
  } catch {
    return { error: "Could not save the package." };
  }

  revalidatePublic(TAGS.packages);
  revalidatePath("/tours-packages");
  revalidatePath("/admin/packages");
  redirect("/admin/packages");
}

export async function deletePackageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.tourPackage.delete({ where: { id } });
  revalidatePublic(TAGS.packages);
  revalidatePath("/tours-packages");
  revalidatePath("/admin/packages");
  redirect("/admin/packages");
}

export async function toggleActivePackageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = await prisma.tourPackage.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!current) return;
  await prisma.tourPackage.update({ where: { id }, data: { isActive: !current.isActive } });
  revalidatePublic(TAGS.packages);
  revalidatePath("/tours-packages");
  revalidatePath("/admin/packages");
}

export async function toggleFeaturedPackageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = await prisma.tourPackage.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (!current) return;
  await prisma.tourPackage.update({ where: { id }, data: { featured: !current.featured } });
  revalidatePublic(TAGS.packages);
  revalidatePath("/tours-packages");
  revalidatePath("/admin/packages");
}

export async function togglePopularPackageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const current = await prisma.tourPackage.findUnique({
    where: { id },
    select: { popular: true },
  });
  if (!current) return;
  await prisma.tourPackage.update({ where: { id }, data: { popular: !current.popular } });
  revalidatePublic(TAGS.packages);
  revalidatePath("/tours-packages");
  revalidatePath("/admin/packages");
}

/** Clone a package (name suffixed " (Copy)", unpublished) so the admin can
 * tweak the route/destination for a similar itinerary without retyping it. */
export async function duplicatePackageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const src = await prisma.tourPackage.findUnique({ where: { id } });
  if (!src) return;

  const base = slugify(`${src.title}-copy`) || "package-copy";
  let slug = base;
  let n = 1;
  while (await prisma.tourPackage.findFirst({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${++n}`;
  }

  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = src;
  void _id;
  void _createdAt;
  void _updatedAt;

  const copy = await prisma.tourPackage.create({
    data: { ...rest, title: `${src.title} (Copy)`, slug, isActive: false },
  });

  revalidatePublic(TAGS.packages);
  revalidatePath("/admin/packages");
  redirect(`/admin/packages/${copy.id}`);
}
