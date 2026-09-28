import type { TourPackage } from "./types";

/**
 * `TourPackage`'s list-shaped columns are stored as JSON strings (same
 * convention as `Vehicle.features` — see src/lib/features.ts). These helpers
 * convert between the stored string and typed values, and give the admin form
 * simple line-based text areas instead of a bespoke repeater UI.
 */

export type ItineraryDay = { day: number; title: string; description: string };
export type FaqPair = { question: string; answer: string };

/** A package row with every JSON column decoded to its real shape. */
export type PackageView = Omit<
  TourPackage,
  | "category"
  | "gallery"
  | "itinerary"
  | "inclusions"
  | "exclusions"
  | "vehicleOptions"
  | "pickupLocations"
  | "tags"
  | "faq"
> & {
  category: string[];
  gallery: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  vehicleOptions: string[];
  pickupLocations: string[];
  tags: string[];
  faq: FaqPair[];
};

export function decodeList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    // Fall through to delimiter parsing for hand-entered values.
  }
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function encodeList(list: string[], max = 40): string {
  return JSON.stringify(list.map((s) => s.trim()).filter(Boolean).slice(0, max));
}

/** Textarea convention: one day per line — "Day 1: Title | Description". */
export function decodeItinerary(raw: string | null | undefined): ItineraryDay[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ItineraryDay[];
  } catch {
    // fall through
  }
  return [];
}

export function itineraryToText(items: ItineraryDay[]): string {
  return items
    .map((d) => `Day ${d.day}: ${d.title} | ${d.description}`)
    .join("\n");
}

export function parseItineraryText(raw: string): string {
  const days: ItineraryDay[] = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const m = line.match(/^Day\s*(\d+)\s*:\s*([^|]+)\|?\s*(.*)$/i);
      if (m) {
        return {
          day: Number(m[1]) || i + 1,
          title: m[2].trim(),
          description: (m[3] ?? "").trim(),
        };
      }
      // No "Day N:" prefix — treat the whole line as the title.
      return { day: i + 1, title: line, description: "" };
    });
  return JSON.stringify(days.slice(0, 30));
}

/** Textarea convention: one Q&A per line — "Question :: Answer". */
export function decodeFaq(raw: string | null | undefined): FaqPair[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as FaqPair[];
  } catch {
    // fall through
  }
  return [];
}

export function faqToText(items: FaqPair[]): string {
  return items.map((f) => `${f.question} :: ${f.answer}`).join("\n");
}

export function parseFaqText(raw: string): string {
  const items: FaqPair[] = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, ...rest] = line.split("::");
      return { question: (q ?? "").trim(), answer: rest.join("::").trim() };
    })
    .filter((f) => f.question && f.answer);
  return JSON.stringify(items.slice(0, 20));
}

/** Featured image first, then gallery, de-duplicated. */
export function packagePhotos(p: {
  featuredImage: string;
  gallery: string[];
}): string[] {
  return [p.featuredImage, ...p.gallery].filter(
    (src, i, arr) => src && arr.indexOf(src) === i,
  );
}

export function decodePackage(row: TourPackage): PackageView {
  return {
    ...row,
    category: decodeList(row.category),
    gallery: decodeList(row.gallery),
    itinerary: decodeItinerary(row.itinerary),
    inclusions: decodeList(row.inclusions),
    exclusions: decodeList(row.exclusions),
    vehicleOptions: decodeList(row.vehicleOptions),
    pickupLocations: decodeList(row.pickupLocations),
    tags: decodeList(row.tags),
    faq: decodeFaq(row.faq),
  };
}
