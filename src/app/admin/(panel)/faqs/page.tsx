import Link from "next/link";
import { db, unwrap } from "@/lib/supabase";
import type { FaqItem } from "@/lib/types";
import { PageTitle, Panel, EmptyState, LinkButton } from "@/components/admin/ui";
import { toggleFaqAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage() {
  const items = unwrap<FaqItem[]>(
    await db
      .from("FaqItem")
      .select("*")
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: true }),
  );

  return (
    <>
      <PageTitle
        title="FAQs"
        subtitle={`${items.length} questions`}
        action={<LinkButton href="/admin/faqs/new">New FAQ</LinkButton>}
      />

      {items.length === 0 ? (
        <EmptyState>No FAQ items yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <Panel key={f.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-forest-900">{f.question}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-forest-700/60">
                    {f.answer}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <form action={toggleFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        f.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-forest-100 text-forest-700/70"
                      }`}
                    >
                      {f.isActive ? "Active" : "Hidden"}
                    </button>
                  </form>
                  <Link
                    href={`/admin/faqs/${f.id}`}
                    className="text-sm font-medium text-forest-700 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
