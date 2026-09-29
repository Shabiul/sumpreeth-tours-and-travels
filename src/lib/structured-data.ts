import { BUSINESS, SITE_NAME, SITE_URL, canonical, GOOGLE_MAPS_URL } from "./seo";
import type { SiteSettingsData, DestinationView } from "./site";
import type { VehicleView } from "./features";
import { vehiclePhotos } from "./features";
import type { PackageView } from "./packages";
import { packagePhotos } from "./packages";
import { PACKAGE_STATE_LABELS, type PackageState } from "./constants";

/**
 * Site-wide JSON-LD graph: the local business (TravelAgency / TaxiService /
 * LocalBusiness), the Organization that runs it, and the WebSite itself —
 * linked by `@id` so search engines and LLMs read them as one entity.
 */
export function businessJsonLd(settings: SiteSettingsData) {
  const sameAs = [
    settings.facebookUrl,
    settings.instagramUrl,
    settings.youtubeUrl,
  ].filter((x): x is string => Boolean(x));

  const address = {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.streetAddress,
    addressLocality: BUSINESS.locality,
    postalCode: BUSINESS.postalCode,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.country,
  };

  const majorCitiesServed = [
    "Bengaluru", "Mysuru", "Mandya", "Channapatna", "Ramanagara", "Hassan",
    "Sakleshpur", "Chikmagalur", "Madikeri", "Coorg", "Mangaluru", "Udupi",
    "Gokarna", "Shivamogga", "Tumakuru", "Chitradurga", "Davanagere", "Hubballi",
    "Dharwad", "Belagavi", "Hospet", "Hampi", "Ballari", "Raichur", "Vijayapura",
    "Bagalkot", "Chikkaballapur", "Kolar", "Ooty", "Coimbatore", "Chennai",
    "Hosur", "Krishnagiri", "Pondicherry", "Wayanad", "Munnar", "Kochi",
    "Tirupati", "Hyderabad", "Vijayawada", "Goa"
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: BUSINESS.legalName,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: canonical("/icon.png"),
          width: 256,
          height: 256,
        },
        image: canonical("/icon.png"),
        telephone: settings.phone,
        email: settings.email,
        address,
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: settings.phone,
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["English", "Kannada", "Hindi", "Telugu", "Tamil"],
            hoursAvailable: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
              ],
              opens: "00:00",
              closes: "23:59"
            }
          }
        ],
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-IN",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/destination?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": ["TravelAgency", "TaxiService", "LocalBusiness"],
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        telephone: settings.phone,
        email: settings.email,
        image: canonical("/icon.png"),
        priceRange: BUSINESS.priceRange,
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
        description:
          "24/7 cab rental and outstation travel service in Bengaluru covering Karnataka and South India — one-way drops, round trips, airport transfers, local rentals and tour packages.",
        address,
        geo: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS.latitude,
          longitude: BUSINESS.longitude,
        },
        hasMap: GOOGLE_MAPS_URL,
        areaServed: [
          ...BUSINESS.areaServed.map((name) => ({
            "@type": "AdministrativeArea",
            name,
          })),
          ...majorCitiesServed.map((name) => ({
            "@type": "City",
            name,
          })),
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        ...(sameAs.length ? { sameAs } : {}),
      },
    ],
  };
}

/** Product + Offer + Vehicle for a fleet detail page. */
export function vehicleJsonLd(vehicle: VehicleView, tagline: string) {
  const url = canonical(`/fleet/${vehicle.slug}`);
  const startingFare =
    vehicle.oneWayRate ??
    vehicle.localPackageRate ??
    (vehicle.roundTripPerKm != null ? vehicle.roundTripPerKm : null);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${vehicle.name} — ${vehicle.seats} seater`,
    description: tagline,
    url,
    image: vehiclePhotos(vehicle).map((src) =>
      src.startsWith("http") ? src : canonical(src),
    ),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Car rental with driver",
    ...(startingFare != null && !vehicle.quoteOnRequest
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: String(startingFare),
            availability: "https://schema.org/InStock",
            url,
            seller: { "@id": `${SITE_URL}/#business` },
          },
        }
      : {}),
  };
}

/** Product + Offer for a tour package detail page. */
export function packageJsonLd(pkg: PackageView) {
  const url = canonical(`/tours-packages/${pkg.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    description: pkg.shortDescription,
    url,
    image: packagePhotos(pkg).map((src) =>
      src.startsWith("http") ? src : canonical(src),
    ),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Tour package",
    ...(pkg.startingPrice != null && pkg.startingPrice > 0
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: String(pkg.startingPrice),
            availability: "https://schema.org/InStock",
            url,
            seller: { "@id": `${SITE_URL}/#business` },
          },
        }
      : {}),
  };
}

/**
 * Cab/travel Service + informational TouristDestination for a Bangalore-origin
 * route page (e.g. "Bangalore to Coorg cab"). One `Service` referencing the
 * single business `@id` via `areaServed`, not a second LocalBusiness — a
 * service area is not a branch.
 */
export function destinationJsonLd(dest: DestinationView) {
  const url = canonical(`/destination/${dest.slug}`);
  const stateName = PACKAGE_STATE_LABELS[dest.state as PackageState] ?? dest.state;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        name: dest.name,
        description: dest.description,
        url,
        image: canonical(dest.imageUrl),
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: stateName,
        },
      },
      {
        "@type": "Service",
        serviceType: "Outstation cab and one-way taxi service",
        name: `Bangalore to ${dest.name} cab service`,
        description: `One-way and round-trip cab booking from Bangalore to ${dest.name}.`,
        url,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: {
          "@type": "AdministrativeArea",
          name: dest.name,
        },
      },
    ],
  };
}

/**
 * AggregateRating + Review for the LocalBusiness, built only from testimonials
 * that are actually visible on the page rendering this — never emit this on a
 * page that doesn't show the same reviews (schema must match on-page content).
 */
export function reviewJsonLd(
  testimonials: { authorName: string; location: string; rating: number; quote: string }[],
) {
  if (testimonials.length === 0) return null;
  const avg =
    testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: testimonials.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.authorName },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: t.quote,
    })),
  };
}

/**
 * Voice-engine optimization: marks specific on-page content (by CSS selector)
 * as `Speakable` for voice assistants (Google Assistant/Actions, and other
 * engines that read this property) — only the classes actually present on
 * the page rendering this should be listed.
 */
export function speakableJsonLd(url: string, cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

/** FAQPage from the contact-page FAQ list. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * One Service entity referencing every town/taluk actually listed on the
 * "Areas We Serve" page — matches visible content exactly (a real coverage
 * list), never a set of individual fake-business listings.
 */
export function serviceAreaJsonLd(townNames: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "One-way, round-trip and local taxi service",
    name: "Sumpreeth Tours and Travels — service area",
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: townNames.map((name) => ({ "@type": "Place", name })),
  };
}

/** BreadcrumbList from an ordered [label, path] trail (path relative). */
export function breadcrumbJsonLd(trail: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: canonical(path),
    })),
  };
}
