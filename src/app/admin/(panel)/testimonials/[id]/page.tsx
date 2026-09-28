import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import type { Testimonial } from "@/lib/types";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deleteTestimonialAction } from "../actions";
import TestimonialForm from "../TestimonialForm";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await db.from("Testimonial").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const item = data as Testimonial;

  return (
    <>
      <PageTitle title={`Edit — ${item.authorName}`} />
      <Panel>
        <TestimonialForm item={item} />
      </Panel>

      <Panel className="mt-6">
        <h2 className="mb-2 font-semibold text-forest-900">Delete</h2>
        <form action={deleteTestimonialAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete testimonial
          </button>
        </form>
      </Panel>
    </>
  );
}
