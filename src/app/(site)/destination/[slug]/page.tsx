import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, MessageCircle, Phone, ArrowRight, ExternalLink, Clock, Compass, ShieldCheck, Car, Coffee } from "lucide-react";
import {
  getDestinations,
  getDestinationBySlug,
  getPackageBySlug,
  getVehicles,
  getSiteSettings,
} from "@/lib/site";
import {
  pageMeta,
  STATE_TOURISM_BOARD,
  INCREDIBLE_INDIA,
  findSiteSpecificAuthority,
  canonical,
} from "@/lib/seo";
import { contactLink, telLink } from "@/lib/whatsapp";
import { destinationJsonLd, faqJsonLd, speakableJsonLd } from "@/lib/structured-data";
import {
  DESTINATION_CATEGORY_LABELS,
  PACKAGE_STATE_LABELS,
  type DestinationCategory,
  type PackageState,
} from "@/lib/constants";
import { distanceLabel } from "@/lib/format";
import { getRouteDetails } from "@/lib/destination-content";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Section from "@/components/site/Section";
import VehicleCard from "@/components/site/VehicleCard";
import FaqAccordion from "@/components/site/FaqAccordion";
import CtaBanner from "@/components/site/CtaBanner";

export const revalidate = 600;

const DESTINATION_ALIASES: Record<string, string> = {
  coorg: "madikeri-coorg",
  madikeri: "madikeri-coorg",
  "nandi-hills": "chikkaballapura-nandi-region",
  mysuru: "mysore",
  hosapete: "hospet-hosapete",
  hubli: "hubli-dharwad",
  hubballi: "hubli-dharwad",
  badami: "bagalkot-badami-aihole-belt",
  belgaum: "belgaum-belagavi",
  belagavi: "belgaum-belagavi",
  bijapur: "bijapur-vijayapura",
  vijayapura: "bijapur-vijayapura",
  bellary: "ballari-bellary",
  ballari: "ballari-bellary",
  trichy: "trichy-tiruchirappalli",
  trivandrum: "trivandrum-kovalam",
  alappuzha: "alleppey-kerala-backwaters",
  alleppey: "alleppey-kerala-backwaters",
  kgf: "kolar-gold-fields",
  gokak: "gokak-falls",
  kushalnagar: "kushal-nagar",
  rameshwaram: "rameswaram",
  kolar: "kolar-gold-fields",
  shimoga: "shivamogga",
  mangaluru: "mangalore",
  chikkamagaluru: "chikmagalur",
  tumakuru: "tumkur",
  gulbarga: "kalaburagi",
};

