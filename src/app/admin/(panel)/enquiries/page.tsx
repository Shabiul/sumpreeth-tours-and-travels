import Link from "next/link";
import { db } from "@/lib/supabase";
import type { Enquiry } from "@/lib/types";
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ORDER,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_ORDER,
  type ServiceType,
  type EnquiryStatus,
} from "@/lib/constants";
import { Pencil } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { PageTitle, Panel, StatusBadge, EmptyState } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteEnquiryAction } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SP = {
  status?: string;
  serviceType?: string;
  q?: string;
  page?: string;
};

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  let query = db.from("Enquiry").select("*", { count: "exact" });
  if (sp.status && ENQUIRY_STATUS_ORDER.includes(sp.status as never)) {
    query = query.eq("status", sp.status);
  }
  if (sp.serviceType && SERVICE_TYPE_ORDER.includes(sp.serviceType as never)) {
    query = query.eq("serviceType", sp.serviceType);
  }
  if (sp.q) {
    // Strip characters that would break PostgREST's .or() filter-string syntax.
    const q = sp.q.replace(/[,()]/g, "");
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,pickupLocation.ilike.%${q}%,dropLocation.ilike.%${q}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order("createdAt", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Enquiry[];
  const total = count ?? 0;

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.serviceType) qs.set("serviceType", sp.serviceType);
  if (sp.q) qs.set("q", sp.q);

  return (
    <>
      <PageTitle
        title="Enquiries"
        subtitle={`${total} enquir${total === 1 ? "y" : "ies"} match`}
        action={
          <a
            href={`/admin/enquiries/export?${qs.toString()}`}
            className="inline-flex items-center justify-center rounded-lg bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100"
          >
            Export CSV
          </a>
        }
      />

      <Panel className="mb-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search name, phone, location…"
            className="rounded-lg border border-forest-200 px-3 py-2 text-sm outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-200"
          />
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-lg border border-forest-200 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {ENQUIRY_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ENQUIRY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            name="serviceType"
            defaultValue={sp.serviceType ?? ""}
            className="rounded-lg border border-forest-200 px-3 py-2 text-sm"
          >
            <option value="">All services</option>
            {SERVICE_TYPE_ORDER.map((s) => (
              <option key={s} value={s}>
                {SERVICE_TYPE_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-forest-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700"
          >
            Filter
          </button>
        </form>
      </Panel>

      {rows.length === 0 ? (
        <EmptyState>No enquiries match these filters.</EmptyState>
      ) : (
        <Panel className="overflow-x-auto border border-forest-200 p-0">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="border-b-2 border-forest-200 bg-forest-50/70 text-xs uppercase tracking-wide text-forest-800">
              <tr className="[&>th]:border-r [&>th]:border-forest-100 [&>th:last-child]:border-r-0">
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-200/70">
              {rows.map((e) => (
                <tr
                  key={e.id}
                  className="odd:bg-white even:bg-forest-50/25 hover:bg-forest-50/70 [&>td]:border-r [&>td]:border-forest-100 [&>td:last-child]:border-r-0"
                >
                  <td className="px-4 py-3 text-forest-700/70">
                    {formatDateTime(e.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/enquiries/${e.id}`}
                      className="font-semibold text-forest-800 hover:underline"
                    >
                      {e.name}
                    </Link>
                    <div className="text-xs text-forest-700/60">
                      <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}>
                        {e.phone}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {SERVICE_TYPE_LABELS[e.serviceType as ServiceType]}
                    {e.packageTitle && (
                      <div className="mt-0.5 text-xs font-medium text-saffron-600">
                        {e.packageTitle}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-forest-700/80">
                    {e.pickupLocation}
                    {e.dropLocation ? ` → ${e.dropLocation}` : ""}
                    {e.travellers != null && (
                      <div className="text-xs text-forest-700/60">
                        {e.travellers} traveller{e.travellers === 1 ? "" : "s"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status as EnquiryStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/enquiries/${e.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-forest-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <form action={deleteEnquiryAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <DeleteButton
                          ariaLabel={`Delete enquiry from ${e.name}`}
                          confirmText={`Delete the enquiry from ${e.name}? This cannot be undone.`}
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: pageCount }).map((_, i) => {
            const p = i + 1;
            const params = new URLSearchParams(qs);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/enquiries?${params.toString()}`}
                className={`rounded-md px-3 py-1.5 ${
                  p === page
                    ? "bg-forest-600 text-white"
                    : "bg-white text-forest-700/80 ring-1 ring-forest-200 hover:bg-forest-50/60"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
