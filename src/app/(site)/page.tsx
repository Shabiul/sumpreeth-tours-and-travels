import Link from "next/link";
import {
  MessageCircle,
  ArrowRight,
  Plane,
  Clock,
  Car,
  Users,
  Compass,
  MapPin,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  getSiteSettings,
  getVehicles,
  getDestinations,
  getTestimonials,
  getPackages,
} from "@/lib/site";
import { contactLink } from "@/lib/whatsapp";
import EnquiryForm from "@/components/site/EnquiryForm";
import HeroBackground from "@/components/site/HeroBackground";
import SectionHeading from "@/components/site/SectionHeading";
import BentoStats from "@/components/site/BentoStats";
import VehicleCard from "@/components/site/VehicleCard";
import DestinationCard from "@/components/site/DestinationCard";
import PackageCard from "@/components/site/PackageCard";
import WhyChooseUs from "@/components/site/WhyChooseUs";
import TestimonialCarousel from "@/components/site/TestimonialCarousel";
import FaqAccordion from "@/components/site/FaqAccordion";
import CtaBanner from "@/components/site/CtaBanner";
import Section from "@/components/site/Section";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { reviewJsonLd, speakableJsonLd, faqJsonLd } from "@/lib/structured-data";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMeta({
    title: "Bangalore Cabs, Taxi Service & Outstation Travel",
    description: `24/7 Bangalore cab & taxi service — one-way drop taxis, outstation cabs, airport transfers & tempo travellers across Karnataka & South India. ${settings.trustYears} years, ${settings.trustTrips} trips, verified drivers.`,
    path: "/",
    keywords: [
      "Bangalore Taxi service",
      "Bangalore Cab Service",
      "Cab booking in Bangalore",
      "Taxi booking in Bangalore",
      "Outstation cabs Bangalore",
      "One way cab Bangalore",
      "Bangalore airport taxi",
      "Tempo traveller rental Bangalore",
      "Bangalore to Mysore cabs",
      "Bangalore to Coorg taxi",
      "Bangalore to Ooty taxi",
      "Bangalore to Chikmagalur taxi",
      "Karnataka outstation cab",
    ].join(", "),
  });
}

const PREVIEW_DESTS = [
  "Madikeri / Coorg",
  "Hampi",
  "Chikmagalur",
  "Mysore",
  "Shivanasamudra Falls",
  "Bangalore Palace",
];

const TOP_OUTSTATION_ROUTES = [
  { name: "Mysore", slug: "mysore", distance: "145 km", duration: "~3 hrs via Expressway", type: "One Way & Round Trip" },
  { name: "Coorg / Madikeri", slug: "madikeri-coorg", distance: "260 km", duration: "~5.5 hrs", type: "Hill Station Outstation" },
  { name: "Ooty", slug: "ooty", distance: "270 km", duration: "~6 hrs via Bandipur", type: "Nilgiri Getaway" },
  { name: "Chikmagalur", slug: "chikmagalur", distance: "245 km", duration: "~4.5 hrs", type: "Coffee Country Tour" },
  { name: "Tirupati", slug: "tirupati", distance: "250 km", duration: "~4.5 hrs", type: "Temple Pilgrimage" },
  { name: "Wayanad", slug: "wayanad", distance: "290 km", duration: "~6 hrs", type: "Kerala Wildlife & Hills" },
  { name: "Gokarna", slug: "gokarna", distance: "480 km", duration: "~8.5 hrs", type: "Beach & Heritage" },
  { name: "Hampi", slug: "hampi", distance: "340 km", duration: "~6 hrs", type: "UNESCO Heritage" },
  { name: "Sakleshpur", slug: "sakleshpur", distance: "220 km", duration: "~4 hrs", type: "Western Ghats Trail" },
  { name: "Dharmasthala / Kukke", slug: "dharmasthala", distance: "295 km", duration: "~6 hrs", type: "Dakshina Kannada Circuit" },
  { name: "Pondicherry", slug: "pondicherry", distance: "410 km", duration: "~7 hrs", type: "Coastal French Quarter" },
  { name: "Munnar", slug: "munnar", distance: "490 km", duration: "~9.5 hrs", type: "Kerala Tea Escapes" },
];

