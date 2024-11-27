import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MockProviderData } from "../Utility/Types";

interface AnalyticsProps {
  providers: MockProviderData[];
}

interface ChartDataItem {
  name: string;
  value: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ providers }) => {
  const approvedProviders = useMemo(() => {
    return providers.filter((p) => {
      const name = p.attributes.name?.toLowerCase() || "";
      const isApproved = p.attributes.status?.toLowerCase() === "approved";
      const isNotTest =
        !name.includes("test") &&
        !name.includes("demo") &&
        !name.includes("sample") &&
        name.length > 0;
      return isApproved && isNotTest;
    });
  }, [providers]);

  const stats = useMemo(() => {
    const totalProviders = approvedProviders.length;
    const abaProviders = approvedProviders.filter(
      (p) => p.attributes.provider_type === "aba_therapy"
    ).length;
    const evalProviders = approvedProviders.filter(
      (p) => p.attributes.provider_type === "autism_evaluation"
    ).length;

    const telehealth = approvedProviders.filter(
      (p) => p.attributes.telehealth_services === "yes"
    ).length;
    const inClinic = approvedProviders.filter(
      (p) => p.attributes.in_clinic_services === "yes"
    ).length;
    const atHome = approvedProviders.filter(
      (p) => p.attributes.at_home_services === "yes"
    ).length;

    const spanishSpeakers = approvedProviders.filter(
      (p) => p.attributes.spanish_speakers === "yes"
    ).length;

    const insuranceDistribution = approvedProviders
      .flatMap(
        (p) => p.attributes.insurance?.map((i) => i.name || "Unknown") || []
      )
      .filter(
        (name): name is string =>
          name !== null && name !== undefined && name !== "Unknown"
      )
      .reduce((acc, insurance) => {
        acc[insurance] = (acc[insurance] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topInsurances = Object.entries(insuranceDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({
        name: formatInsuranceName(name),
        value: parseFloat(
          ((count / approvedProviders.length) * 100).toFixed(1)
        ),
      }));

    const totalSubmitted = providers.filter((p) => {
      const name = p.attributes.name?.toLowerCase() || "";
      return (
        !name.includes("test") &&
        !name.includes("demo") &&
        !name.includes("sample") &&
        name.length > 0
      );
    }).length;

    const approved = approvedProviders.length;
    const pending = providers.filter((p) => {
      const name = p.attributes.name?.toLowerCase() || "";
      const isPending = p.attributes.status?.toLowerCase() === "pending";
      const isNotTest =
        !name.includes("test") &&
        !name.includes("demo") &&
        !name.includes("sample") &&
        name.length > 0;
      return isPending && isNotTest;
    }).length;

    const denied = providers.filter((p) => {
      const name = p.attributes.name?.toLowerCase() || "";
      const isDenied = p.attributes.status?.toLowerCase() === "denied";
      const isNotTest =
        !name.includes("test") &&
        !name.includes("demo") &&
        !name.includes("sample") &&
        name.length > 0;
      return isDenied && isNotTest;
    }).length;

    return {
      totalProviders,
      totalSubmitted,
      abaProviders,
      evalProviders,
      approved,
      pending,
      denied,
      telehealth,
      inClinic,
      atHome,
      spanishSpeakers,
      topInsurances,
    };
  }, [approvedProviders, providers]);

  const providerTypeData: ChartDataItem[] = [
    { name: "ABA Therapy", value: stats.abaProviders },
    { name: "Evaluation", value: stats.evalProviders },
  ];

  const statusData: ChartDataItem[] = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Denied", value: stats.denied },
  ];

  const serviceTypeData: ChartDataItem[] = [
    { name: "Telehealth", value: stats.telehealth },
    { name: "In-Clinic", value: stats.inClinic },
    { name: "At-Home", value: stats.atHome },
  ];

  const insuranceData1 = stats.topInsurances.slice(0, 6);
  const insuranceData2 = stats.topInsurances.slice(6, 12);

  function formatInsuranceName(name: string): string {
    if (name.length > 20) {
      return name
        .split(" ")
        .map((word) => (word.length > 8 ? `${word.slice(0, 6)}...` : word))
        .join(" ");
    }
    return name;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Provider Analytics</h1>
      <p className="text-sm text-gray-600">
        *All statistics are based on approved providers only, excluding test
        data
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Active Providers
          </div>
          <div className="text-2xl font-bold">{stats.totalProviders}</div>
          <div className="text-sm text-gray-500">
            {((stats.approved / stats.totalSubmitted) * 100).toFixed(1)}%
            approval rate
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            ABA Providers
          </div>
          <div className="text-2xl font-bold">{stats.abaProviders}</div>
          <div className="text-sm text-gray-500">
            {((stats.abaProviders / stats.totalProviders) * 100).toFixed(1)}% of
            active
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Evaluation Providers
          </div>
          <div className="text-2xl font-bold">{stats.evalProviders}</div>
          <div className="text-sm text-gray-500">
            {((stats.evalProviders / stats.totalProviders) * 100).toFixed(1)}%
            of active
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Spanish Speaking
          </div>
          <div className="text-2xl font-bold">{stats.spanishSpeakers}</div>
          <div className="text-sm text-gray-500">
            {((stats.spanishSpeakers / stats.totalProviders) * 100).toFixed(1)}%
            of active
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Types Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-lg font-semibold mb-4">
            Active Provider Types Distribution
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-lg font-semibold mb-4">
            Application Status Distribution
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Types Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-lg font-semibold mb-4">
            Service Types Offered by Active Providers
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {serviceTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-lg font-semibold mb-4">
            Top Insurance Networks
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Percentage of providers accepting each insurance
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* First Column */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insuranceData1}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    unit="%"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{
                      fontSize: 12,
                      fill: "#4B5563",
                    }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ fontSize: "12px" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#0088FE"
                    barSize={20}
                    minPointSize={2}
                    label={{
                      position: "right",
                      formatter: (value: number): string => `${value}%`,
                      fontSize: 11,
                      fill: "#4B5563",
                    }}
                  >
                    {insuranceData1.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(210, 100%, ${45 + index * 8}%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Second Column */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insuranceData2}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    unit="%"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{
                      fontSize: 12,
                      fill: "#4B5563",
                    }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ fontSize: "12px" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#0088FE"
                    barSize={20}
                    minPointSize={2}
                    label={{
                      position: "right",
                      formatter: (value: number): string => `${value}%`,
                      fontSize: 11,
                      fill: "#4B5563",
                    }}
                  >
                    {insuranceData2.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(210, 100%, ${45 + (index + 6) * 8}%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
