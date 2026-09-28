"use client";

import { useMemo, useState } from "react";
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ORDER,
  type ServiceType,
} from "@/lib/constants";
import { buildWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { SERVICE_TOWNS } from "@/lib/service-towns";

type Variant = "widget" | "page";

type Props = {
  variant: Variant;
  whatsappNumber: string;
  sourcePage: string;
  defaultServiceType?: ServiceType;
  defaultDrop?: string;
  defaultMessage?: string;
};

type FieldErrors = Partial<Record<string, string[]>>;

const DROP_HIDDEN_FOR: ServiceType[] = ["LOCAL"];

export default function EnquiryForm({
  variant,
  whatsappNumber,
  sourcePage,
  defaultServiceType = "ONE_WAY",
  defaultDrop = "",
  defaultMessage = "",
}: Props) {
  const [serviceType, setServiceType] = useState<ServiceType>(defaultServiceType);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickup] = useState("");
  const [dropLocation, setDrop] = useState(defaultDrop);
  const [pickupAt, setPickupAt] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [company, setCompany] = useState(""); // honeypot

  const [status, setStatus] = useState<"idle" | "done">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  const dropVisible = !DROP_HIDDEN_FOR.includes(serviceType);

  // Earliest bookable time = now (local), so the picker can't offer past slots.
  const minDateTime = useMemo(
    () =>
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    [],
  );

  const focusFirstError = (e: FieldErrors) => {
    const order = [
      "name",
      "phone",
      "pickupLocation",
      "dropLocation",
      "pickupAt",
      "message",
    ];
    const first = order.find((k) => e[k]?.length);
    if (first) document.getElementById(first)?.focus();
  };

  const clientValidate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = ["Please enter your name"];
    if (!/^[\d+\-\s()]{7,20}$/.test(phone.trim()))
      e.phone = ["Enter a valid phone number"];
    if (pickupLocation.trim().length < 2)
      e.pickupLocation = ["Enter a pickup location"];
    return e;
  };

  const payload = useMemo(
    () => ({
      name: name.trim(),
      phone: phone.trim(),
      serviceType,
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropVisible ? dropLocation.trim() : "",
      pickupAt: pickupAt.trim(),
      message: message.trim(),
      sourcePage,
      company,
    }),
    [
      name,
      phone,
      serviceType,
      pickupLocation,
      dropVisible,
      dropLocation,
      pickupAt,
      message,
      sourcePage,
      company,
    ],
  );

  const [lastWa, setLastWa] = useState<string | null>(null);

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    setNotice(null);
    const localErrors = clientValidate();
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      focusFirstError(localErrors);
      return;
    }
    setErrors({});

    // Open WhatsApp synchronously, still inside the click/tap gesture, so the
    // browser never treats it as a blocked popup. Reaching us must not depend
    // on the enquiry save succeeding.
    const wa = whatsappLink(whatsappNumber, buildWhatsAppMessage(payload));
    setLastWa(wa);
    trackEvent("enquiry_submit", {
      service_type: serviceType,
      source: sourcePage,
    });
    const waWindow = window.open(wa, "_blank", "noopener,noreferrer");

    setStatus("done");
    setNotice(
      waWindow
        ? "Opening WhatsApp with your trip details…"
        : "Tap “Open WhatsApp” below to send us your trip details.",
    );

    // Best-effort logging in the background — never blocks the customer.
    try {
      void fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore — the WhatsApp hand-off already happened */
    }
  }

  const err = (k: string) => errors[k]?.[0];

  const FIELD_LABELS: Record<string, string> = {
    name: "Name",
    phone: "Phone",
    pickupLocation: "Pickup location",
    dropLocation: "Drop location",
    pickupAt: "Pickup date & time",
    message: "Message",
  };
  const errorKeys = Object.keys(errors).filter((k) => errors[k]?.length);

  return (
    <form
      onSubmit={handleSubmit}
      className={
        variant === "widget"
          ? "rounded-2xl bg-surface/95 p-4 shadow-card ring-1 ring-black/5 backdrop-blur sm:p-6"
          : "card p-6 sm:p-8"
      }
      noValidate
    >
      {variant === "widget" && (
        <h2 className="mb-4 text-h4 font-semibold text-ink">Quick enquiry</h2>
      )}

      {errorKeys.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <p className="font-semibold">Please check the following:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {errorKeys.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => document.getElementById(k)?.focus()}
                >
                  {FIELD_LABELS[k] ?? k}
                </button>
                {": "}
                {errors[k]?.[0]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Service type — tabs for the widget, select for the page form */}
      {variant === "widget" ? (
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Service type"
        >
          {SERVICE_TYPE_ORDER.map((st) => (
            <button
              key={st}
              type="button"
              role="tab"
              aria-selected={serviceType === st}
              onClick={() => setServiceType(st)}
              className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
                serviceType === st
                  ? "bg-forest-600 text-white"
                  : "bg-forest-50 dark:bg-white/[0.04] text-bodytext hover:bg-forest-100 dark:hover:bg-white/[0.08]"
              }`}
            >
              {SERVICE_TYPE_LABELS[st]}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="serviceType" className="field-label">
            Service type
          </label>
          <select
            id="serviceType"
            className="field-input"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
          >
            {SERVICE_TYPE_ORDER.map((st) => (
              <option key={st} value={st}>
                {SERVICE_TYPE_LABELS[st]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
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
            aria-required="true"
            aria-invalid={!!err("name")}
          />
          {err("name") && <p className="field-error">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Phone <span aria-hidden className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            className="field-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={!!err("phone")}
          />
          {err("phone") && <p className="field-error">{err("phone")}</p>}
        </div>
        <div>
          <label htmlFor="pickupLocation" className="field-label">
            Pickup location <span aria-hidden className="text-red-600">*</span>
          </label>
          <input
            id="pickupLocation"
            className="field-input"
            value={pickupLocation}
            onChange={(e) => setPickup(e.target.value)}
            list="service-towns"
            autoComplete="off"
            required
            aria-required="true"
            aria-invalid={!!err("pickupLocation")}
          />
          {err("pickupLocation") && (
            <p className="field-error">{err("pickupLocation")}</p>
          )}
        </div>
        {dropVisible && (
          <div>
            <label htmlFor="dropLocation" className="field-label">
              Drop location
            </label>
            <input
              id="dropLocation"
              className="field-input"
              value={dropLocation}
              onChange={(e) => setDrop(e.target.value)}
              list="service-towns"
              autoComplete="off"
            />
          </div>
        )}
        <div>
          <label htmlFor="pickupAt" className="field-label">
            Pickup date &amp; time
          </label>
          <input
            id="pickupAt"
            type="datetime-local"
            className="field-input"
            min={minDateTime}
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
          />
        </div>
        <div className={dropVisible ? "sm:col-span-2" : ""}>
          <label htmlFor="message" className="field-label">
            Message <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={variant === "widget" ? 2 : 4}
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

      {/* Honeypot — hidden from real users */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px]">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-accent mt-5 w-full">
        {status === "done" ? "Resend on WhatsApp" : "Book Now on WhatsApp"}
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
          className="mt-3 rounded-lg bg-forest-50 dark:bg-white/[0.04] px-3 py-2 text-sm text-ink"
          role="status"
        >
          {notice}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-forest-500 dark:text-forest-400">
        We reply 24/7. No spam — your details are only used for this booking.
      </p>
    </form>
  );
}
