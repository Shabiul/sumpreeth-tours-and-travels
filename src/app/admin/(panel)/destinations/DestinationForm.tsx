"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Destination } from "@/lib/types";
import { saveDestinationAction } from "./actions";
import {
  DESTINATION_CATEGORY_LABELS,
  DESTINATION_CATEGORY_ORDER,
  PACKAGE_STATE_LABELS,
  PACKAGE_STATE_ORDER,
} from "@/lib/constants";
import { decodeList } from "@/lib/packages";
import {
  emptyResult,
  SubmitButton,
  FormNotice,
  Text,
  Textarea,
  Select,
  Checkbox,
} from "@/components/admin/form";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function DestinationForm({ dest }: { dest?: Destination }) {
  const [state, action] = useActionState(saveDestinationAction, emptyResult);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {dest && <input type="hidden" name="id" value={dest.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="name" label="Name" defaultValue={dest?.name} error={fe.name} required />
        <Select
          name="category"
          label="Category"
          defaultValue={dest?.category ?? DESTINATION_CATEGORY_ORDER[0]}
          error={fe.category}
          options={DESTINATION_CATEGORY_ORDER.map((k) => ({
            value: k,
            label: DESTINATION_CATEGORY_LABELS[k],
          }))}
        />
        <Select
          name="state"
          label="State"
          defaultValue={dest?.state ?? PACKAGE_STATE_ORDER[0]}
          error={fe.state}
          options={PACKAGE_STATE_ORDER.map((k) => ({
            value: k,
            label: PACKAGE_STATE_LABELS[k],
          }))}
        />
        <ImageUpload name="imageUrl" label="Image" folder="destinations" defaultValue={dest?.imageUrl} error={fe.imageUrl} required />
        <Text name="distanceKm" label="Distance from Bangalore (km)" type="number" defaultValue={dest?.distanceKm} error={fe.distanceKm} />
        <Text
          name="packageSlug"
          label="Linked tour package slug (optional)"
          defaultValue={dest?.packageSlug ?? ""}
          error={fe.packageSlug}
          hint="e.g. bangalore-to-coorg — shows a link to that multi-day package on this page."
        />
      </div>

      <Textarea
        name="description"
        label="Description"
        defaultValue={dest?.description}
        error={fe.description}
        rows={3}
        hint="One or two sentences."
      />

      <Textarea
        name="highlights"
        label="Highlights"
        defaultValue={dest ? decodeList(dest.highlights).join("\n") : ""}
        error={fe.highlights}
        rows={4}
        hint="One highlight per line — real, specific things to see or do."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="seoTitle" label="SEO title (optional)" defaultValue={dest?.seoTitle ?? ""} error={fe.seoTitle} />
        <Text name="seoDescription" label="SEO description (optional)" defaultValue={dest?.seoDescription ?? ""} error={fe.seoDescription} />
      </div>

      <div className="flex items-end gap-6">
        <Text name="sortOrder" label="Sort order" type="number" defaultValue={dest?.sortOrder ?? 0} error={fe.sortOrder} />
        <Checkbox name="isActive" label="Active" defaultChecked={dest ? dest.isActive : true} />
      </div>

      <FormNotice result={state} />

      <div className="flex gap-2">
        <SubmitButton>{dest ? "Save destination" : "Create destination"}</SubmitButton>
        <Link
          href="/admin/destinations"
          className="rounded-lg bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
