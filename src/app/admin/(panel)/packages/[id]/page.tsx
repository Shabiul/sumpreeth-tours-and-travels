import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import type { TourPackage } from "@/lib/types";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deletePackageAction } from "../actions";
import PackageForm from "../PackageForm";

export const dynamic = "force-dynamic";

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await db.from("TourPackage").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const pkg = data as TourPackage;

  return (
    <>
      <PageTitle title={`Edit — ${pkg.title}`} />
      <Panel>
        <PackageForm pkg={pkg} />
      </Panel>

      <Panel className="mt-6">
        <h2 className="mb-2 font-semibold text-forest-900">Delete</h2>
        <form action={deletePackageAction}>
          <input type="hidden" name="id" value={pkg.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete package
          </button>
        </form>
      </Panel>
    </>
  );
}
