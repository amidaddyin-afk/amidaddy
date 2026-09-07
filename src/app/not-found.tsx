import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Photo from "@/components/Photo";

export default function NotFound() {
  return (
    <main data-surface="commerce" className="system-state not-found cinematic">
      <div>
        <div className="not-found-media">
          <Photo
            src="/gallery/coldwar/06.webp"
            alt="Amidaddy Cold War fragrance photographed for a campaign"
            fill
            sizes="(max-width: 640px) 100vw, 620px"
            className="object-cover"
          />
        </div>
        <h1>This page has moved on.</h1>
        <Link href="/shop" className="lux-button">
          Back to the collection <ArrowUpRight size={15} />
        </Link>
      </div>
    </main>
  );
}
