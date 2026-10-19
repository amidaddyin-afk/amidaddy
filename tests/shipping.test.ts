import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTimeline,
  currentStage,
  orderStatusForStage,
  type TrackingEvent,
} from "../src/lib/shipping/stages.ts";
import {
  parseShadowfaxTracking,
  shadowfaxStage,
  tenDigitPhone,
} from "../src/lib/shipping/shadowfax.ts";

const event = (
  code: string,
  occurredAt: string,
  label = code,
): TrackingEvent => ({
  code,
  occurredAt,
  label,
  remarks: null,
  location: null,
  stage: shadowfaxStage(code),
});

test("shadowfax codes map onto neutral stages", () => {
  assert.equal(shadowfaxStage("picked"), "PICKED_UP");
  assert.equal(shadowfaxStage("OFD"), "OUT_FOR_DELIVERY");
  assert.equal(shadowfaxStage("rto_d"), "RETURNED");
  assert.equal(shadowfaxStage("something_new"), null);
});

test("tracking response parses and keeps unknown codes", () => {
  const events = parseShadowfaxTracking({
    message: "Success",
    tracking_details: [
      {
        created: "2026-10-19T10:30:00Z",
        status: "Picked Up",
        status_id: "picked",
        remarks: "Item picked up from seller",
        location: "MUMBAI HUB",
      },
      { created: "2026-10-19T12:00:00Z", status_id: "weird_code" },
    ],
  });
  assert.equal(events[0].stage, "PICKED_UP");
  assert.equal(events[0].location, "MUMBAI HUB");
  assert.equal(events[1].stage, null);
  assert.equal(events[1].label, "weird code");
});

test("current stage is the latest recognised event", () => {
  const events = [
    event("ofd", "2026-10-20T09:00:00Z"),
    event("picked", "2026-10-19T10:00:00Z"),
    event("na", "2026-10-20T18:00:00Z"), // failed attempt
    event("weird", "2026-10-20T19:00:00Z"),
  ];
  assert.equal(currentStage(events, "BOOKED"), "IN_TRANSIT");
  assert.equal(currentStage([], "BOOKED"), "BOOKED");
});

test("order status follows the parcel", () => {
  assert.equal(orderStatusForStage("BOOKED"), null);
  assert.equal(orderStatusForStage("IN_TRANSIT"), "SHIPPED");
  assert.equal(orderStatusForStage("DELIVERED"), "DELIVERED");
  assert.equal(orderStatusForStage("RETURNING"), null);
});

test("timeline never shrinks after a failed delivery attempt", () => {
  const timeline = buildTimeline({
    placedAt: "2026-10-18T08:00:00Z",
    bookedAt: "2026-10-18T09:00:00Z",
    stage: "IN_TRANSIT",
    events: [
      event("picked", "2026-10-19T10:00:00Z"),
      event("ofd", "2026-10-20T09:00:00Z"),
      event("na", "2026-10-20T18:00:00Z", "Customer not available"),
    ],
  });
  const byKey = Object.fromEntries(timeline.milestones.map((m) => [m.key, m]));
  assert.equal(byKey.OUT_FOR_DELIVERY.done, true);
  assert.equal(byKey.DELIVERED.done, false);
  assert.equal(byKey.IN_TRANSIT.current, true);
  // An in-transit milestone that was skipped still reads as passed.
  assert.equal(byKey.IN_TRANSIT.done, true);
  assert.equal(timeline.latest?.label, "Customer not available");
  // Every courier message lands somewhere, newest first.
  assert.equal(byKey.IN_TRANSIT.events[0].label, "Customer not available");
  assert.equal(
    timeline.milestones.reduce((n, m) => n + m.events.length, 0),
    3,
  );
});

test("timeline before booking shows only the placed order", () => {
  const timeline = buildTimeline({
    placedAt: "2026-10-18T08:00:00Z",
    bookedAt: null,
    stage: null,
    events: [],
  });
  assert.deepEqual(
    timeline.milestones.filter((m) => m.done).map((m) => m.key),
    ["PLACED"],
  );
  assert.equal(timeline.milestones[0].current, true);
});

test("returned parcels show an exception and no current step", () => {
  const timeline = buildTimeline({
    placedAt: "2026-10-18T08:00:00Z",
    bookedAt: "2026-10-18T09:00:00Z",
    stage: "RETURNED",
    events: [event("rto_d", "2026-10-25T09:00:00Z")],
  });
  assert.match(timeline.exception ?? "", /returned/);
  assert.equal(
    timeline.milestones.some((m) => m.current),
    false,
  );
});

test("phone numbers are trimmed to 10 digits", () => {
  assert.equal(tenDigitPhone("+91 98765-43210"), "9876543210");
});
