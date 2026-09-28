"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/session";
import { enquiryStatusEnum } from "@/lib/validation";
import type { ActionResult } from "@/components/admin/form";

export async function updateEnquiryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").slice(0, 4000);

  const status = enquiryStatusEnum.safeParse(statusRaw);
  if (!id || !status.success) {
    return { error: "Invalid data." };
  }

  const { error } = await db
    .from("Enquiry")
    .update({
      status: status.data,
      adminNotes: adminNotes || null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: "Could not update this enquiry." };

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Saved." };
}

export async function quickStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = enquiryStatusEnum.safeParse(String(formData.get("status") ?? ""));
  if (!id || !status.success) return;
  await db
    .from("Enquiry")
    .update({ status: status.data, updatedAt: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.from("Enquiry").delete().eq("id", id);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}
