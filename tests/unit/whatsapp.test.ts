import { describe, it, expect } from "vitest";
import {
  buildWhatsAppMessage,
  whatsappLink,
  telLink,
} from "@/lib/whatsapp";

describe("buildWhatsAppMessage", () => {
  it("always starts with the booking greeting", () => {
    expect(buildWhatsAppMessage({})).toBe("Hi, I'd like to book a cab");
  });

  it("includes provided fields with readable labels", () => {
    const msg = buildWhatsAppMessage({
      name: "Anita",
      phone: "9448648898",
      serviceType: "ROUND_TRIP",
      pickupLocation: "Jayanagar",
      dropLocation: "Coorg",
      message: "2 adults",
    });
    expect(msg).toContain("Service: Round Trip");
    expect(msg).toContain("Name: Anita");
    expect(msg).toContain("Phone: 9448648898");
    expect(msg).toContain("Pickup: Jayanagar");
    expect(msg).toContain("Drop: Coorg");
    expect(msg).toContain("Notes: 2 adults");
  });

  it("omits empty fields", () => {
    const msg = buildWhatsAppMessage({ name: "A", dropLocation: "" });
    expect(msg).not.toContain("Drop:");
    expect(msg).not.toContain("Phone:");
  });

  it("formats an ISO string pickupAt", () => {
    const msg = buildWhatsAppMessage({
      pickupAt: "2026-01-02T09:30:00",
    });
    expect(msg).toMatch(/When: .+/);
  });
});

describe("whatsappLink", () => {
  it("strips non-digits from the number and encodes the message", () => {
    const link = whatsappLink("+91 94486 48898", "Hi there & bye");
    expect(link).toBe(
      "https://wa.me/919448648898?text=Hi%20there%20%26%20bye",
    );
  });
});

describe("telLink", () => {
  it("keeps digits and a leading plus", () => {
    expect(telLink("+91 94486 48898")).toBe("tel:+919448648898");
  });
});
