"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Vehicle } from "@prisma/client";
import { saveVehicleAction } from "./actions";
import { VEHICLE_CATEGORY_LABELS } from "@/lib/constants";
import { decodeFeatures } from "@/lib/features";
import {
  emptyResult,
  SubmitButton,
  FormNotice,
  Text,
  Textarea,
  Select,
  Checkbox,
} from "@/components/admin/form";
import { ImageUpload, ImageListUpload } from "@/components/admin/ImageUpload";

export default function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action] = useActionState(saveVehicleAction, emptyResult);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="name" label="Name" defaultValue={vehicle?.name} error={fe.name} required />
        <Select
          name="category"
          label="Category"
          defaultValue={vehicle?.category ?? "CAR"}
          error={fe.category}
          options={(Object.keys(VEHICLE_CATEGORY_LABELS) as (keyof typeof VEHICLE_CATEGORY_LABELS)[]).map(
            (k) => ({ value: k, label: VEHICLE_CATEGORY_LABELS[k] }),
          )}
        />
        <Text name="seats" label="Seats" defaultValue={vehicle?.seats} error={fe.seats} hint="e.g. 4+1, 12+1, 30-45" required />
        <ImageUpload name="imageUrl" label="Cover image" folder="fleet" defaultValue={vehicle?.imageUrl} error={fe.imageUrl} required />
      </div>

      <ImageListUpload
        name="images"
        label="Additional photos"
        folder="fleet"
        defaultValue={decodeFeatures(vehicle?.images).join("\n")}
        error={fe.images}
        hint="Shown as a carousel on the fleet card."
      />

      <Textarea
        name="features"
        label="Features"
        defaultValue={decodeFeatures(vehicle?.features).join("\n")}
        error={fe.features}
        hint="One per line (or comma separated)."
        rows={4}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Text name="sortOrder" label="Sort order" type="number" defaultValue={vehicle?.sortOrder ?? 0} error={fe.sortOrder} />
        <div className="flex items-end gap-4">
          <Checkbox name="isActive" label="Active" defaultChecked={vehicle ? vehicle.isActive : true} />
          <Checkbox
            name="quoteOnRequest"
            label="Quote on request"
            defaultChecked={vehicle?.quoteOnRequest ?? false}
          />
        </div>
      </div>

      <fieldset className="rounded-xl border border-forest-100 p-4">
        <legend className="px-1 text-sm font-semibold text-forest-800">
          Rates <span className="font-normal text-forest-700/50">(leave blank if not offered)</span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Text name="oneWayRate" label="One-way rate (₹)" type="number" defaultValue={vehicle?.oneWayRate} error={fe.oneWayRate} />
          <Text name="oneWayNote" label="One-way note" defaultValue={vehicle?.oneWayNote} error={fe.oneWayNote} hint="e.g. + toll" />
          <Text name="roundTripPerKm" label="Round trip ₹/km" type="number" defaultValue={vehicle?.roundTripPerKm} error={fe.roundTripPerKm} />
          <Text name="minKmPerDay" label="Min km/day" type="number" defaultValue={vehicle?.minKmPerDay} error={fe.minKmPerDay} />
          <Text name="driverBata" label="Driver bata (₹)" type="number" defaultValue={vehicle?.driverBata} error={fe.driverBata} />
          <Text name="roundTripNote" label="Round trip note" defaultValue={vehicle?.roundTripNote} error={fe.roundTripNote} />
          <Text name="localPackageRate" label="Local 8hr/80km (₹)" type="number" defaultValue={vehicle?.localPackageRate} error={fe.localPackageRate} />
          <Text name="localExtraPerKm" label="Local extra ₹/km" type="number" defaultValue={vehicle?.localExtraPerKm} error={fe.localExtraPerKm} />
          <Text name="localExtraPerHr" label="Local extra ₹/hr" type="number" defaultValue={vehicle?.localExtraPerHr} error={fe.localExtraPerHr} />
        </div>
      </fieldset>

      <FormNotice result={state} />

      <div className="flex gap-2">
        <SubmitButton>{vehicle ? "Save vehicle" : "Create vehicle"}</SubmitButton>
        <Link
          href="/admin/fleet"
          className="rounded-lg bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
