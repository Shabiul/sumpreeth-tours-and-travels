"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { contactLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { SERVICE_TOWNS } from "@/lib/service-towns";

type Props = {
  packageSlug: string;
  packageTitle: string;
  whatsappNumber: string;
  vehicleOptions: string[];
};

type FieldErrors = Partial<Record<string, string[]>>;

export default function PackageEnquiryForm({
  packageSlug,
  packageTitle,
  whatsappNumber,
  vehicleOptions,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [travellers, setTravellers] = useState("2");
  const [travelDate, setTravelDate] = useState("");
  const [vehiclePreference, setVehiclePreference] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "done">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [lastWa, setLastWa] = useState<string | null>(null);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = ["Please enter your name"];
    if (!/^[\d+\-\s()]{7,20}$/.test(phone.trim()))
      e.phone = ["Enter a valid phone number"];
    return e;
  }

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      document.getElementById(Object.keys(v)[0])?.focus();
      return;
    }
    setErrors({});

    const lines = [
      `Hi, I am interested in the ${packageTitle}. Please share the itinerary and quotation.`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Travellers: ${travellers}`,
    ];
    if (travelDate) lines.push(`Travel date: ${travelDate}`);
    if (vehiclePreference) lines.push(`Vehicle preference: ${vehiclePreference}`);
    if (pickupLocation.trim()) lines.push(`Pickup location: ${pickupLocation.trim()}`);
    if (message.trim()) lines.push(`Message: ${message.trim()}`);

    const wa = contactLink(whatsappNumber, lines.join("\n"));
    setLastWa(wa);
    trackEvent("enquiry_submit", { source: `tours-packages:${packageSlug}` });
    const waWindow = window.open(wa, "_blank", "noopener,noreferrer");

    setStatus("done");
    setNotice(
      waWindow
        ? "Opening WhatsApp with your trip details…"
        : "Tap “Open WhatsApp” below to send us your trip details.",
    );

    try {
      void fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          serviceType: "TOUR_PACKAGE",
          pickupLocation: pickupLocation.trim() || "Bangalore",
          pickupAt: travelDate || "",
          message: message.trim(),
          sourcePage: `tours-packages:${packageSlug}`,
          packageSlug,
          packageTitle,
          travellers: Number(travellers) || undefined,
          vehiclePreference: vehiclePreference || "",
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* WhatsApp hand-off already happened */
    }
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={handleSubmit} className="card p-6" noValidate>
      <h2 className="text-h4 font-semibold text-ink">Enquire about this package</h2>
      <p className="mt-1 text-sm text-muted">
        Send your details and we&apos;ll reply on WhatsApp with a quotation.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Name <span aria-hidden className="text-red-600">*</span>
          </label>
          <input
            id="name"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          {err("name") && <p className="field-error">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Phone / WhatsApp <span aria-hidden className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            className="field-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
          {err("phone") && <p className="field-error">{err("phone")}</p>}
        </div>
        <div>
          <label htmlFor="travellers" className="field-label">
            Number of travellers
          </label>
          <input
            id="travellers"
            type="number"
            min={1}
            max={100}
            className="field-input"
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="travelDate" className="field-label">
            Travel date
          </label>
          <input
            id="travelDate"
            type="date"
            min={minDate}
            className="field-input"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="vehiclePreference" className="field-label">
            Vehicle preference
          </label>
          {vehicleOptions.length > 0 ? (
            <select
              id="vehiclePreference"
              className="field-input"
              value={vehiclePreference}
              onChange={(e) => setVehiclePreference(e.target.value)}
            >
              <option value="">No preference</option>
              {vehicleOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="vehiclePreference"
              className="field-input"
              value={vehiclePreference}
              onChange={(e) => setVehiclePreference(e.target.value)}
              placeholder="e.g. Sedan, SUV, Tempo Traveller"
            />
          )}
        </div>
        <div>
          <label htmlFor="pickupLocation" className="field-label">
            Pickup location
          </label>
          <input
            id="pickupLocation"
            className="field-input"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            list="service-towns"
            autoComplete="off"
            placeholder="e.g. Jayanagar, Bangalore"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="field-label">
            Message <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={3}
            className="field-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <datalist id="service-towns">
        {SERVICE_TOWNS.map((town) => (
          <option key={town} value={town} />
        ))}
      </datalist>

      <button type="submit" className="btn-accent btn-shine mt-5 w-full">
        <MessageCircle className="h-4 w-4" />
        {status === "done" ? "Resend on WhatsApp" : "Get Quote on WhatsApp"}
      </button>

      {lastWa && (
        <a
          href={lastWa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline btn-sm mt-2 w-full"
        >
          Open WhatsApp
        </a>
      )}

      {notice && (
        <p
          className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-sm text-ink dark:bg-white/[0.04]"
          role="status"
        >
          {notice}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-forest-500 dark:text-forest-400">
        Prices are indicative and confirmed once we understand your dates and group size.
      </p>
    </form>
  );
}
