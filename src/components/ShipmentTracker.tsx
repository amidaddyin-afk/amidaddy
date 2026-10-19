import { Check } from "lucide-react";
import type { Timeline } from "@/lib/shipping/stages";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * Vertical tracking timeline. Milestones are in the DOM oldest first (the
 * order a screen reader should hear them) and stacked bottom to top with
 * column-reverse, so the progress line fills upward toward "Delivered".
 */
export default function ShipmentTracker({
  timeline,
  courier,
  awb,
  showCodes = false,
}: {
  timeline: Timeline;
  courier?: string;
  awb?: string;
  /** Admin view: show the courier's raw status codes. */
  showCodes?: boolean;
}) {
  const { latest } = timeline;
  return (
    <div className="track">
      <section className="track-latest lux-panel" aria-live="polite">
        <p className="eyebrow">Latest update</p>
        {latest ? (
          <>
            <p className="track-latest-label">{latest.label}</p>
            <p className="text-subtle text-sm">
              {when(latest.occurredAt)}
              {latest.location && ` · ${latest.location}`}
            </p>
            {latest.remarks && <p className="mt-2 text-sm">{latest.remarks}</p>}
          </>
        ) : (
          <p className="track-latest-label">
            {awb
              ? "Pickup scheduled. Courier updates appear here."
              : "We are preparing your parcel for pickup."}
          </p>
        )}
        {awb && (
          <p className="text-subtle mt-3 text-xs tracking-wider uppercase">
            {courier} · AWB {awb}
          </p>
        )}
        {timeline.exception && (
          <p className="track-exception">{timeline.exception}</p>
        )}
      </section>

      <ol className="track-timeline">
        {timeline.milestones.map((milestone, i) => (
          <li
            key={milestone.key}
            className={[
              milestone.done && "done",
              milestone.current && "current",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--i": i } as React.CSSProperties}
            aria-current={milestone.current ? "step" : undefined}
          >
            <span className="track-dot" aria-hidden="true">
              {milestone.done && !milestone.current && <Check size={12} />}
            </span>
            <div>
              <p className="track-milestone">{milestone.label}</p>
              {milestone.at && (
                <p className="text-subtle text-xs">{when(milestone.at)}</p>
              )}
              {milestone.events.length > 0 && (
                <ul className="track-events">
                  {milestone.events.map((event) => (
                    <li key={`${event.code}-${event.occurredAt}`}>
                      <p>
                        {event.label}
                        {showCodes && <code> {event.code}</code>}
                      </p>
                      <p className="text-subtle text-xs">
                        {when(event.occurredAt)}
                        {event.location && ` · ${event.location}`}
                      </p>
                      {event.remarks && (
                        <p className="text-subtle text-xs">{event.remarks}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