export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dest = await getDestinationBySlug(slug);
  if (!dest && DESTINATION_ALIASES[slug]) {
    dest = await getDestinationBySlug(DESTINATION_ALIASES[slug]);
  }
  if (!dest) return { title: "Destination not found", robots: { index: false } };

  return pageMeta({
    title:
      dest.seoTitle ||
      `Bangalore to ${dest.name} Cab & Taxi Service — One Way & Round Trip`,
    description:
      dest.seoDescription ||
      `Book Bangalore to ${dest.name} cab — one-way drop taxis & round trips from ₹12/km. Clean sedans, SUVs & tempo travellers with verified drivers. 24/7 booking. ${dest.description}`,
    path: `/destination/${dest.slug}`,
    image: dest.imageUrl,
    keywords: [
      `Bangalore to ${dest.name} cab`,
      `Bangalore to ${dest.name} taxi`,
      `${dest.name} to Bangalore cabs`,
      `${dest.name} to Bangalore taxi`,
      `${dest.name} taxi service`,
      `${dest.name} cab service`,
      `cab booking in ${dest.name}`,
      `one way cab Bangalore to ${dest.name}`,
      `outstation cab to ${dest.name}`,
      `Bangalore airport to ${dest.name} taxi`,
      `tempo traveller Bangalore to ${dest.name}`,
      `sedan Bangalore to ${dest.name}`,
      `SUV Bangalore to ${dest.name}`,
    ].join(", "),
  });
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dest = await getDestinationBySlug(slug);

  if (!dest) {
    const alias = DESTINATION_ALIASES[slug];
    if (alias) {
      redirect(`/destination/${alias}`);
    }
    notFound();
  }

  const [allDestinations, vehicles, settings] = await Promise.all([
    getDestinations(),
    getVehicles(),
    getSiteSettings(),
  ]);

  const routeInfo = getRouteDetails(dest);

  const linkedPackage = dest.packageSlug
    ? await getPackageBySlug(dest.packageSlug)
    : null;

  const stateLabel = PACKAGE_STATE_LABELS[dest.state as PackageState] ?? dest.state;
  const stateBoard = STATE_TOURISM_BOARD[dest.state as PackageState];
  const siteSpecific = findSiteSpecificAuthority(dest.name);
  const authorityLinks = [stateBoard, siteSpecific, INCREDIBLE_INDIA].filter(
    (x): x is { name: string; url: string } => Boolean(x),
  );
  const sedan = vehicles.find((v) => v.category === "CAR" && v.seats.startsWith("4"));
  const suv = vehicles.find((v) => v.category === "CAR" && !v.seats.startsWith("4"));
  const wa = contactLink(
    settings.whatsappNumber,
    `Hi, I need a cab from Bangalore to ${dest.name}. Please share availability and fares.`,
  );

  const related = allDestinations
    .filter((d) => d.slug !== dest.slug && d.state === dest.state)
    .slice(0, 6);

  const faq = routeInfo.faqs;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationJsonLd(dest)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            speakableJsonLd(canonical(`/destination/${dest.slug}`), [
              ".speakable-overview",
              ".speakable-faq",
            ]),
          ),
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-forest-900 pt-28 text-white sm:pt-36">
        <Image
          src={dest.imageUrl}
          alt={dest.name}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-900/95 via-forest-900/80 to-forest-900/55"
        />
        <div className="container-page relative pb-14">
          <div className="mb-5 [&_a:hover]:text-white [&_a]:text-white/70 [&_[aria-current]]:text-white [&_svg]:text-white/40">
            <Breadcrumbs
              trail={[
                ["Destinations", "/destination"],
                [stateLabel, "/destination"],
                [dest.name, `/destination/${dest.slug}`],
              ]}
            />
          </div>
          <p className="mb-3 text-eyebrow font-bold uppercase text-saffron-300">
            Bangalore Outstation Cabs
          </p>
          <h1 className="max-w-3xl text-h1 font-extrabold !text-white">
            Bangalore to {dest.name} Cab — One Way &amp; Round Trip Taxi
          </h1>
          <p className="speakable-overview mt-4 max-w-2xl text-lead text-forest-100/85">
            {dest.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {dest.distanceKm != null && (
              <span className="flex items-center gap-1.5 text-sm text-forest-100/70">
                <MapPin className="h-4 w-4" />
                {distanceLabel(dest.distanceKm)} from Bangalore
              </span>
            )}
            <span className="text-sm text-forest-100/70">
              {DESTINATION_CATEGORY_LABELS[dest.category as DestinationCategory] ?? dest.category}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-accent btn-shine">
              <MessageCircle className="h-4 w-4" />
              Get a Cab Quote on WhatsApp
            </a>
            <a href={telLink(settings.phone)} className="btn-white">
              <Phone className="h-4 w-4" />
              {settings.phone}
            </a>
          </div>
          <p className="mt-5 text-xs text-forest-100/60">
            {settings.trustYears} years on the road · {settings.trustTrips} trips completed · every driver vetted &amp; every vehicle GPS-tracked
          </p>
        </div>
      </section>

      <Section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          {/* Route Overview & Trip Essentials */}
          <div className="reveal card p-6">
            <h2 className="text-h3 font-bold text-ink">
              Bangalore to {dest.name} — Route &amp; Travel Overview
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl bg-forest-50/50 p-3.5 dark:bg-white/[0.03]">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-forest-600 dark:text-forest-400" />
                <div>
                  <p className="text-xs font-semibold uppercase text-bodytext">Driving Time</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{routeInfo.drivingTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-forest-50/50 p-3.5 dark:bg-white/[0.03]">
                <Compass className="mt-0.5 h-5 w-5 shrink-0 text-forest-600 dark:text-forest-400" />
                <div>
                  <p className="text-xs font-semibold uppercase text-bodytext">Primary Highway</p>
                  <p className="mt-0.5 text-sm font-bold text-ink line-clamp-1" title={routeInfo.highway}>
                    {routeInfo.highway}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-forest-50/50 p-3.5 dark:bg-white/[0.03]">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest-600 dark:text-forest-400" />
                <div>
                  <p className="text-xs font-semibold uppercase text-bodytext">Best Departure</p>
                  <p className="mt-0.5 text-xs font-medium text-ink">{routeInfo.bestDepartureTime}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-amber-500/10 p-3.5 text-xs text-ink dark:text-amber-200">
              <strong>Best Season to Visit:</strong> {routeInfo.bestSeason}.
            </div>
          </div>

          {/* Route Fare Estimator Table */}
          <div className="reveal card overflow-hidden p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-h3 font-bold text-ink">
                Bangalore to {dest.name} Cab Fares &amp; Rental Rates
              </h2>
              <span className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700 dark:bg-white/[0.05] dark:text-forest-300">
                Transparent Pricing
              </span>
            </div>
            <p className="mt-2 text-sm text-bodytext">
              Estimated door-to-door cab rates for one-way drops and outstation round trips. Fuel and driver allowances are included; FASTag tolls and interstate permits at actuals.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase text-bodytext">
                    <th className="pb-3 pr-4">Vehicle Model</th>
                    <th className="pb-3 pr-4">Seats</th>
                    <th className="pb-3 pr-4">One-Way Drop (Est.)</th>
                    <th className="pb-3">Round Trip Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-forest-500" />
                        Sedan (Etios / Dzire)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-bodytext">4+1</td>
                    <td className="py-3.5 pr-4 font-bold text-forest-700 dark:text-forest-400">
                      from ₹{routeInfo.fares.sedanOneWay.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 text-bodytext">
                      ₹12/km (Min 300 km/day + ₹400 bata)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-forest-500" />
                        SUV (Ertiga / Innova)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-bodytext">6+1 / 7+1</td>
                    <td className="py-3.5 pr-4 font-bold text-forest-700 dark:text-forest-400">
                      from ₹{routeInfo.fares.suvOneWay.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 text-bodytext">
                      ₹17/km (Min 300 km/day + ₹400 bata)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-forest-500" />
                        Innova Crysta (Premium)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-bodytext">7+1</td>
                    <td className="py-3.5 pr-4 font-bold text-forest-700 dark:text-forest-400">
                      from ₹{routeInfo.fares.crystaOneWay.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 text-bodytext">
                      ₹18/km (Min 300 km/day + ₹400 bata)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-forest-500" />
                        Tempo Traveller (Group)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-bodytext">12+1 / 16+1</td>
                    <td className="py-3.5 pr-4 text-bodytext font-medium">Quote on request</td>
                    <td className="py-3.5 text-bodytext">
                      from ₹20/km (Min 300 km/day + ₹500 bata)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-forest-50/60 p-3 text-xs text-bodytext dark:bg-white/[0.03]">
              <span className="font-semibold text-ink">Highway Regulations:</span> {routeInfo.statePermitNote}
            </div>
          </div>

          {/* Highway Pit Stops */}
          {routeInfo.pitStops.length > 0 && (
            <div className="reveal card p-6">
              <h2 className="flex items-center gap-2 text-h4 font-bold text-ink">
                <Coffee className="h-5 w-5 text-saffron-600 dark:text-saffron-400" />
                Recommended Highway Pit Stops on This Route
              </h2>
              <p className="mt-2 text-sm text-bodytext">
                Clean washrooms, South Indian breakfast, and family-friendly dining spots along {routeInfo.highway}:
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {routeInfo.pitStops.map((stop) => (
                  <li key={stop} className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Check className="h-4 w-4 shrink-0 text-forest-500" />
                    {stop}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlights */}
          {dest.highlights.length > 0 && (
            <div className="reveal">
              <h2 className="text-h3 font-bold text-ink">
                Things to see in {dest.name}
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {dest.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Linked multi-day package */}
          {linkedPackage && (
            <div className="reveal card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-saffron-600">
                  Planning a longer trip?
                </p>
                <h3 className="mt-1 font-bold text-ink">{linkedPackage.title}</h3>
                <p className="mt-1 text-sm text-bodytext">
                  {linkedPackage.durationNights}N / {linkedPackage.durationDays}D
                  itinerary with hotels, sightseeing and inclusions planned for you.
                </p>
              </div>
              <Link
                href={`/tours-packages/${linkedPackage.slug}`}
                className="btn-outline btn-sm shrink-0"
              >
                View package
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Cab options */}
          {vehicles.length > 0 && (
            <div className="reveal">
              <h2 className="text-h3 font-bold text-ink">
                One-Way &amp; Round-Trip Cabs for This Route
              </h2>
              <p className="mt-2 text-sm text-bodytext">
                {sedan && suv ? (
                  <>
                    Take a{" "}
                    <Link href={`/fleet/${sedan.slug}`} className="font-semibold text-forest-700 underline dark:text-forest-300">
                      one-way sedan from Bangalore to {dest.name}
                    </Link>
                    , or{" "}
                    <Link href={`/fleet/${suv.slug}`} className="font-semibold text-forest-700 underline dark:text-forest-300">
                      an SUV
                    </Link>{" "}
                    for more luggage and legroom
                  </>
                ) : sedan ? (
                  <>
                    Take a{" "}
                    <Link href={`/fleet/${sedan.slug}`} className="font-semibold text-forest-700 underline dark:text-forest-300">
                      one-way sedan from Bangalore to {dest.name}
                    </Link>
                  </>
                ) : suv ? (
                  <>
                    Take{" "}
                    <Link href={`/fleet/${suv.slug}`} className="font-semibold text-forest-700 underline dark:text-forest-300">
                      an SUV from Bangalore to {dest.name}
                    </Link>{" "}
                    for more luggage and legroom
                  </>
                ) : (
                  "Compare one-way, round-trip and local rates"
                )}
                {(sedan || suv) && " — or check "}
                {!sedan && !suv && " for every vehicle on the "}
                {(sedan || suv) && "round-trip and local rates for every vehicle on the "}
                <Link href="/fleet" className="font-semibold text-forest-700 underline dark:text-forest-300">
                  fleet &amp; rates page
                </Link>
                .
              </p>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {vehicles.slice(0, 4).map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    phone={settings.phone}
                    whatsappNumber={settings.whatsappNumber}
                  />
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="reveal speakable-faq">
            <h2 className="text-h3 font-bold text-ink">
              Frequently Asked Questions
            </h2>
            <div className="mt-4">
              <FaqAccordion
                items={faq.map((f, i) => ({
                  id: `${dest.id}-${i}`,
                  question: f.question,
                  answer: f.answer,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Sidebar: related destinations in the same state */}
        <div className="reveal lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="font-bold text-ink">
              More in {stateLabel}
            </h2>
            <ul className="mt-3 space-y-1">
              {related.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/destination/${d.slug}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink transition hover:bg-forest-50 dark:hover:bg-white/[0.04]"
                  >
                    {d.name}
                    <ArrowRight className="h-3.5 w-3.5 text-forest-300" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/destination"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-300"
            >
              Browse all destinations
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {authorityLinks.length > 0 && (
            <div className="card mt-6 p-5">
              <h2 className="text-sm font-bold text-ink">Official travel information</h2>
              <p className="mt-1.5 text-xs text-bodytext">
                For government travel advisories, permits and civic details on{" "}
                {dest.name}, see:
              </p>
              <ul className="mt-3 space-y-2">
                {authorityLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-300"
                    >
                      {link.name}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <CtaBanner
        text={settings.ctaBannerText}
        phone={settings.phone}
        whatsappHref={wa}
      />
    </>
  );
}
