import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  PlusCircle,
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../Provider-login/AuthProvider";
import { SuperAdminEdit } from "./SuperAdminEdit";
import SuperAdminCreate from "./SuperAdminCreate";
import moment from "moment";
import { MockProviderData, ProviderAttributes } from "../Utility/Types";

const SuperAdmin = () => {
  const { setToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("view");
  const [providers, setProviders] = useState<MockProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<MockProviderData | null>(null);
  const [openNewProviderForm, setOpenNewProviderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize handleLogout to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    toast.dismiss("session-warning"); // Clear any existing warning toasts
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

  const handleProviderUpdate = (updatedProvider: ProviderAttributes) => {
    setProviders((prevProviders) =>
      prevProviders.map((p) =>
        p.id === updatedProvider.id ? { ...p, attributes: updatedProvider } : p
      )
    );
  };

  const filteredProviders = providers.filter((provider) =>
    provider.attributes.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Layout wrapper */}
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`
            bg-white shadow-lg w-64 flex flex-col
            fixed md:static h-full
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 z-40
          `}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">ASL</span>
                  </div>
                  <span className="text-xl font-semibold">Admin Panel</span>
                </div>
                <button className="md:hidden" onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Navigation Menu - Scrollable if needed */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedTab("view")}
                    className={`
                    w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      selectedTab === "view"
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  >
                    <Users className="w-5 h-5" />
                    <span>View Providers</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedTab("create");
                      setOpenNewProviderForm(true);
                    }}
                    className={`
                    w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      selectedTab === "create"
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Provider</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("billing")}
                    className={`
                    w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      selectedTab === "billing"
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Billing</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 w-full px-4 py-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation */}
            <header className="bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <button className="md:hidden" onClick={() => setIsOpen(true)}>
                  <Menu className="w-6 h-6" />
                </button>

                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* User Profile Section */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-700">
                      Admin User
                    </div>
                    <div className="text-xs text-gray-500">
                      admin@example.com
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
                      Total Providers: {providers.length}
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
                                <div className="text-sm font-medium text-gray-900">
                                  {provider.attributes.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {provider.attributes.provider_type ===
                                  "aba_therapy"
                                    ? "ABA Therapy"
                                    : "Autism Evaluation"}
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
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdmin;
