import { type NextRequest } from "next/server";
import { db } from "@/lib/supabase";
import type { Enquiry } from "@/lib/types";
import { isAuthenticated } from "@/lib/session";
import {
  SERVICE_TYPE_LABELS,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_ORDER,
  SERVICE_TYPE_ORDER,
  type ServiceType,
  type EnquiryStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const serviceType = sp.get("serviceType");
  const q = sp.get("q");

  let query = db.from("Enquiry").select("*");
  if (status && ENQUIRY_STATUS_ORDER.includes(status as never)) {
    query = query.eq("status", status);
  }
  if (serviceType && SERVICE_TYPE_ORDER.includes(serviceType as never)) {
    query = query.eq("serviceType", serviceType);
  }
  if (q) {
    const safeQ = q.replace(/[,()]/g, "");
    query = query.or(
      `name.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,pickupLocation.ilike.%${safeQ}%,dropLocation.ilike.%${safeQ}%`,
    );
  }

  const { data, error } = await query.order("createdAt", { ascending: false }).limit(5000);
  if (error) return new Response("Failed to export.", { status: 500 });
  const rows = (data ?? []) as Enquiry[];

  const header = [
    "Received",
    "Name",
    "Phone",
    "Service",
    "Pickup",
    "Drop",
    "Preferred time",
    "Status",
    "Message",
    "Notes",
    "Source",
  ];

  const lines = [header.join(",")];
  for (const e of rows) {
    lines.push(
      [
        formatDateTime(e.createdAt),
        e.name,
        e.phone,
        SERVICE_TYPE_LABELS[e.serviceType as ServiceType],
        e.pickupLocation,
        e.dropLocation ?? "",
        e.pickupAt ? formatDateTime(e.pickupAt) : "",
        ENQUIRY_STATUS_LABELS[e.status as EnquiryStatus],
        e.message ?? "",
        e.adminNotes ?? "",
        e.sourcePage,
      ]
        .map((v) => csvCell(String(v)))
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${stamp}.csv"`,
    },
  });
}
