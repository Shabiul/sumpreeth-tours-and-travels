import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, MessageCircle, Phone, ArrowRight, ExternalLink } from "lucide-react";
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
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Section from "@/components/site/Section";
import VehicleCard from "@/components/site/VehicleCard";
import FaqAccordion from "@/components/site/FaqAccordion";
import CtaBanner from "@/components/site/CtaBanner";

export const revalidate = 600;

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
  const dest = await getDestinationBySlug(slug);
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
  const [dest, allDestinations, vehicles, settings] = await Promise.all([
    getDestinationBySlug(slug),
    getDestinations(),
    getVehicles(),
    getSiteSettings(),
  ]);
  if (!dest) notFound();

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

  const faq = [
    {
      question: `Do you provide one-way cabs from Bangalore to ${dest.name}?`,
      answer:
        "Yes — on most routes we offer a fixed one-way fare, so you only pay for the drop and don't get charged for a return trip you're not taking. Round-trip and multi-day rentals are also available.",
    },
    {
      question: "What's included in the fare?",
      answer:
        "The driver, fuel and vehicle are included. Tolls, parking, permits and state entry taxes are charged at actuals and shared upfront before you confirm.",
    },
    {
      question: "Can I book a tempo traveller or bigger vehicle for a group?",
      answer:
        "Yes — sedans, SUVs, and 12/16-seater tempo travellers are all available for this route. Share your group size on WhatsApp and we'll suggest the right vehicle.",
    },
  ];

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
