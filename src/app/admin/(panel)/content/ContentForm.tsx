"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/types";
import { saveContentAction } from "./actions";
import {
  emptyResult,
  SubmitButton,
  FormNotice,
  Text,
  Textarea,
} from "@/components/admin/form";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function ContentForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState(saveContentAction, emptyResult);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700/60">
          Hero
        </h2>
        <Text name="heroHeadline" label="Headline" defaultValue={settings.heroHeadline} error={fe.heroHeadline} />
        <Textarea name="heroSubheadline" label="Subheadline" defaultValue={settings.heroSubheadline} error={fe.heroSubheadline} rows={2} />
        <ImageUpload name="heroImageUrl" label="Hero image" folder="hero" defaultValue={settings.heroImageUrl} error={fe.heroImageUrl} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700/60">
          About
        </h2>
        <Textarea name="aboutStory" label="Company story" defaultValue={settings.aboutStory} error={fe.aboutStory} rows={5} />
        <Textarea name="aboutPromise" label="Service promise" defaultValue={settings.aboutPromise} error={fe.aboutPromise} rows={2} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700/60">
          Trust bar
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Text name="trustYears" label="Years in service" defaultValue={settings.trustYears} error={fe.trustYears} hint="e.g. 12+" />
          <Text name="trustTrips" label="Trips completed" defaultValue={settings.trustTrips} error={fe.trustTrips} hint="e.g. 50,000+" />
          <Text name="trustCities" label="Cities & towns" defaultValue={settings.trustCities} error={fe.trustCities} hint="e.g. 180+" />
        </div>
        <Text name="ctaBannerText" label="CTA banner text" defaultValue={settings.ctaBannerText} error={fe.ctaBannerText} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700/60">
          Contact details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="phone" label="Phone (display)" defaultValue={settings.phone} error={fe.phone} />
          <Text name="whatsappNumber" label="WhatsApp number" defaultValue={settings.whatsappNumber} error={fe.whatsappNumber} hint="Digits only incl. country code, e.g. 919448648898" />
          <Text name="email" label="Email" defaultValue={settings.email} error={fe.email} />
          <Text name="hours" label="Hours" defaultValue={settings.hours} error={fe.hours} />
        </div>
        <Text name="address" label="Address" defaultValue={settings.address} error={fe.address} />
        <Text name="mapEmbedUrl" label="Google Map embed URL" defaultValue={settings.mapEmbedUrl} error={fe.mapEmbedUrl} hint="The src of a Google Maps embed iframe" />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700/60">
          Social links (optional)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Text name="facebookUrl" label="Facebook URL" defaultValue={settings.facebookUrl} error={fe.facebookUrl} />
          <Text name="instagramUrl" label="Instagram URL" defaultValue={settings.instagramUrl} error={fe.instagramUrl} />
          <Text name="youtubeUrl" label="YouTube URL" defaultValue={settings.youtubeUrl} error={fe.youtubeUrl} />
        </div>
      </section>

      <FormNotice result={state} />
      <SubmitButton>Save site content</SubmitButton>
    </form>
  );
}
