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
  Globe,
  Mail,
  DollarSign,
  Clock,
  Video,
  Home,
  Languages,
  Plus,
  Briefcase,
} from "lucide-react";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { MockProviderData, ProviderAttributes, Insurance, CountiesServed, Location, StateData, CountyData, ProviderType } from "../Utility/Types";
import { fetchStates, fetchCountiesByState } from "../Utility/ApiCall";
import InsuranceModal from "./InsuranceModal";
import CountiesModal from "./CountiesModal";

interface ProviderEditProps {
  loggedInProvider: MockProviderData;
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
  const [currentProvider, setCurrentProvider] =
    useState<MockProviderData>(loggedInProvider);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const [editedProvider, setEditedProvider] = useState<ProviderAttributes>(loggedInProvider.attributes);
  const [providerState, setProviderState] = useState<string[]>(loggedInProvider.attributes.states || []);
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>(loggedInProvider.attributes.states?.[0] || '');
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    loggedInProvider.attributes.counties_served || []
  );
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<ProviderType[]>(
    loggedInProvider.attributes.provider_type || []
  );
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  useEffect(() => {
    setCurrentProvider(loggedInProvider);
  }, [loggedInProvider]);

  const refreshProviderData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${loggedInProvider.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh provider data");
      }

      const refreshedData = await response.json();
      if (refreshedData.data?.[0]) {
        const oldData = JSON.stringify(currentProvider);
        const newData = JSON.stringify(refreshedData.data[0]);
        
        if (oldData !== newData) {
          setCurrentProvider(refreshedData.data[0]);
          onUpdate(refreshedData.data[0].attributes);
          // Only show success toast if data actually changed
          toast.success("Provider information updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error refreshing provider data:", error);
      toast.error("Failed to refresh provider data");
    } finally {
      setIsLoading(false);
    }
  }, [loggedInProvider.id, onUpdate, currentProvider]);

  const handleLogout = useCallback(() => {
    toast.dismiss("session-warning");
    toast.info("Logging out...", {
      toastId: "logging-out",
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      logout();
      clearProviderData();
    }, 2000);
  }, [logout, clearProviderData]);

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

  useEffect(() => {
    const loadStatesAndCounties = async () => {
      try {
        const states = await fetchStates();
        setAvailableStates(states);

        if (providerState.length > 0) {
          const stateIds = states
            .filter(s => providerState.includes(s.attributes.name))
            .map(s => s.id);
          const countiesPromises = stateIds.map(id => fetchCountiesByState(id));
          const countiesResults = await Promise.all(countiesPromises);
          const allCounties = countiesResults.flat();
          setAvailableCounties(allCounties);
        }
      } catch (error) {
        console.error('Error loading states and counties:', error);
        toast.error('Failed to load states and counties');
      }
    };

    loadStatesAndCounties();
  }, [providerState]);

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
      setIsLoading(true);
      const updatedAttributes = {
        ...editedProvider,
        provider_type: selectedProviderTypes,
        counties_served: selectedCounties,
        states: providerState,
        insurance: currentProvider.attributes.insurance
      };

      await onUpdate(updatedAttributes);
      await refreshProviderData();
      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
      return false;
    } finally {
      setIsLoading(false);
    }
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
      <ToastContainer />
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
          selectedInsurances={currentProvider.attributes.insurance || []}
          onInsurancesChange={(insurances) => {
            setCurrentProvider(prev => ({
              ...prev,
              attributes: {
                ...prev.attributes,
                insurance: insurances
              }
            }));
            setEditedProvider(prev => ({
              ...prev,
              insurance: insurances
            }));
            setIsInsuranceModalOpen(false);
          }}
          providerInsurances={currentProvider.attributes.insurance || []}
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
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedTab("dashboard")}
                    className={`
                      w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
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
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("edit")}
                    className={`
                      w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
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
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("create")}
                    className={`
                      w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
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
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("details")}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        selectedTab === "details" ? "bg-[#4A6FA5] text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Provider Services</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("coverage")}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedTab === "coverage" ? "bg-[#4A6FA5] text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Coverage Area</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("insurance")}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedTab === "insurance" ? "bg-[#4A6FA5] text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Insurance</span>
                  </button>
                </li>
              </ul>
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
                        {selectedProviderTypes.map((type) => (
                          <div key={type.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                            <span>{type.name}</span>
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

                    {/* Add a save button */}
                    <div className="mt-6">
                      <button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedTab === "provider-types" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Provider Types</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedProviderTypes.map((type) => (
                        <div key={type.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                          <span>{type.name}</span>
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
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300"
                    >
                      <option value="">Add a provider type...</option>
                      {["ABA Therapy", "Autism Evaluation", "Speech Therapy", "Occupational Therapy"]
                        .filter(type => !selectedProviderTypes.some(t => t.name === type))
                        .map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))
                      }
                    </select>
                    <div className="mt-6">
                      <button onClick={handleSaveChanges} disabled={isLoading} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedTab === "coverage" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Coverage Area</h2>
                    
                    {/* States Section */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">States</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {providerState.map((state) => (
                          <div
                            key={state}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {state}
                            <button
                              onClick={() => removeState(state)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value=""
                          onChange={(e) => {
                            const state = e.target.value;
                            if (state) handleStateChange(state);
                          }}
                        >
                          <option value="">Select a state</option>
                          {availableStates
                            .filter(state => !providerState.includes(state.attributes.name))
                            .map(state => (
                              <option key={state.id} value={state.attributes.name}>
                                {state.attributes.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Counties Section */}
                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Counties Served</h3>
                        {/* Group counties by state and display them */}
                        {providerState.map(state => (
                          <div key={state} className="mb-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{state}</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {selectedCounties
                                .filter(county => {
                                  const countyData = availableCounties.find(c => c.id === county.county_id);
                                  return countyData?.attributes.state === state;
                                })
                                .map(county => (
                                  <div key={county.county_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    {county.county_name}
                                    <button onClick={() => setSelectedCounties(prev => prev.filter(c => c.county_id !== county.county_id))} className="ml-2 hover:text-red-500">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsCountiesModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <MapPin className="h-4 w-4" />
                        Edit Counties
                      </button>
                    </div>

                    {/* Add a save button */}
                    <div className="mt-6">
                      <button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedTab === "insurance" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Insurance Coverage</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentProvider.attributes.insurance?.map((insurance) => (
                        <div key={insurance.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {insurance.name}
                          <X 
                            className="ml-2 w-4 h-4 cursor-pointer" 
                            onClick={() => {
                              const updatedInsurance = currentProvider.attributes.insurance?.filter(i => i.id !== insurance.id) || [];
                              setCurrentProvider(prev => ({
                                ...prev,
                                attributes: {
                                  ...prev.attributes,
                                  insurance: updatedInsurance
                                }
                              }));
                              setEditedProvider(prev => ({
                                ...prev,
                                insurance: updatedInsurance
                              }));
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
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Add this right after the main content area but before closing divs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4" style={{ marginLeft: '13rem' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                // Reset all changes
                setCurrentProvider(loggedInProvider);
                setSelectedProviderTypes(loggedInProvider.attributes.provider_type || []);
                setSelectedCounties(loggedInProvider.attributes.counties_served || []);
                toast.info("Changes discarded");
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Discard Changes
            </button>
            <button
              onClick={async () => {
                const success = await handleSaveChanges();
                if (success) {
                  toast.success("All changes saved successfully!");
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderEdit;