const CORE_SERVICES = [
  {
    icon: Compass,
    title: "One-Way Drop Taxi",
    subtitle: "Save up to 40% on outstation travel",
    description:
      "Pay only for the drop distance. No empty return charges when you travel from Bangalore to Mysore, Coorg, Chennai, Ooty, Salem, Coimbatore, Hassan, or 180+ towns.",
    features: ["No return fare", "Doorstep pickup in Bengaluru", "Sedans, SUVs & Tempo Travellers"],
    href: "/destination",
  },
  {
    icon: Car,
    title: "Outstation Round Trips",
    subtitle: "Dedicated cab & driver at your disposal",
    description:
      "Door-to-door cab rentals across Karnataka, Tamil Nadu, Kerala, Andhra Pradesh & Goa. Unlimited stops, flexible sightseeing, and transparent per-km billing from ₹12/km.",
    features: ["Transparent per-km billing", "Verified courteous chauffeurs", "Custom sightseeing itineraries"],
    href: "/fleet",
  },
  {
    icon: Plane,
    title: "Bangalore Airport Cabs (BLR)",
    subtitle: "24/7 on-time Kempegowda Airport pickup & drop",
    description:
      "Guaranteed on-time airport taxi service across all Bangalore localities. Flight-tracking included so your driver is waiting at the arrival terminal even if flights are delayed.",
    features: ["Zero midnight surge", "Ample luggage space", "Flight delay tracking"],
    href: "/contact",
  },
  {
    icon: Clock,
    title: "Local Hourly Rentals",
    subtitle: "8h/80km & 12h/120km city packages",
    description:
      "Ideal for city shopping, business meetings, client visits, medical appointments, and wedding guest transportation within Bengaluru city limits.",
    features: ["Multiple stops allowed", "Standby chauffeur", "Clean & sanitised AC cars"],
    href: "/fleet",
  },
  {
    icon: Users,
    title: "Tempo Traveller & Bus Hire",
    subtitle: "12, 16 Seater & Force Urbania for groups",
    description:
      "Comfortable group travel with individual push-back seats, separate luggage boots, dual AC, and experienced highway drivers for family holidays and temple tours.",
    features: ["Push-back captain seats", "Spacious luggage trunks", "Ideal for 8 to 25+ people"],
    href: "/fleet",
  },
  {
    icon: ShieldCheck,
    title: "Tour Packages with Cabs",
    subtitle: "Curated multi-day South India itineraries",
    description:
      "Handcrafted tour packages from Bangalore to Coorg, Ooty, Mysore, Chikmagalur, Tirupati, Gokarna, Kerala & Tamil Nadu with private vehicle, driver, and sightseeing.",
    features: ["All sightseeing drives included", "Fuel & driver bata included", "Customizable itineraries"],
    href: "/tours-packages",
  },
];

const HOMEPAGE_FAQS = [
  {
    question: "How do I book a cab in Bangalore with Sumpreeth Tours and Travels?",
    answer:
      "Booking is instant and simple. You can call our 24/7 dispatch desk on +91 94486 48898 or send a message on WhatsApp. Share your pickup address, destination, travel dates, and preferred vehicle type (Sedan, SUV, or Tempo Traveller). Our team provides an immediate quote with transparent inclusions and sends your driver and vehicle details well before pickup.",
  },
  {
    question: "Do you offer one-way drop taxi services from Bangalore to other cities?",
    answer:
      "Yes. We operate one-way drop cabs from Bangalore to over 180 cities and towns across Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, and Telangana. With our one-way taxi service, you only pay for the one-way distance without paying for the return trip, saving up to 40% compared to traditional round-trip billing.",
  },
  {
    question: "What are the outstation cab charges per km from Bangalore?",
    answer:
      "Outstation round-trip fares start from ₹12/km for 4+1 sedans (Toyota Etios, Swift Dzire), ₹17–₹18/km for 6+1 and 7+1 SUVs (Toyota Innova, Innova Crysta), and ₹20–₹28/km for 12-seater and 16-seater Tempo Travellers. Outstation trips have a standard minimum billing of 300 km per day with a transparent driver allowance (bata). Tolls and state permits are billed at actuals.",
  },
  {
    question: "Can I book a Bangalore airport cab (BLR) late at night or early morning?",
    answer:
      "Yes, our airport cab service operates 24 hours a day, 7 days a week. Whether you have a 3:00 AM departure or a late-night arrival at Kempegowda International Airport (BLR), we guarantee on-time pickup from anywhere in Bangalore. We track flight arrival times so your driver is ready when you exit the terminal, with zero surge pricing.",
  },
  {
    question: "What vehicles are available for group trips and family outstation tours?",
    answer:
      "For family and group tours, we offer 7-seater Toyota Innova and Innova Crysta MPVs, 12-seater and 16-seater Force Tempo Travellers, Force Urbania luxury vans, and 20+ seater minibuses. All group vehicles feature reclining push-back seats, separate spacious luggage compartments, dual air-conditioning, and GPS tracking.",
  },
  {
    question: "Are driver allowances (bata), tolls, and parking included in the quotation?",
    answer:
      "Vehicle fuel and driver allowance (bata) are clearly outlined in your initial quote. Toll charges, parking fees, and interstate entry permits (when crossing into Tamil Nadu, Kerala, or Andhra Pradesh) are charged strictly at actuals, with receipts provided, ensuring 100% transparent pricing with no hidden charges.",
  },
  {
    question: "Which localities in Bangalore do you provide doorstep pickup from?",
    answer:
      "We provide doorstep pickup across all areas in Bangalore, including Whitefield, Electronic City, Indiranagar, Koramangala, HSR Layout, JP Nagar, Jayanagar, Marathahalli, Bellandur, Sarjapur Road, Hebbal, Yelahanka, Rajajinagar, Malleshwaram, Banashankari, BTM Layout, Vijayanagar, Basavanagudi, and Kempegowda International Airport.",
  },
];

