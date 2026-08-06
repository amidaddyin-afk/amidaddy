import { Check } from "lucide-react";
import type { OrderStatus } from "@/lib/orders";

const steps: Array<{ status: OrderStatus; label: string }> = [
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Preparing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];
export default function OrderTimeline({ status }: { status: OrderStatus }) {
  const active = steps.findIndex((step) => step.status === status);
  if (status === "CANCELLED" || status === "EXPIRED")
    return (
      <div className="order-terminal">
        {status === "CANCELLED" ? "Order cancelled" : "Payment window expired"}
      </div>
    );
  return (
    <ol className="order-timeline">
      {steps.map((step, index) => (
        <li
          key={step.status}
          className={index <= active || status === "DELIVERED" ? "active" : ""}
        >
          <span>{index <= active ? <Check size={13} /> : index + 1}</span>
          <p>{step.label}</p>
        </li>
      ))}
    </ol>
  );
}
