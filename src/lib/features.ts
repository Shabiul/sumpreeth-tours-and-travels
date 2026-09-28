import type { Vehicle } from "./types";

/**
 * `Vehicle.features` is stored as a JSON string array (SQLite has no scalar
 * lists). These helpers convert between the stored string and a string[].
 */

/** A vehicle row with `features` / `images` decoded from their JSON strings. */
export type VehicleView = Omit<Vehicle, "features" | "images"> & {
  features: string[];
  images: string[];
};

/** Cover image first, then any extra gallery images, de-duplicated. */
export function vehiclePhotos(v: {
  imageUrl: string;
  images: string[];
}): string[] {
  return [v.imageUrl, ...v.images].filter(
    (src, i, arr) => src && arr.indexOf(src) === i,
  );
}

export function decodeFeatures(raw: string | null | undefined): string[] {
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

export function encodeFeatures(list: string[]): string {
  return JSON.stringify(list.map((s) => s.trim()).filter(Boolean).slice(0, 12));
}
