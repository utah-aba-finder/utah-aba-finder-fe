import React, { useState, useEffect } from "react";
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
  const [selectedProvider, setSelectedProvider] = useState<MockProviderData | null>(null);  const [openNewProviderForm, setOpenNewProviderForm] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Session management
  useEffect(() => {
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");
    if (tokenExpiry) {
      const updateSessionTime = () => {
        const timeLeft = Math.max(
          0,
          Math.floor((parseInt(tokenExpiry) - Date.now()) / 1000)
        );
        setSessionTimeLeft(timeLeft);

        if (timeLeft <= 300 && timeLeft > 0) {
          toast.warn(
            `Your session will expire in ${timeLeft} seconds. Please save your work.`
          );
        } else if (timeLeft === 0) {
          toast.error("Your session has expired. Please log in again.");
          handleLogout();
        }
      };

      const timer = setInterval(updateSessionTime, 1000);
      return () => clearInterval(timer);
    }
  }, []);

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

  const handleLogout = () => {
    setToken(null);
  };

  const filteredProviders = providers.filter((provider) =>
    provider.attributes.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      {sessionTimeLeft !== null && sessionTimeLeft <= 300 && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 text-yellow-800 px-4 py-2 text-center">
          Session expires in: {Math.floor(sessionTimeLeft / 60)}:
          {(sessionTimeLeft % 60).toString().padStart(2, "0")}
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 bg-white shadow-lg z-50 w-64 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-semibold">Admin Panel</span>
            </div>
            <button className="md:hidden" onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedTab("view")}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      selectedTab === "view"
                        ? "bg-blue-600 text-white"
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
                        ? "bg-blue-600 text-white"
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
                        ? "bg-blue-600 text-white"
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

          <div className="absolute bottom-0 w-full p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 w-full px-4 py-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <button className="md:hidden" onClick={() => setIsOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex-1 max-w-xl ml-4">
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

              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
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
            </div>
          </header>

          {/* Main Content Area */}
          <main className="p-6">
            {selectedTab === "view" && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Provider Management
                  </h1>
                  <p className="text-gray-600">
                    Total Providers: {providers.length}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <p className="text-gray-600">Billing features coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
