import Link from "next/link";
import { Star } from "lucide-react";
import { db, unwrap } from "@/lib/supabase";
import type { Testimonial } from "@/lib/types";
import { PageTitle, Panel, EmptyState, LinkButton } from "@/components/admin/ui";
import { toggleTestimonialAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  const items = unwrap<Testimonial[]>(
    await db
      .from("Testimonial")
      .select("*")
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: false })
      .limit(1000),
  );

  return (
    <>
      <PageTitle
        title="Testimonials"
        subtitle={`${items.length} testimonials`}
        action={
          <LinkButton href="/admin/testimonials/new">New testimonial</LinkButton>
        }
      />

      {items.length === 0 ? (
        <EmptyState>No testimonials yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((t) => (
            <Panel key={t.id}>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-saffron-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      fill={i < t.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <form action={toggleTestimonialAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      t.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-forest-100 text-forest-700/70"
                    }`}
                  >
                    {t.isActive ? "Active" : "Hidden"}
                  </button>
                </form>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-forest-800">
                “{t.quote}”
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-forest-700/60">
                  {t.authorName} · {t.location}
                </span>
                <Link
                  href={`/admin/testimonials/${t.id}`}
                  className="text-sm font-medium text-forest-700 hover:underline"
                >
                  Edit
                </Link>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
