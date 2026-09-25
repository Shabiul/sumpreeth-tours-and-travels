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
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
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
