import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  DollarSign,
  Clock,
  Video,
  Home,
  Stethoscope,
  Languages,
  Plus,
  X,
} from "lucide-react";
import moment from "moment";
import InsuranceModal from "../Provider-edit/InsuranceModal";
import CountiesModal from "../Provider-edit/CountiesModal";
import {
  ProviderData,
  ProviderAttributes,
  Insurance,
  CountiesServed,
  Location as ProviderLocation,
  StateData,
  CountyData,
  Service,
} from "../Utility/Types";
import { fetchStates, fetchCountiesByState } from "../Utility/ApiCall";

interface SuperAdminEditProps {
  provider: ProviderData;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
  setSelectedTab?: Dispatch<SetStateAction<string>>;
}

interface ProviderType {
  id: number;
  name: string;
}

const getProviderTypeId = (typeName: string): number => {
  const typeMap: { [key: string]: number } = {
    "ABA Therapy": 1,
    "Autism Evaluation": 2,
    "Speech Therapy": 3,
    "Occupational Therapy": 4,
  };
  return typeMap[typeName] || 1;
};

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({
  provider,
  onUpdate,
  setSelectedTab,
}): JSX.Element => {
  const [editedProvider, setEditedProvider] =
    useState<ProviderAttributes | null>(null);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [providerState, setProviderState] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<ProviderType[]>(
    provider.attributes.provider_type || []
  );
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>(providerState[0] || '');

  useEffect(() => {
    if (provider) {
      setEditedProvider(provider.attributes);
      setProviderState(provider.states || []);
      setSelectedCounties(provider.attributes.counties_served || []);
      setSelectedInsurances(provider.attributes.insurance || []);
      setLocations(provider.attributes.locations.map(location => ({
        ...location,
        services: location.services || []
      })) || []);
      setSelectedProviderTypes(provider.attributes.provider_type || []);
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load states
        const states = await fetchStates();
        setAvailableStates(states);

        // If provider has states, fetch counties for the first state
        if (provider.states?.[0]) {
          const selectedState = states.find(
            (state) => state.attributes.name === provider.states[0]
          );

          if (selectedState) {
            const counties = await fetchCountiesByState(selectedState.id);
            setAvailableCounties(counties);
            setActiveStateForCounties(provider.states[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load states and counties");
      }
    };

    loadInitialData();
  }, [provider.states]);

  useEffect(() => {
    const loadCountiesForState = async () => {
      if (activeStateForCounties && availableStates.length > 0) {
        const selectedState = availableStates.find(
          state => state.attributes.name === activeStateForCounties
        );
        
        if (selectedState) {
          try {
            const counties = await fetchCountiesByState(selectedState.id);
            setAvailableCounties(counties);
          } catch (error) {
            toast.error("Failed to load counties");
          }
        }
      }
    };

    loadCountiesForState();
  }, [activeStateForCounties, availableStates]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "state") {
      const selectedState = availableStates.find(
        state => state.attributes.name === value
      );
      
      if (selectedState) {
        setProviderState([value]); // Update providerState when state is selected
        setEditedProvider(prev => 
          prev ? { ...prev, state: [value] } : null
        );
        
        // Set active state for counties
        setActiveStateForCounties(value);
        
        fetchCountiesByState(selectedState.id)
          .then(counties => {
            setAvailableCounties(counties);
          })
          .catch(error => {
            toast.error("Failed to load counties");
          });
      }
    } else {
      setEditedProvider(prev =>
        prev ? { ...prev, [name]: value } : null
      );
    }
  };

  const handleLocationChange = (
    index: number,
    field: keyof ProviderLocation,
    value: string | Service[] | boolean
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };
    setLocations(updatedLocations);
  };

  const addNewLocation = () => {
    const newLocation: ProviderLocation = {
      id: null,
      name: null,
      address_1: null,
      address_2: null,
      city: null,
      state: null,
      zip: null,
      phone: null,
      services: [],
      in_home_waitlist: null,
      in_clinic_waitlist: null
    };
    setLocations([newLocation, ...locations]);
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    setLocations(updatedLocations);
  };

  const handleInsurancesChange = (insurances: Insurance[]) => {
    setSelectedInsurances(insurances);
  };

  const handleCountiesChange = (counties: CountiesServed[]) => {
    setSelectedCounties(counties);
  };

  const validateLocations = () => {
    for (const location of locations) {
      // If the location has any services, only phone number is required
      if (location.services && location.services.length > 0) {
        if (!location.phone) {
          toast.error(`Please provide a phone number for the location that offers services`);
          return false;
        }
      }
      // If no services are provided at this location, it's optional
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all locations first
    if (!validateLocations()) {
      return;
    }
    
    setIsSaving(true);

    try {
      // Filter out locations that have no services before sending to the server
      const filteredLocations = locations.filter(location => 
        location.services && location.services.length > 0 && location.phone
      ).map(location => ({
        ...location,
        // Set default values for optional fields if they're empty
        name: location.name || 'Virtual Location',
        address_1: location.address_1 || null,
        address_2: location.address_2 || null,
        city: location.city || null,
        state: location.state || null,
        zip: location.zip || null,
        phone: location.phone,
        services: location.services
      }));

      const requestBody = {
        data: [{
          id: provider.id,
          type: "provider",
          attributes: {
            ...editedProvider,
            provider_type: selectedProviderTypes.map(type => ({
              id: type.id,
              name: type.name
            })),
            insurance: selectedInsurances,
            counties_served: selectedCounties,
            locations: filteredLocations,
            states: providerState,
            services: filteredLocations.map(location => location.services).flat(),
          },
        }],
      };

      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${provider.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response text:', responseText);
        throw new Error(`Failed to update provider: ${response.status} - ${responseText}`);
      }

      let responseData;
      toast.success(`Provider ${editedProvider?.name} updated successfully!`);
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      // Check if response has the expected structure
      if (!responseData?.data?.[0]?.attributes) {
        console.error('Invalid response structure:', JSON.stringify(responseData, null, 2));
        throw new Error('Invalid response format from server - missing provider data');
      }

      const updatedProvider = responseData.data[0];
      
      // Verify that all locations were saved
      const savedLocations = updatedProvider.attributes.locations || [];
      if (savedLocations.length !== filteredLocations.length) {
        console.warn(`Location count mismatch. Expected ${filteredLocations.length}, got ${savedLocations.length}`);
      }
      
      onUpdate(updatedProvider.attributes);
      
      if (setSelectedTab) {
        setSelectedTab("view");
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update provider", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: `error-${provider.id}-${Date.now()}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceChange = (locationIndex: number, service: Service) => {
    const updatedLocations = [...locations];
    const locationServices = updatedLocations[locationIndex].services || [];
    
    // Check if service already exists in this location
    const serviceExists = locationServices.some(s => s.id === service.id);
    
    if (serviceExists) {
      // Remove service if it exists
      updatedLocations[locationIndex].services = locationServices.filter(s => s.id !== service.id);
    } else {
      // Add service if it doesn't exist
      updatedLocations[locationIndex].services = [...locationServices, service];
    }
    
    setLocations(updatedLocations);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!editedProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No provider data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="w-full overflow-x-hidden">
          <div className="px-2 sm:px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Editing: <span className="text-blue-600">{editedProvider.name}</span>
              </h1>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">ID:{provider.id}</h2>
              <p className="text-sm text-gray-500">
                Last updated:{" "}
                {editedProvider.updated_last
                  ? moment(editedProvider.updated_last).format("MM/DD/YYYY")
                  : "N/A"}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedTab?.("view")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900 flex items-center space-x-2`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Back to List</span>
                </button>

                <button
                  onClick={() => setActiveTab("basic")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "basic"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab("locations")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "locations"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Locations
                </button>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "services"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Services & Coverage
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px] mx-auto px-4">
                  {/* Provider Details Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Provider Details
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Provider Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editedProvider.name || ""}
                          onChange={handleInputChange}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Provider Types Selection */}
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

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={editedProvider.status || ""}
                          onChange={handleInputChange}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="denied">Denied</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Contact Information
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Website
                        </label>
                        <div className="relative flex items-center w-[95%]">
                          <Globe className="absolute left-3 z-10 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="website"
                            value={editedProvider.website || ""}
                            onChange={handleInputChange}
                            className="block w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Email
                        </label>
                        <div className="relative flex items-center w-[95%]">
                          <Mail className="absolute left-3 z-10 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={editedProvider.email || ""}
                            onChange={handleInputChange}
                            className="block w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Logo URL
                        </label>
                        <input
                          type="text"
                          name="logo"
                          value={editedProvider.logo || ""}
                          onChange={handleInputChange}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "locations" && (
                <div className="max-w-[1200px] mx-auto px-4 space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Provider Locations
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={addNewLocation}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Location
                    </button>
                  </div>

                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Location {index + 1} of {locations.length}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Location Name
                          </label>
                          <input
                            type="text"
                            value={location.name || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "name", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={location.phone || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "phone", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={location.address_1 || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "address_1", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={location.address_2 || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "address_2", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={location.city || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "city", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={location.state || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "state", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={location.zip || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "zip", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            In-Home Waitlist
                          </label>
                          <p className="text-sm text-gray-500 mb-2">If you don't provide this service please select "No"</p>
                          <select
                            value={location.in_home_waitlist === true ? "true" : location.in_home_waitlist === false ? "false" : ""}
                            onChange={(e) =>
                              handleLocationChange(index, "in_home_waitlist", e.target.value === "true")
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select...</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            In-Clinic Waitlist
                          </label>
                          <p className="text-sm text-gray-500 mb-2">If you don't provide this service please select "No"</p>
                          <select
                            value={location.in_clinic_waitlist === true ? "true" : location.in_clinic_waitlist === false ? "false" : ""}
                            onChange={(e) =>
                              handleLocationChange(index, "in_clinic_waitlist", e.target.value === "true")
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select...</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm text-gray-600 mb-2">
                          Services Offered at this Location
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {location.services?.map((service) => (
                            <div
                              key={service.id}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              <span>{service.name}</span>
                              <X 
                                onClick={() => handleServiceChange(index, service)}
                                className="ml-2 hover:text-red-500 p-0 border-0 bg-transparent cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                        <select
                          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value=""
                          onChange={(e) => {
                            const [id, name] = e.target.value.split('|');
                            if (id && name) {
                              handleServiceChange(index, { id: parseInt(id), name });
                            }
                          }}
                        >
                          <option value="">Add a service...</option>
                          {[
                            { id: 1, name: "ABA Therapy" },
                            { id: 2, name: "Autism Evaluation" },
                            { id: 3, name: "Speech Therapy" },
                            { id: 4, name: "Occupational Therapy" }
                          ]
                            .filter(service => !location.services?.some(s => s.id === service.id))
                            .map(service => (
                              <option key={service.id} value={`${service.id}|${service.name}`}>
                                {service.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "services" && (
                <div className="max-w-[1200px] mx-auto px-4 space-y-6">
                  {/* Service Information Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Service Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Cost Information */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Cost Information
                          </label>
                          <div className="relative w-[95%]">
                            <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                              name="cost"
                              value={editedProvider.cost || ""}
                              onChange={handleInputChange}
                              rows={2}
                              style={{ textIndent: "2rem" }}
                              className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Enter cost details..."
                            />
                          </div>
                        </div>

                        {/* Waitlist Status */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Waitlist Status
                          </label>
                          <div className="relative w-[95%]">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              name="waitlist"
                              value={editedProvider.waitlist || ""}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="Contact us">Contact us</option>
                              <option value="No waitlist">No waitlist</option>
                              <option value="6 months or less">6 months or less</option>
                              <option value="6 months or more">6 months or more</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Age Range */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Age Range
                          </label>
                          <div className="gap-2 w-[95%] items-center">
                            <div>
                              <input
                                type="number"
                                name="min_age"
                                value={editedProvider.min_age || ""}
                                onChange={handleInputChange}
                                placeholder="Min Age"
                                min="0"
                                step="0.5"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                              <span className="mx-2 text-gray-500">to</span>
                              <input
                                type="number"
                                name="max_age"
                                value={editedProvider.max_age || ""}
                                onChange={handleInputChange}
                                placeholder="Max Age"
                                min="0"
                                step="0.5"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Service Delivery Options */}
                          <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-600 mb-4">
                              Service Delivery Options
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="relative">
                                <label className="block text-sm text-gray-600 mb-2">Telehealth Services</label>
                                <div className="relative">
                                  <div className="p-1.5 bg-blue-50 rounded absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Video className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <select
                                    name="telehealth_services"
                                    value={editedProvider.telehealth_services || ""}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                  >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Limited">Limited</option>
                                    <option value="Contact Us">Contact Us</option>
                                  </select>
                                </div>
                              </div>

                              <div className="relative">
                                <label className="block text-sm text-gray-600 mb-2">In-Clinic Services</label>
                                <div className="relative">
                                  <div className="p-1.5 bg-blue-50 rounded absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <select
                                    name="in_clinic_services"
                                    value={editedProvider.in_clinic_services || ""}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                  >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Limited">Limited</option>
                                    <option value="Contact Us">Contact Us</option>
                                  </select>
                                </div>
                              </div>

                              <div className="relative">
                                <label className="block text-sm text-gray-600 mb-2">At-Home Services</label>
                                <div className="relative">
                                  <div className="p-1.5 bg-blue-50 rounded absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Home className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <select
                                    name="at_home_services"
                                    value={editedProvider.at_home_services || ""}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                  >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Contact Us">Contact Us</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage & Language Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Languages className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Coverage & Language
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Spanish Speaking Staff */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Spanish Speaking Staff
                        </label>
                        <div className="relative w-[95%]">
                          <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            name="spanish_speakers"
                            value={editedProvider.spanish_speakers || ""}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Contact Us">Contact Us</option>
                          </select>
                        </div>
                      </div>

                      {/* Coverage Buttons */}
                      <div className="space-y-3 w-[95%]">
                        <button
                          type="button"
                          onClick={() => setIsInsuranceModalOpen(true)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DollarSign className="w-5 h-5 mr-2" />
                          Edit Insurance Coverage
                        </button>

                        {/* States Selection */}
                        <div className="mt-4">
                          <label className="block text-sm text-gray-600 mb-2">States</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {providerState.map((state) => (
                              <div 
                                key={state} 
                                className={`px-2 py-1 rounded-md flex items-center cursor-pointer ${
                                  activeStateForCounties === state 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                                onClick={() => setActiveStateForCounties(state)}
                              >
                                <span>{state}</span>
                                <X 
                                  className="ml-2 w-4 h-4 cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent state selection when clicking X
                                    setProviderState(prev => prev.filter(s => s !== state));
                                    if (activeStateForCounties === state) {
                                      setActiveStateForCounties(providerState[0] || '');
                                    }
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <select
                            onChange={(e) => {
                              if (!providerState.includes(e.target.value)) {
                                setProviderState(prev => [...prev, e.target.value]);
                                setActiveStateForCounties(e.target.value);
                              }
                            }}
                            className="block w-full px-3 py-2 rounded-lg border border-gray-300"
                          >
                            <option value="">Add a state...</option>
                            {availableStates.map((state) => (
                              <option key={state.id} value={state.attributes.name}>
                                {state.attributes.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Counties Selection */}
                        <div className="mt-4">
                          <label className="block text-sm text-gray-600 mb-2">
                            Counties Served {activeStateForCounties && `for ${activeStateForCounties}`}
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedCounties
                              .filter(county => {
                                const countyData = availableCounties.find(c => c.id === county.county_id);
                                return countyData?.attributes.state === activeStateForCounties;
                              })
                              .map((county) => (
                                <div key={county.county_id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                                  <span>{county.county_name}</span>
                                  <X 
                                    className="ml-2 w-4 h-4 cursor-pointer" 
                                    onClick={() => {
                                      setSelectedCounties(prev => prev.filter(c => c.county_id !== county.county_id));
                                    }}
                                  />
                                </div>
                            ))}
                          </div>
                          {providerState.length > 0 ? (
                            <select
                              onChange={(e) => {
                                const [id, name] = e.target.value.split('|');
                                if (id && name && !selectedCounties.some(c => c.county_id === parseInt(id))) {
                                  setSelectedCounties(prev => [...prev, { 
                                    county_id: parseInt(id), 
                                    county_name: name 
                                  }]);
                                }
                              }}
                              className="block w-full px-3 py-2 rounded-lg border border-gray-300"
                            >
                              <option value="">Add a {activeStateForCounties} county...</option>
                              {availableCounties
                                .filter(county => 
                                  county.attributes.state === activeStateForCounties &&
                                  !selectedCounties.some(c => c.county_id === county.id)
                                )
                                .map((county) => (
                                  <option key={county.id} value={`${county.id}|${county.attributes.name}`}>
                                    {county.attributes.name}
                                  </option>
                                ))
                              }
                            </select>
                          ) : (
                            <p className="text-sm text-gray-500">Please select a state first</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="max-w-[1200px] mx-auto px-4">
                <div className="flex justify-end space-x-4 bg-white p-4 border-t mt-6 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      if (provider?.attributes) {
                        setEditedProvider(provider.attributes);
                        setSelectedCounties(provider.attributes.counties_served || []);
                        setSelectedInsurances(provider.attributes.insurance || []);
                        setLocations(provider.attributes.locations.map(location => ({
                          ...location,
                          services: location.services || []
                        })) || []);
                        setSelectedProviderTypes(provider.attributes.provider_type || []);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Modals */}
              {isInsuranceModalOpen && (
                <InsuranceModal
                  isOpen={isInsuranceModalOpen}
                  onClose={() => setIsInsuranceModalOpen(false)}
                  selectedInsurances={selectedInsurances}
                  onInsurancesChange={handleInsurancesChange}
                  providerInsurances={provider.attributes.insurance || []}
                />
              )}

              {isCountiesModalOpen && (
                <CountiesModal
                  isOpen={isCountiesModalOpen}
                  onClose={() => setIsCountiesModalOpen(false)}
                  selectedCounties={selectedCounties}
                  onCountiesChange={handleCountiesChange}
                  availableCounties={availableCounties.filter(county => 
                    county.attributes.state === activeStateForCounties
                  )}
                  currentState={activeStateForCounties}
                  states={providerState}
                  onStateChange={setActiveStateForCounties}
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminEdit;
