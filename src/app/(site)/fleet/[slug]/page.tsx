import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Check,
  Sparkles,
  ThumbsUp,
  Info,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getVehicleBySlug, getVehicles, getSiteSettings, getDestinations } from "@/lib/site";
import { vehiclePhotos } from "@/lib/features";
import { vehicleGuide } from "@/lib/vehicle-content";
import { contactLink, telLink } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";
import { rupees } from "@/lib/format";
import { vehicleJsonLd, faqJsonLd } from "@/lib/structured-data";
import VehicleImages from "@/components/site/VehicleImages";
import VehicleCard from "@/components/site/VehicleCard";
import RateCard from "@/components/site/RateCard";
import CtaBanner from "@/components/site/CtaBanner";
import Section from "@/components/site/Section";
import SectionHeading from "@/components/site/SectionHeading";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqAccordion from "@/components/site/FaqAccordion";

export const revalidate = 300;

export async function generateStaticParams() {
  const vehicles = await getVehicles();
  return vehicles
    .filter((v) => typeof v.slug === "string" && v.slug.length > 0)
    .map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle not found", robots: { index: false } };

  const guide = vehicleGuide(vehicle);
  const from =
    !vehicle.quoteOnRequest && vehicle.oneWayRate != null
      ? ` One-way fares from ${rupees(vehicle.oneWayRate)}.`
      : "";
  return pageMeta({
    title: `${vehicle.name} (${vehicle.seats} seater) — Rates & Booking`,
    description: `${guide.tagline}${from} GPS-tracked, verified drivers.`.slice(0, 158),
    path: `/fleet/${vehicle.slug}`,
    image: vehiclePhotos(vehicle)[0] ?? "/logo.png",
  });
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [vehicle, allVehicles, settings, destinations] = await Promise.all([
    getVehicleBySlug(slug),
    getVehicles(),
    getSiteSettings(),
    getDestinations(),
  ]);

  if (!vehicle) notFound();

  const guide = vehicleGuide(vehicle);
  const photos = vehiclePhotos(vehicle);
  const others = allVehicles.filter((v) => v.slug !== vehicle.slug).slice(0, 3);
  const isSedan = vehicle.category === "CAR" && vehicle.seats.startsWith("4");
  const popularRoutes = isSedan
    ? destinations.filter((d) => d.packageSlug).slice(0, 6)
    : [];

  const wa = contactLink(
    settings.whatsappNumber,
    `Welcome to Sumpreeth Tours and Travels. I'd like to book the ${vehicle.name} (${vehicle.seats} seater) — please share availability and a quote.`,
  );

  const vehicleFaqs = [
    {
      question: `How many passengers and bags can fit in the ${vehicle.name}?`,
      answer: `The ${vehicle.name} comfortably seats ${vehicle.seats} passengers with luggage capacity for ${vehicle.features.find((f) => f.toLowerCase().includes("bag")) ?? "standard luggage"}. It is equipped with AC, comfortable push-back seats, and GPS tracking.`,
    },
    {
      question: `What are the rental rates for the ${vehicle.name}?`,
      answer: `${vehicle.oneWayRate ? `One-way starting fare is ₹${vehicle.oneWayRate}. ` : ""}${vehicle.roundTripPerKm ? `Outstation round trips are billed at ₹${vehicle.roundTripPerKm}/km with a standard minimum of ${vehicle.minKmPerDay ?? 300} km/day and ₹${vehicle.driverBata ?? 400} driver bata. ` : ""}${vehicle.localPackageRate ? `Local 8h/80km package is ₹${vehicle.localPackageRate}. ` : ""}Tolls and interstate entry taxes are billed at actuals.`,
    },
    {
      question: `Is the ${vehicle.name} available for Bangalore Airport pickup and drop?`,
      answer: `Yes, the ${vehicle.name} can be booked 24/7 for Kempegowda International Airport (BLR) transfers with flight delay tracking and no midnight surge pricing.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vehicleJsonLd(vehicle, guide.tagline)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(vehicleFaqs)),
        }}
      />
      <section className="container-page pb-8 pt-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            trail={[
              ["Fleet", "/fleet"],
              [vehicle.name, `/fleet/${vehicle.slug}`],
            ]}
          />
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-600 hover:text-ink dark:text-forest-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All vehicles
          </Link>
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal">
            <VehicleImages
              photos={photos}
              name={vehicle.name}
              variant="full"
              priority
            />
          </div>

          <div className="reveal">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 font-bold">{vehicle.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 text-sm font-semibold text-bodytext dark:bg-white/[0.04]">
                <Users className="h-4 w-4" />
                {vehicle.seats} seater
              </span>
            </div>
            <p className="mt-3 text-lead text-bodytext">{guide.tagline}</p>

            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vehicle.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <RateCard
                vehicle={vehicle}
                actions={
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="book-cta"
                      className="btn-accent btn-shine"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Book this vehicle
                    </a>
                    <a href={telLink(settings.phone)} className="btn-outline">
                      <Phone className="h-4 w-4" />
                      {settings.phone}
                    </a>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </section>

      <Section bleed="surface" className="grid gap-8 md:grid-cols-3">
          <div className="reveal">
            <h2 className="flex items-center gap-2 text-h4 font-bold text-ink">
              <ThumbsUp className="h-5 w-5 text-forest-600 dark:text-forest-300" />
              Best for
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-bodytext">
              {guide.bestFor.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-500" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <h2 className="flex items-center gap-2 text-h4 font-bold text-ink">
              <Sparkles className="h-5 w-5 text-forest-600 dark:text-forest-300" />
              Highlights
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-bodytext">
              {guide.highlights.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <h2 className="flex items-center gap-2 text-h4 font-bold text-ink">
              <Info className="h-5 w-5 text-forest-600 dark:text-forest-300" />
              Good to know
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-bodytext">
              {guide.goodToKnow.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-300" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
      </Section>

      <Section size="sm">
        <div className="rounded-2xl bg-forest-50 p-5 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink">
              {popularRoutes.length > 0
                ? `Popular one-way sedan routes from Bangalore:`
                : "Know where you're headed? Browse routes and distances, or send your trip details for a quick quote."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/destination" className="btn-ghost btn-sm">
                Browse destinations
              </Link>
              <Link href="/contact" className="btn-outline btn-sm">
                Get a quote
              </Link>
            </div>
          </div>
          {popularRoutes.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {popularRoutes.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/destination/${d.slug}`}
                    className="inline-block rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-line hover:bg-forest-100 dark:bg-white/[0.04] dark:text-forest-200"
                  >
                    {vehicle.name} to {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {others.length > 0 && (
        <Section>
          <h2 className="text-h2 font-bold">Compare other vehicles</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {others.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                phone={settings.phone}
                whatsappNumber={settings.whatsappNumber}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Vehicle FAQs for Rich Snippets & Answer Engines */}
      <Section bleed="surface" className="max-w-4xl">
        <div className="reveal">
          <SectionHeading
            center
            eyebrow="FAQ"
            title={`Frequently Asked Questions — ${vehicle.name}`}
            intro="Common questions about seating capacity, rates, luggage space, and trip booking."
          />
        </div>
        <div className="reveal mt-8">
          <FaqAccordion
            items={vehicleFaqs.map((f, i) => ({
              id: `${vehicle.id}-faq-${i}`,
              question: f.question,
              answer: f.answer,
            }))}
          />
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
