import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { getSiteSettings, getFaqs } from "@/lib/site";
import { contactLink, telLink } from "@/lib/whatsapp";
import { pageMeta, GOOGLE_MAPS_URL } from "@/lib/seo";
import { faqJsonLd } from "@/lib/structured-data";
import PageHeader from "@/components/site/PageHeader";
import SectionHeading from "@/components/site/SectionHeading";
import EnquiryForm from "@/components/site/EnquiryForm";
import FaqAccordion from "@/components/site/FaqAccordion";
import Section from "@/components/site/Section";
import MapEmbed from "@/components/site/MapEmbed";

export const metadata = pageMeta({
  title: "Cab Booking & 24/7 Contact — Call +91 94486 48898",
  description:
    "Book a cab with Sumpreeth Tours and Travels — call +91 94486 48898, message us on WhatsApp, or send an enquiry. 24/7 instant booking for one-way, airport & outstation cabs, based in Bengaluru 560078.",
  path: "/contact",
  image: "/images/destinations/hero-bangalore.webp",
  keywords: [
    "Cab booking in Bangalore",
    "Taxi booking in Bangalore",
    "Bangalore taxi contact number",
    "Airport cab booking Bangalore",
    "Outstation cab booking",
    "One way drop taxi booking",
  ].join(", "),
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const [{ destination }, settings, faqs] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getFaqs(),
  ]);

  const waHref = contactLink(settings.whatsappNumber);

  const dest = destination?.slice(0, 80);

  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              faqJsonLd(
                faqs.map((f) => ({ question: f.question, answer: f.answer })),
              ),
            ),
          }}
        />
      )}
      <PageHeader
        trail={[["Contact & booking", "/contact"]]}
        title="Book your trip"
        intro="Send an enquiry and we'll open WhatsApp with your details, or reach us directly — any hour, any day."
        image="/images/destinations/hero-bangalore.webp"
        imageAlt="Bengaluru skyline"
      />

      <Section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {dest && (
            <p className="mb-4 rounded-xl bg-saffron-50 px-4 py-3 text-sm font-medium text-saffron-800">
              Planning a trip to <strong>{dest}</strong> — your form is pre-filled.
            </p>
          )}
          <EnquiryForm
            variant="page"
            whatsappNumber={settings.whatsappNumber}
            sourcePage={dest ? `contact:${dest}` : "contact"}
            defaultServiceType={dest ? "TOUR_PACKAGE" : "ONE_WAY"}
            defaultDrop={dest ?? ""}
            defaultMessage={dest ? `Planning a trip to ${dest}.` : ""}
          />
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="text-h4 font-bold text-ink">Reach us now</h2>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={telLink(settings.phone)}
                data-track="call"
                className="btn-primary"
              >
                <Phone className="h-4 w-4" />
                Call {settings.phone}
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp"
                className="btn-accent"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp us
              </a>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-bodytext">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                <a
                  href={`mailto:${settings.email}`}
                  data-track="email"
                  className="hover:underline"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                <span>
                  {settings.address}
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-semibold text-forest-700 underline dark:text-forest-300"
                  >
                    Get directions
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-forest-500 dark:text-forest-400" />
                {settings.hours}
              </li>
            </ul>
          </div>

          <div className="card overflow-hidden">
            <MapEmbed
              src={settings.mapEmbedUrl}
              title="Sumpreeth Tours and Travels location — Bengaluru 560078"
            />
          </div>
        </aside>
      </Section>

      {faqs.length > 0 && (
        <Section bleed="surface" className="max-w-3xl">
          <SectionHeading center eyebrow="FAQ" title="Common questions" />
          <div className="mt-8">
            <FaqAccordion
              items={faqs.map((f) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
              }))}
            />
          </div>
        </Section>
      )}
    </>
  );
}
