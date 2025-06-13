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
import CreateUser from "./CreateUser";
import { ProviderData, ProviderAttributes, Providers } from "../Utility/Types";
import { API_URL } from "../Utility/ApiCall";

const SuperAdmin = () => {
  const { setToken, loggedInProvider } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("view");
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderData | null>(null);
  const [openNewProviderForm, setOpenNewProviderForm] = useState(false);
  const [openNewInsuranceForm, setOpenNewInsuranceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreateUserForm, setOpenCreateUserForm] = useState(false);
  const [providerTypeFilter, setProviderTypeFilter] = useState<
    "all" | "ABA Therapy" | "Autism Evaluation" | "Speech Therapy" | "Occupational Therapy"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "denied"
  >("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [locationCountFilter, setLocationCountFilter] = useState<string>("all");

  // Hardcoded list of all US states
  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
  ];

  // Extract states that are actually used by providers
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  // Add this constant for available services
  const AVAILABLE_SERVICES = [
    { id: 1, name: "ABA Therapy" },
    { id: 2, name: "Autism Evaluation" },
    { id: 3, name: "Speech Therapy" },
    { id: 4, name: "Occupational Therapy" }
  ];

  // Add this constant for location count options
  const LOCATION_COUNT_OPTIONS = [
    { value: "all", label: "All Locations" },
    { value: "1", label: "1 Location" },
    { value: "2-3", label: "2-3 Locations" },
    { value: "4-5", label: "4-5 Locations" },
    { value: "6+", label: "6+ Locations" }
  ];

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
      const response = await fetch(`${API_URL}/providers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.data) {
        throw new Error("Invalid response format");
      }

      // Update the providers state with the fresh data
      setProviders(data.data);
      
      // If we have a selected provider, update it with the fresh data
      if (selectedProvider) {
        const updatedProvider = data.data.find(
          (p: ProviderData) => p.id === selectedProvider.id
        );
        if (updatedProvider) {
          setSelectedProvider(updatedProvider);
        }
      }

    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to fetch providers");
    }
  };

  useEffect(() => {
    fetchAllProviders();
  }, []);

  // Extract states that are actually used by providers
  useEffect(() => {
    const states = new Set<string>();
    providers.forEach(provider => {
      provider.attributes.locations?.forEach(location => {
        if (location.state) {
          // Clean up state name
          const cleanState = location.state.trim();
          // Log the state we're processing
          
          // Try to find a matching state, being more lenient with the matching
          const matchingState = US_STATES.find(state => 
            state.toLowerCase() === cleanState.toLowerCase() ||
            state.toLowerCase().includes(cleanState.toLowerCase()) ||
            cleanState.toLowerCase().includes(state.toLowerCase())
          );
          
          if (matchingState) {
            states.add(matchingState);
          }
        }
      });
    });
    
    const sortedStates = Array.from(states).sort();
    setAvailableStates(sortedStates);
  }, [providers, US_STATES]);

  const handleProviderUpdate = async (updatedProvider: ProviderAttributes) => {
    try {
      if (!updatedProvider) {
        console.error("Received undefined updatedProvider");
        return;
      }

      // First update the local state
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
                states: p.states || []
              }
            : p;
        });
      });

      // Then fetch fresh data from the server
      await fetchAllProviders();

      // Show success message
      toast.success("Provider updated successfully");

      // Switch back to view tab after a short delay
      setTimeout(() => {
        setSelectedTab("view");
      }, 1000);

    } catch (error) {
      console.error("Error in handleProviderUpdate:", error);
      toast.error("Failed to update provider");
    }
  };

  const filteredProviders = providers.filter((provider) => {
    if (!provider?.attributes) {
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

    const stateMatch =
      stateFilter === "all"
        ? true
        : (provider.states || provider.attributes.states || [])?.some(state => {
            return state.toLowerCase() === stateFilter.toLowerCase();
          });

    const serviceMatch =
      serviceFilter === "all"
        ? true
        : provider.attributes.locations?.some(location => 
            location.services?.some(service => 
              service.name === serviceFilter
            )
          );

    const locationCount = provider.attributes.locations?.length || 0;
    const locationCountMatch = (() => {
      if (locationCountFilter === "all") return true;
      if (locationCountFilter === "1") return locationCount === 1;
      if (locationCountFilter === "2-3") return locationCount >= 2 && locationCount <= 3;
      if (locationCountFilter === "4-5") return locationCount >= 4 && locationCount <= 5;
      if (locationCountFilter === "6+") return locationCount >= 6;
      return true;
    })();

    const result = nameMatch && typeMatch && statusMatch && stateMatch && serviceMatch && locationCountMatch;
    return result;
  }).sort((a, b) => {
    const nameA = a.attributes.name?.toLowerCase() || "";
    const nameB = b.attributes.name?.toLowerCase() || "";
    return nameA.localeCompare(nameB);
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
                    onClick={() => {
                      setSelectedTab("createUser");
                      setOpenCreateUserForm(true);
                    }}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "createUser"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm">Create User</span>
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
                  <div className="flex flex-col gap-4">
                    {/* Top Row: Search and Admin User */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Menu Button */}
                        <button
                          className="flex-shrink-0 md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                          onClick={() => setIsOpen(true)}
                        >
                          <Menu className="w-5 h-5" />
                        </button>

                        {selectedTab === "view" ? (
                          /* Search Input */
                          <div className="flex-1 max-w-2xl">
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
                            {selectedTab === "createUser" && "Create User"}
                          </div>
                        )}
                      </div>

                      {/* Admin User Profile */}
                      <div className="hidden lg:flex items-center gap-3">
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

                    {/* Bottom Row: Filters */}
                    {selectedTab === "view" && (
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Provider Type Filter */}
                        <div className="w-[calc(50%-0.375rem)] sm:w-40 flex-shrink-0">
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
                        
                        {/* State Filter */}
                        <div className="w-[calc(50%-0.375rem)] sm:w-40 flex-shrink-0">
                          <div className="relative">
                            <select
                              value={stateFilter}
                              onChange={(e) => setStateFilter(e.target.value)}
                              className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-gray-300 bg-white 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             appearance-none cursor-pointer text-gray-700 text-sm"
                            >
                              <option value="all">All States</option>
                              {US_STATES.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Service Filter */}
                        <div className="w-[calc(50%-0.375rem)] sm:w-40 flex-shrink-0">
                          <div className="relative">
                            <select
                              value={serviceFilter}
                              onChange={(e) => setServiceFilter(e.target.value)}
                              className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-gray-300 bg-white 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             appearance-none cursor-pointer text-gray-700 text-sm"
                            >
                              <option value="all">All Services</option>
                              {AVAILABLE_SERVICES.map((service) => (
                                <option key={service.id} value={service.name}>
                                  {service.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Location Count Filter */}
                        <div className="w-[calc(50%-0.375rem)] sm:w-40 flex-shrink-0">
                          <div className="relative">
                            <select
                              value={locationCountFilter}
                              onChange={(e) => setLocationCountFilter(e.target.value)}
                              className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-gray-300 bg-white 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             appearance-none cursor-pointer text-gray-700 text-sm"
                            >
                              {LOCATION_COUNT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-[calc(50%-0.375rem)] sm:w-32 flex-shrink-0">
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
                      </div>
                    )}
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
                            <th className="px-6 py-3 text-left max-w-[1rem] text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[10rem]">
                                  {provider.attributes.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 max-w-[6rem] truncate">
                                  {provider.attributes.provider_type?.map((type: { name: string }) => type.name).join(", ") || "Unknown"}
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

              {selectedTab === "createUser" && openCreateUserForm && (
                <CreateUser
                  handleCloseForm={() => {
                    setOpenCreateUserForm(false);
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
