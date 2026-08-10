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
          and share the video with us. A video recorded after the parcel has
          already been opened will not be accepted, and the product will not be
          eligible for replacement.
        </p>
        <p className="replacement-notice-hindi">
          Wrong product ya broken/damaged bottle ke replacement ke liye parcel
          kholte waqt continuous video banana zaroori hai. Parcel khulne ke baad
          banaya gaya video valid nahi hoga aur replacement nahi milega.
        </p>
      </div>
    </aside>
  );
}
