import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sumpreethtoursandtravels.com";

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const headingFont = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#09140d" },
  ],
};

const gscToken = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...(gscToken ? { verification: { google: gscToken } } : {}),
  title: {
    default:
      "Sumpreeth Tours and Travels | Bangalore Cabs, Taxi Service & Outstation Travel",
    template: "%s | Sumpreeth Tours and Travels",
  },
  description:
    "24/7 cab & taxi service in Bangalore. Book one-way drop cabs, outstation taxis, airport pickup/drop & tempo travellers across Karnataka & South India. Verified drivers, GPS tracked, transparent fares.",
  keywords: [
    "Bangalore Taxi service",
    "Bangalore Cab Service",
    "Cab booking in Bangalore",
    "Taxi booking in Bangalore",
    "Outstation cabs Bangalore",
    "One way cab Bangalore",
    "Bangalore airport taxi",
    "Tempo traveller rental Bangalore",
    "Bangalore to Mysore cabs",
    "Bangalore to Coorg taxi",
    "Bangalore to Ooty taxi",
    "Bangalore to Chikmagalur taxi",
    "Karnataka outstation cab",
    "One way drop taxi",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Bengaluru",
    "geo.position": "12.8916;77.5847",
    "ICBM": "12.8916, 77.5847",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Sumpreeth Tours and Travels",
    url: siteUrl,
    title:
      "Sumpreeth Tours and Travels | Bangalore Cabs, Taxi Service & Outstation Travel",
    description:
      "24/7 cabs, tempo travellers and buses for airport, local and outstation trips across Karnataka & South India.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Sumpreeth Tours and Travels - Bangalore Cabs & Karnataka Outstation Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sumpreeth Tours and Travels | Bangalore Cabs, Taxi Service & Outstation Travel",
    description:
      "24/7 cabs, tempo travellers and buses for airport, local and outstation trips across Karnataka & South India.",
    images: ["/og.jpg"],
  },
};

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${bodyFont.variable} ${headingFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
