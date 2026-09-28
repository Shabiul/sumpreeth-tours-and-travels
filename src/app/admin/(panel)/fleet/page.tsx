import Link from "next/link";
import { Pencil } from "lucide-react";
import { db, unwrap } from "@/lib/supabase";
import type { Vehicle } from "@/lib/types";
import { VEHICLE_CATEGORY_LABELS, type VehicleCategory } from "@/lib/constants";
import { rupees, perKm } from "@/lib/format";
import { PageTitle, Panel, EmptyState, LinkButton } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleVehicleAction, deleteVehicleAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FleetAdminPage() {
  const vehicles = unwrap<Vehicle[]>(
    await db
      .from("Vehicle")
      .select("*")
      .order("sortOrder", { ascending: true })
      .order("name", { ascending: true }),
  );

  return (
    <>
      <PageTitle
        title="Fleet"
        subtitle="Vehicles, rates and availability shown on the public site"
        action={<LinkButton href="/admin/fleet/new">New vehicle</LinkButton>}
      />

      {vehicles.length === 0 ? (
        <EmptyState>No vehicles yet. Add your first one.</EmptyState>
      ) : (
        <Panel className="overflow-x-auto border border-forest-200 p-0">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="border-b-2 border-forest-200 bg-forest-50/70 text-xs uppercase tracking-wide text-forest-800">
              <tr className="[&>th]:border-r [&>th]:border-forest-100 [&>th:last-child]:border-r-0">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rates</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-200/70">
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="odd:bg-white even:bg-forest-50/25 hover:bg-forest-50/70 [&>td]:border-r [&>td]:border-forest-100 [&>td:last-child]:border-r-0"
                >
                  <td className="px-4 py-3 text-forest-700/50">{v.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/fleet/${v.id}`}
                      className="font-semibold text-forest-800 hover:underline"
                    >
                      {v.name}
                    </Link>
                    <div className="text-xs text-forest-700/60">{v.seats} seats</div>
                  </td>
                  <td className="px-4 py-3">
                    {VEHICLE_CATEGORY_LABELS[v.category as VehicleCategory]}
                  </td>
                  <td className="px-4 py-3 text-forest-700/80">
                    {v.quoteOnRequest
                      ? "Quote on request"
                      : [
                          v.oneWayRate != null
                            ? `1-way ${rupees(v.oneWayRate)}`
                            : null,
                          v.roundTripPerKm != null
                            ? `RT ${perKm(v.roundTripPerKm)}`
                            : null,
                          v.localPackageRate != null
                            ? `Local ${rupees(v.localPackageRate)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleVehicleAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          v.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-forest-100 text-forest-700/70"
                        }`}
                      >
                        {v.isActive ? "Active" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/fleet/${v.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-forest-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <form action={deleteVehicleAction}>
                        <input type="hidden" name="id" value={v.id} />
                        <DeleteButton
                          ariaLabel={`Delete ${v.name}`}
                          confirmText={`Delete "${v.name}" from the fleet? This cannot be undone.`}
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
    </>
  );
}
