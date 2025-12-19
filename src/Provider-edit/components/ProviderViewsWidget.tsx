import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getApiBaseUrl } from "../../Utility/config";
import { useParams } from "react-router-dom";

interface ProviderViewsWidgetProps {
  days?: number;
  providerId?: number;
}

interface ViewStatsResponse {
  // Stats data (when has_subscription is true)
  by_day?: Record<string, number>;
  total?: number;
  days_requested?: number;
  start_date?: string;
  end_date?: string;
  // Subscription status (when has_subscription is false)
  has_subscription?: boolean;
  requires_sponsorship?: boolean;
  current_tier?: string;
  subscription_status?: string;
  sponsored_until?: string | null;
  upgrade_message?: string;
  tiers_url?: string;
  message?: string;
  // Analytics level (when has_subscription is true)
  analytics_level?: string;
  tier?: string;
}

export function ProviderViewsWidget({ days = 30, providerId }: ProviderViewsWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ViewStatsResponse | null>(null);
  const { id: urlProviderId } = useParams<{ id: string }>();
  
  // Use providerId prop first, then fall back to URL param
  const effectiveProviderId = providerId || (urlProviderId ? parseInt(urlProviderId) : undefined);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const baseUrl = getApiBaseUrl();
    // Endpoint: GET /api/v1/providers/view_stats?days=30
    // provider_id is optional - if not provided, uses the user's active provider
    const url = `${baseUrl}/providers/view_stats?days=${days}${effectiveProviderId ? `&provider_id=${effectiveProviderId}` : ''}`;

    fetch(url, { 
      credentials: "include",
      headers: {
        'Authorization': userId ? `Bearer ${userId}` : '',
        'Content-Type': 'application/json',
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          const errorText = await r.text();
          throw new Error(`Failed: ${r.status} - ${errorText}`);
        }
        return r.json();
      })
      .then((data: ViewStatsResponse) => {
        if (alive) {
          // Check if provider has a subscription - new backend format
          if (data.has_subscription === false) {
            // No subscription - show upgrade message
            setError('NO_SUBSCRIPTION');
            setStats(null);
          } else if (data.has_subscription === true && data.by_day) {
            // Has subscription and stats data available
            setStats(data);
            setError(null);
          } else {
            // Unexpected response format
            setStats(data);
            setError(null);
          }
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => { 
      alive = false; 
    };
  }, [days, effectiveProviderId]);

  const chartData = useMemo(() => {
    if (!stats?.by_day) return [] as { date: string; views: number }[];

    // Ensure chronological order
    return Object.entries(stats.by_day)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));
  }, [stats]);

  const last7 = useMemo(() => chartData.slice(-7).reduce((s, d) => s + d.views, 0), [chartData]);
  const today = useMemo(() => (chartData.at(-1)?.views ?? 0), [chartData]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-semibold">Listing Views</h3>
          </div>
          <div className="text-xs text-zinc-500">Last {days} days</div>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        )}
        {error && (
          <div className="text-sm p-4 rounded-lg bg-blue-50 border border-blue-200">
            {error === 'NO_SUBSCRIPTION' ? (
              <div className="text-blue-800">
                <p className="font-medium mb-2">View statistics require an active sponsorship subscription.</p>
                <p className="text-sm mb-3">Upgrade to a sponsored tier (Featured, Sponsor, or Community Partner) to access detailed listing view analytics, including daily trends and click statistics.</p>
                <a 
                  href={`/providerEdit/${effectiveProviderId}?tab=sponsorship`}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  View sponsorship options →
                </a>
              </div>
            ) : error === 'ACCESS_DENIED' ? (
              // Legacy fallback for old 403 responses
              <div className="text-blue-800">
                <p className="font-medium mb-2">View statistics are available for Community Partner tier providers.</p>
                <p className="text-sm">Upgrade to Community Partner ($99/month) to access detailed listing view analytics, including daily trends and click statistics.</p>
              </div>
            ) : (
              <div className="text-red-600">{error}</div>
            )}
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:col-span-1">
              <div className="text-xs text-zinc-500">Today</div>
              <div className="text-2xl font-bold">{today}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:col-span-1">
              <div className="text-xs text-zinc-500">Last 7 days</div>
              <div className="text-2xl font-bold">{last7}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:col-span-1">
              <div className="text-xs text-zinc-500">Last {days} days</div>
              <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            </div>
            <div className="sm:col-span-4 h-48 w-full rounded-xl border border-zinc-200 bg-white p-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }} 
                      hide={chartData.length > 30}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                    <Tooltip 
                      formatter={(v: any) => [v, "Views"]} 
                      labelFormatter={(l) => `Date: ${l}`} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      dot={false} 
                      strokeWidth={2}
                      stroke="#14b8a6"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-zinc-500">
                  No view data available
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
          <TrendingUp className="h-4 w-4" /> Unique-by-day counting recommended. Refresh granularity in admin if needed.
        </div>
      </div>
    </div>
  );
}

export default ProviderViewsWidget;
