import "server-only";
import { db, unwrap } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

/**
 * Ensure the singleton SiteSettings row exists, seeding safe defaults if the
 * seed script never ran. Safe to call unconditionally — a no-op if the row
 * already exists (mirrors Prisma's old `upsert({ update: {} })`).
 */
export async function seedSettingsIfMissing(): Promise<SiteSettings> {
  await db.from("SiteSettings").upsert(
    {
      id: "singleton",
      heroHeadline: "Reliable Cabs & Outstation Travel Across Karnataka, 24/7",
      heroSubheadline:
        "Cars, tempo travellers and buses for airport, local and multi-day trips across Karnataka and South India.",
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
      updatedAt: new Date().toISOString(),
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  return unwrap<SiteSettings>(
    await db.from("SiteSettings").select("*").eq("id", "singleton").single(),
  );
}
