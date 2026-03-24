import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { X, ExternalLink } from "lucide-react";
import playblocks from "../Assets/playblocks.jpg";
import "../Providers-page/ProvidersPage.css";
import "./CompareProviders.css";
import { fetchPublicProviders } from "../Utility/ApiCall";
import { ProviderAttributes, ProviderData } from "../Utility/Types";
import {
  getCompareProviderIds,
  setCompareProviderIds,
  MAX_COMPARE_PROVIDERS,
} from "../Utility/compareProvidersStorage";
import { resolvePublicProviderId } from "../Utility/resolvePublicProviderId";
import ProviderLogo from "../Utility/ProviderLogo";

function formatServiceDelivery(p: ProviderAttributes): string {
  if (p.in_home_only) return "In-home only";
  const sd = p.service_delivery;
  if (sd && typeof sd === "object") {
    const parts: string[] = [];
    if (sd.in_home) parts.push("In-home");
    if (sd.in_clinic) parts.push("In-clinic");
    if (sd.telehealth) parts.push("Telehealth");
    if (parts.length) return parts.join(", ");
  }
  const bits: string[] = [];
  if (p.at_home_services?.toLowerCase().includes("yes")) bits.push("In-home");
  if (p.in_clinic_services?.toLowerCase().includes("yes")) bits.push("In-clinic");
  if (p.telehealth_services?.toLowerCase().includes("yes")) bits.push("Telehealth");
  return bits.length ? bits.join(", ") : "—";
}

function primaryPhone(p: ProviderAttributes): string {
  const loc = p.locations?.[0];
  return (
    (loc?.phone && String(loc.phone).trim()) ||
    (p.phone && String(p.phone).trim()) ||
    (p.contact_phone && String(p.contact_phone).trim()) ||
    "—"
  );
}

function primaryAddressSnippet(p: ProviderAttributes): string {
  const loc = p.locations?.[0];
  if (!loc) return "—";
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length ? parts.join(", ") : loc.address_1 || "—";
}

