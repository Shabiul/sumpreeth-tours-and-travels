import { Suspense } from "react";
import { getSiteSettings, getPackages } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import PageHeader from "@/components/site/PageHeader";
import PackagesView from "@/components/site/PackagesView";
import CtaBanner from "@/components/site/CtaBanner";
import Section from "@/components/site/Section";
import { contactLink } from "@/lib/whatsapp";

export const revalidate = 600;

export const metadata = pageMeta({
  title: "South India Tour Packages from Bangalore — Karnataka, Kerala & Tamil Nadu",
  description:
    "Curated tour packages from Bangalore to Coorg, Ooty, Mysore, Chikmagalur, Tirupati, Gokarna, Kerala & Tamil Nadu with private cab, verified chauffeur & hotel itineraries.",
  path: "/tours-packages",
  image: "/images/destinations/coorg-getaway.webp",
  keywords: [
    "Tour packages from Bangalore",
    "Coorg tour package from Bangalore",
    "Ooty tour package from Bangalore",
    "Mysore tour package from Bangalore",
    "Karnataka tour packages",
    "South India tour packages",
    "Weekend getaway from Bangalore",
  ].join(", "),
});

export default async function ToursPackagesPage() {
  const [settings, packages] = await Promise.all([
    getSiteSettings(),
    getPackages(),
  ]);
  const waHref = contactLink(settings.whatsappNumber);

  return (
    <>
      <PageHeader
        trail={[["Tours & Packages", "/tours-packages"]]}
        eyebrow="Tours & Packages"
        title="Explore South India with Reliable Tours & Travels from Bangalore"
        intro="Discover carefully planned tour packages from Bangalore to Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Telangana and other popular South Indian destinations. Choose from weekend getaways, family holidays, honeymoon trips, group tours and customized travel packages."
        image="/images/destinations/coorg-getaway.webp"
        imageAlt="Misty coffee estate hills in Coorg, Karnataka"
      />

      <Section>
        <Suspense fallback={null}>
          <PackagesView packages={packages} whatsappNumber={settings.whatsappNumber} />
        </Suspense>
      </Section>

      <CtaBanner text={settings.ctaBannerText} phone={settings.phone} whatsappHref={waHref} />
    </>
  );
}
