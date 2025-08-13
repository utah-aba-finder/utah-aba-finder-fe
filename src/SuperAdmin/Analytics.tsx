import React, { useMemo, useState, useEffect } from "react";
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
import { ProviderData } from "../Utility/Types";
import { getAdminAuthHeader } from "../Utility/config";

interface AnalyticsProps {
  providers: ProviderData[];
}

interface UserData {
  id: number;
  email: string;
  role: string;
  provider_id?: number;
  created_at: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface Insurance {
  name: string | null;
}

const Analytics: React.FC<AnalyticsProps> = ({ providers }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users', {
          headers: {
            'Authorization': getAdminAuthHeader(),
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
  
        }
      } catch (error) {

      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

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
    
    // Comprehensive provider type analysis
    const providerTypeCounts: Record<string, number> = {};
    approvedProviders.forEach((provider) => {
      provider.attributes.provider_type?.forEach((type) => {
        const typeName = type.name?.toLowerCase() || 'unknown';
        providerTypeCounts[typeName] = (providerTypeCounts[typeName] || 0) + 1;
      });
    });

    // User statistics
    const totalUsers = users.length;
    const superAdmins = users.filter(user => user.role === 'super_admin').length;
    const providerAdmins = users.filter(user => user.role === 'user').length;
    const usersWithProviders = users.filter(user => user.provider_id).length;
    const usersWithoutProviders = users.filter(user => !user.provider_id).length;
    


    // Legacy provider type counts for backward compatibility
    const abaProviders = approvedProviders.filter((p) =>
      p.attributes.provider_type?.some(
        (type: { name: string }) => type.name?.toLowerCase() === "aba_therapy"
      )
    ).length;
    const evalProviders = approvedProviders.filter((p) =>
      p.attributes.provider_type?.some(
        (type: { name: string }) =>
          type.name?.toLowerCase() === "autism_evaluation"
      )
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
        (p) => p.attributes.insurance?.map((i: Insurance) => i.name || "Unknown") || []
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
      // New statistics
      totalUsers,
      superAdmins,
      providerAdmins,
      usersWithProviders,
      usersWithoutProviders,
      providerTypeCounts,
    };
  }, [approvedProviders, providers, users]);

  // Create comprehensive provider type data
  const providerTypeData: ChartDataItem[] = Object.entries(stats.providerTypeCounts)
    .map(([type, count]) => ({
      name: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // Fallback to legacy data if no comprehensive data
  const fallbackProviderTypeData: ChartDataItem[] = [
    { name: "ABA Therapy", value: stats.abaProviders },
    { name: "Evaluation", value: stats.evalProviders },
  ];

  const finalProviderTypeData = providerTypeData.length > 0 ? providerTypeData : fallbackProviderTypeData;

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
      {isLoadingUsers && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Loading user statistics...</span>
          </div>
        </div>
      )}

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
            Registered Users
          </div>
          <div className="text-2xl font-bold">{isLoadingUsers ? '...' : stats.totalUsers}</div>
          <div className="text-sm text-gray-500">
            {stats.providerAdmins} provider admins
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Provider Types
          </div>
          <div className="text-2xl font-bold">{Object.keys(stats.providerTypeCounts).length}</div>
          <div className="text-sm text-gray-500">
            Different service types
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

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Total Applications
          </div>
          <div className="text-2xl font-bold">{stats.totalSubmitted}</div>
          <div className="text-sm text-gray-500">
            {stats.pending} pending, {stats.denied} denied
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Super Admins
          </div>
          <div className="text-2xl font-bold">{stats.superAdmins}</div>
          <div className="text-sm text-gray-500">
            System administrators
          </div>
        </div>



        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Service Delivery
          </div>
          <div className="text-2xl font-bold">{stats.telehealth + stats.inClinic + stats.atHome}</div>
          <div className="text-sm text-gray-500">
            Total service options
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
                  data={finalProviderTypeData}
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
                  {finalProviderTypeData.map((entry, index) => (
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

      {/* Additional User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-lg font-semibold mb-4">
            User Registration Statistics
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Total Users", value: stats.totalUsers },
                { name: "Super Admins", value: stats.superAdmins },
                { name: "Provider Admins", value: stats.providerAdmins },
                { name: "With Providers", value: stats.usersWithProviders },
                { name: "Without Providers", value: stats.usersWithoutProviders }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00C49F">
                  {[
                    { name: "Total Users", value: stats.totalUsers },
                    { name: "Super Admins", value: stats.superAdmins },
                    { name: "Provider Admins", value: stats.providerAdmins },
                    { name: "With Providers", value: stats.usersWithProviders },
                    { name: "Without Providers", value: stats.usersWithoutProviders }
                  ].map((entry, index) => (
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

        {/* Provider Type Breakdown */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-lg font-semibold mb-4">
            Provider Type Breakdown
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={finalProviderTypeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
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
                <Tooltip />
                <Bar dataKey="value" fill="#FFBB28">
                  {finalProviderTypeData.map((entry, index) => (
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
      </div>
    </div>
  );
};

export default Analytics;
