import {
  Clock,
  SprayCan,
  ShieldCheck,
  BadgeCheck,
  MapPinned,
  Leaf,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site";
import { contactLink } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";
import PageHeader from "@/components/site/PageHeader";
import SectionHeading from "@/components/site/SectionHeading";
import Gallery from "@/components/site/Gallery";
import CtaBanner from "@/components/site/CtaBanner";
import Section from "@/components/site/Section";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMeta({
    title: "About Us — Trusted Bangalore Cab & Outstation Travel Service",
    description: `Sumpreeth Tours and Travels is a Bangalore-based 24/7 cab and outstation travel service — ${settings.trustYears} years, ${settings.trustTrips} trips, vetted drivers and GPS-tracked vehicles across Karnataka & South India.`,
    path: "/about",
    image: "/images/fleet/IMG-20260901-WA0040.jpg",
    keywords: [
      "About Sumpreeth Tours and Travels",
      "Bangalore cab company",
      "Outstation travel agency Bangalore",
      "Best taxi service in Bangalore",
      "Verified cab drivers Bangalore",
    ].join(", "),
  });
}

const DRIVER_STANDARDS = [
  "Address verification",
  "Medical check-up",
  "Driving-skill testing",
  "Communication & behavioural training",
  "Technology & GPS handling",
];

const PROMISE = [
  { icon: Clock, label: "Timeliness" },
  { icon: SprayCan, label: "Cleanliness" },
  { icon: ShieldCheck, label: "Safety" },
  { icon: BadgeCheck, label: "Professionalism" },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const waHref = contactLink(settings.whatsappNumber);

  return (
    <>
      <PageHeader
        trail={[["About us", "/about"]]}
        title="Reliable, comfortable, safe rides — any hour"
        intro={settings.aboutPromise}
        image="/images/fleet/IMG-20260901-WA0040.jpg"
        imageAlt="A Sumpreeth Toyota Etios on a Bangalore highway"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="reveal">
            <SectionHeading eyebrow="Our story" title="Who we are" />
            <p className="mt-4 whitespace-pre-line text-lead text-bodytext">
              {settings.aboutStory}
            </p>

            <h3 className="mt-10 text-h4 font-bold text-ink">
              Our service promise
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PROMISE.map(({ icon: Icon, label }) => (
                <div key={label} className="card p-4 text-center">
                  <Icon className="mx-auto h-6 w-6 text-forest-600 dark:text-forest-300" />
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-forest-600 dark:text-forest-300">
              Transparent pricing with no hidden charges — always.
            </p>
          </div>

          <aside className="reveal card h-fit p-6">
            <h3 className="flex items-center gap-2 text-h4 font-bold text-ink">
              <BadgeCheck className="h-5 w-5 text-forest-600 dark:text-forest-300" />
              Driver standards
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-bodytext">
              {DRIVER_STANDARDS.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-500" />
                  {s}
                </li>
              ))}
            </ul>

            <h3 className="mt-8 flex items-center gap-2 text-h4 font-bold text-ink">
              <Leaf className="h-5 w-5 text-forest-600 dark:text-forest-300" />
              Safety &amp; hygiene
            </h3>
            <p className="mt-3 text-sm text-bodytext">
              GPS-enabled vehicles, sanitised regularly between trips, and
              green-fuel usage wherever possible to reduce emissions.
            </p>
          </aside>
        </div>

        <div className="reveal mt-14 flex items-start gap-3 rounded-2xl bg-forest-900 p-8 text-forest-100">
          <MapPinned className="mt-1 h-6 w-6 shrink-0 text-saffron-300" />
          <p>
            <span className="font-semibold text-white">Coverage:</span> we serve
            Bangalore, greater Karnataka — cities and interior towns and villages
            alike — and outstation routes across South India.
          </p>
        </div>
      </Section>

      <Section bleed="surface">
        <div className="reveal">
          <SectionHeading
            eyebrow="Our fleet on the road"
            title="Real vehicles, real trips"
            intro="A look at the cars, tempo travellers and coaches our customers travel in — sanitised between trips and GPS-enabled."
          />
        </div>
        <div className="mt-10">
          <Gallery />
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
