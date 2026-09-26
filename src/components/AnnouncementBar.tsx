import { Gift } from "lucide-react";
import { COMBO_TIERS, DEFAULT_FREE_SHIPPING_PAISE } from "@/lib/commerce";
import { formatInr } from "@/lib/money";

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      {/* Phones get the offer alone: both lines do not fit at 390px, and the
          delivery threshold is repeated in the bag and on every product. */}
      <span className="announcement-delivery">
        Complimentary delivery on orders of{" "}
        {formatInr(DEFAULT_FREE_SHIPPING_PAISE)} or more.
      </span>
      {/* Opens the popover rendered by OfferLauncher in the root layout. */}
      <button
        type="button"
        popoverTarget="offer-pop"
        className="announcement-offer"
      >
        <Gift size={14} aria-hidden="true" />
        {/* Every tier on wide screens; phones get the headline tier only. */}
        <span className="announcement-offer-full">
          Buy{" "}
          {[...COMBO_TIERS]
            .reverse()
            .map((tier) => `${tier.minQty} for ${formatInr(tier.totalPaise)}`)
            .join(" · ")}
        </span>
        <span className="announcement-offer-short">
          Any {COMBO_TIERS[0].minQty} for {formatInr(COMBO_TIERS[0].totalPaise)}
        </span>
        <b>-{COMBO_TIERS[0].percent}%</b>
      </button>
    </div>
  );
}
