import { AlertTriangle, Video } from "lucide-react";

export default function ReplacementNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <aside
      className={`replacement-notice${compact ? "replacement-notice--compact" : ""}`}
      aria-labelledby={
        compact ? "checkout-replacement-title" : "replacement-title"
      }
    >
      <div className="replacement-notice-icon" aria-hidden="true">
        <Video size={24} />
      </div>
      <div>
        <p className="eyebrow">
          <AlertTriangle size={13} /> Important replacement notice
        </p>
        <h2
          id={compact ? "checkout-replacement-title" : "replacement-title"}
          className="display-title"
        >
          Record a continuous unboxing video.
        </h2>
        <p>
          For a wrong product or a broken/damaged bottle, please record the
          parcel continuously from before opening until every item is visible
          and share the video with us. This is strongly recommended because it
          helps us review damage, missing-item and wrong-product claims quickly.
        </p>
        <p className="replacement-notice-hindi">
          A clear, uninterrupted unboxing video helps us verify and resolve an
          eligible replacement request without unnecessary delay.
        </p>
      </div>
    </aside>
  );
}