export default async function HomePage() {
  const [settings, vehicles, destinations, testimonials, packages] =
    await Promise.all([
      getSiteSettings(),
      getVehicles(),
      getDestinations(),
      getTestimonials(),
      getPackages(),
    ]);

  const waHref = contactLink(settings.whatsappNumber);

  const fleetPreview = [
    vehicles.find((v) => v.category === "CAR" && v.seats.startsWith("4")),
    vehicles.find((v) => v.category === "CAR" && v.seats.startsWith("7")),
    vehicles.find((v) => v.category === "TEMPO_TRAVELLER"),
  ].filter(Boolean) as typeof vehicles;

  const packagePreview = [...packages]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    .slice(0, 3);

  const destPreview =
    destinations.filter((d) => PREVIEW_DESTS.includes(d.name)).slice(0, 6);
  const destShown = destPreview.length >= 3 ? destPreview : destinations.slice(0, 6);

  const testimonialRating = reviewJsonLd(
    testimonials.map((t) => ({
      authorName: t.authorName,
      location: t.location,
      rating: t.rating,
      quote: t.quote,
    })),
  );

  return (
    <>
      {testimonialRating && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialRating) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(speakableJsonLd(SITE_URL, [".speakable-overview"])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(HOMEPAGE_FAQS)),
        }}
      />

      {/* Hero */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
        <HeroBackground
          video="/images/fleet-hero.mp4"
          poster={settings.heroImageUrl}
          alt="A Sumpreeth Tours and Travels vehicle ready for an outstation trip"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-900/90 via-forest-900/70 to-forest-900/40" />

        <div className="container-page grid gap-10 py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="text-white">
            <p className="inline-flex rounded-full bg-surface/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-saffron-200 ring-1 ring-white/20">
              {settings.hours}
            </p>
            <h1 className="speakable-overview mt-5 text-display font-extrabold text-white">
              {settings.heroHeadline}
            </h1>
            <p className="speakable-overview mt-5 max-w-xl text-lead text-forest-100/90">
              {settings.heroSubheadline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent"
              >
                <MessageCircle className="h-4 w-4" />
                Book Now on WhatsApp
              </a>
              <Link href="/fleet" className="btn-white">
                View Fleet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <EnquiryForm
            variant="widget"
            whatsappNumber={settings.whatsappNumber}
            sourcePage="home-hero"
          />
        </div>
      </section>

      {/* Trust bar — bento */}
      <BentoStats
        years={settings.trustYears}
        trips={settings.trustTrips}
        cities={settings.trustCities}
      />

      {/* Core Cab & Taxi Services in Bangalore */}
      <Section bleed="surface">
        <div className="reveal">
          <SectionHeading
            center
            eyebrow="Services"
            title="Bangalore Cab Services for Every Travel Need"
            intro="From solo one-way airport drops to 16-seater outstation temple circuits — transparent fares, GPS-tracked vehicles, and verified chauffeurs."
          />
        </div>
        <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="reveal card flex flex-col justify-between p-6">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-700 dark:bg-white/[0.08] dark:text-forest-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-h4 font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-saffron-600">
                    {s.subtitle}
                  </p>
                  <p className="mt-2.5 text-sm text-bodytext">{s.description}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs font-medium text-ink">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-forest-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={s.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-ink dark:text-forest-300"
                >
                  Explore service
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Top Outstation Routes Matrix */}
      <Section>
        <div className="reveal flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Outstation Cabs"
            title="Top Outstation Taxi Routes from Bangalore"
            intro="Browse distance, estimated drive times, and cab options for Karnataka & South India's most popular routes."
          />
          <Link
            href="/destination"
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-bodytext hover:text-ink sm:inline-flex"
          >
            All 60+ routes
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOP_OUTSTATION_ROUTES.map((r) => (
            <Link
              key={r.slug}
              href={`/destination/${r.slug}`}
              className="reveal card group block p-4 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-saffron-600">
                  {r.type}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-muted">
                  <MapPin className="h-3 w-3 text-forest-500" />
                  {r.distance}
                </span>
              </div>
              <h3 className="mt-1 font-bold text-ink group-hover:text-forest-700 dark:group-hover:text-forest-300">
                Bangalore to {r.name}
              </h3>
              <p className="mt-1 text-xs text-bodytext">{r.duration}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-300">
                Book cab
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Fleet preview */}
      <Section bleed="surface">
        <div className="reveal flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Our fleet"
            title="The Right Vehicle for Every Trip"
            intro="From solo airport runs to 16-seater temple tours — all GPS-enabled, sanitised, and driven by verified drivers."
          />
          <Link
            href="/fleet"
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-bodytext hover:text-ink sm:inline-flex"
          >
            All vehicles &amp; rates
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {fleetPreview.map((v, i) => (
            <div key={v.id} className="reveal">
              <VehicleCard
                vehicle={v}
                phone={settings.phone}
                whatsappNumber={settings.whatsappNumber}
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Tour packages */}
      {packagePreview.length > 0 && (
        <Section>
          <div className="reveal flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Tours & Packages"
              title="Ready-Made Multi-Day Trips from Bangalore"
              intro="Planned itineraries with sightseeing, vehicle options and transparent inclusions — or ask us to customize one."
            />
            <Link
              href="/tours-packages"
              className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-bodytext hover:text-ink sm:inline-flex"
            >
              All tour packages
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
            {packagePreview.map((p) => (
              <div key={p.id} className="reveal h-full">
                <PackageCard pkg={p} whatsappNumber={settings.whatsappNumber} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Popular destinations */}
      <Section bleed="surface">
        <div className="reveal flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Popular routes"
            title="Where Karnataka Takes You"
            intro="Coffee hills, temple towns, waterfalls and heritage — with extended getaways across South India."
          />
          <Link
            href="/destination"
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-bodytext hover:text-ink sm:inline-flex"
          >
            All destinations
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {destShown.map((d) => (
            <div key={d.id} className="reveal h-full">
              <DestinationCard dest={d} />
            </div>
          ))}
        </div>
      </Section>

      {/* Why choose us */}
      <Section>
        <WhyChooseUs
          years={settings.trustYears}
          trips={settings.trustTrips}
        />
      </Section>

      {/* Doorstep Pickup Across Bengaluru */}
      <Section bleed="surface" size="sm">
        <div className="reveal rounded-2xl bg-forest-900 p-8 text-forest-100 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-saffron-300">
                Local Bengaluru Pickup &amp; State-Wide Coverage
              </p>
              <h2 className="mt-2 text-h3 font-bold text-white">
                Doorstep Pickup Across Every Bengaluru Locality
              </h2>
              <p className="mt-3 text-sm text-forest-100/80">
                We pick up from your doorstep in Indiranagar, Koramangala, Whitefield, Electronic City, HSR Layout, JP Nagar, Jayanagar, Marathahalli, Bellandur, Sarjapur Road, Hebbal, Yelahanka, Rajajinagar, Malleshwaram, Banashankari, BTM Layout, Vijayanagar, and Kempegowda International Airport (BLR) — dropping you across all 31 Karnataka districts and neighbouring South Indian states.
              </p>
            </div>
            <div className="shrink-0">
              <Link href="/areas-we-serve" className="btn-accent">
                View all coverage areas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section>
          <div className="reveal">
            <SectionHeading
              center
              eyebrow="Riders"
              title="What Our Customers Say"
            />
          </div>
          <div className="reveal mt-12">
            <TestimonialCarousel
              items={testimonials.map((t) => ({
                id: t.id,
                authorName: t.authorName,
                location: t.location,
                rating: t.rating,
                quote: t.quote,
              }))}
            />
          </div>
        </Section>
      )}

      {/* Homepage FAQ for Answer Engines (AEO) and Rich Snippets */}
      <Section bleed="surface" className="max-w-4xl">
        <div className="reveal">
          <SectionHeading
            center
            eyebrow="FAQ"
            title="Frequently Asked Questions About Bangalore Cabs"
            intro="Everything you need to know about booking, outstation rates, one-way drops, and airport taxi services."
          />
        </div>
        <div className="reveal mt-8">
          <FaqAccordion
            items={HOMEPAGE_FAQS.map((f, i) => ({
              id: `home-faq-${i}`,
              question: f.question,
              answer: f.answer,
            }))}
          />
        </div>
      </Section>

      <CtaBanner
        text={settings.ctaBannerText}
        phone={settings.phone}
        whatsappHref={waHref}
      />
    </>
  );
}
