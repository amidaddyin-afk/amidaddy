// Provider-neutral shipping vocabulary. Every courier adapter maps its own
// status codes onto these stages, so the order pages, the admin view and the
// order-status sync never learn a courier's dialect. Switching from Shadowfax
// to Delhivery means writing one adapter, nothing here.
//
// No runtime imports: tests load this file directly with Node.
import type { OrderRecord } from "@/lib/orders";

export type ShipmentStage =
  | "BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNING"
  | "RETURNED"
  | "CANCELLED"
  | "LOST";

/** The happy path, bottom to top on the tracking page. */
export const PROGRESS_STAGES = [
  "BOOKED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;
type ProgressStage = (typeof PROGRESS_STAGES)[number];

/** Nothing more will happen to a shipment in these stages. */
export const TERMINAL_STAGES: ShipmentStage[] = [
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
  "LOST",
];

export type TrackingEvent = {
  occurredAt: string;
  /** The courier's own status code, kept for the admin view and debugging. */
  code: string;
  /** The courier's human-readable status, shown to the customer. */
  label: string;
  remarks: string | null;
  location: string | null;
  /** null when the adapter does not recognise the code; the event still shows. */
  stage: ShipmentStage | null;
};

export type BookingOrder = Pick<
  OrderRecord,
  | "id"
  | "customerName"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "postalCode"
  | "totalPaise"
  | "taxPaise"
  | "lines"
>;

export interface ShippingProvider {
  id: string;
  label: string;
  /** Names of required environment variables that are unset; empty when ready. */
  missingConfig(): string[];
  /** Creates the shipment with the courier, which schedules the pickup. */
  book(order: BookingOrder, clientOrderId: string): Promise<{ awb: string }>;
  /** The full event history for an AWB, in any order. */
  track(awb: string): Promise<TrackingEvent[]>;
  cancel(awb: string, reason: string): Promise<void>;
}

const isProgress = (stage: ShipmentStage | null): stage is ProgressStage =>
  PROGRESS_STAGES.includes(stage as ProgressStage);

const chronological = (events: TrackingEvent[]) =>
  [...events].sort(
    (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
  );

/** The stage of the latest recognised event, or the fallback if none. */
export function currentStage(
  events: TrackingEvent[],
  fallback: ShipmentStage,
): ShipmentStage {
  return (
    chronological(events)
      .reverse()
      .find((event) => event.stage)?.stage ?? fallback
  );
}

/** What the order itself should become once the parcel reaches a stage. */
export function orderStatusForStage(
  stage: ShipmentStage,
): "SHIPPED" | "DELIVERED" | null {
  if (stage === "DELIVERED") return "DELIVERED";
  if (
    stage === "PICKED_UP" ||
    stage === "IN_TRANSIT" ||
    stage === "OUT_FOR_DELIVERY"
  )
    return "SHIPPED";
  return null;
}

const MILESTONE_LABELS: Record<"PLACED" | ProgressStage, string> = {
  PLACED: "Order placed",
  BOOKED: "Pickup scheduled",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

const EXCEPTION_LABELS: Partial<Record<ShipmentStage, string>> = {
  RETURNING: "This parcel is on its way back to us",
  RETURNED: "This parcel was returned to us",
  CANCELLED: "This shipment was cancelled",
  LOST: "The courier has reported this parcel missing. We are on it.",
};

export type Milestone = {
  key: "PLACED" | ProgressStage;
  label: string;
  at: string | null;
  done: boolean;
  current: boolean;
  /** Courier updates that happened while the parcel was at this milestone, newest first. */
  events: TrackingEvent[];
};

export type Timeline = {
  /** Oldest first; the page stacks them bottom to top. */
  milestones: Milestone[];
  latest: TrackingEvent | null;
  exception: string | null;
};

export function buildTimeline(input: {
  placedAt: string;
  bookedAt: string | null;
  stage: ShipmentStage | null;
  events: TrackingEvent[];
}): Timeline {
  const events = chronological(input.events);
  const milestones: Milestone[] = [
    {
      key: "PLACED",
      label: MILESTONE_LABELS.PLACED,
      at: input.placedAt,
      done: true,
      current: false,
      events: [],
    },
    ...PROGRESS_STAGES.map((key) => ({
      key,
      label: MILESTONE_LABELS[key],
      at: key === "BOOKED" ? input.bookedAt : null,
      done: false,
      current: false,
      events: [] as TrackingEvent[],
    })),
  ];
  const index = (stage: ProgressStage) => PROGRESS_STAGES.indexOf(stage) + 1;

  // Furthest point ever reached. A failed delivery attempt after "out for
  // delivery" sends the current stage back to in-transit, but the bar should
  // not visibly shrink.
  let reached = input.bookedAt ? index("BOOKED") : 0;
  let group = reached;
  for (const event of events) {
    if (isProgress(event.stage)) {
      const at = index(event.stage);
      milestones[at].at ??= event.occurredAt;
      reached = Math.max(reached, at);
      group = at;
    }
    // Unrecognised codes and exceptions (RTO, lost) file under wherever the
    // parcel last was, so no courier message is ever dropped.
    milestones[group].events.unshift(event);
  }
  for (let i = 0; i <= reached; i++) milestones[i].done = true;

  const stage = input.stage;
  const currentIndex = isProgress(stage) ? index(stage) : reached;
  if (!(stage && TERMINAL_STAGES.includes(stage) && stage !== "DELIVERED"))
    milestones[currentIndex].current = true;

  return {
    milestones,
    latest: events.at(-1) ?? null,
    exception: (stage && EXCEPTION_LABELS[stage]) ?? null,
  };
}
