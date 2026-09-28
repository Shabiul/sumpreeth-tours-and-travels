import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import type { Vehicle } from "@/lib/types";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deleteVehicleAction } from "../actions";
import VehicleForm from "../VehicleForm";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await db.from("Vehicle").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const vehicle = data as Vehicle;

  return (
    <>
      <PageTitle title={`Edit — ${vehicle.name}`} />
      <Panel>
        <VehicleForm vehicle={vehicle} />
      </Panel>

      <Panel className="mt-6">
        <h2 className="mb-2 font-semibold text-forest-900">Delete</h2>
        <p className="mb-3 text-sm text-forest-700/60">
          Removes this vehicle from the site permanently.
        </p>
        <form action={deleteVehicleAction}>
          <input type="hidden" name="id" value={vehicle.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete vehicle
          </button>
        </form>
      </Panel>
    </>
  );
}
