import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { getSiteSettings, getDestinations } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { contactLink } from "@/lib/whatsapp";
import { slugify } from "@/lib/validation";
import { serviceAreaJsonLd } from "@/lib/structured-data";
import { KARNATAKA_AREAS, KARNATAKA_TOWN_COUNT } from "@/lib/karnataka-areas";
import { INTERSTATE_AREAS, INTERSTATE_TOWN_COUNT } from "@/lib/interstate-areas";
import PageHeader from "@/components/site/PageHeader";
import Section from "@/components/site/Section";
import CtaBanner from "@/components/site/CtaBanner";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "Areas We Serve — One-Way Cabs & Taxi Service Across Karnataka",
  description: `One-way drop cabs, round-trip taxis & outstation rentals covering all 31 Karnataka districts (${KARNATAKA_TOWN_COUNT}+ towns) plus ${INTERSTATE_TOWN_COUNT}+ towns across Tamil Nadu, Kerala, Andhra Pradesh & Telangana.`,
  path: "/areas-we-serve",
  keywords: [
    "Karnataka taxi service",
    "One way cab Karnataka",
    "Bangalore to outstation taxi",
    "Channapatna taxi service",
    "Mandya taxi service",
    "Mysore taxi service",
    "Coorg taxi service",
    "Mangalore taxi service",
    "Udupi cab service",
    "Hubli taxi service",
    "Belgaum taxi service",
    "Davanagere taxi service",
    "Shivamogga taxi service",
    "Chikmagalur taxi service",
    "Hassan taxi service",
  ].join(", "),
});

export default async function AreasWeServePage() {
  const [settings, destinations] = await Promise.all([
    getSiteSettings(),
    getDestinations(),
  ]);
  const destSlugs = new Set(destinations.map((d) => d.slug));
  const TOWN_ALIASES: Record<string, string> = {
    kgf: "kolar-gold-fields",
    kolar: "kolar-gold-fields",
    gokak: "gokak-falls",
    trichy: "trichy-tiruchirappalli",
    trivandrum: "trivandrum-kovalam",
    alappuzha: "alleppey-kerala-backwaters",
    alleppey: "alleppey-kerala-backwaters",
    coorg: "madikeri-coorg",
    madikeri: "madikeri-coorg",
    "nandi-hills": "chikkaballapura-nandi-region",
    chikkaballapur: "chikkaballapura-nandi-region",
    mysuru: "mysore",
    hosapete: "hospet-hosapete",
    hubli: "hubli-dharwad",
    hubballi: "hubli-dharwad",
    badami: "bagalkot-badami-aihole-belt",
    bagalkot: "bagalkot-badami-aihole-belt",
    belgaum: "belgaum-belagavi",
    belagavi: "belgaum-belagavi",
    bijapur: "bijapur-vijayapura",
    vijayapura: "bijapur-vijayapura",
    bellary: "ballari-bellary",
    ballari: "ballari-bellary",
    kushalnagar: "kushal-nagar",
    shimoga: "shivamogga",
    chikkamagaluru: "chikmagalur",
    mangaluru: "mangalore",
    tumakuru: "tumkur",
    gulbarga: "kalaburagi",
    rameshwaram: "rameshwaram",
    savandurga: "savandurga-hills",
  };
  const waHref = contactLink(settings.whatsappNumber);
  const allKarnatakaTowns = KARNATAKA_AREAS.flatMap((d) => d.towns);
  const allInterstateTowns = INTERSTATE_AREAS.flatMap((s) => s.areas.flatMap((a) => a.towns));
  const allTowns = [...allKarnatakaTowns, ...allInterstateTowns];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaJsonLd(allTowns)) }}
      />

      <PageHeader
        trail={[["Areas We Serve", "/areas-we-serve"]]}
        eyebrow="Coverage"
        title="One-Way & Outstation Taxi Across Karnataka & South India"
        intro={`Sumpreeth Tours and Travels runs one-way cabs, round trips and local rentals to ${KARNATAKA_TOWN_COUNT}+ towns and taluks across all 31 Karnataka districts, plus ${INTERSTATE_TOWN_COUNT}+ outstation drop points across Tamil Nadu, Kerala, Andhra Pradesh and Telangana. Don't see your town below? Ask us on WhatsApp; we cover interior routes on request.`}
      />

      <Section>
        <p className="reveal max-w-3xl text-sm text-bodytext">
          Browse by district for a one-way sedan, SUV or tempo traveller to
          any taluk headquarters or town listed here. Towns with a dedicated
          route guide link through to full trip details; every other town is
          still a real pickup/drop point — message us on WhatsApp for a fare.
        </p>

        <h2 className="reveal mt-10 text-h4 font-bold text-ink">Karnataka — by district</h2>
        <div className="reveal-stagger mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {KARNATAKA_AREAS.map((d) => (
            <div key={d.district} className="reveal card p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <MapPin className="h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                {d.district}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {d.towns.map((town) => {
                  const rawSlug = slugify(town);
                  const slug = TOWN_ALIASES[rawSlug] ?? rawSlug;
                  const hasPage = destSlugs.has(slug);
                  return (
                    <li key={town}>
                      {hasPage ? (
                        <Link
                          href={`/destination/${slug}`}
                          className="inline-block rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-800 hover:bg-forest-100 dark:bg-white/[0.04] dark:text-forest-200"
                        >
                          {town}
                        </Link>
                      ) : (
                        <span className="inline-block rounded-full bg-page px-2.5 py-1 text-xs text-bodytext ring-1 ring-line">
                          {town}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {INTERSTATE_AREAS.map((s) => (
          <div key={s.state}>
            <h2 className="reveal mt-12 text-h4 font-bold text-ink">
              {s.state} — outstation one-way routes
            </h2>
            <div className="reveal-stagger mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {s.areas.map((a) => (
                <div key={a.region} className="reveal card p-5">
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
                    <MapPin className="h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                    {a.region}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {a.towns.map((town) => {
                      const rawSlug = slugify(town);
                      const slug = TOWN_ALIASES[rawSlug] ?? rawSlug;
                      const hasPage = destSlugs.has(slug);
                      return (
                        <li key={town}>
                          {hasPage ? (
                            <Link
                              href={`/destination/${slug}`}
                              className="inline-block rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-800 hover:bg-forest-100 dark:bg-white/[0.04] dark:text-forest-200"
                            >
                              {town}
                            </Link>
                          ) : (
                            <span className="inline-block rounded-full bg-page px-2.5 py-1 text-xs text-bodytext ring-1 ring-line">
                              {town}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="reveal mt-10 rounded-2xl bg-forest-50 p-5 text-sm text-ink dark:bg-white/[0.04]">
          <p className="font-semibold">Don&apos;t see your exact village or pickup point?</p>
          <p className="mt-1 text-bodytext">
            This list covers every taluk and major town, but we drive to
            interior villages too. Share your pickup and drop location on
            WhatsApp and we&apos;ll confirm a one-way or round-trip fare.
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp"
            className="btn-accent btn-sm mt-4"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask on WhatsApp
          </a>
        </div>
      </Section>

      <CtaBanner text={settings.ctaBannerText} phone={settings.phone} whatsappHref={waHref} />
    </>
  );
}
