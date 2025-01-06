import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  PlusCircle,
  CreditCard,
  LogOut,
  Menu,
  X,
  BarChart,
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../Provider-login/AuthProvider";
import { SuperAdminEdit } from "./SuperAdminEdit";
import Analytics from "./Analytics";
import SuperAdminCreate from "./SuperAdminCreate";
import SuperAdminAddInsurances from "./SuperAdminAddInsurances";
import moment from "moment";
import { MockProviderData, ProviderAttributes } from "../Utility/Types";

const SuperAdmin = () => {
  const { setToken, loggedInProvider } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("view");
  const [providers, setProviders] = useState<MockProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<MockProviderData | null>(null);
  const [openNewProviderForm, setOpenNewProviderForm] = useState(false);
  const [openNewInsuranceForm, setOpenNewInsuranceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerTypeFilter, setProviderTypeFilter] = useState<
    "all" | "ABA Therapy" | "Autism Evaluation" | "Speech Therapy" | "Occupational Therapy"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "denied"
  >("all");

  const handleLogout = useCallback(() => {
    toast.dismiss("session-warning");
    toast.info("Logging out...", {
      toastId: "logging-out",
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      setToken(null);
    }, 2000);
  }, [setToken]);

  // Fetch providers
  const fetchAllProviders = async () => {
    try {
      const response = await fetch(
        "https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers",
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch providers");
      }
      const fetchedProviders = await response.json();
      setProviders(fetchedProviders.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to fetch providers. Please try again later.");
    }
  };

  useEffect(() => {
    fetchAllProviders();
  }, []);

  const handleProviderUpdate = async (updatedProvider: ProviderAttributes) => {
    try {
      if (!updatedProvider) {
        console.error("Received undefined updatedProvider");
        return;
      }

      console.log("Received updatedProvider:", updatedProvider); // Debug log

      setProviders((prevProviders) => {
        if (!selectedProvider?.id) {
          console.error("No selected provider ID");
          return prevProviders;
        }

        return prevProviders.map((p) => {
          if (!p) return p;
          return p.id === selectedProvider.id
            ? {
                ...p,
                attributes: updatedProvider,
                state: p.states || []
              }
            : p
        });
      });

      await fetchAllProviders();
    } catch (error) {
      console.error("Error in handleProviderUpdate:", error);
      toast.error("Failed to update provider");
    }
  };

  const filteredProviders = providers.filter((provider) => {
    if (!provider?.attributes) {
      console.log("Filtering out invalid provider:", provider); // Debug log
      return false;
    }

    const nameMatch = provider.attributes.name
      ? provider.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    const typeMatch =
      providerTypeFilter === "all"
        ? true
        : provider.attributes.provider_type?.some(
            (type: { name: string }) =>
              type.name === providerTypeFilter
          );

    const statusMatch =
      statusFilter === "all"
        ? true
        : provider.attributes.status?.toLowerCase() === statusFilter;

    return nameMatch && typeMatch && statusMatch;
  });

  const getStatusColor = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "denied":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "denied":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };


  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-50"
      />
      <div className="h-screen bg-gray-100 flex lg:flex-col">
        <div className="flex min-h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`
    bg-white shadow-lg w-52 flex flex-col
    fixed md:static h-[calc(100vh-2rem)] my-4 rounded-lg mx-4
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 z-40
  `}
          >
            {/* Dashboard Header */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-[#4A6FA5] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ASL</span>
                  </div>
                  <span className="text-lg font-semibold">Admin Panel</span>
                </div>
                <button className="md:hidden" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="space-y-1 px-2">
                <li>
                  <button
                    onClick={() => setSelectedTab("view")}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "view"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm">View Providers</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("analytics")}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "analytics"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <BarChart className="w-4 h-4" />
                    <span className="text-sm">Analytics</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedTab("create");
                      setOpenNewProviderForm(true);
                    }}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "create"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm">Create Provider</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedTab("createInsurance");
                      setOpenNewInsuranceForm(true);
                    }}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "createInsurance"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm">Add Insurance</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("billing")}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "billing"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Billing</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:cursor-pointer w-full px-3 py-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
          {/* Main Content Container */}
          <div className="flex-1 flex flex-col min-w-0 h-screen">
            {/* Floating Header */}
            <header className="sticky top-0 z-30 px-2">
              <div className="bg-white shadow-lg rounded-lg mx-2 mt-4 mb-2">
                <div className="p-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-[40%]">
                      {/* Menu Button */}
                      <button
                        className="flex-shrink-0 md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsOpen(true)}
                      >
                        <Menu className="w-5 h-5" />
                      </button>

                      {selectedTab === "view" ? (
                        /* Search Input */
                        <div className="w-full max-w-[calc(100%-94px)] sm:max-w-full min-w-0">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search providers..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Title for other tabs */
                        <div className="text-lg font-semibold">
                          {selectedTab === "analytics" && "Analytics Dashboard"}
                          {selectedTab === "create" && "Create New Provider"}
                          {selectedTab === "createInsurance" && "Add Insurance"}
                          {selectedTab === "billing" && "Billing Management"}
                          {selectedTab === "edit" && "Edit Provider"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                      {selectedTab === "view" ? (
                        /* Filters */
                        <>
                          {/* Provider Type Filter */}
                          <div className="w-[calc(50%-0.375rem)] sm:w-32 flex-shrink-0">
                            <div className="relative">
                              <select
                                value={providerTypeFilter}
                                onChange={(e) =>
                                  setProviderTypeFilter(
                                    e.target.value as "all" | "ABA Therapy" | "Autism Evaluation" | "Speech Therapy" | "Occupational Therapy"
                                  )
                                }
                                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-gray-300 bg-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               appearance-none cursor-pointer text-gray-700 text-sm"
                              >
                                <option value="all">All Providers</option>
                                <option value="ABA Therapy">ABA Therapy</option>
                                <option value="Autism Evaluation">Autism Evaluation</option>
                                <option value="Speech Therapy">Speech Therapy</option>
                                <option value="Occupational Therapy">Occupational Therapy</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Status Filter */}
                          <div className="w-[calc(50%-0.375rem)] sm:w-28 flex-shrink-0">
                            <div className="relative">
                              <select
                                value={statusFilter}
                                onChange={(e) =>
                                  setStatusFilter(
                                    e.target.value as
                                      | "all"
                                      | "approved"
                                      | "pending"
                                      | "denied"
                                  )
                                }
                                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-gray-300 bg-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               appearance-none cursor-pointer text-gray-700 text-sm"
                              >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="denied">Denied</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </>
                      ) : /* Tab-specific actions could go here */
                      null}

                      {/* User Profile */}
<div className="hidden lg:block">
  <div className="text-right">
    <div className="text-sm font-medium text-gray-700">
      Admin User
    </div>
    <div className="text-xs text-gray-500">
      {loggedInProvider?.email || 'admin@example.com'}
    </div>
  </div>
</div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {selectedTab === "view" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Provider Management
                    </h1>
                    <p className="text-gray-600">
                      {providerTypeFilter === "all"
                        ? `Total Providers: ${filteredProviders.length}`
                        : providerTypeFilter === "ABA Therapy"
                        ? `ABA Therapy Providers: ${filteredProviders.length}`
                        : providerTypeFilter === "Autism Evaluation"
                        ? `Autism Evaluation Providers: ${filteredProviders.length}`
                        : providerTypeFilter === "Speech Therapy"
                        ? `Speech Therapy Providers: ${filteredProviders.length}`
                        : `Occupational Therapy Providers: ${filteredProviders.length}`}
                      {searchTerm && ` (Filtered)`}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Provider Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Locations
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Updated
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProviders.map((provider) => (
                            <tr
                              key={provider.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedProvider(provider);
                                setSelectedTab("edit");
                              }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[16rem]">
                                  {provider.attributes.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {provider.attributes.provider_type?.map(type => type.name).join(", ") || "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {provider.attributes.locations?.length || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`flex items-center text-sm ${getStatusColor(
                                    provider.attributes.status
                                  )}`}
                                >
                                  {getStatusIcon(provider.attributes.status)}
                                  <span className="ml-1">
                                    {provider.attributes.status || "Unknown"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {provider.attributes.updated_last
                                  ? moment(
                                      provider.attributes.updated_last
                                    ).format("MM/DD/YYYY")
                                  : "Never"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "edit" && selectedProvider && (
                <SuperAdminEdit
                  provider={selectedProvider}
                  onUpdate={handleProviderUpdate}
                  setSelectedTab={setSelectedTab} 
                />
              )}

              {selectedTab === "create" && openNewProviderForm && (
                <SuperAdminCreate
                  handleCloseForm={() => {
                    setOpenNewProviderForm(false);
                    setSelectedTab("view");
                  }}
                  onProviderCreated={fetchAllProviders}
                />
              )}

              {selectedTab === "createInsurance" && openNewInsuranceForm && (
                <SuperAdminAddInsurances
                  handleCloseForm={() => {
                    setOpenNewInsuranceForm(false);
                    setSelectedTab("view");
                  }}
                />
              )}

              {selectedTab === "billing" && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Billing Management
                  </h1>
                  <p className="text-gray-600">
                    Billing features coming soon...
                  </p>
                </div>
              )}

              {selectedTab === "analytics" && (
                <Analytics providers={providers} />
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdmin;
