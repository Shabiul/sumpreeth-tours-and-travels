import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import type { SiteSettingsData } from "@/lib/site";

const EXPLORE: [string, string][] = [
  ["/", "Home"],
  ["/fleet", "Fleet & rates"],
  ["/destination", "Destinations"],
  ["/areas-we-serve", "Areas we serve"],
  ["/gallery", "Photo gallery"],
  ["/about", "About us"],
  ["/contact", "Contact & FAQ"],
];

const POPULAR_ROUTES = [
  { label: "Coorg (Madikeri)", href: "/destination/madikeri-coorg" },
  { label: "Chikmagalur", href: "/destination/chikmagalur" },
  { label: "Hampi", href: "/destination/hampi" },
  { label: "Mysore", href: "/destination/mysore" },
  { label: "Ooty", href: "/destination/ooty" },
  { label: "Tirupati", href: "/destination/tirupati" },
  { label: "Gokarna", href: "/destination/gokarna" },
  { label: "Wayanad", href: "/destination/wayanad" },
];

export default function Footer({ settings }: { settings: SiteSettingsData }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest-900 text-forest-100">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <Link
            href="/"
            aria-label="Sumpreeth Tours and Travels — home"
            className="flex items-center gap-3 rounded-xl"
          >
            <span className="inline-flex rounded-lg bg-white p-1.5 shadow-sm">
              <Image
                src="/logo.png"
                alt=""
                width={512}
                height={512}
                className="h-12 w-auto"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg font-bold text-white">
                Sumpreeth
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-200">
                Tours &amp; Travels
              </span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-forest-200/80">
            24/7 cabs, tempo travellers and buses for airport, local and
            outstation trips across Karnataka and South India.
          </p>
          <div className="mt-4 flex gap-3">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} aria-label="Facebook" className="hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} aria-label="Instagram" className="hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} aria-label="YouTube" className="hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-eyebrow font-bold uppercase text-white">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {EXPLORE.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-forest-200/80 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-eyebrow font-bold uppercase text-white">
            Popular routes
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {POPULAR_ROUTES.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="text-forest-200/80 hover:text-white"
                >
                  Bangalore → {route.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/destination"
                className="font-semibold text-saffron-200 hover:text-white"
              >
                All destinations →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-eyebrow font-bold uppercase text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-forest-200/80">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{settings.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-forest-200/70 sm:flex-row">
          <p>© {year} Sumpreeth Tours and Travels. All rights reserved.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-white">
              Privacy &amp; Cookies
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="hover:text-white">
              Sitemap
            </Link>
            <Link href="/admin/login" rel="nofollow" className="hover:text-white">
              Staff login
            </Link>
          </nav>
        </div>
        <div className="container-page pb-5 text-center text-xs text-forest-200/60 sm:text-right">
          Developed &amp; designed by{" "}
          <a
            href="https://www.naazailabs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-forest-100 hover:text-white hover:underline"
          >
            Naaz AI Labs
          </a>
        </div>
      </div>
    </footer>
  );
}
