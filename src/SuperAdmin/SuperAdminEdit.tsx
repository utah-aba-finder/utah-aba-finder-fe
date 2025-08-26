import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  DollarSign,
  Clock,
  Stethoscope,
  Languages,
  X,
  Plus,
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
import { validateLogoFile, uploadProviderLogo } from "../Utility/ApiCall";
import { getSuperAdminAuthHeader } from "../Utility/config";

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
    "ABA Therapy": 115,
    "Autism Evaluation": 201,
    "Speech Therapy": 202,
    "Occupational Therapy": 203,
    "Physical Therapy": 204,
    "Dentists": 301,
    "Orthodontists": 302,
    "Coaching/Mentoring": 401,
    "Therapists": 402,
    "Advocates": 403,
    "Barbers/Hair": 404,
    "Pediatricians": 405,
  };
  return typeMap[typeName] ?? 0; // Return 0 (invalid) for unknown types
};

// Complete list of supported provider types
const PROVIDER_TYPES = [
  "ABA Therapy",
  "Autism Evaluation",
  "Speech Therapy",
  "Occupational Therapy",
  "Physical Therapy",
  "Dentists",
  "Orthodontists",
  "Coaching/Mentoring",
  "Therapists",
  "Advocates",
  "Barbers/Hair",
  "Pediatricians",
];

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
  const [locations, setLocations] = useState<ProviderLocation[]>(
    provider.attributes.locations?.map(location => ({
      ...location,
      services: location.services || []
    })) || []
  );
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
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (provider) {
      setEditedProvider({
        ...provider.attributes,
        // Initialize new fields with defaults if they don't exist
        in_home_only: provider.attributes.in_home_only || false,
        service_delivery: provider.attributes.service_delivery || {
          in_home: false,
          in_clinic: false,
          telehealth: false
        }
      });
      setProviderState(provider.states || []);
      setSelectedCounties(provider.attributes.counties_served || []);
      setSelectedInsurances(provider.attributes.insurance || []);
      const mappedLocations = provider.attributes.locations.map(location => ({
        ...location,
        services: location.services || []
      })) || [];
      setLocations(mappedLocations);
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

  // Address parsing function - automatically splits full address into components
  const parseAddress = (fullAddress: string, locationIndex: number) => {
    if (!fullAddress.trim()) return;
    
    let address = fullAddress.trim();
    address = address.replace(/\n+/g, ', ').replace(/\s+/g, ' ').trim();
    
    // Extract phone number first
    const phoneMatch = address.match(/phone:\s*\(?(\d{3})\)?\s*-?\s*(\d{3})\s*-?\s*(\d{4})/i);
    let phone = '';
    if (phoneMatch) {
      phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
      address = address.replace(phoneMatch[0], '').trim();
    }
    
    // Extract ZIP code
    const zipMatch = address.match(/\b(\d{5}(?:-\d{4})?)\b/);
    let zip = '';
    if (zipMatch) {
      zip = zipMatch[1];
      address = address.replace(zipMatch[0], '').trim();
    }
    
    // Extract state
    const stateMatch = address.match(/\b([A-Z]{2,3})\b/);
    let state = '';
    if (stateMatch) {
      state = stateMatch[1];
      address = address.replace(stateMatch[0], '').trim();
    }
    
    // Clean up any trailing commas
    address = address.replace(/,\s*$/, '').trim();
    
    // Split by commas and process
    const parts = address.split(',').map(part => part.trim()).filter(part => part);
    
    let streetAddress = '';
    let suite = '';
    let city = '';
    let locationName = '';
    
    if (parts.length >= 1) {
      // For your format: "4927 Calloway Dr. Bakersfield CA, 93312"
      // We want: street = "4927 Calloway Dr.", city = "Bakersfield", state = "CA", zip = "93312"
      
      // First part contains both street and city - we need to separate them
      const firstPart = parts[0];
      
      // Find where the street address ends and city begins
      // Look for the last occurrence of a street type word
      const words = firstPart.split(' ');
      let lastStreetTypeIndex = -1;
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (/\b(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|way|pl|place|ct|court)\b/i.test(word)) {
          lastStreetTypeIndex = i;
        }
      }
      
      let streetWords = [];
      let cityWords = [];
      
      if (lastStreetTypeIndex >= 0) {
        // Everything up to and including the street type is street address
        streetWords = words.slice(0, lastStreetTypeIndex + 1);
        // Everything after the street type is city
        cityWords = words.slice(lastStreetTypeIndex + 1);
      } else {
        // Fallback: if no street type found, assume last word is city
        streetWords = words.slice(0, -1);
        cityWords = words.slice(-1);
      }
      
      // Join the words back together
      streetAddress = streetWords.join(' ');
      city = cityWords.join(' ');
    }
    
    // Extract suite/unit from street address
    const suiteMatch = streetAddress.match(/\b(suite|ste|unit|apt|apartment|#)\s*\.?\s*([a-z0-9-]+)\b/i);
    if (suiteMatch) {
      suite = `${suiteMatch[1]} ${suiteMatch[2]}`;
      streetAddress = streetAddress.replace(suiteMatch[0], '').trim();
    }
    
    // Auto-generate location name based on city
    if (city) {
      locationName = `${city} Clinic`;
    } else if (state) {
      locationName = `${state} Clinic`;
    } else {
      locationName = 'Main Clinic';
    }
    
    // Update the locations state
    const updatedLocations = [...locations];
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      address_1: streetAddress,
      address_2: suite,
      city: city,
      state: state,
      zip: zip,
      phone: phone,
      name: locationName
    };
    setLocations(updatedLocations);
    
    // Update editedProvider state to trigger re-render
    setEditedProvider(prev => prev ? {
      ...prev,
      locations: updatedLocations
    } : null);
  };

  // Clear all address fields for a location
  const clearAddressFields = (locationIndex: number) => {
    const updatedLocations = [...locations];
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      address_1: null,
      address_2: null,
      city: null,
      state: null,
      zip: null
    };
    
    setLocations(updatedLocations);
    
    toast.info('Address fields cleared', {
      position: "top-right",
      autoClose: 1500,
    });
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
      // Strip null IDs from new locations to prevent validation issues
      const filteredLocations = locations
        .filter(location => 
          location.services && location.services.length > 0 && location.phone
        )
        .map(({ id, in_home_waitlist, in_clinic_waitlist, ...rest }) => {
          const base = {
            ...rest,
            // Set default values for optional fields if they're empty
            name: rest.name || 'Virtual Location',
            address_1: rest.address_1 || null,
            address_2: rest.address_2 || null,
            city: rest.city || null,
            state: rest.state || null,
            zip: rest.zip || null,
            phone: rest.phone!,
            services: rest.services || [],
            // Note: location waitlist fields may not be supported by API
            // Only include if confirmed the API accepts them
          };
          
          // Only include id if it's a real number (existing location)
          return (typeof id === 'number' && id > 0) ? { id, ...base } : base;
        });

      // Build attributes object with only what the API expects
      const attributes: any = {
        ...editedProvider,
        // Remove fields the API doesn't accept
        state: undefined,
        updated_last: undefined,
        // Keep only what API expects
        provider_type: selectedProviderTypes.map(type => ({ id: type.id, name: type.name })),
        insurance: selectedInsurances,
        counties_served: selectedCounties.map(c => ({ 
          county_id: c.county_id, 
          county_name: c.county_name 
        })),
        locations: filteredLocations,
        states: providerState,
        // Remove top-level services array - API may not expect it
        // services: filteredLocations.flatMap(l => l.services || []),
      };

      const requestBody = { data: [{ attributes }] };

      // Use correct endpoint and method per spec
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/providers/${provider.id}`,
        {
          method: "PUT", // PUT per spec, not PATCH
          headers: {
            "Content-Type": "application/json",
            'Authorization': getSuperAdminAuthHeader(), // Use super admin header
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to update provider: ${response.status} - ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }
      
      // Check if response has the expected structure
      if (!responseData?.data?.[0]?.attributes) {
        throw new Error('Invalid response format from server - missing provider data');
      }

      const updatedProvider = responseData.data[0];
      
      // Verify that all locations were saved
      const savedLocations = updatedProvider.attributes.locations || [];
      if (savedLocations.length !== filteredLocations.length) {
        console.warn('⚠️ Some locations may not have been saved properly');
      }
      
      // Pass both the id and attributes to onUpdate
      onUpdate({
        ...updatedProvider.attributes,
        id: provider.id
      });
      
      // Update local state to reflect the changes immediately
      setEditedProvider(prev => prev ? {
        ...prev,
        ...updatedProvider.attributes,
        locations: updatedProvider.attributes.locations || []
      } : null);
      
      // Update local locations state to match what was saved
      if (updatedProvider.attributes.locations) {
        setLocations(updatedProvider.attributes.locations);
      }
      
      // Show success toast only after everything is confirmed successful
      toast.success(`Provider ${editedProvider?.name} updated successfully!`);
      
      // Handle logo upload separately if a file is selected
      if (selectedLogoFile) {
        try {
          console.log('🔑 SuperAdminEdit: Starting logo upload for provider:', provider.id);
          
          // Use the regular provider endpoint with admin authentication
          const adminAuthHeader = getSuperAdminAuthHeader();
          console.log('🔑 SuperAdminEdit: Using super admin auth header for logo upload:', adminAuthHeader);
          
          const logoResult = await uploadProviderLogo(provider.id, selectedLogoFile, adminAuthHeader, true);
          
          if (logoResult.success) {
            toast.success('Logo uploaded successfully');
            setSelectedLogoFile(null);
            
            // Update the local provider state with the new logo URL
            if (logoResult.updatedProvider && logoResult.updatedProvider.data) {
              const updatedProviderData = logoResult.updatedProvider.data[0];
              if (updatedProviderData && updatedProviderData.attributes && updatedProviderData.attributes.logo) {
                // Update the provider object with the new logo
                const updatedProvider = {
                  ...provider,
                  attributes: {
                    ...provider.attributes,
                    logo: updatedProviderData.attributes.logo
                  }
                };
                
                // Call the onUpdate function to update the parent state
                onUpdate(updatedProvider.attributes);
                
                console.log('🔄 SuperAdminEdit: Updated provider logo in local state:', updatedProviderData.attributes.logo);
              }
            }
          } else {
            toast.error(`Logo upload failed: ${logoResult.error}`);
          }
        } catch (logoError) {
          console.error('❌ SuperAdminEdit: Logo upload error:', logoError);
          toast.error('Failed to upload logo');
        }
      }
      
      // Don't redirect - let user stay on edit page to see the updated data
      // if (setSelectedTab) {
      //   setSelectedTab("view");
      // }
    } catch (error) {
      
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
              <div className="flex items-start space-x-6 mb-4">
                {provider.attributes.logo ? (
                  <div className="flex-shrink-0">
                    <img 
                      src={provider.attributes.logo}
                      alt={`${editedProvider.name} logo`}
                      className="w-24 h-24 object-contain rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
        
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-3xl">📷</span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Editing: <span className="text-blue-600">{editedProvider.name}</span>
                  </h1>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">ID: {provider.id}</h2>
                  <p className="text-sm text-gray-500">
                    Last updated:{" "}
                    {editedProvider.updated_last
                      ? moment(editedProvider.updated_last).format("MM/DD/YYYY")
                      : "N/A"}
                  </p>
                </div>
              </div>
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
                            if (!type) return;
                            if (!selectedProviderTypes.some(t => t.name === type)) {
                              const id = getProviderTypeId(type);
                              if (id === 0) {
                                toast.error(`Unknown provider type: ${type}`);
                                return;
                              }
                              setSelectedProviderTypes(prev => [...prev, { id, name: type }]);
                            }
                          }}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300"
                        >
                          <option value="">Add a provider type...</option>
                          {PROVIDER_TYPES
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
                          Logo
                        </label>
                        <div className="space-y-2">
                          {/* File upload input */}
                          <div className="space-y-4">
                            <div className="relative group">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/gif"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const validation = validateLogoFile(file);
                                    if (!validation.isValid) {
                                      toast.error(validation.error);
                                      return;
                                    }
                                    setSelectedLogoFile(file);
                                    toast.success('Logo file selected');
                                  }
                                }}
                                className="w-full px-4 py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 transition-all duration-200 group-hover:bg-blue-50 group-hover:border-blue-400"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-3xl mb-2">📁</div>
                                <span className="text-gray-600 text-sm font-medium">Click to select logo file</span>
                                <span className="text-gray-400 text-xs mt-1">or drag and drop</span>
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Choose Logo File
                              </button>
                            </div>
                          </div>
                          {selectedLogoFile && (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="text-green-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-green-800">Selected: {selectedLogoFile.name}</span>
                                  <span className="text-xs text-green-600 block">{(selectedLogoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedLogoFile(null)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Supported formats: PNG, JPEG, GIF. Max size: 5MB
                          </p>
                        </div>
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

                        {/* Address Parser - Paste Full Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            🚀 Quick Address Entry - Paste Full Address
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Paste full address from Google Maps, business listing, etc..."
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              onBlur={(e) => parseAddress(e.target.value, index)}
                            />
                            <button
                              type="button"
                              onClick={() => clearAddressFields(index)}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                              title="Clear all address fields"
                            >
                              Clear
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Paste a full address like: "123 Main St, Suite 100, Salt Lake City, UT 84101"
                          </p>
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
                              <option value="">Select waitlist status</option>
                              <option value="Currently accepting clients">Currently accepting clients</option>
                              <option value="Short waitlist">Short waitlist</option>
                              <option value="Long waitlist">Long waitlist</option>
                              <option value="Not accepting new clients">Not accepting new clients</option>
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
                            
                            {/* In-Home Only Toggle */}
                            <div className="mb-6">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editedProvider.in_home_only || false}
                                  onChange={(e) =>
                                    setEditedProvider({
                                      ...editedProvider,
                                      in_home_only: e.target.checked,
                                      // If in-home only is checked, set service delivery accordingly
                                      service_delivery: e.target.checked 
                                        ? { in_home: true, in_clinic: false, telehealth: false }
                                        : editedProvider.service_delivery || { in_home: false, in_clinic: false, telehealth: false }
                                    })
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  In-Home Services Only (No physical locations required)
                                </span>
                              </label>
                              <p className="text-xs text-gray-500 mt-1 ml-7">
                                Check this if your provider offers only in-home services without physical clinic locations
                              </p>
                            </div>

                            {/* Service Delivery Checkboxes - Only show if not in-home only */}
                            {!editedProvider.in_home_only && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={editedProvider.service_delivery?.in_home || false}
                                    onChange={(e) =>
                                      setEditedProvider({
                                        ...editedProvider,
                                        service_delivery: {
                                          ...editedProvider.service_delivery,
                                          in_home: e.target.checked
                                        }
                                      })
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <label className="text-sm font-medium text-gray-700">
                                    In-Home Services
                                  </label>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={editedProvider.service_delivery?.in_clinic || false}
                                    onChange={(e) =>
                                      setEditedProvider({
                                        ...editedProvider,
                                        service_delivery: {
                                          ...editedProvider.service_delivery,
                                          in_clinic: e.target.checked
                                        }
                                      })
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <label className="text-sm font-medium text-gray-700">
                                    In-Clinic Services
                                  </label>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={editedProvider.service_delivery?.telehealth || false}
                                    onChange={(e) =>
                                      setEditedProvider({
                                        ...editedProvider,
                                        service_delivery: {
                                          ...editedProvider.service_delivery,
                                          telehealth: e.target.checked
                                        }
                                      })
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <label className="text-sm font-medium text-gray-700">
                                    Telehealth Services
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* Removed duplicate service dropdowns - keeping only the checkboxes above */}
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
                            <option value="Contact us">Contact us</option>
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
