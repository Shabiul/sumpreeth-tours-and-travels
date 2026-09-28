import Link from "next/link";
import {
  Inbox,
  CalendarClock,
  BadgeCheck,
  Layers,
  Car,
  MapPin,
  Package,
  MessageSquareQuote,
  HelpCircle,
} from "lucide-react";
import { db, unwrap } from "@/lib/supabase";
import type { Enquiry } from "@/lib/types";
import {
  SERVICE_TYPE_LABELS,
  type ServiceType,
  type EnquiryStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import {
  PageTitle,
  Panel,
  PanelHeading,
  StatCard,
  StatusBadge,
  EmptyState,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // A single round trip for every count instead of 9 — each one adds real
  // latency to the pooled connection. admin_dashboard_stats() is a Postgres
  // function (see scripts/create-dashboard-rpc.ts) so this stays one call.
  type Stats = {
    new_count: number;
    week_count: number;
    total_count: number;
    booked_count: number;
    vehicle_count: number;
    destination_count: number;
    testimonial_count: number;
    faq_count: number;
    package_count: number;
  };
  const [statsRows, recentResult] = await Promise.all([
    db.rpc("admin_dashboard_stats", { week_ago: weekAgo.toISOString() }),
    db.from("Enquiry").select("*").order("createdAt", { ascending: false }).limit(8),
  ]);
  const stats0 = unwrap<Stats[]>(statsRows)[0];
  const recent = unwrap<Enquiry[]>(recentResult);

  const {
    new_count: newCount,
    week_count: weekCount,
    total_count: totalCount,
    booked_count: bookedCount,
    vehicle_count: vehicleCount,
    destination_count: destinationCount,
    testimonial_count: testimonialCount,
    faq_count: faqCount,
    package_count: packageCount,
  } = stats0;

  const stats = [
    {
      label: "New enquiries",
      value: newCount,
      href: "/admin/enquiries?status=NEW",
      tone: "saffron" as const,
      icon: <Inbox className="h-5 w-5" />,
    },
    {
      label: "Last 7 days",
      value: weekCount,
      href: "/admin/enquiries",
      tone: "forest" as const,
      icon: <CalendarClock className="h-5 w-5" />,
    },
    {
      label: "Booked",
      value: bookedCount,
      href: "/admin/enquiries?status=BOOKED",
      tone: "emerald" as const,
      icon: <BadgeCheck className="h-5 w-5" />,
    },
    {
      label: "Total enquiries",
      value: totalCount,
      href: "/admin/enquiries",
      tone: "sky" as const,
      icon: <Layers className="h-5 w-5" />,
    },
  ];

  const content: [string, number, string, React.ReactNode][] = [
    [
      "Tour packages",
      packageCount,
      "/admin/packages",
      <Package key="p" className="h-4 w-4" />,
    ],
    ["Vehicles", vehicleCount, "/admin/fleet", <Car key="c" className="h-4 w-4" />],
    [
      "Destinations",
      destinationCount,
      "/admin/destinations",
      <MapPin key="d" className="h-4 w-4" />,
    ],
    [
      "Testimonials",
      testimonialCount,
      "/admin/testimonials",
      <MessageSquareQuote key="t" className="h-4 w-4" />,
    ],
    [
      "FAQ items",
      faqCount,
      "/admin/faqs",
      <HelpCircle key="f" className="h-4 w-4" />,
    ],
  ];

  return (
    <>
      <PageTitle title="Dashboard" subtitle="Overview of enquiries and content" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <PanelHeading>Recent enquiries</PanelHeading>
            <Link
              href="/admin/enquiries"
              className="text-sm font-semibold text-forest-700 hover:underline"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState>No enquiries yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-forest-100">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/admin/enquiries/${e.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-forest-50/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-forest-900">
                        {e.name} · {e.phone}
                      </p>
                      <p className="truncate text-xs text-forest-700/60">
                        {SERVICE_TYPE_LABELS[e.serviceType as ServiceType]} —{" "}
                        {e.pickupLocation}
                        {e.dropLocation ? ` → ${e.dropLocation}` : ""} ·{" "}
                        {formatDateTime(e.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={e.status as EnquiryStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <div className="mb-3">
            <PanelHeading>Content</PanelHeading>
          </div>
          <ul className="space-y-1.5 text-sm">
            {content.map(([label, count, href, icon]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-forest-50/60"
                >
                  <span className="flex items-center gap-2.5 text-forest-800">
                    <span className="text-forest-500">{icon}</span>
                    {label}
                  </span>
                  <span className="inline-flex min-w-7 justify-center rounded-full bg-forest-100 px-2 py-0.5 text-xs font-bold text-forest-800">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
