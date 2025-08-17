import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { toast } from "react-toastify";
import { useAuth } from "../Provider-login/AuthProvider";
import { SuperAdminEdit } from "./SuperAdminEdit";
import Analytics from "./Analytics";
import SuperAdminCreate from "./SuperAdminCreate";
import SuperAdminAddInsurances from "./SuperAdminAddInsurances";
import moment from "moment";
import CreateUser from "./CreateUser";
import UserProviderLinking from "./UserProviderLinking";
import { ProviderData, ProviderAttributes } from "../Utility/Types";
// import { fetchProviders } from "../Utility/ApiCall";

const SuperAdmin = () => {
  console.log('🚀 SuperAdmin: Component mounted/rendered');
  
  const { loggedInProvider, logout, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("view");
  const [allProviders, setAllProviders] = useState<ProviderData[]>([]);
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
  const [logoFilter, setLogoFilter] = useState<"all" | "with_logo" | "without_logo">("all");

  // Hardcoded list of all US states
  const US_STATES = useMemo(() => [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
  ], []);

  // Extract states that are actually used by providers
  // const [availableStates, setAvailableStates] = useState<string[]>([]);

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
              logout('manual');
    }, 2000);
  }, [logout]);


  // Fetch providers
  const fetchAllProviders = useCallback(async () => {
    console.log('🚀 SuperAdmin: fetchAllProviders function called!');
    console.log('🔄 SuperAdmin: Starting to fetch providers...');
    
    try {
      // Get the current user's ID for Bearer token authentication
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (!currentUser?.id) {
        console.error('❌ SuperAdmin: No current user ID found');
        throw new Error('User not authenticated');
      }

      console.log('🔑 SuperAdmin: Using Bearer token with user ID:', currentUser.id);

      // Use Bearer token authentication with user ID (not API key)
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/providers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${currentUser.id}`, // Bearer token with user ID
          },
        }
      );

      console.log('📡 SuperAdmin: API response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access forbidden - user may not have super admin privileges');
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 SuperAdmin: Providers data received:', data);

      if (data && data.data) {
        setAllProviders(data.data);
        console.log('✅ SuperAdmin: Successfully set providers:', data.data.length);
      } else {
        console.log('⚠️ SuperAdmin: No providers data found in response');
        setAllProviders([]);
      }
    } catch (error) {
      console.error('❌ SuperAdmin: Error fetching providers:', error);
      setAllProviders([]);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 SuperAdmin: useEffect triggered', { 
      hasCurrentUser: !!currentUser,
      role: currentUser?.role,
      isSuperAdmin: currentUser?.role === 'super_admin'
    });
    
    // Use currentUser.role instead of loggedInProvider for role checks
    if (currentUser && currentUser.role === 'super_admin') {
      console.log('✅ SuperAdmin: Calling fetchAllProviders...');
      fetchAllProviders();
    } else {
      console.log('❌ SuperAdmin: Not calling fetchAllProviders - missing requirements:', {
        hasCurrentUser: !!currentUser,
        role: currentUser?.role
      });
    }
  }, [currentUser, fetchAllProviders]);

  const handleProviderUpdate = async (updatedProvider: ProviderAttributes) => {
    try {
      // Get the current user's ID for Bearer token authentication
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (!currentUser?.id) {
        console.error('❌ SuperAdmin: No current user ID found for update');
        toast.error("Authentication error - please log in again");
        return;
      }

      console.log('🔑 SuperAdmin: Updating provider with Bearer token, user ID:', currentUser.id);

      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/providers/${updatedProvider.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${currentUser.id}`, // Bearer token with user ID
          },
          body: JSON.stringify({
            data: [{
              id: updatedProvider.id,
              type: "provider",
              attributes: updatedProvider,
            }],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access forbidden - user may not have super admin privileges');
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ SuperAdmin: Provider updated successfully:', data);

      // Update the local state immediately
      setAllProviders((prevProviders) => {
        if (!selectedProvider?.id) {
          return prevProviders;
        }

        return prevProviders.map((provider) =>
          provider.id === selectedProvider.id
            ? { ...provider, attributes: { ...provider.attributes, ...updatedProvider } }
            : provider
        );
      });

      toast.success("Provider updated successfully!");
    } catch (error) {
      console.error("❌ SuperAdmin: Error updating provider:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update provider");
    }
  };

  const filteredProviders = allProviders.filter((provider) => {
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

    const logoMatch = (() => {
      if (logoFilter === "all") return true;
      if (logoFilter === "with_logo") return !!provider.attributes.logo;
      if (logoFilter === "without_logo") return !provider.attributes.logo;
      return true;
    })();

    const result = nameMatch && typeMatch && statusMatch && stateMatch && serviceMatch && locationCountMatch && logoMatch;
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
                <div className="flex items-center space-x-2">
                  {/* Mobile Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="md:hidden flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded transition-colors duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  {/* Mobile Close Button */}
                  <button className="md:hidden" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                    onClick={() => setSelectedTab("linking")}
                    className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg
            transition-colors hover:cursor-pointer duration-200
            ${
              selectedTab === "linking"
                ? "bg-[#4A6FA5] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Link Users</span>
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

            {/* Sidebar Footer - Removed logout button, now in header */}
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
                            {selectedTab === "linking" && "User-Provider Linking"}
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
                        
                        {/* Desktop Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors duration-200"
                          title="Sign Out"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </div>
                      
                      {/* Mobile Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="lg:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors duration-200"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
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

                        {/* Logo Filter */}
                        <div className="w-[calc(50%-0.375rem)] sm:w-32 flex-shrink-0">
                          <div className="relative">
                            <select
                              value={logoFilter}
                              onChange={(e) =>
                                setLogoFilter(
                                  e.target.value as "all" | "with_logo" | "without_logo"
                                )
                              }
                              className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-gray-300 bg-white 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             appearance-none cursor-pointer text-gray-700 text-sm"
                            >
                              <option value="all">All Logos</option>
                              <option value="with_logo">With Logo</option>
                              <option value="without_logo">Without Logo</option>
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
                      {(() => {
                        const withLogos = allProviders.filter(p => p.attributes?.logo).length;
                        const withoutLogos = allProviders.filter(p => !p.attributes?.logo).length;
                        return ` • ${withLogos} with logos, ${withoutLogos} without logos`;
                      })()}
                    </p>
                  </div>

                  {/* isLoading is removed, so this block is always rendered */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Provider Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Logo
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
                                <div className="flex items-center justify-center">
                                  {provider.attributes.logo ? (
                                    <div className="relative group">
                                      <img 
                                        src={provider.attributes.logo}
                                        alt={`${provider.attributes.name} logo`}
                                        className="w-10 h-10 object-contain rounded border border-gray-200"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      {/* Logo preview on hover */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                                          <img 
                                            src={provider.attributes.logo}
                                            alt={`${provider.attributes.name} logo`}
                                            className="w-32 h-32 object-contain"
                                          />
                                          <div className="text-xs text-gray-600 mt-1 text-center">
                                            {provider.attributes.name}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                      <span className="text-gray-400 text-sm">📷</span>
                                    </div>
                                  )}
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

              {selectedTab === "linking" && (
                <UserProviderLinking />
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
                <Analytics providers={allProviders} />
              )}
            </main>
          </div>
        </div>
      </div>
      
      {/* Floating Logout Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default SuperAdmin;
