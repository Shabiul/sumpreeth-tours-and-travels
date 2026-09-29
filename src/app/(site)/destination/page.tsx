import Link from "next/link";
import { getSiteSettings, getDestinations } from "@/lib/site";
import { contactLink } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";
import PageHeader from "@/components/site/PageHeader";
import DestinationView from "@/components/site/DestinationView";
import CoverageMap from "@/components/site/CoverageMap";
import CtaBanner from "@/components/site/CtaBanner";
import Section from "@/components/site/Section";

export const revalidate = 600;

export const metadata = pageMeta({
  title: "Outstation Cabs & One Way Taxi from Bangalore — 60+ Routes",
  description:
    "Book one-way drop cabs, round-trip outstation taxis & tempo travellers from Bangalore to Mysore, Coorg, Ooty, Chikmagalur, Gokarna, Tirupati and 60+ destinations across Karnataka & South India. Transparent per-km rates.",
  path: "/destination",
  image: "/images/destinations/hero-bangalore.webp",
  keywords: [
    "Bangalore outstation cabs",
    "One way cab Bangalore",
    "Bangalore taxi service",
    "Cab booking in Bangalore",
    "Bangalore to Mysore cabs",
    "Bangalore to Coorg taxi",
    "Bangalore to Ooty taxi",
    "Bangalore to Chikmagalur taxi",
    "Outstation taxi Karnataka",
  ].join(", "),
});

export default async function DestinationPage() {
  const [settings, destinations] = await Promise.all([
    getSiteSettings(),
    getDestinations(),
  ]);

  const waHref = contactLink(settings.whatsappNumber);

  return (
    <>
      <PageHeader
        trail={[["Destinations", "/destination"]]}
        title="One Way, Round Trip & Local Cabs from Bangalore"
        intro="Book a one-way cab, round-trip taxi or full-day local cab to every major Karnataka city and countless interior towns and villages, with outstation routes into Tamil Nadu, Kerala, Andhra Pradesh, Telangana, Goa and Puducherry. Pick a destination for route details, cab options and fares."
        image="/images/destinations/hero-bangalore.webp"
        imageAlt="Bengaluru skyline at dusk"
      />

      <Section>
        <div className="reveal mb-12">
          <CoverageMap />
        </div>

        <DestinationView destinations={destinations} />

        <p className="mt-10 rounded-2xl bg-forest-50 p-5 text-sm text-ink dark:bg-white/[0.04]">
          Don&apos;t see your town? We cover every district and taluk across
          Karnataka —{" "}
          <Link href="/areas-we-serve" className="font-semibold text-forest-700 underline dark:text-forest-300">
            see our full coverage list
          </Link>
          , or just share your pickup and drop points.
        </p>
      </Section>

      <CtaBanner
        text={settings.ctaBannerText}
        phone={settings.phone}
        whatsappHref={waHref}
      />
    </>
  );
}
