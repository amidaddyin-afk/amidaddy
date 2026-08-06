"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="system-state">
      <div>
        <p className="eyebrow">A brief interruption</p>
        <h1>Let&apos;s return to the ritual.</h1>
        <p>
          This page could not be prepared just now. Try it once more, or return
          to the collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="lux-button">
            <RefreshCw size={15} /> Try again
          </button>
          <Link href="/shop" className="btn-ghost">
            View fragrances
          </Link>
        </div>
      </div>
    </main>
  );
}
