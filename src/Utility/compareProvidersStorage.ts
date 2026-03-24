/** Local compare list (max 3 provider IDs). Stored on this device only. */

export const COMPARE_PROVIDER_IDS_KEY = "compareProviderIds";
export const MAX_COMPARE_PROVIDERS = 3;

export function getCompareProviderIds(): number[] {
  try {
    const raw = localStorage.getItem(COMPARE_PROVIDER_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => (typeof x === "number" ? x : Number(x)))
      .filter((id) => Number.isFinite(id) && id > 0)
      .slice(0, MAX_COMPARE_PROVIDERS);
  } catch {
    return [];
  }
}

function normalizeId(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const n =
    typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function setCompareProviderIds(ids: number[]): void {
  const next = ids
    .map((id) => normalizeId(id))
    .filter((id): id is number => id !== null)
    .slice(0, MAX_COMPARE_PROVIDERS);
  localStorage.setItem(COMPARE_PROVIDER_IDS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("compareProvidersChanged"));
}

export function toggleCompareProviderId(providerId: number): {
  ok: boolean;
  reason?: "max" | "invalid";
  nowInCompare: boolean;
} {
  const id = normalizeId(providerId);
  if (id === null) {
    return { ok: false, reason: "invalid", nowInCompare: false };
  }
  const ids = getCompareProviderIds();
  if (ids.includes(id)) {
    setCompareProviderIds(ids.filter((x) => x !== id));
    return { ok: true, nowInCompare: false };
  }
  if (ids.length >= MAX_COMPARE_PROVIDERS) {
    return { ok: false, reason: "max", nowInCompare: false };
  }
  setCompareProviderIds([...ids, id]);
  return { ok: true, nowInCompare: true };
}

export function isProviderInCompare(providerId: number): boolean {
  const id = normalizeId(providerId);
  if (id === null) return false;
  return getCompareProviderIds().includes(id);
}
