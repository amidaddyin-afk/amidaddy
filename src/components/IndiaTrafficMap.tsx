"use client";

import { useMemo } from "react";
import type { RegionTraffic } from "@/lib/analytics-server";

/**
 * Traffic-by-state dot map, drawn inline with no mapping library.
 *
 * Each Indian state/UT has an approximate centroid (lat/long). We project those
 * with a plain equirectangular transform over India's bounding box onto a
 * 620×680 viewBox and draw one dot per state, its radius scaled by visit share.
 * Good enough to answer "where is the traffic coming from" at a glance; it is
 * not a survey-grade map.
 *
 * Keyed by ISO-3166-2 subdivision code (the part after "IN-"), which is what
 * the CDN edge reports (Vercel: x-vercel-ip-country-region).
 */

// [lat, long] centroids. Source: public-domain state centroid tables, rounded.
const CENTROIDS: Record<string, [number, number, string]> = {
  AP: [15.9, 79.74, "Andhra Pradesh"],
  AR: [28.22, 94.73, "Arunachal Pradesh"],
  AS: [26.2, 92.94, "Assam"],
  BR: [25.1, 85.31, "Bihar"],
  CT: [21.28, 81.87, "Chhattisgarh"],
  CG: [21.28, 81.87, "Chhattisgarh"],
  GA: [15.36, 74.06, "Goa"],
  GJ: [22.31, 72.14, "Gujarat"],
  HR: [29.06, 76.09, "Haryana"],
  HP: [31.9, 77.17, "Himachal Pradesh"],
  JH: [23.61, 85.28, "Jharkhand"],
  KA: [15.32, 75.71, "Karnataka"],
  KL: [10.85, 76.27, "Kerala"],
  MP: [23.47, 77.95, "Madhya Pradesh"],
  MH: [19.75, 75.71, "Maharashtra"],
  MN: [24.66, 93.91, "Manipur"],
  ML: [25.47, 91.37, "Meghalaya"],
  MZ: [23.16, 92.94, "Mizoram"],
  NL: [26.16, 94.56, "Nagaland"],
  OR: [20.95, 85.1, "Odisha"],
  OD: [20.95, 85.1, "Odisha"],
  PB: [31.15, 75.34, "Punjab"],
  RJ: [27.02, 74.22, "Rajasthan"],
  SK: [27.53, 88.51, "Sikkim"],
  TN: [11.13, 78.66, "Tamil Nadu"],
  TG: [18.11, 79.02, "Telangana"],
  TS: [18.11, 79.02, "Telangana"],
  TR: [23.94, 91.99, "Tripura"],
  UP: [26.85, 80.91, "Uttar Pradesh"],
  UT: [30.07, 79.09, "Uttarakhand"],
  UK: [30.07, 79.09, "Uttarakhand"],
  WB: [22.99, 87.85, "West Bengal"],
  DL: [28.7, 77.1, "Delhi"],
  JK: [33.78, 76.58, "Jammu & Kashmir"],
  LA: [34.21, 77.61, "Ladakh"],
  CH: [30.73, 76.78, "Chandigarh"],
  PY: [11.94, 79.81, "Puducherry"],
  AN: [11.67, 92.74, "Andaman & Nicobar"],
  DN: [20.4, 72.83, "Dadra & Nagar Haveli and Daman & Diu"],
  DH: [20.4, 72.83, "Dadra & Nagar Haveli and Daman & Diu"],
  LD: [10.57, 72.64, "Lakshadweep"],
};

// India bounding box, with a little padding.
const LAT_MAX = 37.5;
const LAT_MIN = 6.5;
const LON_MIN = 67.5;
const LON_MAX = 98;
const W = 620;
const H = 680;

const project = (lat: number, lon: number): [number, number] => [
  ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W,
  ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H,
];

export default function IndiaTrafficMap({ data }: { data: RegionTraffic[] }) {
  const points = useMemo(() => {
    const maxVisits = Math.max(1, ...data.map((d) => d.visits));
    return data
      .map((d) => {
        const key = (d.region ?? "").toUpperCase();
        const centroid = CENTROIDS[key];
        if (!centroid) return null;
        const [lat, lon, name] = centroid;
        const [x, y] = project(lat, lon);
        // sqrt scale so a 10× busier state is ~3× the radius, not 10×.
        const r = 4 + 22 * Math.sqrt(d.visits / maxVisits);
        return { key, name, x, y, r, visits: d.visits, sessions: d.sessions };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.r - a.r);
  }, [data]);

  const unknown = data.find((d) => !d.region);
  const mapped = data
    .filter((d) => d.region && CENTROIDS[d.region.toUpperCase()])
    .reduce((s, d) => s + d.visits, 0);

  if (!data.length)
    return (
      <p className="text-subtle text-sm">
        No visits recorded yet. Data appears here once the site has live traffic
        (page views are logged from every customer-facing page).
      </p>
    );

  return (
    <div className="admin-traffic-map">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Website visits by Indian state over the last 30 days"
        className="admin-traffic-svg"
      >
        <rect x="0" y="0" width={W} height={H} fill="transparent" />
        {points.map((p) => (
          <g key={p.key}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="var(--accent, #c9a96e)"
              fillOpacity={0.28}
              stroke="var(--accent, #c9a96e)"
              strokeOpacity={0.7}
            />
            <circle cx={p.x} cy={p.y} r={2} fill="var(--accent, #c9a96e)" />
            <title>{`${p.name}: ${p.visits} views, ${p.sessions} sessions`}</title>
          </g>
        ))}
      </svg>
      <ul className="admin-traffic-legend">
        {points.slice(0, 8).map((p) => (
          <li key={p.key}>
            <span>{p.name}</span>
            <strong>{p.visits.toLocaleString("en-IN")}</strong>
          </li>
        ))}
        {unknown && (
          <li className="admin-traffic-legend-note">
            <span>Region not reported</span>
            <strong>{unknown.visits.toLocaleString("en-IN")}</strong>
          </li>
        )}
      </ul>
      <p className="text-subtle mt-3 text-xs">
        {mapped.toLocaleString("en-IN")} located views plotted.
        {unknown
          ? ` ${unknown.visits.toLocaleString("en-IN")} views had no region from the CDN (common on desktop ISPs).`
          : ""}
      </p>
    </div>
  );
}
