/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy. Shipped as `Content-Security-Policy-Report-Only`
 * first (see `headers()` below) so violations can be observed without breaking
 * the site; promote to the enforcing header once the report is clean. A nonce
 * based `script-src` is a Phase 5 follow-up.
 */
// Google Analytics (only actually loaded when NEXT_PUBLIC_GA_ID is set +
// the visitor opts in) — allow-listed here so it isn't a CSP violation.
const ga = "https://www.googletagmanager.com";
const gaData =
  "https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com";

// Supabase Storage — hostname derived from SUPABASE_URL so it isn't hardcoded
// to one project. All uploaded images (fleet/destination/package/etc.) are
// served from `${SUPABASE_URL}/storage/v1/object/public/images/...`.
const supabaseHost = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : null;

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
  // Next.js injects small inline bootstrap scripts; dev also needs eval.
  `script-src 'self' 'unsafe-inline' ${ga}${isDev ? " 'unsafe-eval'" : ""}`,
  // Fonts are self-hosted via next/font; only inline styles remain.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://maps.gstatic.com https://maps.googleapis.com${supabaseHost ? ` https://${supabaseHost}` : ""} ${ga} ${gaData}`,
  "frame-src https://www.google.com https://maps.google.com",
  `connect-src 'self' ${ga} ${gaData}`,
  "media-src 'self'",
  "manifest-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Keep Prisma's engine out of the server bundle so it initialises correctly
  // on the Vercel Node runtime.
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      ...(supabaseHost ? [{ protocol: "https", hostname: supabaseHost }] : []),
    ],
  },
  async redirects() {
    return [
      // 1. Resolve orphaned/historical Tour Package slugs (prevents 404s in GSC)
      {
        source: "/tours-packages/bangalore-to-coorg-tour-package",
        destination: "/tours-packages/bangalore-to-coorg",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-ooty-tour-package",
        destination: "/tours-packages/bangalore-to-ooty",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-mysore-day-tour",
        destination: "/tours-packages/bangalore-to-mysore",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-mysore-tour-package",
        destination: "/tours-packages/bangalore-to-mysore",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-chikmagalur-tour-package",
        destination: "/tours-packages/bangalore-to-chikmagalur",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-wayanad-tour-package",
        destination: "/tours-packages/bangalore-to-wayanad",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-munnar-tour-package",
        destination: "/tours-packages/bangalore-to-munnar",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-goa-tour-package",
        destination: "/tours-packages/bangalore-to-goa",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-gokarna-tour-package",
        destination: "/tours-packages/bangalore-to-gokarna",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-hampi-tour-package",
        destination: "/tours-packages/bangalore-to-hampi",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-tirupati-tour-package",
        destination: "/tours-packages/bangalore-to-tirupati",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-sakleshpur-tour-package",
        destination: "/tours-packages/bangalore-to-sakleshpur",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-kodaikanal-tour-package",
        destination: "/tours-packages/bangalore-to-kodaikanal",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-pondicherry-tour-package",
        destination: "/tours-packages/bangalore-to-pondicherry",
        permanent: true,
      },
      {
        source: "/tours-packages/bangalore-to-kanyakumari-rameswaram-tour-package",
        destination: "/tours-packages/bangalore-to-kanyakumari-rameswaram",
        permanent: true,
      },

      // 2. Common destination aliases and spelling variants
      { source: "/destination/coorg", destination: "/destination/madikeri-coorg", permanent: true },
      { source: "/destination/madikeri", destination: "/destination/madikeri-coorg", permanent: true },
      { source: "/destination/nandi-hills", destination: "/destination/chikkaballapura-nandi-region", permanent: true },
      { source: "/destination/mysuru", destination: "/destination/mysore", permanent: true },
      { source: "/destination/hosapete", destination: "/destination/hospet-hosapete", permanent: true },
      { source: "/destination/hubli", destination: "/destination/hubli-dharwad", permanent: true },
      { source: "/destination/hubballi", destination: "/destination/hubli-dharwad", permanent: true },
      { source: "/destination/badami", destination: "/destination/bagalkot-badami-aihole-belt", permanent: true },
      { source: "/destination/belgaum", destination: "/destination/belgaum-belagavi", permanent: true },
      { source: "/destination/belagavi", destination: "/destination/belgaum-belagavi", permanent: true },
      { source: "/destination/bijapur", destination: "/destination/bijapur-vijayapura", permanent: true },
      { source: "/destination/vijayapura", destination: "/destination/bijapur-vijayapura", permanent: true },
      { source: "/destination/bellary", destination: "/destination/ballari-bellary", permanent: true },
      { source: "/destination/ballari", destination: "/destination/ballari-bellary", permanent: true },
      { source: "/destination/trichy", destination: "/destination/trichy-tiruchirappalli", permanent: true },
      { source: "/destination/trivandrum", destination: "/destination/trivandrum-kovalam", permanent: true },
      { source: "/destination/alappuzha", destination: "/destination/alleppey-kerala-backwaters", permanent: true },
      { source: "/destination/alleppey", destination: "/destination/alleppey-kerala-backwaters", permanent: true },
      { source: "/destination/kgf", destination: "/destination/kolar-gold-fields", permanent: true },
      { source: "/destination/gokak", destination: "/destination/gokak-falls", permanent: true },
      { source: "/destination/kushalnagar", destination: "/destination/kushal-nagar", permanent: true },
      { source: "/destination/rameshwaram", destination: "/destination/rameswaram", permanent: true },
      { source: "/destination/kolar", destination: "/destination/kolar-gold-fields", permanent: true },
      { source: "/destination/shimoga", destination: "/destination/shivamogga", permanent: true },
      { source: "/destination/mangaluru", destination: "/destination/mangalore", permanent: true },
      { source: "/destination/chikkamagaluru", destination: "/destination/chikmagalur", permanent: true },
      { source: "/destination/tumakuru", destination: "/destination/tumkur", permanent: true },
      { source: "/destination/gulbarga", destination: "/destination/kalaburagi", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Keep the private admin area out of every index.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
