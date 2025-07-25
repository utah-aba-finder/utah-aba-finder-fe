import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../Provider-login/AuthProvider";
import Dashboard from "./components/Dashboard";
import EditLocation from "./components/EditLocation";
import CreateLocation from "./components/CreateLocation";
import { AuthModal } from "./AuthModal";
import {
  Building2,
  PlusCircle,
  LogOut,
  Menu,
  X,
  BarChart,
  MapPin,
  DollarSign,
} from "lucide-react";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ProviderData, ProviderAttributes, Insurance, CountiesServed, Location, StateData, CountyData, ProviderType } from "../Utility/Types";
import { fetchStates, fetchCountiesByState } from "../Utility/ApiCall";
import InsuranceModal from "./InsuranceModal";
import CountiesModal from "./CountiesModal";

interface ProviderEditProps {
  loggedInProvider: ProviderData;
  clearProviderData: () => void;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
}

const ProviderEdit: React.FC<ProviderEditProps> = ({
  loggedInProvider,
  clearProviderData,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const [currentProvider, setCurrentProvider] = useState<ProviderData>({
    ...loggedInProvider,
    attributes: {
      ...loggedInProvider.attributes,
      provider_type: loggedInProvider.attributes.provider_type || [],
      insurance: loggedInProvider.attributes.insurance || [],
      counties_served: loggedInProvider.attributes.counties_served || [],
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { logout } = useAuth();
  const [editedProvider, setEditedProvider] = useState<ProviderAttributes>(loggedInProvider.attributes);
  const [providerState, setProviderState] = useState<string[]>(loggedInProvider.states || []);
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>(loggedInProvider.states?.[0] || '');
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    loggedInProvider.attributes.counties_served || []
  );
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<ProviderType[]>(
    loggedInProvider.attributes.provider_type || []
  );
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  
  const [selectedStateAbbr, setSelectedStateAbbr] = useState<string>('none');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('');
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>(loggedInProvider.attributes.insurance || []);
  const [locations, setLocations] = useState<Location[]>(loggedInProvider.attributes.locations || []);

  const handleLogout = useCallback(() => {
    toast.dismiss("session-warning");
    toast.info("Logging out...", {
      toastId: "logging-out",
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      logout('manual');
      clearProviderData();
    }, 2000);
  }, [logout, clearProviderData]);

  const refreshProviderData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${loggedInProvider.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh provider data");
      }

      const data = await response.json();
      const providerData = data.data?.[0] || {};
      
      console.log('ProviderEdit: Raw provider data from backend:', providerData);
      console.log('ProviderEdit: Provider attributes:', providerData.attributes);
      console.log('ProviderEdit: Provider types:', providerData.attributes?.provider_type);
      console.log('ProviderEdit: Locations:', providerData.attributes?.locations);
      console.log('ProviderEdit: Insurance:', providerData.attributes?.insurance);
      console.log('ProviderEdit: Counties served:', providerData.attributes?.counties_served);
      console.log('ProviderEdit: Service fields:', {
        telehealth_services: providerData.attributes?.telehealth_services,
        spanish_speakers: providerData.attributes?.spanish_speakers,
        at_home_services: providerData.attributes?.at_home_services,
        in_clinic_services: providerData.attributes?.in_clinic_services,
      });
      
      // Ensure we have all required properties with defaults
      const safeProviderData = {
        ...providerData,
        attributes: {
          ...providerData.attributes,
          provider_type: providerData.attributes?.provider_type || [],
          insurance: providerData.attributes?.insurance || [],
          counties_served: providerData.attributes?.counties_served || [],
          locations: providerData.attributes?.locations || [],
        }
      };

      setCurrentProvider(safeProviderData);
      setEditedProvider({
        ...safeProviderData.attributes,
        telehealth_services: safeProviderData.attributes.telehealth_services || "Contact us",
        spanish_speakers: safeProviderData.attributes.spanish_speakers || "Contact us",
        at_home_services: safeProviderData.attributes.at_home_services || "Contact us",
        in_clinic_services: safeProviderData.attributes.in_clinic_services || "Contact us",
      });
      setSelectedProviderTypes(safeProviderData.attributes.provider_type || []);
      setSelectedCounties(safeProviderData.attributes.counties_served || []);
      setProviderState(safeProviderData.states || []);
      setSelectedInsurances(safeProviderData.attributes.insurance || []);
      setLocations(safeProviderData.attributes.locations || []);
      
      console.log('ProviderEdit: Updated state with locations:', safeProviderData.attributes.locations);
    } catch (error) {
      console.error('Error refreshing provider data:', error);
      toast.error('Failed to refresh provider data');
    }
  }, [loggedInProvider.id]);

  // Initialize provider state and fetch counties for saved states
  useEffect(() => {
    const initializeStatesAndCounties = async () => {
      try {
        // Fetch all available states
        const states = await fetchStates();
        setAvailableStates(states);

        // Get the provider's saved states
        const savedStates = loggedInProvider.states || [];
        setProviderState(savedStates);

        // If there are saved states, set the first one as active and fetch counties
        if (savedStates.length > 0) {
          setActiveStateForCounties(savedStates[0]);
          
          // Fetch counties for all saved states
          const stateIds = states
            .filter(s => savedStates.includes(s.attributes.name))
            .map(s => s.id);
          
          const countiesPromises = stateIds.map(id => fetchCountiesByState(id));
          const countiesResults = await Promise.all(countiesPromises);
          const allCounties = countiesResults.flat();
          setAvailableCounties(allCounties);
        }
      } catch (error) {
        console.error('Error initializing states and counties:', error);
        toast.error('Failed to load states and counties');
      }
    };

    initializeStatesAndCounties();
  }, [loggedInProvider.states]); // Update dependency to use correct path

  // Update provider data when loggedInProvider changes
  useEffect(() => {
    setCurrentProvider(loggedInProvider);
    setProviderState(loggedInProvider.states || []);
    setSelectedCounties(loggedInProvider.attributes.counties_served || []);
  }, [loggedInProvider]);

  useEffect(() => {
    const hideAuthModal = localStorage.getItem("hideAuthModal");
    if (hideAuthModal === "true") {
      setAuthModalOpen(false);
    }
  }, []);

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
            `Your session will expire in ${timeLeft} seconds. Please save your work.`,
            {
              toastId: "session-warning",
              position: "top-center",
              autoClose: false,
            }
          );
        } else if (timeLeft === 0) {
          toast.error("Your session has expired. Please log in again.", {
            toastId: "session-expired",
            position: "top-center",
            autoClose: false,
          });
          handleLogout();
        }
      };

      const timer = setInterval(updateSessionTime, 1000);
      return () => clearInterval(timer);
    }
  }, [handleLogout]);

  // Cleanup toasts when component unmounts
  React.useEffect(() => {
    return () => {
      toast.dismiss("session-warning");
      toast.dismiss("session-expired");
      toast.dismiss("session-warning-five-min");
      toast.dismiss("session-warning-one-min");
      toast.dismiss("inactivity-warning");
      toast.dismiss("inactivity-logout");
    };
  }, []);

  const handleProviderUpdate = useCallback(
    async (updatedAttributes: ProviderAttributes) => {
      setCurrentProvider((prev) => ({
        ...prev,
        attributes: updatedAttributes,
      }));

      await refreshProviderData();
      // Remove success toast from here since it's now in refreshProviderData
    },
    [refreshProviderData]
  );

  const handleShownModal = (hideModal: boolean) => {
    setAuthModalOpen(false);
    if (hideModal) {
      localStorage.setItem("hideAuthModal", "true");
    }
  };

  // Add this effect to handle state changes
  useEffect(() => {
    if (providerState.length > 0 && !activeStateForCounties) {
      setActiveStateForCounties(providerState[0]);
    }
  }, [providerState, activeStateForCounties]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProvider(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = async (stateName: string) => {
    try {
      setIsLoading(true);
      const stateData = availableStates.find(s => s.attributes.name === stateName);
      if (stateData) {
        const counties = await fetchCountiesByState(stateData.id);
        setAvailableCounties(prev => [...prev, ...counties]);
        setProviderState(prev => [...prev, stateName]);
        if (!activeStateForCounties) {
          setActiveStateForCounties(stateName);
        }
      }
    } catch (error) {
      console.error('Error fetching counties:', error);
      toast.error('Failed to fetch counties');
    } finally {
      setIsLoading(false);
    }
  };

  const removeState = (stateToRemove: string) => {
    setProviderState(prev => prev.filter(state => state !== stateToRemove));
    if (activeStateForCounties === stateToRemove) {
      setActiveStateForCounties(providerState[0] || '');
    }
  };

  const getProviderTypeId = (typeName: string): number => {
    const typeMap: { [key: string]: number } = {
      "ABA Therapy": 1,
      "Autism Evaluation": 2,
      "Speech Therapy": 3,
      "Occupational Therapy": 4,
    };
    return typeMap[typeName] || 1;
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Ensure we preserve the current locations and don't overwrite them
      const currentLocations = locations || currentProvider?.attributes?.locations || [];
      
      const updatedAttributes = {
        ...editedProvider,
        provider_type: selectedProviderTypes.map(type => ({
          id: type.id,
          name: type.name
        })),
        insurance: selectedInsurances,
        counties_served: selectedCounties,
        locations: currentLocations, // Explicitly preserve locations
        states: providerState,
        services: currentLocations.map(location => location.services || []).flat(),
      };

      console.log('ProviderEdit: Saving provider with data:', {
        providerId: loggedInProvider.id,
        locations: currentLocations,
        providerTypes: selectedProviderTypes,
        insurance: selectedInsurances,
        counties: selectedCounties
      });

      const requestBody = {
        data: [{
          id: loggedInProvider.id,
          type: "provider",
          attributes: updatedAttributes,
        }],
      };

      console.log('ProviderEdit: Request body being sent:', requestBody);

      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${loggedInProvider.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('ProviderEdit: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ProviderEdit: Backend error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('ProviderEdit: Server success response:', responseData);
      
      // Only call onUpdate if we have valid data
      if (responseData.data?.attributes) {
        onUpdate(responseData.data.attributes);
      }
      
      // Try to refresh data, but don't fail if it doesn't work
      try {
        await refreshProviderData();
      } catch (refreshError) {
        console.warn('ProviderEdit: Error refreshing data after save:', refreshError);
        // Don't fail the save operation if refresh fails
      }
      
      // Show success toast only after everything is complete
      toast.success("Changes saved successfully!");
      return true;
    } catch (error) {
      console.error('ProviderEdit: Error saving changes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save changes: ${errorMessage}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderCardClick = (provider: ProviderAttributes) => {
    // Get locations filtered by selected state
    const stateLocations = selectedStateAbbr && selectedStateAbbr !== 'none'
      ? provider.locations.filter(loc => loc.state?.toUpperCase() === selectedStateAbbr.toUpperCase())
      : provider.locations;

    // Use the first matching location, or fall back to the first location if none match
    const primaryLocation = stateLocations[0] || provider.locations[0];

    const address = primaryLocation
      ? `${primaryLocation.address_1 || ""} ${primaryLocation.address_2 || ""}, ${primaryLocation.city || ""}, ${primaryLocation.state || ""} ${primaryLocation.zip || ""}`.trim()
      : "Address not available";

    setMapAddress(address);
    setSelectedAddress(address);
  };

  const handleViewOnMapClick = (address: string) => {
    setMapAddress(address);
    setSelectedAddress(address);
  };

  const renderViewOnMapButton = (provider: ProviderAttributes) => {
    // Get locations filtered by selected state
    const stateLocations = selectedStateAbbr && selectedStateAbbr !== 'none'
      ? provider.locations.filter(loc => loc.state?.toUpperCase() === selectedStateAbbr.toUpperCase())
      : provider.locations;

    // Use the first matching location, or fall back to the first location if none match
    const primaryLocation = stateLocations[0] || provider.locations[0];
    const isAddressAvailable = primaryLocation?.address_1;

    return (
      <button
        className={`view-on-map-button ${!isAddressAvailable ? "disabled" : ""}`}
        onClick={() => {
          const fullAddress = `${primaryLocation.address_1 || ""} ${primaryLocation.address_2 || ""}, ${primaryLocation.city || ""}, ${primaryLocation.state || ""} ${primaryLocation.zip || ""}`.trim();
          handleViewOnMapClick(fullAddress);
        }}
        disabled={!isAddressAvailable}
      >
        View on Map
      </button>
    );
  };

  if (!currentProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No provider data available</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderSessionWarning = () => {
    if (sessionTimeLeft && sessionTimeLeft <= 300) {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            Session expires in: {Math.floor(sessionTimeLeft / 60)}:
            {(sessionTimeLeft % 60).toString().padStart(2, "0")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      
      {/* Loading overlay for save operations */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-700">Saving changes...</span>
            </div>
          </div>
        </div>
      )}
      
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          handleShownModal={handleShownModal}
        />
      )}

      {renderSessionWarning()}

      {isCountiesModalOpen && (
        <CountiesModal
          isOpen={isCountiesModalOpen}
          onClose={() => setIsCountiesModalOpen(false)}
          selectedCounties={selectedCounties}
          onCountiesChange={setSelectedCounties}
          availableCounties={availableCounties}
          currentState={activeStateForCounties}
          states={providerState}
          onStateChange={setActiveStateForCounties}
        />
      )}

      {isInsuranceModalOpen && (
        <InsuranceModal
          isOpen={isInsuranceModalOpen}
          onClose={() => setIsInsuranceModalOpen(false)}
          selectedInsurances={selectedInsurances}
          onInsurancesChange={(insurances) => {
            setSelectedInsurances(insurances);
            setIsInsuranceModalOpen(false);
          }}
          providerInsurances={selectedInsurances}
        />
      )}

      <div className="h-screen bg-gray-100 flex flex-col">
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
                  <span className="text-lg font-semibold">Provider Panel</span>
                </div>
                <button className="md:hidden" onClick={() => setIsOpen(false)}>
                  <X className="ml-2 w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 flex flex-col justify-center gap-4 py-2 px-4">
              <button
                onClick={() => setSelectedTab("dashboard")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200 md:flex hidden
                  ${
                    selectedTab === "dashboard"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <BarChart className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </button>

              <button
                onClick={() => setSelectedTab("edit")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200 md:flex hidden
                  ${
                    selectedTab === "edit"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Basic Details</span>
              </button>

              <button
                onClick={() => setSelectedTab("create")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200 md:flex hidden
                  ${
                    selectedTab === "create"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="text-sm">Create Location</span>
              </button>

              <button
                onClick={() => setSelectedTab("details")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200 md:flex hidden
                  ${
                    selectedTab === "details"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Provider Services</span>
              </button>

              <button
                onClick={() => setSelectedTab("coverage")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200 md:flex hidden
                  ${
                    selectedTab === "coverage"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Coverage Area</span>
              </button>

              <button
                onClick={() => setSelectedTab("insurance")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200 md:flex hidden
                  ${
                    selectedTab === "insurance"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Insurance</span>
              </button>
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-gray-700 hover:cursor-pointer hover:text-gray-900 w-full px-3 py-2 text-sm"
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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <button
                        className="md:hidden p-1.5 hover:bg-gray-100 hover:cursor-pointerrounded-lg hover:cursor-pointer"
                        onClick={() => setIsOpen(true)}
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                      <h1 className="text-lg font-semibold">
                        {selectedTab === "dashboard" && "Provider Dashboard"}
                        {selectedTab === "edit" && "Edit Location"}
                        {selectedTab === "create" && "Create New Location"}
                        {selectedTab === "billing" && "Billing Management"}
                      </h1>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {currentProvider.attributes.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated:{" "}
                        {moment(currentProvider.attributes.updated_last).format(
                          "MM/DD/YYYY"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {selectedTab === "dashboard" && (
                <Dashboard provider={currentProvider} />
              )}
              {selectedTab === "edit" && (
                <EditLocation
                  provider={currentProvider}
                  onUpdate={handleProviderUpdate}
                />
              )}
              {selectedTab === "create" && (
                <CreateLocation
                  provider={currentProvider}
                  onLocationCreated={handleProviderUpdate}
                  setSelectedTab={setSelectedTab}
                />
              )}
              {selectedTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Billing Management
                    </h2>
                    <p className="text-gray-600">
                      Billing features coming soon...
                    </p>
                  </div>
                </div>
              )}
              {selectedTab === "details" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Provider Details</h2>
                    
                    {/* Provider Types */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Provider Types</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(selectedProviderTypes || []).map((type) => (
                          <div key={type?.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                            <span>{type?.name || 'Unknown'}</span>
                            <X 
                              className="ml-2 w-4 h-4 cursor-pointer" 
                              onClick={() => setSelectedProviderTypes(prev => prev.filter(t => t.id !== type.id))}
                            />
                          </div>
                        ))}
                      </div>
                      <select
                        onChange={(e) => {
                          const type = e.target.value;
                          if (!selectedProviderTypes.some(t => t.name === type)) {
                            setSelectedProviderTypes(prev => [...prev, {
                              id: getProviderTypeId(type),
                              name: type
                            }]);
                          }
                        }}
                        className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300"
                      >
                        <option value="">Add a provider type...</option>
                        {["ABA Therapy", "Autism Evaluation", "Speech Therapy", "Occupational Therapy"]
                          .filter(type => !selectedProviderTypes.some(t => t.name === type))
                          .map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Save and Discard Buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedProviderTypes(loggedInProvider.attributes.provider_type || []);
                        toast.info("Provider types changes discarded");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={async () => {
                        await handleSaveChanges();
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
              {selectedTab === "provider-types" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Provider Types</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(selectedProviderTypes || []).map((type) => (
                        <div key={type?.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {type?.name || 'Unknown'}
                          <button
                            onClick={() => setSelectedProviderTypes(prev => prev.filter(t => t.id !== type.id))}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <select
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value=""
                      onChange={(e) => {
                        const typeName = e.target.value;
                        if (typeName && !selectedProviderTypes.some(t => t.name === typeName)) {
                          setSelectedProviderTypes(prev => [...prev, {
                            id: getProviderTypeId(typeName),
                            name: typeName
                          }]);
                        }
                      }}
                    >
                      <option value="">Add provider type...</option>
                      {["ABA Therapy", "Autism Evaluation", "Speech Therapy", "Occupational Therapy"]
                        .filter(type => !selectedProviderTypes.some(t => t.name === type))
                        .map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
              {selectedTab === "coverage" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Coverage Area</h2>
                    
                    {/* States Section */}
                    <div className="space-y-4">
                      {/* Selected States Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Coverage States</label>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        ) : (
                          <>
                            {providerState.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {providerState.map((stateName) => (
                                  <div 
                                    key={stateName} 
                                    className={`px-3 py-1 rounded-full text-sm flex items-center cursor-pointer justify-between
                                      ${activeStateForCounties === stateName ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
                                  >
                                    <span 
                                      onClick={() => {
                                        const stateData = availableStates.find(s => s.attributes.name === stateName);
                                        if (stateData) {
                                          setActiveStateForCounties(activeStateForCounties === stateName ? '' : stateName);
                                          if (activeStateForCounties !== stateName) {
                                            fetchCountiesByState(stateData.id).then(counties => {
                                              setAvailableCounties(prev => {
                                                const filtered = prev.filter(c => c.attributes.state !== stateName);
                                                return [...filtered, ...counties];
                                              });
                                            });
                                          }
                                        }
                                      }}
                                    >
                                      {stateName}
                                    </span>
                                    <X 
                                      className="ml-2 w-4 h-4 cursor-pointer" 
                                      onClick={() => {
                                        setProviderState(prev => prev.filter(s => s !== stateName));
                                        setSelectedCounties(prev => prev.filter(c => c.state !== stateName));
                                        if (activeStateForCounties === stateName) {
                                          setActiveStateForCounties('');
                                        }
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm mb-4">No states selected yet. Select states from the dropdown below.</p>
                            )}

                            {/* Add new state dropdown */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {providerState.length > 0 ? 'Add More States' : 'Select States'}
                              </label>
                              <select
                                onChange={async (e) => {
                                  const selectedStateName = e.target.value;
                                  if (selectedStateName && !providerState.includes(selectedStateName)) {
                                    const stateData = availableStates.find(s => s.attributes.name === selectedStateName);
                                    if (stateData) {
                                      setActiveStateForCounties(selectedStateName);
                                      setProviderState(prev => [...prev, selectedStateName]);
                                      const counties = await fetchCountiesByState(stateData.id);
                                      setAvailableCounties(prev => {
                                        const filtered = prev.filter(c => c.attributes.state !== selectedStateName);
                                        return [...filtered, ...counties];
                                      });
                                    }
                                  }
                                  e.target.value = ''; // Reset select after choosing
                                }}
                                className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                value=""
                                disabled={isLoading}
                              >
                                <option value="">
                                  {isLoading 
                                    ? 'Loading states...' 
                                    : availableStates.length === providerState.length 
                                      ? 'All states selected' 
                                      : 'Select a state...'}
                                </option>
                                {!isLoading && availableStates
                                  .filter(state => !providerState.includes(state.attributes.name))
                                  .map(state => (
                                    <option key={state.id} value={state.attributes.name}>
                                      {state.attributes.name}
                                    </option>
                                  ))
                                }
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Counties Section */}
                    {activeStateForCounties && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Counties in {activeStateForCounties}</h3>
                        <div className="flex flex-wrap gap-2">
                          {availableCounties
                            .filter(county => county.attributes.state === activeStateForCounties)
                            .map(county => {
                              const isSelected = selectedCounties.some(c => c.county_id === county.id);
                              return (
                                <div
                                  key={county.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      const remaining = selectedCounties.filter(c => c.county_id !== county.id);
                                      if (!remaining.some(c => c.state === activeStateForCounties)) {
                                        setSelectedCounties(prev => [...prev.filter(c => c.state !== activeStateForCounties), {
                                          county_id: 0,
                                          county_name: "Contact Us",
                                          state: activeStateForCounties
                                        }]);
                                      } else {
                                        setSelectedCounties(remaining);
                                      }
                                    } else {
                                      setSelectedCounties(prev => [...prev.filter(c => 
                                        !(c.state === activeStateForCounties && c.county_name === "Contact Us")
                                      ), {
                                        county_id: county.id,
                                        county_name: county.attributes.name,
                                        state: county.attributes.state
                                      }]);
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm cursor-pointer flex items-center justify-between
                                    ${isSelected 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                  <span>{county.attributes.name}</span>
                                  {isSelected && (
                                    <X className="h-4 w-4 ml-2" />
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save and Discard Buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setProviderState(loggedInProvider.states || []);
                        setSelectedCounties(loggedInProvider.attributes.counties_served || []);
                        setActiveStateForCounties('');
                        toast.info("Coverage area changes discarded");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={async () => {
                        await handleSaveChanges();
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
              {selectedTab === "insurance" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Insurance Coverage</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedInsurances.map((insurance) => (
                        <div key={insurance.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {insurance.name}
                          <X 
                            className="ml-2 w-4 h-4 cursor-pointer" 
                            onClick={() => {
                              const updatedInsurance = selectedInsurances.filter(i => i.id !== insurance.id) || [];
                              setSelectedInsurances(updatedInsurance);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInsuranceModalOpen(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Edit Insurance Coverage
                    </button>
                  </div>

                  {/* Save and Discard Buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedInsurances(loggedInProvider.attributes.insurance || []);
                        toast.info("Insurance changes discarded");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={async () => {
                        await handleSaveChanges();
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderEdit;
