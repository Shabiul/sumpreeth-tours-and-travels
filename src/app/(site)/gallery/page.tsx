import { getSiteSettings } from "@/lib/site";
import { contactLink } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";
import PageHeader from "@/components/site/PageHeader";
import Gallery from "@/components/site/Gallery";
import CtaBanner from "@/components/site/CtaBanner";
import Section from "@/components/site/Section";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "Cab Fleet & Vehicle Photos — Bangalore Taxi Gallery",
  description:
    "Photos of the Sumpreeth Tours and Travels fleet — sedans, SUVs, tempo travellers and coaches used for airport, local and outstation trips across Karnataka.",
  path: "/gallery",
  image: "/images/fleet/IMG-20260901-WA0056.jpg",
  keywords: [
    "Bangalore cab photos",
    "Tempo traveller photos Bangalore",
    "Sumpreeth tours fleet photos",
    "Innova Crysta cab Bangalore photos",
  ].join(", "),
});

export default async function GalleryPage() {
  const settings = await getSiteSettings();
  const waHref = contactLink(settings.whatsappNumber);

  return (
    <>
      <PageHeader
        trail={[["Gallery", "/gallery"]]}
        eyebrow="Gallery"
        title="Our fleet, on the road"
        intro="Real photos of the cars, tempo travellers and coaches our customers travel in — sanitised between trips and GPS-enabled."
        image="/images/fleet/IMG-20260901-WA0056.jpg"
        imageAlt="Front of a Sumpreeth Force tempo traveller"
      />

      <Section>
        <Gallery />
      </Section>

      <CtaBanner
        text={settings.ctaBannerText}
        phone={settings.phone}
        whatsappHref={waHref}
      />
    </>
  );
}
