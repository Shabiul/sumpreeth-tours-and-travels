import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for database access (replaces Prisma at
 * runtime — prisma/schema.prisma remains the schema/migration source of
 * truth, applied via `prisma db push`, but no app code imports
 * @prisma/client any more). Uses the service-role key, so it bypasses RLS —
 * every caller here is already an authenticated server action or a route
 * that does its own `requireAdmin()`/`isAuthenticated()` check.
 */
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<any, any, any>> | undefined;
};

// `any` generics: without an explicit Database type, supabase-js's default
// generic resolves insert()/update() argument types to `never`. This app has
// no generated Database type (schema lives in prisma/schema.prisma instead),
// so row shapes are asserted at each call site via src/lib/types.ts instead.
export const db =
  globalForSupabase.supabase ??
  createClient<any, any, any>(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });

globalForSupabase.supabase = db;

/** Throws if a Supabase query returned an error — call sites do `const x = unwrap(await db.from(...))`. */
export function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}
