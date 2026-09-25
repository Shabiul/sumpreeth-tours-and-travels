import { createClient } from "@supabase/supabase-js";

/** Public bucket that holds every uploaded image (fleet/destination/package/testimonial/hero). */
export const IMAGE_BUCKET = "images";

let client: ReturnType<typeof createClient> | null = null;

function admin() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

let bucketReady: Promise<void> | null = null;

/** Idempotent — creates the public bucket on first use only. */
function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data } = await admin().storage.getBucket(IMAGE_BUCKET);
      if (!data) {
        await admin().storage.createBucket(IMAGE_BUCKET, { public: true });
      }
    })();
  }
  return bucketReady;
}

/** Uploads a file under `folder/` and returns its public URL. */
export async function uploadImage(
  folder: string,
  filename: string,
  bytes: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  await ensureBucket();
  const path = `${folder}/${Date.now()}-${filename}`;
  const { error } = await admin()
    .storage.from(IMAGE_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;
  const { data } = admin().storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