const CompareProviders: React.FC = () => {
  const [ids, setIds] = useState<number[]>(() => getCompareProviderIds());
  const [providers, setProviders] = useState<ProviderAttributes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setIds(getCompareProviderIds());
    sync();
    window.addEventListener("compareProvidersChanged", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("compareProvidersChanged", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchPublicProviders();
        const list = res?.data ?? [];
        const byId = new Map<number, ProviderAttributes>();
        for (const row of list) {
          const id = resolvePublicProviderId(row as ProviderData);
          if (!id) continue;
          const attr = row.attributes;
          byId.set(id, { ...attr, id });
        }
        if (cancelled) return;
        const ordered = ids
          .map((id) => byId.get(id))
          .filter((p): p is ProviderAttributes => Boolean(p));
        setProviders(ordered);
      } catch {
        if (!cancelled) setProviders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const removeId = (providerId: number) => {
    setCompareProviderIds(ids.filter((i) => i !== providerId));
    toast.info("Removed from compare");
  };

  const rows = useMemo(
    (): { label: string; get: (p: ProviderAttributes) => ReactNode }[] => [
      { label: "Name", get: (p: ProviderAttributes) => p.name || "—" },
      {
        label: "Services",
        get: (p: ProviderAttributes) =>
          p.provider_type?.map((t) => t.name).filter(Boolean).join(", ") || "—",
      },
      { label: "Phone", get: primaryPhone },
      {
        label: "Website",
        get: (p: ProviderAttributes) =>
          p.website ? (
            <a
              href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="compare-link"
            >
              Visit <ExternalLink size={14} className="inline ml-0.5" />
            </a>
          ) : (
            "—"
          ),
      },
      { label: "Email", get: (p: ProviderAttributes) => p.email || "—" },
      {
        label: "Locations",
        get: (p: ProviderAttributes) =>
          `${p.locations?.length ?? 0} · ${primaryAddressSnippet(p)}`,
      },
      {
        label: "Insurance",
        get: (p: ProviderAttributes) =>
          p.insurance?.length
            ? p.insurance.map((i) => i.name).join(", ")
            : "—",
      },
      {
        label: "Counties",
        get: (p: ProviderAttributes) =>
          p.counties_served?.length
            ? `${p.counties_served.length} listed`
            : "—",
      },
      {
        label: "Waitlist",
        get: (p: ProviderAttributes) =>
          p.waitlist || p.waitlist_status || "—",
      },
      {
        label: "Ages",
        get: (p: ProviderAttributes) =>
          p.min_age != null || p.max_age != null
            ? `${p.min_age ?? "?"} – ${p.max_age ?? "?"}`
            : "—",
      },
      {
        label: "Spanish",
        get: (p: ProviderAttributes) => p.spanish_speakers || "—",
      },
      { label: "Service delivery", get: formatServiceDelivery },
      { label: "Cost", get: (p: ProviderAttributes) => p.cost || "—" },
    ],
    []
  );

  return (
    <div className="providers-page compare-providers-page">
      <section className="find-your-provider-section">
        <img src={playblocks} alt="" className="banner-image" />
        <h1 className="providers-banner-title">Compare providers</h1>
      </section>
      <p className="compare-subtitle">
        Side-by-side view for up to {MAX_COMPARE_PROVIDERS} providers.{" "}
        <span className="compare-device-note">
          Your list is saved only on this device.
        </span>
      </p>

      {loading && (
        <div className="compare-loading">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A6FA5] mx-auto" />
          <p className="mt-2 text-gray-600">Loading provider data…</p>
        </div>
      )}

      {!loading && ids.length === 0 && (
        <div className="compare-empty compare-empty--no-selection" role="region" aria-labelledby="compare-empty-heading">
          <h2 id="compare-empty-heading" className="compare-empty-title">
            No providers chosen yet
          </h2>
          <p className="compare-empty-lead">
            Add up to {MAX_COMPARE_PROVIDERS} providers from the directory, then
            come back here to see them side by side.
          </p>
          <p className="compare-empty-hint">
            On the <strong>Find Your Provider</strong> page, open a card and tap{" "}
            <strong>Add to compare</strong>.
          </p>
          <Link to="/providers" className="compare-cta-button">
            Find providers to compare
          </Link>
        </div>
      )}

      {!loading && ids.length > 0 && providers.length === 0 && (
        <div className="compare-empty compare-empty--error" role="region">
          <h2 className="compare-empty-title">Couldn&apos;t load those providers</h2>
          <p className="compare-empty-lead">
            They may have been removed from the directory. You can clear your
            list and choose new providers.
          </p>
          <div className="compare-empty-actions">
            <button
              type="button"
              className="compare-empty-link-btn"
              onClick={() => setCompareProviderIds([])}
            >
              Clear compare list
            </button>
            <Link to="/providers" className="compare-cta-button compare-cta-button--secondary">
              Find providers to compare
            </Link>
          </div>
        </div>
      )}

      {!loading && providers.length > 0 && (
        <section className="compare-table-wrap glass">
          <div className="compare-table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-row-label" />
                  {providers.map((p) => (
                    <th key={p.id} className="compare-col-header">
                      <div className="compare-col-head-inner">
                        <div className="compare-logo-wrap">
                          <ProviderLogo
                            provider={p}
                            className="compare-logo"
                            size="small"
                          />
                        </div>
                        <div className="compare-col-title">{p.name}</div>
                        <button
                          type="button"
                          className="compare-remove-btn"
                          onClick={() => removeId(p.id)}
                          aria-label={`Remove ${p.name} from compare`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="compare-row-label">
                      {row.label}
                    </th>
                    {providers.map((p) => (
                      <td key={`${p.id}-${row.label}`} className="compare-cell">
                        {row.get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="compare-footer-actions">
            <Link to="/providers" className="compare-cta-link">
              ← Back to directory
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default CompareProviders;
