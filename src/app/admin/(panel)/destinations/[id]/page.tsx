import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import type { Destination } from "@/lib/types";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deleteDestinationAction } from "../actions";
import DestinationForm from "../DestinationForm";

export const dynamic = "force-dynamic";

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: dest } = await db.from("Destination").select("*").eq("id", id).maybeSingle();
  if (!dest) notFound();
  const typedDest = dest as Destination;

  return (
    <>
      <PageTitle title={`Edit — ${typedDest.name}`} />
      <Panel>
        <DestinationForm dest={typedDest} />
      </Panel>

      <Panel className="mt-6">
        <h2 className="mb-2 font-semibold text-forest-900">Delete</h2>
        <form action={deleteDestinationAction}>
          <input type="hidden" name="id" value={typedDest.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete destination
          </button>
        </form>
      </Panel>
    </>
  );
}
