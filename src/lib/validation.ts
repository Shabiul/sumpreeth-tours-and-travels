import { z } from "zod";

export const serviceTypeEnum = z.enum([
  "ONE_WAY",
  "ROUND_TRIP",
  "AIRPORT",
  "LOCAL",
  "TOUR_PACKAGE",
]);

export const enquiryStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "BOOKED",
  "CLOSED",
]);

export const vehicleCategoryEnum = z.enum(["CAR", "TEMPO_TRAVELLER", "BUS"]);

export const destinationCategoryEnum = z.enum([
  "HILL_STATION",
  "HERITAGE",
  "PILGRIMAGE",
  "NATURE_FALLS",
  "MAJOR_CITY",
  "OUTSTATION_GETAWAY",
]);

export const packageStateEnum = z.enum([
  "KARNATAKA",
  "KERALA",
  "TAMIL_NADU",
  "ANDHRA_PRADESH",
  "TELANGANA",
  "GOA",
  "PUDUCHERRY",
]);

export const packageCategoryEnum = z.enum([
  "FAMILY",
  "HONEYMOON",
  "WEEKEND",
  "ADVENTURE",
  "PILGRIMAGE",
  "WILDLIFE",
  "GROUP",
  "CORPORATE",
  "CUSTOM",
]);

export const packagePriceTypeEnum = z.enum(["PER_PACKAGE", "PER_PERSON"]);

/** Public enquiry form (booking widget + contact page). */
export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[\d+\-\s()]+$/, "Phone number looks invalid"),
  serviceType: serviceTypeEnum,
  pickupLocation: z.string().trim().min(2, "Enter a pickup location").max(120),
  dropLocation: z.string().trim().max(120).optional().or(z.literal("")),
  pickupAt: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  sourcePage: z.string().trim().max(40).optional(),
  // Populated only when the enquiry comes from a tour package page.
  packageSlug: z.string().trim().max(140).optional().or(z.literal("")),
  packageTitle: z.string().trim().max(140).optional().or(z.literal("")),
  travellers: z.coerce.number().int().min(1).max(200).optional(),
  vehiclePreference: z.string().trim().max(60).optional().or(z.literal("")),
  // Honeypot — must stay empty.
  company: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

/**
 * An image reference: either a full https URL (e.g. Unsplash) or a site-relative
 * path to a file in /public (e.g. "/images/fleet/IMG-20260901-WA0040.jpg").
 */
const imageRef = z
  .string()
  .trim()
  .refine(
    (v) => /^https?:\/\/.+/i.test(v) || /^\/[^\s]+\.(jpe?g|png|webp|avif|gif|svg)$/i.test(v),
    "Enter a full image URL or a path like /images/fleet/photo.jpg",
  );

const intFromForm = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v)))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Must be a positive number")
  .nullable();

export const vehicleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: vehicleCategoryEnum,
  seats: z.string().trim().min(1).max(20),
  features: z.string().trim().max(600), // newline or comma separated in the form
  imageUrl: imageRef,
  images: z.string().trim().max(4000).optional().or(z.literal("")), // one image URL/path per line
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.coerce.boolean().default(true),
  quoteOnRequest: z.coerce.boolean().default(false),
  oneWayRate: intFromForm,
  oneWayNote: z.string().trim().max(120).optional().or(z.literal("")),
  roundTripPerKm: intFromForm,
  minKmPerDay: intFromForm,
  driverBata: intFromForm,
  roundTripNote: z.string().trim().max(160).optional().or(z.literal("")),
  localPackageRate: intFromForm,
  localExtraPerKm: intFromForm,
  localExtraPerHr: intFromForm,
});

export const destinationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: destinationCategoryEnum,
  state: packageStateEnum,
  description: z.string().trim().min(10).max(400),
  imageUrl: imageRef,
  distanceKm: intFromForm,
  highlights: z.string().trim().max(1000).optional().or(z.literal("")),
  packageSlug: z.string().trim().max(160).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.coerce.boolean().default(true),
  seoTitle: z.string().trim().max(90).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(170).optional().or(z.literal("")),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  quote: z.string().trim().min(10).max(600),
  imageUrl: imageRef.optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const faqSchema = z.object({
  question: z.string().trim().min(5).max(200),
  answer: z.string().trim().min(5).max(1200),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const packageSchema = z.object({
  title: z.string().trim().min(4, "Enter a title").max(120),
  origin: z.string().trim().min(2).max(60).default("Bangalore"),
  destination: z.string().trim().min(2, "Enter the destination").max(80),
  route: z.string().trim().min(4, "Enter the route").max(160),
  state: packageStateEnum,
  category: z.array(packageCategoryEnum).default([]),
  durationDays: z.coerce.number().int().min(1).max(30),
  durationNights: z.coerce.number().int().min(0).max(30),
  distanceKm: intFromForm,
  startingPrice: intFromForm,
  priceType: packagePriceTypeEnum.default("PER_PACKAGE"),
  shortDescription: z.string().trim().min(10, "Enter a short description").max(220),
  description: z.string().trim().min(20, "Enter a fuller description").max(4000),
  featuredImage: imageRef,
  gallery: z.string().trim().max(4000).optional().or(z.literal("")),
  itinerary: z.string().trim().max(6000).optional().or(z.literal("")),
  inclusions: z.string().trim().max(2000).optional().or(z.literal("")),
  exclusions: z.string().trim().max(2000).optional().or(z.literal("")),
  vehicleOptions: z.string().trim().max(600).optional().or(z.literal("")),
  pickupLocations: z.string().trim().max(600).optional().or(z.literal("")),
  tags: z.string().trim().max(600).optional().or(z.literal("")),
  faq: z.string().trim().max(4000).optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  popular: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(170).optional().or(z.literal("")),
  seoKeywords: z.string().trim().max(300).optional().or(z.literal("")),
});

export const siteSettingsSchema = z.object({
  heroHeadline: z.string().trim().min(5).max(160),
  heroSubheadline: z.string().trim().min(5).max(400),
  heroImageUrl: imageRef,
  aboutStory: z.string().trim().min(20).max(2000),
  aboutPromise: z.string().trim().min(10).max(400),
  trustYears: z.string().trim().min(1).max(12),
  trustTrips: z.string().trim().min(1).max(16),
  trustCities: z.string().trim().min(1).max(12),
  ctaBannerText: z.string().trim().min(5).max(160),
  phone: z.string().trim().min(7).max(24),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Digits only, including country code (e.g. 919448648898)"),
  email: z.string().trim().email(),
  address: z.string().trim().min(5).max(200),
  hours: z.string().trim().min(3).max(80),
  mapEmbedUrl: z.string().trim().url(),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  youtubeUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Admin portal sign-in (ID + password + optional "remember me"). */
export const adminLoginSchema = z.object({
  id: z.string().trim().min(1, "Enter your ID").max(60),
  password: z.string().min(1, "Enter your password").max(200),
  remember: z.coerce.boolean().default(false),
});

/** Reset the admin password with a one-time code. */
export const otpResetSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Turn a comma / newline separated string into a clean string array. */
export function parseFeatures(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}
