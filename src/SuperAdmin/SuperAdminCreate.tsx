import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Building2, MapPin, DollarSign, Stethoscope, Plus, X } from "lucide-react";
import CountiesModal from "../Provider-edit/CountiesModal";
import { CountiesServed, Insurance, StateData, CountyData, Service } from "../Utility/Types";
import InsuranceModal from "../Provider-edit/InsuranceModal";
import { fetchStates, fetchCountiesByState, fetchProviders, validateLogoFile, uploadProviderLogo } from "../Utility/ApiCall";
import { getAdminAuthHeader, getSuperAdminAuthHeader } from "../Utility/config";
import "react-toastify/dist/ReactToastify.css";

interface SuperAdminCreateProps {
  handleCloseForm: () => void;
  onProviderCreated: () => void;
}

const SuperAdminCreate: React.FC<SuperAdminCreateProps> = ({
  handleCloseForm,
  onProviderCreated,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    state: "",
    provider_type: [] as string[],
    email: "",
    password: "",
    confirmPassword: "",
    locations: [
      {
        id: null,
        name: "",
        address_1: "",
        address_2: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        services: [] as Service[],
        in_clinic_waitlist: "",
        in_home_waitlist: ""
      },
    ],
    insurances: [] as string[],
    counties_served: [] as string[],
    website: "",
    cost: "",
    min_age: "",
    max_age: "",
    waitlist: "",
    telehealth_services: "Contact us",
    spanish_speakers: "",
    at_home_services: "Contact us",
    in_clinic_services: "Contact us",
    logo: "",
    status: "",
    // New fields from API update
    in_home_only: false,
    service_delivery: {
      in_home: false,
      in_clinic: false,
      telehealth: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>('');
  const [providerState, setProviderState] = useState<string[]>([]);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<string[]>([]);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await fetchStates();
        setAvailableStates(states);
      } catch (error) {
        toast.error("Failed to load states");
      }
    };
    loadStates();
  }, []);

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
            
            toast.error("Failed to load counties for selected state");
          }
        }
      }
    };

    loadCountiesForState();
  }, [activeStateForCounties, availableStates]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "state") {
      const selectedState = availableStates.find(
        state => state.attributes.name === value
      );
      
      if (selectedState) {
        setProviderState([value]);
        setActiveStateForCounties(value);
        
        fetchCountiesByState(selectedState.id)
          .then(counties => {
            setAvailableCounties(counties);
            setSelectedCounties([]);
          })
          .catch(error => {
            
            toast.error("Failed to load counties");
          });
      }
    }
  };

  const handleLocationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };
    setFormData((prev) => ({ ...prev, locations: updatedLocations }));
  };

  const addNewLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [
        {
          id: null,
          name: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          zip: "",
          phone: "",
          services: [],
          in_clinic_waitlist: "",
          in_home_waitlist: ""
        },
        ...prev.locations
      ],
    }));
  };

  const handleCloseCountiesModal = () => {
    setIsCountiesModalOpen(false);
  };

  const handleCountiesChange = (newCounties: CountiesServed[]) => {
    setSelectedCounties(newCounties);
  };

  const handleOpenInsuranceModal = () => {
    setIsInsuranceModalOpen(true);
  };

  const handleInsurancesChange = (selectedInsuranceNames: Insurance[]) => {
    setSelectedInsurances(selectedInsuranceNames);
  };

  const handleProviderTypeChange = (providerType: string) => {
    if (providerType && !selectedProviderTypes.includes(providerType)) {
      setSelectedProviderTypes(prev => [...prev, providerType]);
      setFormData(prev => ({
        ...prev,
        provider_type: [...prev.provider_type, providerType]
      }));
    }
  };

  const removeProviderType = (providerType: string) => {
    setSelectedProviderTypes(prev => prev.filter(type => type !== providerType));
    setFormData(prev => ({
      ...prev,
      provider_type: prev.provider_type.filter(type => type !== providerType)
    }));
  };

  const handleServiceChange = (locationIndex: number, service: Service) => {
    const updatedLocations = [...formData.locations];
    const locationServices = updatedLocations[locationIndex].services || [];
    
    const serviceExists = locationServices.some(s => s.id === service.id);
    if (serviceExists) {
      updatedLocations[locationIndex].services = locationServices.filter(s => s.id !== service.id);
    } else {
      updatedLocations[locationIndex].services = [...locationServices, service];
    }
    
    setFormData(prev => ({
      ...prev,
      locations: updatedLocations
    }));
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

  const checkForDuplicateProvider = async (providerName: string): Promise<boolean> => {
    try {
      const providers = await fetchProviders();
      const existingProvider = providers.data.find(
        (provider: any) => 
          provider.attributes.name?.toLowerCase().trim() === providerName.toLowerCase().trim()
      );
      return !!existingProvider;
    } catch (error) {
      
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Check for duplicate provider
      const isDuplicate = await checkForDuplicateProvider(formData.name);
      if (isDuplicate) {
        toast.error(`Provider "${formData.name}" already exists. Please use a different name.`);
        setIsSaving(false);
        return;
      }

      // Debug: Log the data being sent
      const requestData = {
        data: [
          {
            type: "provider",
            states: [formData.state],
            attributes: {
              name: formData.name,
              provider_type: formData.provider_type.map((type) => ({
                id: getProviderTypeId(type),
                name: type,
              })),
              locations: formData.locations.map((location) => ({
                id: location.id,
                name: location.name,
                address_1: location.address_1,
                address_2: location.address_2,
                city: location.city,
                state: location.state,
                zip: location.zip,
                phone: location.phone,
                services: location.services.map(service => ({
                  id: service.id,
                  name: service.name
                }))
              })),
              website: formData.website,
              email: formData.email,
              cost: formData.cost,
              insurance: selectedInsurances,
              counties_served: selectedCounties,
              min_age: parseInt(formData.min_age),
              max_age: parseInt(formData.max_age),
              waitlist: formData.waitlist,
              telehealth_services: formData.telehealth_services || "Contact us",
              spanish_speakers: formData.spanish_speakers || "Contact us",
              at_home_services: formData.at_home_services || "Contact us",
              in_clinic_services: formData.in_clinic_services || "Contact us",
              logo: formData.logo,
              status: formData.status,
              // New fields from API update
              in_home_only: formData.in_home_only,
              service_delivery: formData.service_delivery,
            },
          },
        ],
      };

      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers`,
        {
          method: "POST",
                  headers: {
          "Content-Type": "application/json",
                      'Authorization': getAdminAuthHeader(),
        },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "Failed to create provider");
      }

      const responseData = await response.json();

      // Upload logo if selected
      if (selectedLogoFile && responseData.data?.[0]?.id) {

        try {
          // For SuperAdmin, use the admin API key
                  const adminAuthHeader = getSuperAdminAuthHeader();
        const logoResult = await uploadProviderLogo(responseData.data[0].id, selectedLogoFile, adminAuthHeader, true);
          
          if (logoResult.success) {
            toast.success('Logo uploaded successfully');
            
          } else {
            
            toast.warning('Provider created but logo upload failed: ' + logoResult.error);
          }
        } catch (error) {
          
          toast.warning('Provider created but logo upload failed');
        }
      } else {

      }

      // Show success toast after confirming the save was successful
      toast.success(`Provider ${formData.name} created successfully!`);
      onProviderCreated();
      setFormData({
        id: null,
        name: "",
        state: "",
        provider_type: [],
        email: "",
        password: "",
        confirmPassword: "",
        locations: [
          {
            id: null,
            name: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            services: [],
            in_clinic_waitlist: "",
            in_home_waitlist: ""
          },
        ],
        insurances: [],
        counties_served: [],
        website: "",
        cost: "",
        min_age: "",
        max_age: "",
        waitlist: "",
        telehealth_services: "Contact us",
        spanish_speakers: "",
        at_home_services: "Contact us",
        in_clinic_services: "Contact us",
        logo: "",
        status: "",
        // New fields from API update
        in_home_only: false,
        service_delivery: {
          in_home: false,
          in_clinic: false,
          telehealth: false
        }
      });
      setSelectedProviderTypes([]);
      setSelectedLogoFile(null);
      setTimeout(() => {
        handleCloseForm();
      }, 3000);
    } catch (error) {
      
      setError("There was an error creating the provider. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1152px] mx-auto px-2 sm:px-4 py-6">
      

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create New Provider
        </h1>
        <p className="text-sm text-gray-500">
          Fill in the provider details below
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* States and Counties Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Coverage Area
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* States Section */}
            <div className="space-y-4 w-full">
              <div className="w-full">
                <label className="block text-sm text-gray-600 mb-2">States</label>
                <div className="flex flex-wrap gap-2 mb-2 w-full">
                  {providerState.map((state) => (
                    <div 
                      key={state} 
                      className={`px-2 py-1 rounded-md flex items-center cursor-pointer ${
                        activeStateForCounties === state 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={() => {
                        setActiveStateForCounties(state);
                        const stateData = availableStates.find(s => s.attributes.name === state);
                        if (stateData) {
                          fetchCountiesByState(stateData.id).then(counties => {
                            setAvailableCounties(counties);
                          });
                        }
                      }}
                    >
                      <span>{state}</span>
                      <X 
                        className="ml-2 w-4 h-4 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setProviderState(prev => prev.filter(s => s !== state));
                          setSelectedCounties(prev => prev.filter(c => c.state !== state));
                          if (activeStateForCounties === state) {
                            setActiveStateForCounties('');
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    const selectedStateName = e.target.value;
                    if (selectedStateName && !providerState.includes(selectedStateName)) {
                      const stateData = availableStates.find(s => s.attributes.name === selectedStateName);
                      if (stateData) {
                        setActiveStateForCounties(selectedStateName);
                        setProviderState(prev => [...prev, selectedStateName]);
                        fetchCountiesByState(stateData.id).then(counties => {
                          setAvailableCounties(counties);
                        });
                      }
                    }
                    e.target.value = '';
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value=""
                >
                  <option value="">Add a state...</option>
                  {availableStates
                    .filter(state => !providerState.includes(state.attributes.name))
                    .map(state => (
                      <option key={state.id} value={state.attributes.name}>
                        {state.attributes.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="w-full">
                <label className="block text-sm text-gray-600 mb-2">
                  Counties for {activeStateForCounties || 'Select a State'}
                </label>
                <div className="flex flex-wrap gap-2 mb-2 w-full">
                  {selectedCounties
                    .filter(county => county.state === activeStateForCounties)
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
                {activeStateForCounties && (
                  <div className="flex flex-wrap gap-2 mt-2 w-full">
                    {availableCounties
                      .filter(county => 
                        county.attributes.state === activeStateForCounties &&
                        !selectedCounties.some(selected => selected.county_id === county.id)
                      )
                      .map((county) => (
                        <div 
                          key={county.id}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center cursor-pointer hover:bg-blue-50"
                          onClick={() => {
                            setSelectedCounties(prev => [...prev, {
                              county_id: county.id,
                              county_name: county.attributes.name,
                              state: activeStateForCounties
                            }]);
                          }}
                        >
                          <span>{county.attributes.name}</span>
                          <Plus className="ml-2 w-4 h-4" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Section
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleOpenInsuranceModal}
                className="w-[95%] inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-400"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Select Insurances
              </button>
            </div> */}
          </div>
        </div>

        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Provider Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="hover:cursor-text w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Provider Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Provider Type
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedProviderTypes.map((type) => (
                  <div
                    key={type}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <span>{type}</span>
                    <X 
                      onClick={() => removeProviderType(type)}
                      className="ml-2 hover:text-red-500 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value=""
                onChange={(e) => {
                  const selectedType = e.target.value;
                  if (selectedType) {
                    handleProviderTypeChange(selectedType);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Add provider type...</option>
                {[
                  "ABA Therapy",
                  "Autism Evaluation", 
                  "Speech Therapy",
                  "Occupational Therapy"
                ]
                  .filter(type => !selectedProviderTypes.includes(type))
                  .map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Email Address"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="https://"
                onBlur={(e) => {
                  if (
                    !e.target.value.startsWith("https://") &&
                    !e.target.value.startsWith("http://") &&
                    e.target.value.trim() !== ""
                  ) {
                    setFormData((prev) => ({
                      ...prev,
                      website: `https://${e.target.value}`,
                    }));
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Logo
              </label>
              <div className="space-y-2">
                {/* File upload input */}
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
                  className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {selectedLogoFile && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Selected: {selectedLogoFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedLogoFile(null)}
                      className="text-red-600 hover:text-red-800 text-sm"
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

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="" disabled>Select an option</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Locations Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Location
            </button>
          </div>

          {formData.locations.map((location, index) => (
            <div
              key={location.id || index}
              className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Location {index + 1} of {formData.locations.length}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location Name"
                  value={location.name}
                  onChange={(e) =>
                    handleLocationChange(index, "name", e.target.value)
                  }
                  className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 hover:cursor-text focus:ring-blue-400 focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={location.phone}
                  onChange={(e) =>
                    handleLocationChange(index, "phone", e.target.value)
                  }
                  className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 hover:cursor-text focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={location.address_1}
                    onChange={(e) =>
                      handleLocationChange(index, "address_1", e.target.value)
                    }
                    className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 hover:cursor-text focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                    <input 
                    type='text'
                    placeholder='Address Line 2'
                    value={location.address_2}
                    onChange={(e) =>
                      handleLocationChange(index, "address_2", e.target.value)
                    }
                    className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 hover:cursor-text focus:ring-blue-400 focus:border-transparent text-sm"
                    />
                </div>
                <input
                  type="text"
                  placeholder="City"
                  value={location.city}
                  onChange={(e) =>
                    handleLocationChange(index, "city", e.target.value)
                  }
                  className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="State"
                    value={location.state}
                    onChange={(e) =>
                      handleLocationChange(index, "state", e.target.value)
                    }
                    className="w-[90%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={location.zip}
                    onChange={(e) =>
                      handleLocationChange(index, "zip", e.target.value)
                    }
                    className="w-[90%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2">In-Clinic Waitlist</label>
                    <select
                        id={`location-in-home-waitlist-${index}`}
                        value={location.in_clinic_waitlist}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newLocations = [...formData.locations];
                          newLocations[index] = {
                            ...location,
                            in_clinic_waitlist: value
                          };
                          setFormData((prev) => ({ ...prev, locations: newLocations }));
                        }}
                        required
                        className="w-[90%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-2">At-Home Waitlist</label>
                    <select
                        id={`location-in-home-waitlist-${index}`}
                        value={location.in_home_waitlist}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newLocations = [...formData.locations];
                          newLocations[index] = {
                            ...location,
                            in_home_waitlist: value
                          };
                          setFormData((prev) => ({ ...prev, locations: newLocations }));
                        }}
                        required
                        className="w-[90%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
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

        {/* Coverage & Services Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Coverage & Services
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Options */}
            {/* Insurance Section */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleOpenInsuranceModal}
                className="w-[95%] inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-400"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Select Insurances
              </button>
            </div>
            <div className="space-y-4">
            
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Cost Information
                </label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  placeholder="Enter cost details"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Min Age
                  </label>
                  <input
                    type="number"
                    name="min_age"
                    value={formData.min_age}
                    onChange={handleChange}
                    className="w-[90%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Max Age
                  </label>
                  <input
                    type="number"
                    name="max_age"
                    value={formData.max_age}
                    onChange={handleChange}
                    className="w-[90%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    placeholder="99"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            {/* Service Delivery Options */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Waitlist Status
                </label>
                <select
                  name="waitlist"
                  value={formData.waitlist || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                >
                  <option value="" disabled>
                    Select Waitlist Status
                  </option>
                  <option value="Currently accepting clients">Currently accepting clients</option>
                  <option value="Short waitlist">Short waitlist</option>
                  <option value="Long waitlist">Long waitlist</option>
                  <option value="Not accepting new clients">Not accepting new clients</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full">
                  <label className="block text-sm text-gray-600 mb-2">
                    Telehealth Services
                  </label>
                  <select
                    name="telehealth_services"
                    value={formData.telehealth_services || "Contact us"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  >
                    <option value="Contact us">Contact us</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm text-gray-600 mb-2">
                    At-Home Services
                  </label>
                  <select
                    name="at_home_services"
                    value={formData.at_home_services || "Contact us"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  >
                    <option value="Contact us">Contact us</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm text-gray-600 mb-2">
                    In-Clinic Services
                  </label>
                  <select
                    name="in_clinic_services"
                    value={formData.in_clinic_services || "Contact us"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  >
                    <option value="Contact us">Contact us</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Spanish Speaking Staff
                </label>
                <select
                  name="spanish_speakers"
                  value={formData.spanish_speakers}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="contact us">Contact Us</option>
                </select>
              </div>

              {/* New Service Delivery Fields */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Service Delivery Options</h4>
                
                {/* In-Home Only Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.in_home_only}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          in_home_only: e.target.checked,
                          // If in-home only is checked, set service delivery accordingly
                          service_delivery: e.target.checked 
                            ? { in_home: true, in_clinic: false, telehealth: false }
                            : formData.service_delivery
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
                {!formData.in_home_only && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.service_delivery.in_home}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            service_delivery: {
                              ...formData.service_delivery,
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
                        checked={formData.service_delivery.in_clinic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            service_delivery: {
                              ...formData.service_delivery,
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
                        checked={formData.service_delivery.telehealth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            service_delivery: {
                              ...formData.service_delivery,
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
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end rounded-lg space-x-4 bottom-0 bg-white p-4 border-t">
          <button
            type="button"
            onClick={handleCloseForm}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:cursor-pointer text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent hover:cursor-pointer rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              "Create Provider"
            )}
          </button>
        </div>

        {/* Modals */}
        {isInsuranceModalOpen && (
          <InsuranceModal
            isOpen={isInsuranceModalOpen}
            onClose={() => setIsInsuranceModalOpen(false)}
            selectedInsurances={selectedInsurances}
            onInsurancesChange={handleInsurancesChange}
            providerInsurances={selectedInsurances}
          />
        )}

        {isCountiesModalOpen && (
          <CountiesModal
            isOpen={isCountiesModalOpen}
            onClose={handleCloseCountiesModal}
            selectedCounties={selectedCounties}
            onCountiesChange={handleCountiesChange}
            availableCounties={availableCounties}
          />
        )}
      </form>
    </div>
  );
};

export default SuperAdminCreate;
