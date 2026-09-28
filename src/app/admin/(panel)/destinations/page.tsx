import Link from "next/link";
import { db, unwrap } from "@/lib/supabase";
import type { Destination } from "@/lib/types";
import {
  DESTINATION_CATEGORY_LABELS,
  type DestinationCategory,
} from "@/lib/constants";
import { PageTitle, Panel, EmptyState, LinkButton } from "@/components/admin/ui";
import { toggleDestinationAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function DestinationsAdminPage() {
  const destinations = unwrap<Destination[]>(
    await db
      .from("Destination")
      .select("*")
      .order("sortOrder", { ascending: true })
      .order("name", { ascending: true })
      .limit(1000),
  );

  return (
    <>
      <PageTitle
        title="Destinations"
        subtitle={`${destinations.length} destinations`}
        action={
          <LinkButton href="/admin/destinations/new">New destination</LinkButton>
        }
      />

      {destinations.length === 0 ? (
        <EmptyState>No destinations yet.</EmptyState>
      ) : (
        <Panel className="overflow-x-auto border border-forest-200 p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b-2 border-forest-200 bg-forest-50/70 text-xs uppercase tracking-wide text-forest-800">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-200/70 [&>tr]:odd:bg-white [&>tr]:even:bg-forest-50/25">
              {destinations.map((d) => (
                <tr key={d.id} className="hover:bg-forest-50/60">
                  <td className="px-4 py-3 text-forest-700/50">{d.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/destinations/${d.id}`}
                      className="font-medium text-forest-700 hover:underline"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {DESTINATION_CATEGORY_LABELS[d.category as DestinationCategory]}
                  </td>
                  <td className="px-4 py-3 text-forest-700/80">
                    {d.distanceKm != null ? `${d.distanceKm} km` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleDestinationAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          d.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-forest-100 text-forest-700/70"
                        }`}
                      >
                        {d.isActive ? "Active" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/destinations/${d.id}`}
                      className="text-sm font-medium text-forest-700 hover:underline"
                    >
                      Edit
                    </Link>
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
