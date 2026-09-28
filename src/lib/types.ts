/**
 * Manual row types mirroring prisma/schema.prisma (the schema/migration
 * source of truth), since app code no longer imports @prisma/client types.
 * Timestamp columns come back from Supabase/PostgREST as ISO strings, not
 * Date instances.
 */

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  serviceType: string;
  pickupLocation: string;
  dropLocation: string | null;
  pickupAt: string | null;
  message: string | null;
  status: string;
  adminNotes: string | null;
  sourcePage: string;
  packageSlug: string | null;
  packageTitle: string | null;
  travellers: number | null;
  vehiclePreference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  category: string;
  seats: string;
  features: string;
  imageUrl: string;
  images: string;
  sortOrder: number;
  isActive: boolean;
  quoteOnRequest: boolean;
  oneWayRate: number | null;
  oneWayNote: string | null;
  roundTripPerKm: number | null;
  minKmPerDay: number | null;
  driverBata: number | null;
  roundTripNote: string | null;
  localPackageRate: number | null;
  localExtraPerKm: number | null;
  localExtraPerHr: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Destination = {
  id: string;
  name: string;
  slug: string;
  category: string;
  state: string;
  description: string;
  imageUrl: string;
  distanceKm: number | null;
  highlights: string;
  packageSlug: string | null;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: string;
  authorName: string;
  location: string;
  rating: number;
  quote: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  id: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  aboutStory: string;
  aboutPromise: string;
  trustYears: string;
  trustTrips: string;
  trustCities: string;
  ctaBannerText: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  hours: string;
  mapEmbedUrl: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  adminId: string;
  adminPasswordHash: string | null;
  updatedAt: string;
};

export type TourPackage = {
  id: string;
  title: string;
  slug: string;
  origin: string;
  destination: string;
  route: string;
  state: string;
  region: string;
  category: string;
  durationDays: number;
  durationNights: number;
  distanceKm: number | null;
  startingPrice: number | null;
  priceType: string;
  shortDescription: string;
  description: string;
  featuredImage: string;
  gallery: string;
  itinerary: string;
  inclusions: string;
  exclusions: string;
  vehicleOptions: string;
  pickupLocations: string;
  tags: string;
  faq: string;
  featured: boolean;
  popular: boolean;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
};
