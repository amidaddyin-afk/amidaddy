import { DEFAULT_FREE_SHIPPING_PAISE } from "@/lib/commerce";
import { formatInr } from "@/lib/money";

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar" role="status">
      Complimentary delivery on orders of{" "}
      {formatInr(DEFAULT_FREE_SHIPPING_PAISE)} or more.
    </div>
  );
}
