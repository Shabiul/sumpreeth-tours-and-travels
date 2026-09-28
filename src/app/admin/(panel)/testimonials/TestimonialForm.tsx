"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Testimonial } from "@/lib/types";
import { saveTestimonialAction } from "./actions";
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

export default function TestimonialForm({ item }: { item?: Testimonial }) {
  const [state, action] = useActionState(saveTestimonialAction, emptyResult);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="authorName" label="Author name" defaultValue={item?.authorName} error={fe.authorName} required />
        <Text name="location" label="Location" defaultValue={item?.location} error={fe.location} required />
        <Select
          name="rating"
          label="Rating"
          defaultValue={String(item?.rating ?? 5)}
          error={fe.rating}
          options={[5, 4, 3, 2, 1].map((n) => ({
            value: String(n),
            label: `${n} star${n > 1 ? "s" : ""}`,
          }))}
        />
        <ImageUpload name="imageUrl" label="Photo (optional)" folder="testimonials" defaultValue={item?.imageUrl} error={fe.imageUrl} />
      </div>

      <Textarea
        name="quote"
        label="Quote"
        defaultValue={item?.quote}
        error={fe.quote}
        rows={4}
      />

      <div className="flex items-end gap-6">
        <Text name="sortOrder" label="Sort order" type="number" defaultValue={item?.sortOrder ?? 0} error={fe.sortOrder} />
        <Checkbox name="isActive" label="Active" defaultChecked={item ? item.isActive : true} />
      </div>

      <FormNotice result={state} />

      <div className="flex gap-2">
        <SubmitButton>{item ? "Save testimonial" : "Create testimonial"}</SubmitButton>
        <Link
          href="/admin/testimonials"
          className="rounded-lg bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
