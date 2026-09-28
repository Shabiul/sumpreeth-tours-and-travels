import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { db } from "@/lib/supabase";
import type { Enquiry } from "@/lib/types";
import {
  SERVICE_TYPE_LABELS,
  type ServiceType,
  type EnquiryStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { buildWhatsAppMessage, whatsappLink, telLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/lib/site";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deleteEnquiryAction } from "../actions";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data }, settings] = await Promise.all([
    db.from("Enquiry").select("*").eq("id", id).maybeSingle(),
    getSiteSettings(),
  ]);

  if (!data) notFound();
  const enquiry = data as Enquiry;

  const wa = whatsappLink(
    settings.whatsappNumber,
    buildWhatsAppMessage({
      name: enquiry.name,
      phone: enquiry.phone,
      serviceType: enquiry.serviceType as ServiceType,
      pickupLocation: enquiry.pickupLocation,
      dropLocation: enquiry.dropLocation,
      pickupAt: enquiry.pickupAt,
      message: enquiry.message,
    }),
  );

  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Phone", enquiry.phone],
    ["Service", SERVICE_TYPE_LABELS[enquiry.serviceType as ServiceType]],
    ...(enquiry.packageTitle
      ? ([["Package", enquiry.packageTitle]] as [string, string][])
      : []),
    ...(enquiry.travellers != null
      ? ([["Travellers", String(enquiry.travellers)]] as [string, string][])
      : []),
    ...(enquiry.vehiclePreference
      ? ([["Vehicle preference", enquiry.vehiclePreference]] as [string, string][])
      : []),
    ["Pickup", enquiry.pickupLocation],
    ["Drop", enquiry.dropLocation ?? "—"],
    ["Preferred time", formatDateTime(enquiry.pickupAt)],
    ["Message", enquiry.message ?? "—"],
    ["Source", enquiry.sourcePage],
    ["Received", formatDateTime(enquiry.createdAt)],
  ];

  return (
    <>
      <Link
        href="/admin/enquiries"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700/60 hover:text-forest-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to enquiries
      </Link>

      <PageTitle
        title={enquiry.name}
        subtitle={`Enquiry received ${formatDateTime(enquiry.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel>
          <dl className="divide-y divide-forest-100">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 py-3 text-sm">
                <dt className="text-forest-700/60">{label}</dt>
                <dd className="col-span-2 whitespace-pre-line text-forest-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <a href={telLink(enquiry.phone)} className="inline-flex items-center gap-1.5 rounded-lg bg-forest-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700">
              <Phone className="h-4 w-4" />
              Call customer
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-600"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp customer
            </a>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="mb-4 font-semibold text-forest-900">
              Status &amp; notes
            </h2>
            <EditForm
              id={enquiry.id}
              status={enquiry.status as EnquiryStatus}
              adminNotes={enquiry.adminNotes}
            />
          </Panel>

          <Panel>
            <h2 className="mb-2 font-semibold text-forest-900">Danger zone</h2>
            <p className="mb-3 text-sm text-forest-700/60">
              Permanently delete this enquiry.
            </p>
            <form action={deleteEnquiryAction}>
              <input type="hidden" name="id" value={enquiry.id} />
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete enquiry
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
