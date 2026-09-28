/** One-time DDL: creates the Postgres function the dashboard calls via supabase.rpc(). */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    create or replace function admin_dashboard_stats(week_ago timestamptz)
    returns table (
      new_count bigint,
      week_count bigint,
      total_count bigint,
      booked_count bigint,
      vehicle_count bigint,
      destination_count bigint,
      testimonial_count bigint,
      faq_count bigint,
      package_count bigint
    ) language sql stable as $$
      select
        (select count(*) from "Enquiry" where status = 'NEW'),
        (select count(*) from "Enquiry" where "createdAt" >= week_ago),
        (select count(*) from "Enquiry"),
        (select count(*) from "Enquiry" where status = 'BOOKED'),
        (select count(*) from "Vehicle"),
        (select count(*) from "Destination"),
        (select count(*) from "Testimonial"),
        (select count(*) from "FaqItem"),
        (select count(*) from "TourPackage")
    $$;
  `);
  console.log("admin_dashboard_stats() created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
