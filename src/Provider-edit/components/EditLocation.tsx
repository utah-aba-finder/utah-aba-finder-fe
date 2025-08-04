import React, { FC, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Building2, MapPin, Globe, Mail, DollarSign, Clock, Video, Home, Stethoscope, Languages, X } from "lucide-react";
import moment from "moment";
import InsuranceModal from "../InsuranceModal";
import CountiesModal from "../CountiesModal";
import { ProviderData, ProviderAttributes, Insurance, CountiesServed, Location, StateData, CountyData, Service } from "../../Utility/Types";
import { fetchStates, fetchCountiesByState, validateLogoFile, uploadProviderLogo, removeProviderLogo } from "../../Utility/ApiCall";
import { getAdminAuthHeader } from "../../Utility/config";

interface EditLocationProps {
  provider: ProviderData;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
}

interface ApiError {
  message: string;
  status?: number;
}

const EditLocation: FC<EditLocationProps> = ({ provider, onUpdate }) => {
  
  const [formData, setFormData] = useState<ProviderAttributes>(
    provider.attributes
  );
  const [locations, setLocations] = useState<Location[]>(
    (provider.attributes.locations || []).map((location: Location) => ({
      ...location,
      services: location.services || []
    }))
  );

  // Ensure locations are properly initialized when provider changes
  useEffect(() => {
    const updatedLocations = (provider.attributes.locations || []).map((location: Location) => ({
      ...location,
      services: location.services || []
    }));
    
    setLocations(updatedLocations);
    setFormData(provider.attributes);
    setSelectedInsurances(provider.attributes.insurance || []);
    setSelectedCounties(provider.attributes.counties_served || []);
  }, [provider]);
  
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>(
    provider.attributes.insurance || []
  );
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    provider.attributes.counties_served || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);

  const handleCancel = () => {
    setFormData(provider.attributes);
    setLocations((provider.attributes.locations || []).map((location: Location) => ({
      ...location,
      services: location.services || []
    })));
    setSelectedInsurances(provider.attributes.insurance || []);
    setSelectedCounties(provider.attributes.counties_served || []);
    toast.info("Changes have been reverted");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const provider_type = formData.provider_type?.[0]
        ? [
            {
              id: formData.provider_type[0].id || 0,
              name: formData.provider_type[0].name || "",
            },
          ]
        : [];

      const requestBody = {
        data: {
          attributes: {
            ...formData,
            id: provider.attributes.id,
            provider_type,
            insurance: selectedInsurances,
            counties_served: selectedCounties,
            locations: locations.map((location) => ({
              ...location,
              id: location.id || null,
            })),
            password: provider.attributes.password,
            username: provider.attributes.username,
            status: formData.status || provider.attributes.status,
          },
        },
      };

      console.log('Saving location changes for provider:', {
        providerId: provider.id,
        method: 'PATCH',
        authHeader: provider.id.toString()
      });

      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${provider.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            'Authorization': provider.id.toString(),
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update provider`);
      }

      const responseData = await response.json();

      // Only refresh data if the save was successful
      try {
        const refreshResponse = await fetch(
          `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${provider.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              'Authorization': provider.id.toString(),
            },
          }
        );

        if (!refreshResponse.ok) {

          // Don't throw error here, just log warning
        } else {
          const refreshedData = await refreshResponse.json();
          if (refreshedData.data?.[0]?.attributes) {
            setFormData(refreshedData.data[0].attributes);
            setSelectedInsurances(refreshedData.data[0].attributes.insurance || []);
            setSelectedCounties(
              refreshedData.data[0].attributes.counties_served || []
            );
            setLocations((refreshedData.data[0].attributes.locations || []).map((location: Location) => ({
              ...location,
              services: location.services || []
            })));

            // Only call onUpdate if we have valid data
            onUpdate(refreshedData.data[0].attributes);
          }
        }
      } catch (refreshError) {

        // Don't fail the save operation if refresh fails
      }

      // Show success toast only after everything is complete
      toast.success("Changes saved successfully!");
    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : "Failed to update provider";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceChange = (locationIndex: number, service: Service) => {
    const newLocations = [...locations];
    const locationServices = newLocations[locationIndex].services || [];
    
    const serviceExists = locationServices.some(s => s.id === service.id);
    if (serviceExists) {
      newLocations[locationIndex].services = locationServices.filter(s => s.id !== service.id);
    } else {
      newLocations[locationIndex].services = [...locationServices, service];
    }
    
    setLocations(newLocations);
  };

  useEffect(() => {
    setFormData({
      ...provider.attributes,
      // Initialize new fields with defaults if they don't exist
      in_home_only: provider.attributes.in_home_only || false,
      service_delivery: provider.attributes.service_delivery || {
        in_home: false,
        in_clinic: false,
        telehealth: false
      }
    });
    setLocations((provider.attributes.locations || []).map((location: Location) => ({
      ...location,
      services: location.services || []
    })));
    setSelectedInsurances(provider.attributes.insurance || []);
    setSelectedCounties(provider.attributes.counties_served || []);
  }, [provider.attributes]);

  useEffect(() => {
    const loadStatesAndCounties = async () => {
      try {
        const states = await fetchStates();
        setAvailableStates(states);
        
        if (provider.states && provider.states[0]) {
          const selectedState = states.find(
            state => state.attributes.name === provider.states[0]
          );
          
          if (selectedState) {
            const counties = await fetchCountiesByState(selectedState.id);
            setAvailableCounties(counties);
          }
        }
      } catch (error) {

        toast.error("Failed to load location data");
      }
    };
    loadStatesAndCounties();
  }, [provider.states]);

  return (
    <div className="w-full overflow-x-hidden relative">
      {/* Loading overlay */}
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
      
      <div className="px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Editing: <span className="text-blue-600">{formData.name}</span>
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {moment(formData.updated_last).format("MM/DD/YYYY")}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                activeTab === "basic"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                activeTab === "locations"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Locations
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                activeTab === "services"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Services & Coverage
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <form className="space-y-6">
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
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                    />
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
                        value={formData.website || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        className="block w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
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
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="block w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Logo
                    </label>
                    <div className="space-y-2">
                      {/* Current logo display */}
                      {formData.logo && (
                        <div className="flex items-center space-x-3 mb-2">
                          <img 
                            src={formData.logo} 
                            alt="Current logo" 
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const result = await removeProviderLogo(provider.id);
                                if (result.success) {
                                  setFormData({ ...formData, logo: null });
                                  toast.success('Logo removed successfully');
                                } else {
                                  toast.error(result.error || 'Failed to remove logo');
                                }
                              } catch (error) {
                                toast.error('Failed to remove logo');
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      
                      {/* File upload input */}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const validation = validateLogoFile(file);
                            if (!validation.isValid) {
                              toast.error(validation.error);
                              return;
                            }
                            
                            try {
                              const result = await uploadProviderLogo(provider.id, file);
                              if (result.success) {
                                if (result.updatedProvider?.attributes) {
                                  setFormData(result.updatedProvider.attributes);
                                  toast.success('Logo uploaded successfully');
                                } else {
                                  // Fallback: refresh provider data to get the new logo URL
                                  const refreshResponse = await fetch(
                                    `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${provider.id}`,
                                    {
                                      headers: {
                                        'Authorization': provider.id.toString(),
                                      },
                                    }
                                  );
                                  
                                  if (refreshResponse.ok) {
                                    const refreshData = await refreshResponse.json();
                                    if (refreshData.data?.[0]?.attributes) {
                                      setFormData(refreshData.data[0].attributes);
                                      toast.success('Logo uploaded successfully');
                                    }
                                  }
                                }
                              } else {

                                toast.error(result.error || 'Failed to upload logo');
                              }
                            } catch (error) {

                              toast.error('Failed to upload logo');
                            }
                          }
                        }}
                        className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                      />
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
                        Location {index + 1}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Location Name
                      </label>
                      <input
                        type="text"
                        value={location.name || ""}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            name: e.target.value,
                          };
                          setLocations(newLocations);
                        }}
                        className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={location.phone || ""}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            phone: e.target.value,
                          };
                          setLocations(newLocations);
                        }}
                        className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={location.address_1 || ""}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            address_1: e.target.value,
                          };
                          setLocations(newLocations);
                        }}
                        className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={location.city || ""}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            city: e.target.value,
                          };
                          setLocations(newLocations);
                        }}
                        className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={location.state || ""}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            state: e.target.value,
                          };
                          setLocations(newLocations);
                        }}
                        className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={location.zip || ""}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            zip: e.target.value,
                          };
                          setLocations(newLocations);
                        }}
                        className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="form-group">
                      <label htmlFor={`location-in-home-waitlist-${index}`}>In-Home Waitlist</label>
                      <p className="text-sm text-gray-500 mb-2">If you don't provide this service please select "No"</p>
                      <select
                        id={`location-in-home-waitlist-${index}`}
                        value={location.in_home_waitlist === true ? "true" : location.in_home_waitlist === false ? "false" : ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            in_home_waitlist: value === "" ? null : value === "true"
                          };
                          setLocations(newLocations);
                        }}
                        required
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor={`location-in-clinic-waitlist-${index}`}>In-Clinic Waitlist</label>
                      <p className="text-sm text-gray-500 mb-2">If you don't provide this service please select "No"</p>
                      <select
                        id={`location-in-clinic-waitlist-${index}`}
                        value={location.in_clinic_waitlist === true ? "true" : location.in_clinic_waitlist === false ? "false" : ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newLocations = [...locations];
                          newLocations[index] = {
                            ...location,
                            in_clinic_waitlist: value === "" ? null : value === "true"
                          };
                          setLocations(newLocations);
                        }}
                        required
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
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
                            size={16}
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
                          value={formData.cost || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, cost: e.target.value })
                          }
                          rows={2}
                          style={{ textIndent: "2rem" }}
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
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
                          value={formData.waitlist || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              waitlist: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                        >
                          <option value="no wait list">No wait list</option>
                          <option value="6 months or less">
                            6 months or less
                          </option>
                          <option value="6 months or more">
                            6 months or more
                          </option>
                          <option value="contact us">Contact us</option>
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
                            value={formData.min_age || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min_age: parseFloat(e.target.value),
                              })
                            }
                            placeholder="Min Age"
                            min="0"
                            step="0.5"
                            className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                          />
                          <span className="mx-2 text-gray-500">to</span>
                          <input
                            type="number"
                            value={formData.max_age || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_age: parseFloat(e.target.value),
                              })
                            }
                            placeholder="Max Age"
                            min="0"
                            step="0.5"
                            className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Spanish Speaking Staff */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Spanish Speaking Staff
                      </label>
                      <div className="relative w-[95%]">
                        <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.spanish_speakers || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              spanish_speakers: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-3 py-2 rounded-lg border cursor-pointer border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Limited">Limited</option>
                          <option value="Contact us">Contact us</option>
                        </select>
                      </div>
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
                        checked={formData.in_home_only || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            in_home_only: e.target.checked,
                            // If in-home only is checked, set service delivery accordingly
                            service_delivery: e.target.checked 
                              ? { in_home: true, in_clinic: false, telehealth: false }
                              : formData.service_delivery || { in_home: false, in_clinic: false, telehealth: false }
                          })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        In-Home Services Only (No physical locations required)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Check this if your provider offers only in-home services without physical clinic locations
                    </p>
                  </div>

                  {/* Service Delivery Checkboxes - Only show if not in-home only */}
                  {!formData.in_home_only && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.service_delivery?.in_home || false}
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
                          checked={formData.service_delivery?.in_clinic || false}
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
                          checked={formData.service_delivery?.telehealth || false}
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

                  {/* Removed duplicate service dropdowns - keeping only the checkboxes above */}
                </div>
              </div>
            </div>
          )}

          {/* Save Changes Button - Always visible */}
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex justify-end space-x-4 bg-white p-4 border-t mt-6 rounded-lg">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel Changes
              </button>
              <button
                onClick={handleSave}
                type="button"
                disabled={isSaving}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#4A6FA5] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocation;
