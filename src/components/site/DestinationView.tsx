"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Search } from "lucide-react";
import type { DestinationView as Destination } from "@/lib/site";
import {
  DESTINATION_CATEGORY_LABELS,
  DESTINATION_CATEGORY_ORDER,
  type DestinationCategory,
} from "@/lib/constants";
import { distanceLabel } from "@/lib/format";

/**
 * Image cards for every destination that has a photo of its own, ordered so
 * neighbouring cards vary by scenery. Each name maps to a distinct file, so no
 * image repeats on the page. Destinations not listed here appear in the text
 * list below only.
 */
const FEATURED = [
  "Madikeri / Coorg",
  "Hampi",
  "Dharmasthala",
  "Gokarna",
  "Mysore",
  "Chikmagalur",
  "Bangalore Palace",
  "Tirupati",
  "Shivanasamudra Falls",
  "Ooty",
  "Mantralaya",
  "Pondicherry",
  "Sakleshpur",
  "Kodaikanal",
  "Wayanad",
  "Kanyakumari",
  "Chikkaballapura (Nandi region)",
  "Munnar",
  "Rameswaram",
  "Goa",
  "Trivandrum & Kovalam",
  "Alleppey (Kerala Backwaters)",
];

const TABS: ("ALL" | DestinationCategory)[] = ["ALL", ...DESTINATION_CATEGORY_ORDER];

function planHref(d: Destination) {
  return `/destination/${d.slug}`;
}

export default function DestinationView({
  destinations,
}: {
  destinations: Destination[];
}) {
  const [tab, setTab] = useState<"ALL" | DestinationCategory>("ALL");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const matchesSearch = (d: Destination) =>
    !query ||
    d.name.toLowerCase().includes(query) ||
    d.description.toLowerCase().includes(query) ||
    d.state.toLowerCase().includes(query);

  const featured = FEATURED.map((n) =>
    destinations.find((d) => d.name === n),
  ).filter(Boolean) as Destination[];

  const visible = (
    tab === "ALL" ? destinations : destinations.filter((d) => d.category === tab)
  ).filter(matchesSearch);

  const grouped = DESTINATION_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: visible
      .filter((d) => d.category === cat)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Search & filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 60+ destinations (e.g. Mysore, Coorg, Ooty)..."
            className="input w-full pl-10 pr-4 text-sm"
            aria-label="Search destinations"
          />
        </div>
        {search && (
          <p className="text-xs text-muted">
            Found {visible.length} route{visible.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Featured image cards (shown on initial unfiltered view) */}
      {!search && tab === "ALL" && featured.length > 0 && (
        <div className="mb-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <Link
              key={d.id}
              href={planHref(d)}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5"
            >
              <Image
                src={d.imageUrl}
                alt={d.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-lg font-bold">{d.name}</h3>
                {d.distanceKm != null && (
                  <p className="mt-0.5 text-xs text-white/80">
                    {distanceLabel(d.distanceKm)}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-saffron-200">
                  Plan this trip
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Destination category"
      >
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-forest-600 text-white"
                : "bg-surface text-bodytext ring-1 ring-line hover:bg-forest-50 dark:hover:bg-white/[0.04]"
            }`}
          >
            {t === "ALL" ? "All destinations" : DESTINATION_CATEGORY_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Grouped list */}
      <div className="mt-8 space-y-10">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-saffron-600">
              {DESTINATION_CATEGORY_LABELS[cat]}
              <span className="ml-2 font-medium text-muted">
                {items.length}
              </span>
            </h3>
            <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((d) => (
                <li key={d.id} className="min-w-0">
                  <Link
                    href={planHref(d)}
                    className="group flex min-w-0 items-start justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-forest-50 dark:hover:bg-white/[0.04]"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">
                        {d.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-forest-500 dark:text-forest-400">
                        {d.description}
                      </span>
                    </span>
                    <span className="shrink-0 pt-0.5 text-right">
                      {d.distanceKm != null && (
                        <span className="flex items-center gap-1 text-xs font-medium text-saffron-600">
                          <MapPin className="h-3 w-3" />
                          {d.distanceKm} km
                        </span>
                      )}
                      <ArrowRight className="ml-auto mt-1 h-4 w-4 text-forest-300 transition group-hover:translate-x-0.5 group-hover:text-forest-600 dark:text-forest-500 dark:group-hover:text-forest-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
