/**
 * One-time migration: uploads every image currently referenced by the DB
 * (local /public files and external Unsplash URLs) into Supabase Storage,
 * then rewrites the DB rows to point at the new Supabase public URLs.
 * Idempotent — already-migrated URLs (containing "/storage/v1/object/public/")
 * are left untouched, so this is safe to re-run.
 *
 * Run with: npx tsx scripts/migrate-images-to-supabase.ts
 */
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { decodeList, encodeList } from "../src/lib/packages";
import { decodeFeatures, encodeFeatures } from "../src/lib/features";

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});
const BUCKET = "images";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};
const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) await supabase.storage.createBucket(BUCKET, { public: true });
}

async function uploadBytes(folder: string, filename: string, bytes: Buffer, contentType: string): Promise<string> {
  const objectPath = `${folder}/${filename}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

const cache = new Map<string, string>();
let uploaded = 0;
let reused = 0;

async function migrateRef(ref: string, folder: string): Promise<string> {
  if (ref.includes("/storage/v1/object/public/")) return ref;
  const cached = cache.get(ref);
  if (cached) {
    reused++;
    return cached;
  }

  let bytes: Buffer;
  let contentType: string;
  let baseName: string;

  if (/^https?:\/\//i.test(ref)) {
    const res = await fetch(ref);
    if (!res.ok) throw new Error(`Failed to fetch ${ref}: ${res.status}`);
    contentType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    bytes = Buffer.from(await res.arrayBuffer());
    const rawBase = path.basename(new URL(ref).pathname).split("?")[0] || "image";
    baseName = /\.[a-z0-9]+$/i.test(rawBase)
      ? rawBase
      : `${rawBase}.${EXT_BY_CONTENT_TYPE[contentType] ?? "jpg"}`;
  } else {
    const filePath = path.join(process.cwd(), "public", ref.replace(/^\//, ""));
    bytes = await readFile(filePath);
    baseName = path.basename(filePath);
    const ext = path.extname(baseName).slice(1).toLowerCase();
    contentType = CONTENT_TYPE_BY_EXT[ext] ?? "image/jpeg";
  }

  // Prefix with a short hash of the source ref so same-named files from
  // different sources (or re-runs) never collide in the bucket.
  const hash = Buffer.from(ref).toString("base64url").slice(0, 10);
  const url = await uploadBytes(folder, `${hash}-${baseName}`, bytes, contentType);
  cache.set(ref, url);
  uploaded++;
  return url;
}

async function migrateSingle(ref: string | null, folder: string): Promise<string | null> {
  if (!ref) return ref;
  return migrateRef(ref, folder);
}

/** For JSON-string-array columns encoded with decodeList/encodeList. */
async function migrateEncodedList(raw: string, folder: string): Promise<string> {
  const list = decodeList(raw);
  const migrated: string[] = [];
  for (const item of list) migrated.push(await migrateRef(item, folder));
  return encodeList(migrated, migrated.length);
}

/** Vehicle.images/features use a slightly different encode/decode pair. */
async function migrateFeatureList(raw: string, folder: string): Promise<string> {
  const list = decodeFeatures(raw);
  const migrated: string[] = [];
  for (const item of list) migrated.push(await migrateRef(item, folder));
  return encodeFeatures(migrated);
}

async function main() {
  await ensureBucket();

  const vehicles = await prisma.vehicle.findMany();
  for (const v of vehicles) {
    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        imageUrl: (await migrateSingle(v.imageUrl, "fleet"))!,
        images: await migrateFeatureList(v.images, "fleet"),
      },
    });
  }
  console.log(`Vehicles migrated: ${vehicles.length}`);

  const destinations = await prisma.destination.findMany();
  for (const d of destinations) {
    await prisma.destination.update({
      where: { id: d.id },
      data: { imageUrl: (await migrateSingle(d.imageUrl, "destinations"))! },
    });
  }
  console.log(`Destinations migrated: ${destinations.length}`);

  const packages = await prisma.tourPackage.findMany();
  for (const p of packages) {
    await prisma.tourPackage.update({
      where: { id: p.id },
      data: {
        featuredImage: (await migrateSingle(p.featuredImage, "packages"))!,
        gallery: await migrateEncodedList(p.gallery, "packages"),
      },
    });
  }
  console.log(`Packages migrated: ${packages.length}`);

  const testimonials = await prisma.testimonial.findMany();
  for (const t of testimonials) {
    if (!t.imageUrl) continue;
    await prisma.testimonial.update({
      where: { id: t.id },
      data: { imageUrl: await migrateSingle(t.imageUrl, "testimonials") },
    });
  }
  console.log(`Testimonials migrated: ${testimonials.length}`);

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (settings) {
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { heroImageUrl: (await migrateSingle(settings.heroImageUrl, "hero"))! },
    });
    console.log("Site settings hero image migrated.");
  }

  console.log(`Done. Uploaded ${uploaded} new images, reused ${reused} cached URLs.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
