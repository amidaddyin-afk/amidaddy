"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { setLeadMarketingOptIn, setLeadMarketingOptOut } from "@/lib/leads";
import { correctPersonalData, erasePersonalData } from "@/lib/privacy";

export type PrivacyActionState = { error?: string; message?: string };

/** DPDP s.6(4): withdrawing consent is one click, same as giving it. */
export async function updateMarketingConsentAction(
  _: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const { user } = await requireUser();
  if (!user.email) return { error: "No email address on this account." };
  const optIn = formData.get("marketingOptIn") === "yes";
  try {
    if (optIn) await setLeadMarketingOptIn(user.email);
    else await setLeadMarketingOptOut(user.email);
  } catch {
    return { error: "Could not save that. Please try again." };
  }
  revalidatePath("/account/privacy");
  return {
    message: optIn
      ? "You will receive marketing email from us."
      : "You are opted out of marketing email. Order and account email still applies.",
  };
}

/** DPDP s.12(1): correction of inaccurate personal data. */
export async function correctPersonalDataAction(
  _: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const { user } = await requireUser();
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (fullName.length < 2 || fullName.length > 80)
    return { error: "Enter a name between 2 and 80 characters." };
  if (!user.email) return { error: "No email address on this account." };
  try {
    await correctPersonalData(user.id, user.email, fullName);
  } catch {
    return { error: "Could not save that. Please try again." };
  }
  revalidatePath("/account/privacy");
  revalidatePath("/account");
  return { message: "Your name has been corrected." };
}

/**
 * DPDP s.12(3): erasure. Typed confirmation because it cannot be undone, and
 * orders are retained where tax law requires it.
 */
export async function erasePersonalDataAction(
  _: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const { user } = await requireUser();
  if (
    String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== "ERASE"
  )
    return { error: "Type ERASE to confirm." };
  if (!user.email) return { error: "No email address on this account." };
  try {
    await erasePersonalData(user.id, user.email);
  } catch {
    return { error: "Could not complete the request. Please email support." };
  }
  revalidatePath("/account/privacy");
  return {
    message:
      "Your marketing profile and activity history have been erased. Order records are retained where tax law requires it.",
  };
}
