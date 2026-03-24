import zipcodes from "zipcodes";
import type { ProviderAttributes } from "./Types";

/** Normalize to 5-digit US ZIP when possible (handles ZIP+4). */
export function normalizeUsZip(zip: string | null | undefined): string | null {
  if (zip == null || zip === "") return null;
  const s = String(zip).trim();
  const m = s.match(/^(\d{5})(?:-\d{4})?$/);
  if (m) return m[1];
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 5) return digits.slice(0, 5);
  return null;
}

export function isValidUsZipForLookup(zip: string): boolean {
  const z = normalizeUsZip(zip);
  return z != null && !!zipcodes.lookup(z);
}

/**
 * Shortest distance (miles, zip-centroid to zip-centroid) from origin ZIP
 * to any location on the provider. Uses the `zipcodes` package (US/CA DB).
 */
export function minDistanceMilesFromZip(
  originZip: string,
  provider: ProviderAttributes
): number | null {
  const oz = normalizeUsZip(originZip);
  if (!oz || !zipcodes.lookup(oz)) return null;
  let min: number | null = null;
  for (const loc of provider.locations || []) {
    const lz = normalizeUsZip(loc.zip);
    if (!lz) continue;
    const d = zipcodes.distance(oz, lz);
    if (d == null) continue;
    if (min === null || d < min) min = d;
  }
  return min;
}

export function filterProvidersByZipRadius(
  providers: ProviderAttributes[],
  originZip: string,
  radiusMiles: number
): ProviderAttributes[] {
  const oz = normalizeUsZip(originZip);
  if (!oz || !zipcodes.lookup(oz)) return [];
  const withDist: { p: ProviderAttributes; d: number }[] = [];
  for (const p of providers) {
    const d = minDistanceMilesFromZip(oz, p);
    if (d != null && d <= radiusMiles) {
      withDist.push({ p, d });
    }
  }
  withDist.sort((a, b) => a.d - b.d);
  return withDist.map((x) => x.p);
}
