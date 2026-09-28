import { KARNATAKA_AREAS } from "./karnataka-areas";
import { INTERSTATE_AREAS } from "./interstate-areas";
import { INDIA_CITIES } from "./india-cities";
import { CITY_ALIASES } from "./city-aliases";

/**
 * Every town for the pickup/drop autocomplete: Karnataka + interstate coverage
 * towns first (Sumpreeth's actual declared service area), then major cities
 * nationwide as typing convenience — not a service-area claim, see
 * india-cities.ts.
 */
export const SERVICE_TOWNS: string[] = Array.from(
  new Set([
    ...KARNATAKA_AREAS.flatMap((d) => d.towns),
    ...INTERSTATE_AREAS.flatMap((s) => s.areas.flatMap((a) => a.towns)),
    ...INDIA_CITIES,
    ...CITY_ALIASES,
  ]),
).sort((a, b) => a.localeCompare(b));
