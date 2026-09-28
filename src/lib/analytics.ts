/**
 * Thin wrapper over Google Analytics 4. Every call is a no-op unless
 * `NEXT_PUBLIC_GA_ID` is set (which is what causes the gtag script to load).
 * GA runs with IP anonymisation and page views sent manually.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
/** Google Ads conversion tag (e.g. "AW-11277138143"). Shares the same gtag.js loader as GA4. */
export const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Fire a GA4 event. Safe to call anywhere on the client. */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

/** Manual SPA page_view (App Router route changes don't reload the page). */
export function trackPageView(path: string): void {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", "page_view", { page_path: path });
}

/** Maps a `data-track` attribute value to a GA4 event name. */
export const TRACK_EVENTS: Record<string, string> = {
  call: "contact_call",
  whatsapp: "contact_whatsapp",
  email: "contact_email",
  enquiry: "enquiry_submit",
  directions: "get_directions",
  "book-cta": "cta_book",
};
