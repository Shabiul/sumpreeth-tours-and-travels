import { SERVICE_TYPE_LABELS, type ServiceType } from "./constants";

export type EnquiryLike = {
  name?: string | null;
  phone?: string | null;
  serviceType?: ServiceType | null;
  pickupLocation?: string | null;
  dropLocation?: string | null;
  pickupAt?: string | null;
  message?: string | null;
};

function formatPickupAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/**
 * Builds the pre-filled WhatsApp message body for an enquiry.
 * Kept pure and free of DOM/Next dependencies so it can be unit tested.
 */
export function buildWhatsAppMessage(enquiry: EnquiryLike): string {
  const lines: string[] = ["Hi, I'd like to book a cab"];

  if (enquiry.serviceType) {
    lines.push(`Service: ${SERVICE_TYPE_LABELS[enquiry.serviceType]}`);
  }
  if (enquiry.name) lines.push(`Name: ${enquiry.name}`);
  if (enquiry.phone) lines.push(`Phone: ${enquiry.phone}`);
  if (enquiry.pickupLocation) lines.push(`Pickup: ${enquiry.pickupLocation}`);
  if (enquiry.dropLocation) lines.push(`Drop: ${enquiry.dropLocation}`);

  const when = formatPickupAt(enquiry.pickupAt);
  if (when) lines.push(`When: ${when}`);

  if (enquiry.message) lines.push(`Notes: ${enquiry.message}`);

  return lines.join("\n");
}

/** Full https://wa.me link with the encoded pre-filled message. */
export function whatsappLink(numberDigitsOnly: string, message: string): string {
  const num = numberDigitsOnly.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/** Greeting used by the generic "contact us" WhatsApp shortcuts. */
export const CONTACT_GREETING = "Welcome to Sumpreeth Tours and Travels";

/**
 * WhatsApp link for a plain "contact us" shortcut (header, floating button,
 * CTA banner, page-level hero). No structured enquiry fields — just the
 * greeting, so it never renders the duplicated "Notes:" line.
 */
export function contactLink(
  numberDigitsOnly: string,
  greeting: string = CONTACT_GREETING,
): string {
  return whatsappLink(numberDigitsOnly, greeting);
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
