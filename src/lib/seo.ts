import type { Metadata } from "next";
import type { PackageState } from "./constants";

/**
 * Official state/UT government tourism board for each destination state —
 * used as an authoritative outbound citation on destination and package
 * pages (real government sources, not affiliate or paid links).
 */
export const STATE_TOURISM_BOARD: Record<PackageState, { name: string; url: string }> = {
  KARNATAKA: { name: "Karnataka Tourism (Govt. of Karnataka)", url: "https://karnatakatourism.org/en" },
  KERALA: { name: "Kerala Tourism (Govt. of Kerala)", url: "https://www.keralatourism.org" },
  TAMIL_NADU: { name: "Tamil Nadu Tourism (Govt. of Tamil Nadu)", url: "https://www.tamilnadutourism.tn.gov.in" },
  ANDHRA_PRADESH: { name: "Andhra Pradesh Tourism (Govt. of AP)", url: "https://tourism.ap.gov.in" },
  TELANGANA: { name: "Telangana Tourism (Govt. of Telangana)", url: "https://telanganatourism.gov.in" },
  GOA: { name: "Goa Tourism (Govt. of Goa)", url: "https://goatourism.gov.in" },
  PUDUCHERRY: { name: "Puducherry Tourism (Govt. of Puducherry)", url: "https://www.py.gov.in/tourism-0" },
};

/** National-level tourism authority — cited alongside the state board on
 * every destination/package page. Real Ministry of Tourism, Govt. of India
 * portal, verified before hardcoding. */
export const INCREDIBLE_INDIA = {
  name: "Incredible India (Ministry of Tourism, Govt. of India)",
  url: "https://www.incredibleindia.gov.in/en",
};

/**
 * Site-specific official authorities — only added where independently
 * verified real and directly relevant (a protected monument's ASI page, a
 * temple's own government-trust site), matched by a lowercase substring of
 * the destination/package name. Deliberately small: no fabricated deep
 * links for sites not individually checked.
 */
export const SITE_SPECIFIC_AUTHORITY: { match: string; name: string; url: string }[] = [
  {
    match: "hampi",
    name: "Archaeological Survey of India — Hampi Circle",
    url: "https://asi.nic.in/hampi/",
  },
  {
    match: "tirupati",
    name: "Tirumala Tirupati Devasthanams (Govt. of Andhra Pradesh)",
    url: "https://ttdevasthanams.ap.gov.in/",
  },
];

export function findSiteSpecificAuthority(name: string) {
  const lower = name.toLowerCase();
  return SITE_SPECIFIC_AUTHORITY.find((s) => lower.includes(s.match));
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sumpreethtoursandtravels.com";

export const SITE_NAME = "Sumpreeth Tours and Travels";

/**
 * Name / address / phone / geo — the single source of truth for every place
 * the business identity is rendered (header, footer, contact, JSON-LD,
 * sitemap). Keep this consistent with the DB `SiteSettings` defaults.
 */
export const BUSINESS = {
  name: SITE_NAME,
  legalName: "Sumpreeth Tours and Travels",
  phone: "+91 94486 48898",
  email: "info@sumpreethtoursandtravels.com",
  streetAddress: "Bangalore",
  locality: "Bengaluru",
  region: "Karnataka",
  postalCode: "560078",
  country: "IN",
  // Approximate centroid of the 560078 (JP Nagar / Bengaluru South) service base.
  latitude: 12.8916,
  longitude: 77.5847,
  priceRange: "₹₹",
  areaServed: [
    "Bengaluru",
    "Karnataka",
    "Tamil Nadu",
    "Kerala",
    "Andhra Pradesh",
    "Telangana",
  ],
} as const;

/** Google Maps deep link to the business's exact coordinates — used for both
 * the on-site "Get directions" link and the `hasMap` structured-data property. */
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${BUSINESS.latitude},${BUSINESS.longitude}`;

/** Absolute canonical URL for a path (`/fleet`, `/` …). */
export function canonical(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** OG image path relative to the site root. */
  image?: string;
  /** Set true for thin/utility pages that should not be indexed. */
  noindex?: boolean;
  /** Optional comma-separated keywords (Google ignores this tag; kept for other engines/bots). */
  keywords?: string;
};

/**
 * Builds a consistent per-route `Metadata` block: canonical + Open Graph +
 * Twitter, derived from one title/description/path.
 */
export const DEFAULT_OG_IMAGE = "/og.jpg";

/** Trims to Google's ~160-char display budget, cutting at a word boundary. */
function truncateDescription(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
}

export function pageMeta({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  keywords,
}: PageMetaInput): Metadata {
  const url = canonical(path);
  const desc = truncateDescription(description);
  // Top-level `title` stays bare so the root layout template appends the brand;
  // OG/Twitter get the fully-qualified title since no template applies there.
  const fullTitle = `${title} | ${SITE_NAME}`;
  const absoluteImageUrl = image.startsWith("http") ? image : canonical(image);

  return {
    title,
    description: desc,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      url,
      title: fullTitle,
      description: desc,
      images: [
        {
          url: absoluteImageUrl,
          width: image === DEFAULT_OG_IMAGE ? 1200 : undefined,
          height: image === DEFAULT_OG_IMAGE ? 630 : undefined,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [absoluteImageUrl],
    },
  };
}
