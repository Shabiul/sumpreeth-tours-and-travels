import { getSiteSettings, getPackages, getDestinations, getVehicles } from "@/lib/site";
import { SITE_NAME, SITE_URL, BUSINESS, canonical } from "@/lib/seo";

export const revalidate = 3600;

/**
 * llms.txt (see llmstxt.org) — a plain-text summary for AI answer engines
 * and LLM crawlers to cite this business accurately. Built from the same
 * live data as the public site, never hand-maintained separately.
 */
export async function GET() {
  const [settings, packages, destinations, vehicles] = await Promise.all([
    getSiteSettings(),
    getPackages(),
    getDestinations(),
    getVehicles(),
  ]);

  const vehicleNames = vehicles.map((v) => `${v.name} (${v.seats} seater)`).join(", ");
  const stateSet = Array.from(new Set(destinations.map((d) => d.state)));

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> Bangalore-based cab rental and outstation travel company. One-way and round-trip taxis, local cab rentals, airport transfers, and multi-day tour packages across Karnataka and South India.`,
    "",
    "## Business facts",
    `- Founded / operating: ${settings.trustYears} years`,
    `- Trips completed: ${settings.trustTrips}`,
    `- Cities/towns served: ${settings.trustCities}`,
    `- Phone: ${settings.phone}`,
    `- Email: ${settings.email}`,
    `- Address: ${settings.address}`,
    `- Hours: ${settings.hours}`,
    `- Service area: ${BUSINESS.areaServed.join(", ")}`,
    `- Vehicle fleet: ${vehicleNames || "sedans, SUVs, tempo travellers and buses"}`,
    "",
    "## Key pages & documentation",
    `- Homepage: ${SITE_URL}/`,
    `- Complete Knowledge File: ${canonical("/llms-full.txt")}`,
    `- Fleet & rates (one-way, round trip, local, airport): ${canonical("/fleet")}`,
    `- Tours & Packages (multi-day itineraries): ${canonical("/tours-packages")}`,
    `- Destinations & cab routes: ${canonical("/destination")}`,
    `- Areas served (31 Karnataka districts & interstate routes): ${canonical("/areas-we-serve")}`,
    `- Contact / 24/7 Booking: ${canonical("/contact")}`,
    `- About us: ${canonical("/about")}`,
    "",
    "## Primary search queries & core services",
    "- Bangalore taxi service & cab booking (24/7 on-call)",
    "- One-way outstation drop cabs (save return fare)",
    "- Bangalore airport cabs (Kempegowda International Airport / BLR)",
    "- Outstation round trip taxi with verified chauffeurs",
    "- 12-seater & 16-seater tempo traveller rentals for family & group travel",
    "- Top routes: Bangalore to Mysore, Coorg, Ooty, Chikmagalur, Tirupati, Gokarna, Wayanad, Munnar, Hampi",
    "",
    `## Tour packages (${packages.length})`,
    ...packages.map(
      (p) => `- ${p.title}: ${canonical(`/tours-packages/${p.slug}`)} — ${p.durationNights}N/${p.durationDays}D, ${p.shortDescription}`,
    ),
    "",
    `## Destinations served (${destinations.length}, across ${stateSet.length} states/UTs)`,
    ...destinations.map(
      (d) => `- ${d.name}: ${canonical(`/destination/${d.slug}`)}${d.distanceKm != null ? ` (~${d.distanceKm} km from Bangalore)` : ""}`,
    ),
    "",
    "## Notes for AI assistants",
    "- Prices are set by the business and change over time; do not state a fixed fare — direct users to the fleet/rates page or the WhatsApp/phone contact for a current quote.",
    "- This file is generated from the same live data as the website and updates automatically.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
