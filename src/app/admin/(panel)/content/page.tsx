import { db } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";
import { PageTitle, Panel } from "@/components/admin/ui";
import ContentForm from "./ContentForm";
import { seedSettingsIfMissing } from "./ensure";

export const dynamic = "force-dynamic";

export default async function ContentAdminPage() {
  const { data } = await db.from("SiteSettings").select("*").eq("id", "singleton").maybeSingle();
  const settings: SiteSettings = data ? (data as SiteSettings) : await seedSettingsIfMissing();

  return (
    <>
      <PageTitle
        title="Site content"
        subtitle="Text and details shown across the public website"
      />
      <Panel>
        <ContentForm settings={settings} />
      </Panel>
    </>
  );
}
