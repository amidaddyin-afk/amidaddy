import "server-only";

import { createClient } from "@/lib/supabase/server";

async function invoke(
  operation:
    | "reserve_inventory"
    | "release_inventory"
    | "commit_inventory_sale"
    | "adjust_inventory",
  productId: string,
  quantity: number,
  reason: string,
) {
  const supabase = await createClient();
  const parameter =
    operation === "release_inventory"
      ? "quantity_to_release"
      : operation === "adjust_inventory"
        ? "adjustment"
        : operation === "commit_inventory_sale"
          ? "sold_quantity"
          : "requested_quantity";
  const { data, error } = await supabase.rpc(operation, {
    product_uuid: productId,
    [parameter]: quantity,
    note: reason,
  });
  if (error || !data)
    throw new Error("Inventory operation could not be completed.");
}

export const reserveInventory = (
  productId: string,
  quantity: number,
  reason: string,
) => invoke("reserve_inventory", productId, quantity, reason);
export const releaseInventory = (
  productId: string,
  quantity: number,
  reason: string,
) => invoke("release_inventory", productId, quantity, reason);
export const commitInventorySale = (
  productId: string,
  quantity: number,
  reason: string,
) => invoke("commit_inventory_sale", productId, quantity, reason);
export const adjustInventory = (
  productId: string,
  quantity: number,
  reason: string,
) => invoke("adjust_inventory", productId, quantity, reason);
