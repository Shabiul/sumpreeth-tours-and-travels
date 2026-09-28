import "server-only";
import { unstable_cache } from "next/cache";
import { db, unwrap } from "./supabase";
import type { Destination } from "./types";
import { decodeFeatures, type VehicleView } from "./features";
import { decodePackage, decodeList, type PackageView } from "./packages";

export type { VehicleView, PackageView };

export type DestinationView = Omit<Destination, "highlights"> & {
  highlights: string[];
};

function decodeDestination(row: Destination): DestinationView {
  return { ...row, highlights: decodeList(row.highlights) };
}

/**
 * Cached read helpers for the public site. Each is tagged so the admin portal
 * can call `revalidateTag(...)` after a mutation and have pages refresh within
 * seconds without losing full-page caching.
 */

export const TAGS = {
  settings: "site-settings",
  vehicles: "vehicles",
  destinations: "destinations",
  testimonials: "testimonials",
  faqs: "faqs",
  packages: "packages",
} as const;

const FALLBACK_SETTINGS = {
  id: "singleton",
  heroHeadline: "Reliable Cabs & Outstation Travel Across Karnataka, 24/7",
  heroSubheadline:
    "Cars, tempo travellers and buses for airport runs, local errands and multi-day road trips across Karnataka and South India.",
  heroImageUrl: "/images/fleet/IMG-20260901-WA0058.jpg",
  aboutStory:
    "Sumpreeth Tours and Travels is a Bangalore-based cab and outstation travel service focused on reliable, comfortable and safe rides.",
  aboutPromise:
    "Timeliness, cleanliness, safety and professionalism on every trip — with transparent pricing and no hidden charges.",
  trustYears: "12+",
  trustTrips: "50,000+",
  trustCities: "180+",
  ctaBannerText: "Plan your next trip with Sumpreeth Tours and Travels",
  phone: "+91 94486 48898",
  whatsappNumber: "919448648898",
  email: "info@sumpreethtoursandtravels.com",
  address: "Bangalore – 560078, Karnataka, India",
  hours: "Open all days · 24/7",
  mapEmbedUrl: "https://www.google.com/maps?q=Bangalore%20560078&output=embed",
  facebookUrl: null as string | null,
  instagramUrl: null as string | null,
  youtubeUrl: null as string | null,
  adminPasswordHash: null as string | null,
  updatedAt: new Date(0).toISOString(),
};

export type SiteSettingsData = typeof FALLBACK_SETTINGS;

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettingsData> => {
    try {
      const { data } = await db.from("SiteSettings").select("*").eq("id", "singleton").maybeSingle();
      return (data as SiteSettingsData | null) ?? FALLBACK_SETTINGS;
    } catch {
      return FALLBACK_SETTINGS;
    }
  },
  ["site-settings"],
  { tags: [TAGS.settings], revalidate: 3600 },
);

export const getVehicles = unstable_cache(
  async (): Promise<VehicleView[]> => {
    try {
      const rows = unwrap<import("./types").Vehicle[]>(
        await db
          .from("Vehicle")
          .select("*")
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
          .order("name", { ascending: true }),
      );
      return rows.map((r) => ({
        ...r,
        features: decodeFeatures(r.features),
        images: decodeFeatures(r.images),
      }));
    } catch {
      return [];
    }
  },
  ["vehicles"],
  { tags: [TAGS.vehicles], revalidate: 3600 },
);

/** Single active vehicle by slug, with features/images decoded. */
export async function getVehicleBySlug(
  slug: string,
): Promise<VehicleView | null> {
  const all = await getVehicles();
  return all.find((v) => v.slug === slug) ?? null;
}

export const getDestinations = unstable_cache(
  async (): Promise<DestinationView[]> => {
    try {
      const rows = unwrap<Destination[]>(
        await db
          .from("Destination")
          .select("*")
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
          .order("name", { ascending: true }),
      );
      return rows.map(decodeDestination);
    } catch {
      return [];
    }
  },
  ["destinations"],
  { tags: [TAGS.destinations], revalidate: 3600 },
);

/** Single active destination by slug, with highlights decoded. */
export async function getDestinationBySlug(
  slug: string,
): Promise<DestinationView | null> {
  const all = await getDestinations();
  return all.find((d) => d.slug === slug) ?? null;
}

export const getTestimonials = unstable_cache(
  async (): Promise<import("./types").Testimonial[]> => {
    try {
      return unwrap<import("./types").Testimonial[]>(
        await db
          .from("Testimonial")
          .select("*")
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
          .order("createdAt", { ascending: false }),
      );
    } catch {
      return [];
    }
  },
  ["testimonials"],
  { tags: [TAGS.testimonials], revalidate: 3600 },
);

export const getPackages = unstable_cache(
  async (): Promise<PackageView[]> => {
    try {
      const rows = unwrap<import("./types").TourPackage[]>(
        await db
          .from("TourPackage")
          .select("*")
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
          .order("title", { ascending: true }),
      );
      return rows.map(decodePackage);
    } catch {
      return [];
    }
  },
  ["packages"],
  { tags: [TAGS.packages], revalidate: 3600 },
);

/** Single active package by slug, with every JSON column decoded. */
export async function getPackageBySlug(slug: string): Promise<PackageView | null> {
  const all = await getPackages();
  return all.find((p) => p.slug === slug) ?? null;
}

export const getFaqs = unstable_cache(
  async (): Promise<import("./types").FaqItem[]> => {
    try {
      return unwrap<import("./types").FaqItem[]>(
        await db
          .from("FaqItem")
          .select("*")
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
          .order("createdAt", { ascending: true }),
      );
    } catch {
      return [];
    }
  },
  ["faqs"],
  { tags: [TAGS.faqs], revalidate: 3600 },
);
