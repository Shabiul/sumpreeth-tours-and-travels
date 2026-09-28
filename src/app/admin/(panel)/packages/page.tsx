import Link from "next/link";
import { Pencil, Copy } from "lucide-react";
import { db } from "@/lib/supabase";
import type { TourPackage } from "@/lib/types";
import { PACKAGE_STATE_LABELS, type PackageState } from "@/lib/constants";
import { rupees } from "@/lib/format";
import { PageTitle, Panel, EmptyState, LinkButton } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  toggleActivePackageAction,
  toggleFeaturedPackageAction,
  togglePopularPackageAction,
  deletePackageAction,
  duplicatePackageAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Tab = "all" | "oneDay" | "published" | "drafts" | "featured" | "popular";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All packages" },
  { key: "oneDay", label: "1-day trips" },
  { key: "published", label: "Published" },
  { key: "drafts", label: "Drafts" },
  { key: "featured", label: "Featured" },
  { key: "popular", label: "Popular" },
];

export default async function PackagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (TABS.find((t) => t.key === tabParam)?.key ?? "all") as Tab;

  let query = db.from("TourPackage").select("*", { count: "exact" });
  if (tab === "oneDay") query = query.eq("durationDays", 1);
  else if (tab === "published") query = query.eq("isActive", true);
  else if (tab === "drafts") query = query.eq("isActive", false);
  else if (tab === "featured") query = query.eq("featured", true);
  else if (tab === "popular") query = query.eq("popular", true);

  const [{ data, error }, { count: total }] = await Promise.all([
    query.order("sortOrder", { ascending: true }).order("title", { ascending: true }),
    db.from("TourPackage").select("*", { count: "exact", head: true }),
  ]);
  if (error) throw new Error(error.message);
  const packages = (data ?? []) as TourPackage[];
  const totalCount = total ?? 0;

  return (
    <>
      <PageTitle
        title="Tours & Packages"
        subtitle={`${totalCount} package${totalCount === 1 ? "" : "s"} total`}
        action={<LinkButton href="/admin/packages/new">New package</LinkButton>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/packages" : `/admin/packages?tab=${t.key}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-forest-600 text-white"
                : "bg-white text-forest-700/80 ring-1 ring-forest-200 hover:bg-forest-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {packages.length === 0 ? (
        <EmptyState>No packages in this view yet.</EmptyState>
      ) : (
        <Panel className="overflow-x-auto border border-forest-200 p-0">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="border-b-2 border-forest-200 bg-forest-50/70 text-xs uppercase tracking-wide text-forest-800">
              <tr className="[&>th]:border-r [&>th]:border-forest-100 [&>th:last-child]:border-r-0">
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-200/70">
              {packages.map((p) => (
                <tr
                  key={p.id}
                  className="odd:bg-white even:bg-forest-50/25 hover:bg-forest-50/70 [&>td]:border-r [&>td]:border-forest-100 [&>td:last-child]:border-r-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/packages/${p.id}`}
                      className="font-semibold text-forest-800 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="text-xs text-forest-700/60">{p.route}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.destination}
                    <div className="text-xs text-forest-700/60">
                      {PACKAGE_STATE_LABELS[p.state as PackageState] ?? p.state}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-forest-700/80">
                    {p.durationNights}N / {p.durationDays}D
                  </td>
                  <td className="px-4 py-3 text-forest-700/80">
                    {p.distanceKm != null ? `${p.distanceKm} km` : "—"}
                  </td>
                  <td className="px-4 py-3 text-forest-700/80">
                    {p.startingPrice != null ? rupees(p.startingPrice) : "On request"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <form action={toggleActivePackageAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-forest-100 text-forest-700/70"
                          }`}
                        >
                          {p.isActive ? "Published" : "Draft"}
                        </button>
                      </form>
                      <form action={toggleFeaturedPackageAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.featured
                              ? "bg-saffron-100 text-saffron-800"
                              : "bg-forest-100 text-forest-700/70"
                          }`}
                        >
                          Featured
                        </button>
                      </form>
                      <form action={togglePopularPackageAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.popular
                              ? "bg-sky-100 text-sky-800"
                              : "bg-forest-100 text-forest-700/70"
                          }`}
                        >
                          Popular
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/packages/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-forest-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <form action={duplicatePackageAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          aria-label={`Duplicate ${p.title}`}
                          className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1.5 text-xs font-semibold text-forest-700 ring-1 ring-forest-200 hover:bg-forest-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={deletePackageAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <DeleteButton
                          ariaLabel={`Delete ${p.title}`}
                          confirmText={`Delete "${p.title}"? This cannot be undone.`}
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
