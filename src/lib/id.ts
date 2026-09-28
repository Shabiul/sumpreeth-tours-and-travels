import { randomUUID } from "crypto";

/**
 * Row ID generator. Prisma's `@default(cuid())` generated IDs client-side,
 * not as a Postgres column default — now that inserts go through
 * supabase-js directly, every create needs to supply its own id.
 * Existing rows keep their cuid-format ids; new ones are UUIDs. Both are
 * just opaque unique strings to the rest of the app.
 */
export function newId(): string {
  return randomUUID();
}
