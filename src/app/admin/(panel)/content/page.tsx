import { db } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";
import { PageTitle, Panel } from "@/components/admin/ui";
import ContentForm from "./ContentForm";
import { seedSettingsIfMissing } from "./ensure";

export const dynamic = "force-dynamic";

export default async function ContentAdminPage() {
  const { data } = await db.from("SiteSettings").select("*").eq("id", "singleton").maybeSingle();
  const settings: SiteSettings = data ? (data as SiteSettings) : await seedSettingsIfMissing();
  // Never send the password hash to the client — this form has no use for it,
  // and passing the full row to a Client Component serializes it into the RSC
  // payload otherwise.
  const { adminPasswordHash: _adminPasswordHash, ...safeSettings } = settings;
  void _adminPasswordHash;

  return (
    <>
      <PageTitle
        title="Site content"
        subtitle="Text and details shown across the public website"
      />
      <Panel>
        <ContentForm settings={safeSettings} />
      </Panel>
    </>
  );
}
