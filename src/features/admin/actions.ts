"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth";
import { appendAuditEvent } from "@/lib/audit";
import { db, transaction } from "@/lib/db";
import { SITE_THEME_TAG, SITE_THEMES } from "@/lib/theme-config";

export type AdminActionState = { error?: string; message?: string };
async function admin() {
  return requireAdminUser();
}

export async function createCouponAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { user } = await admin();
    const parsed = z
      .object({
        code: z
          .string()
          .trim()
          .toUpperCase()
          .regex(/^[A-Z0-9-]{3,24}$/),
        type: z.enum(["PERCENT", "FIXED"]),
        value: z.coerce.number().positive(),
        minSubtotalRupees: z.coerce.number().nonnegative().default(0),
        maxDiscountRupees: z.coerce.number().nonnegative().optional(),
        usageLimit: z
          .union([z.literal(""), z.coerce.number().int().positive()])
          .optional(),
        perCustomerLimit: z.coerce.number().int().positive().default(1),
        startsAt: z.string().optional(),
        endsAt: z.string().optional(),
      })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success)
      return { error: parsed.error.issues[0]?.message ?? "Invalid coupon." };
    const item = parsed.data;
    if (item.type === "PERCENT" && item.value > 100)
      return { error: "Percentage discounts cannot exceed 100%." };
    await transaction(async (client) => {
      await client.query(
        'insert into public.coupons(code,type,value,min_subtotal_paise,max_discount_paise,usage_limit,per_customer_limit,starts_at,ends_at) values($1,$2::public."CouponType",$3,$4,$5,$6,$7,$8,$9)',
        [
          item.code,
          item.type,
          item.type === "FIXED"
            ? Math.round(item.value * 100)
            : Math.round(item.value),
          Math.round(item.minSubtotalRupees * 100),
          item.maxDiscountRupees
            ? Math.round(item.maxDiscountRupees * 100)
            : null,
          item.usageLimit || null,
          item.perCustomerLimit,
          item.startsAt || null,
          item.endsAt || null,
        ],
      );
      await appendAuditEvent(client, user.id, "coupon.created", {
        code: item.code,
      });
    });
    revalidatePath("/admin");
    return { message: "Coupon created." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to create coupon.",
    };
  }
}

export async function toggleCouponAction(formData: FormData) {
  const { user } = await admin();
  const id = z.string().uuid().parse(formData.get("id"));
  await transaction(async (client) => {
    await client.query(
      "update public.coupons set active=not active,updated_at=now() where id=$1",
      [id],
    );
    await appendAuditEvent(client, user.id, "coupon.toggled", {
      couponId: id,
    });
  });
  revalidatePath("/admin");
}

export async function adjustVariantStockAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { user } = await admin();
    const parsed = z
      .object({
        variantId: z.string().uuid(),
        quantity: z.coerce
          .number()
          .int()
          .min(-10000)
          .max(10000)
          .refine((value) => value !== 0),
        reason: z.string().trim().min(3).max(200),
      })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success)
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid stock adjustment.",
      };
    await transaction(async (client) => {
      const result = await client.query(
        "update public.product_variants set stock=stock+$2,updated_at=now() where id=$1 and stock+$2>=reserved and stock+$2>=0 returning product_id",
        [parsed.data.variantId, parsed.data.quantity],
      );
      if (!result.rowCount)
        throw new Error(
          "Adjustment would reduce stock below reserved inventory.",
        );
      await client.query(
        "insert into public.inventory_movements(product_id,type,quantity,reason,actor_id) values($1,'ADJUSTMENT',$2,$3,$4)",
        [
          result.rows[0].product_id,
          parsed.data.quantity,
          parsed.data.reason,
          user.id,
        ],
      );
      await appendAuditEvent(client, user.id, "inventory.adjusted", {
        variantId: parsed.data.variantId,
        quantity: parsed.data.quantity,
      });
    });
    revalidatePath("/admin");
    return { message: "Stock updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to adjust stock.",
    };
  }
}

export async function updateStoreSettingsAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { user } = await admin();
    const parsed = z
      .object({
        supportEmail: z.string().email(),
        supportPhone: z.string().trim().max(30).optional(),
        shippingFeeRupees: z.coerce.number().nonnegative(),
        freeShippingAboveRupees: z.coerce.number().nonnegative(),
        cancellationMessage: z.string().trim().min(10).max(300),
      })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success)
      return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };
    const item = parsed.data;
    await transaction(async (client) => {
      await client.query(
        "update public.store_settings set support_email=$1,support_phone=$2,shipping_fee_paise=$3,free_shipping_above_paise=$4,cancellation_message=$5,updated_at=now() where id=1",
        [
          item.supportEmail,
          item.supportPhone || null,
          Math.round(item.shippingFeeRupees * 100),
          Math.round(item.freeShippingAboveRupees * 100),
          item.cancellationMessage,
        ],
      );
      await client.query(
        "insert into public.audit_logs(actor_id,event,metadata) values($1,'settings.updated','{}')",
        [user.id],
      );
    });
    revalidatePath("/admin");
    return { message: "Store settings updated." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update settings.",
    };
  }
}

/**
 * Switches the storefront art direction for every visitor.
 *
 * updateTag expires the cached theme read immediately (read-your-own-writes),
 * and revalidatePath("/", "layout") drops the rendered HTML of every route
 * below the root layout, which is where data-theme is written.
 */
export async function updateSiteThemeAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { user } = await admin();
    const parsed = z
      .object({ theme: z.enum(SITE_THEMES) })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "Unknown theme." };
    const { theme } = parsed.data;
    await transaction(async (client) => {
      await client.query(
        "update public.store_settings set theme=$1,updated_at=now() where id=1",
        [theme],
      );
      await appendAuditEvent(client, user.id, "settings.theme_changed", {
        theme,
      });
    });
    updateTag(SITE_THEME_TAG);
    revalidatePath("/", "layout");
    return { message: `Theme switched to ${theme}.` };
  } catch (error) {
    // 42703 is undefined_column. It means the site_theme migration has not run
    // against this database, which a raw Postgres error does not make
    // actionable for whoever is looking at the admin screen.
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code)
        : undefined;
    if (code === "42703")
      return {
        error:
          "The theme column is missing. Run the site_theme migration " +
          "(prisma/migrations/20260902140000_site_theme) against this database, " +
          "then try again.",
      };
    return {
      error:
        error instanceof Error ? error.message : "Unable to change the theme.",
    };
  }
}

export async function updateUserRoleAction(formData: FormData) {
  const { user } = await admin();
  const parsed = z
    .object({
      profileId: z.string().uuid(),
      role: z.enum(["CUSTOMER", "ADMIN"]),
    })
    .parse(Object.fromEntries(formData));
  if (parsed.profileId === user.id && parsed.role === "CUSTOMER") {
    const count = Number(
      (
        await db().query(
          "select count(*) count from public.profiles where role='ADMIN'",
        )
      ).rows[0].count,
    );
    if (count <= 1)
      throw new Error("The final administrator cannot be removed.");
  }
  await transaction(async (client) => {
    await client.query(
      'update public.profiles set role=$2::public."UserRole",updated_at=now() where id=$1',
      [parsed.profileId, parsed.role],
    );
    await appendAuditEvent(client, user.id, "profile.role_changed", {
      profileId: parsed.profileId,
      role: parsed.role,
    });
  });
  revalidatePath("/admin");
}
