"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics";

/**
 * A Next <Link> that fires one GA4 event on click. Lets server components
 * (homepage, etc.) attach tracking without becoming client components
 * themselves.
 */
export default function TrackedLink({
  event,
  params,
  ...props
}: ComponentProps<typeof Link> & {
  event: string;
  params?: Record<string, unknown>;
}) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, params ?? {});
        props.onClick?.(e);
      }}
    />
  );
}
