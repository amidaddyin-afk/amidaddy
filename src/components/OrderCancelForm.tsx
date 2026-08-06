"use client";

import { useActionState } from "react";
import {
  cancelCustomerOrderAction,
  type OrderActionState,
} from "@/features/orders/actions";

const initial: OrderActionState = {};
export default function OrderCancelForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    cancelCustomerOrderAction,
    initial,
  );
  return (
    <form action={action} className="mt-5 grid gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="field">
        <span>Reason for cancellation</span>
        <select name="reason" required defaultValue="">
          <option value="" disabled>
            Choose a reason
          </option>
          <option>Ordered by mistake</option>
          <option>Need to change the order</option>
          <option>Delivery timing no longer works</option>
          <option>Other</option>
        </select>
      </label>
      {state.error && (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="text-sm text-emerald-300">{state.message}</p>
      )}
      <button disabled={pending} className="btn-ghost w-full">
        {pending ? "Cancelling…" : "Cancel this order"}
      </button>
    </form>
  );
}
