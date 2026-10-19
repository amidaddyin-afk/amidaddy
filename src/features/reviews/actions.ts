"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { claimGuestOrders } from "@/lib/orders";
import {
  findReviewableProduct,
  hasPurchasedProduct,
  saveReview,
} from "@/lib/reviews";
import { publicAuthorName, reviewSchema } from "./schemas";

export type ReviewActionState = { error?: string; message?: string };

export async function submitReviewAction(
  _: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Check your review." };
  const current = await getCurrentUser();
  if (!current) return { error: "Sign in to write a review." };
  const { user, profile } = current;
  if (!user.email_confirmed_at || !user.email)
    return { error: "Verify your email before writing a review." };

  try {
    const product = await findReviewableProduct(parsed.data.productId);
    if (!product) return { error: "This product is no longer available." };
    // Guest orders placed with this email count as purchases too.
    await claimGuestOrders(user.id, user.email).catch(() => {});
    await saveReview({
      ...parsed.data,
      customerId: user.id,
      authorName: publicAuthorName(
        profile?.full_name ??
          (user.user_metadata?.full_name as string | undefined),
      ),
      verifiedPurchase: await hasPurchasedProduct(user.id, product.id),
    });
    revalidatePath(`/products/${product.slug}`);
    return { message: "Thank you — your review is live." };
  } catch (error) {
    console.error("[reviews] save failed", error);
    return { error: "We couldn't save your review. Please try again." };
  }
}
