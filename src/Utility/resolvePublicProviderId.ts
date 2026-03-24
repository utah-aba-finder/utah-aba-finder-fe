/**
 * Public provider list responses may put the numeric id on the JSON:API resource
 * (`data[].id`) and/or under `attributes.id`. Cards need one stable id for keys,
 * compare list, and matching the directory fetch.
 */
export function resolvePublicProviderId(p: {
  id?: number | string;
  attributes?: { id?: number | string };
}): number {
  const raw = p.attributes?.id ?? p.id;
  if (raw === undefined || raw === null || raw === "") return 0;
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
