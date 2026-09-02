import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main data-surface="commerce" className="system-state">
      <div>
        <p className="eyebrow">404 · Scent not found</p>
        <h1>This trail has faded.</h1>
        <p>
          The page you followed is no longer here. The signature collection is
          still waiting.
        </p>
        <Link href="/shop" className="lux-button">
          Return to the collection <ArrowUpRight size={15} />
        </Link>
      </div>
    </main>
  );
}
