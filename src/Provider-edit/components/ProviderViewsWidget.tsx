import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getApiBaseUrl } from "../../Utility/config";

interface ProviderViewsWidgetProps {
  days?: number;
  providerId?: number;
}

interface ViewStatsResponse {
  by_day: Record<string, number>;
  total: number;
  days_requested: number;
  start_date: string;
  end_date: string;
}

export function ProviderViewsWidget({ days = 30, providerId }: ProviderViewsWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ViewStatsResponse | null>(null);

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
    const url = `${baseUrl}/providers/view_stats?days=${days}${providerId ? `&provider_id=${providerId}` : ''}`;

    fetch(url, { 
      credentials: "include",
      headers: {
        'Authorization': userId || '',
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
      .then((data) => {
        if (alive) {
          setStats(data);
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
  }, [days, providerId]);

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
          <div className="text-sm text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
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
