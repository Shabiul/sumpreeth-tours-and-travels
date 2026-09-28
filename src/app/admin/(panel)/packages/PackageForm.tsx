"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { TourPackage } from "@/lib/types";
import { savePackageAction } from "./actions";
import {
  PACKAGE_STATE_LABELS,
  PACKAGE_STATE_ORDER,
  PACKAGE_CATEGORY_LABELS,
  PACKAGE_CATEGORY_ORDER,
} from "@/lib/constants";
import { decodeList, decodeItinerary, decodeFaq, itineraryToText, faqToText } from "@/lib/packages";
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

export default function PackageForm({ pkg }: { pkg?: TourPackage }) {
  const [state, action] = useActionState(savePackageAction, emptyResult);
  const fe = state.fieldErrors ?? {};

  const category = pkg ? decodeList(pkg.category) : [];
  const gallery = pkg ? decodeList(pkg.gallery).join("\n") : "";
  const inclusions = pkg ? decodeList(pkg.inclusions).join("\n") : "";
  const exclusions = pkg ? decodeList(pkg.exclusions).join("\n") : "";
  const vehicleOptions = pkg ? decodeList(pkg.vehicleOptions).join("\n") : "";
  const pickupLocations = pkg ? decodeList(pkg.pickupLocations).join("\n") : "";
  const tags = pkg ? decodeList(pkg.tags).join("\n") : "";
  const itinerary = pkg ? itineraryToText(decodeItinerary(pkg.itinerary)) : "";
  const faq = pkg ? faqToText(decodeFaq(pkg.faq)) : "";

  return (
    <form action={action} className="space-y-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          Basics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="title" label="Package title" defaultValue={pkg?.title} error={fe.title} required />
          <Text
            name="destination"
            label="Destination"
            defaultValue={pkg?.destination}
            error={fe.destination}
            hint="e.g. Coorg"
            required
          />
          <Text name="origin" label="Origin" defaultValue={pkg?.origin ?? "Bangalore"} error={fe.origin} />
          <Text
            name="route"
            label="Route"
            defaultValue={pkg?.route}
            error={fe.route}
            hint="e.g. Bangalore → Coorg"
            required
          />
          <Select
            name="state"
            label="State"
            defaultValue={pkg?.state ?? PACKAGE_STATE_ORDER[0]}
            error={fe.state}
            options={PACKAGE_STATE_ORDER.map((k) => ({ value: k, label: PACKAGE_STATE_LABELS[k] }))}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          Categories
        </h2>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {PACKAGE_CATEGORY_ORDER.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm font-medium text-forest-800">
              <input
                type="checkbox"
                name="category"
                value={c}
                defaultChecked={category.includes(c)}
                className="h-4 w-4 rounded border-forest-300 accent-forest-600"
              />
              {PACKAGE_CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          Duration &amp; pricing
        </h2>
        <div className="grid gap-4 sm:grid-cols-5">
          <Text name="durationDays" label="Days" type="number" defaultValue={pkg?.durationDays ?? 3} error={fe.durationDays} required />
          <Text name="durationNights" label="Nights" type="number" defaultValue={pkg?.durationNights ?? 2} error={fe.durationNights} required />
          <Text
            name="distanceKm"
            label="Distance (km)"
            type="number"
            defaultValue={pkg?.distanceKm ?? undefined}
            error={fe.distanceKm}
            hint="Round trip distance from Bangalore"
          />
          <Text
            name="startingPrice"
            label="Starting price (₹)"
            type="number"
            defaultValue={pkg?.startingPrice}
            error={fe.startingPrice}
            hint="Leave blank for 'On request'"
          />
          <Select
            name="priceType"
            label="Price type"
            defaultValue={pkg?.priceType ?? "PER_PACKAGE"}
            error={fe.priceType}
            options={[
              { value: "PER_PACKAGE", label: "Per package" },
              { value: "PER_PERSON", label: "Per person" },
            ]}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          Description &amp; images
        </h2>
        <div className="space-y-4">
          <Textarea
            name="shortDescription"
            label="Short description"
            defaultValue={pkg?.shortDescription}
            error={fe.shortDescription}
            rows={2}
            hint="Shown on the package card. One or two sentences."
          />
          <Textarea
            name="description"
            label="Full description / overview"
            defaultValue={pkg?.description}
            error={fe.description}
            rows={5}
          />
          <ImageUpload
            name="featuredImage"
            label="Featured image"
            folder="packages"
            defaultValue={pkg?.featuredImage}
            error={fe.featuredImage}
            required
          />
          <ImageListUpload
            name="gallery"
            label="Gallery images"
            folder="packages"
            defaultValue={gallery}
            error={fe.gallery}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          Itinerary
        </h2>
        <Textarea
          name="itinerary"
          label="Day-by-day plan"
          defaultValue={itinerary}
          error={fe.itinerary}
          rows={6}
          hint={'One line per day: "Day 1: Title | What happens that day."'}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          name="inclusions"
          label="Inclusions"
          defaultValue={inclusions}
          error={fe.inclusions}
          rows={4}
          hint="One item per line, e.g. Transportation, Driver, Fuel, Toll."
        />
        <Textarea
          name="exclusions"
          label="Exclusions"
          defaultValue={exclusions}
          error={fe.exclusions}
          rows={4}
          hint="One item per line, e.g. Hotel stay, Meals, Entry tickets."
        />
        <Textarea
          name="vehicleOptions"
          label="Vehicle options"
          defaultValue={vehicleOptions}
          error={fe.vehicleOptions}
          rows={3}
          hint="One per line, e.g. Sedan, SUV, Tempo Traveller."
        />
        <Textarea
          name="pickupLocations"
          label="Pickup locations"
          defaultValue={pickupLocations}
          error={fe.pickupLocations}
          rows={3}
          hint="One per line."
        />
      </div>

      <Textarea
        name="tags"
        label="Highlights"
        defaultValue={tags}
        error={fe.tags}
        rows={3}
        hint="One highlight per line, e.g. Abbey Falls, Raja's Seat, Dubare Elephant Camp."
      />

      <Textarea
        name="faq"
        label="FAQ"
        defaultValue={faq}
        error={fe.faq}
        rows={4}
        hint={'One per line: "Question :: Answer"'}
      />

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          Visibility
        </h2>
        <div className="flex flex-wrap items-end gap-6">
          <Text name="sortOrder" label="Sort order" type="number" defaultValue={pkg?.sortOrder ?? 0} error={fe.sortOrder} />
          <Checkbox name="isActive" label="Published" defaultChecked={pkg ? pkg.isActive : true} />
          <Checkbox name="featured" label="Featured" defaultChecked={pkg?.featured ?? false} />
          <Checkbox name="popular" label="Popular" defaultChecked={pkg?.popular ?? false} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700/70">
          SEO
        </h2>
        <div className="space-y-4">
          <Text
            name="seoTitle"
            label="SEO title"
            defaultValue={pkg?.seoTitle}
            error={fe.seoTitle}
            hint="Optional — falls back to the package title."
          />
          <Textarea
            name="seoDescription"
            label="SEO description"
            defaultValue={pkg?.seoDescription}
            error={fe.seoDescription}
            rows={2}
            hint="Optional — falls back to the short description. ~150–160 characters."
          />
          <Text
            name="seoKeywords"
            label="SEO keywords"
            defaultValue={pkg?.seoKeywords}
            error={fe.seoKeywords}
            hint="Optional, comma separated."
          />
        </div>
      </div>

      <FormNotice result={state} />

      <div className="flex gap-2">
        <SubmitButton>{pkg ? "Save package" : "Create package"}</SubmitButton>
        <Link
          href="/admin/packages"
          className="rounded-lg bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
