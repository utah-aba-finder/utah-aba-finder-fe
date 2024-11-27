import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast, ToastContainer } from "react-toastify";
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
  MockProviderData,
  ProviderAttributes,
  Insurance,
  CountiesServed,
  Location as ProviderLocation,
} from "../Utility/Types";

interface SuperAdminEditProps {
  provider: MockProviderData;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
  setSelectedTab?: Dispatch<SetStateAction<string>>; 
}

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({
  provider,
  onUpdate,
  setSelectedTab,
}) => {
  const [editedProvider, setEditedProvider] =
    useState<ProviderAttributes | null>(null);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    []
  );
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (provider?.attributes) {
      setEditedProvider(provider.attributes);
      setSelectedCounties(provider.attributes.counties_served || []);
      setSelectedInsurances(provider.attributes.insurance || []);
      setLocations(provider.attributes.locations || []);
      setIsLoading(false);
    }
  }, [provider]);


  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedProvider((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  const handleLocationChange = (
    index: number,
    field: keyof ProviderLocation,
    value: string
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
    };
    setLocations([...locations, newLocation]);
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const handleInsurancesChange = (insurances: Insurance[]) => {
    setSelectedInsurances(insurances);
  };

  const handleCountiesChange = (counties: CountiesServed[]) => {
    setSelectedCounties(counties);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${provider.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            data: [
              {
                id: provider.id,
                type: "provider",
                attributes: {
                  ...editedProvider,
                  insurance: selectedInsurances,
                  counties_served: selectedCounties,
                  locations: locations,
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update provider");

      const updatedProvider = await response.json();
      onUpdate(updatedProvider.data[0].attributes);
      toast.success("Provider updated successfully");
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error("Failed to update provider");
    } finally {
      setIsSaving(false);
    }
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
    <div className="w-full overflow-x-hidden">
      {" "}
      <div className="px-2 sm:px-4 py-6">
        {" "}
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Editing:{" "}
            <span className="text-blue-600">{editedProvider.name}</span>
          </h1>
          <p className="text-sm text-gray-500">
            Last updated:{" "}
            {editedProvider.updated_last
              ? moment(editedProvider.updated_last).format("MM/DD/YYYY")
              : "N/A"}
          </p>
        </div>
        <div className="flex justify-center mb-6">
          <div className="inline-flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {/* Back Button */}
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

            {/* Tab Navigation Buttons */}
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

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Provider Type
                    </label>
                    <select
                      name="provider_type"
                      value={editedProvider.provider_type || ""}
                      onChange={handleInputChange}
                      className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="aba_therapy">ABA Therapy</option>
                      <option value="autism_evaluation">
                        Autism Evaluation
                      </option>
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
                        Location {index + 1}
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
                          handleLocationChange(
                            index,
                            "address_1",
                            e.target.value
                          )
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
                          handleLocationChange(
                            index,
                            "address_2",
                            e.target.value
                          )
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
                          <option value="contact us">Contact Us</option>
                          <option value="no wait list">No wait list</option>
                          <option value="6 months or less">
                            6 months or less
                          </option>
                          <option value="6 months or more">
                            6 months or more
                          </option>
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
                      <div className=" gap-2 w-[95%] items-center">
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
                    {editedProvider.provider_type === "aba_therapy" && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Service Delivery Options
                        </label>
                        <div className="space-y-3 w-[95%]">
                          <div className="relative">
                            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              name="telehealth_services"
                              value={editedProvider.telehealth_services || ""}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">Telehealth Services</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                              <option value="limited">Limited</option>
                            </select>
                          </div>

                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              name="at_home_services"
                              value={editedProvider.at_home_services || ""}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">At-Home Services</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>

                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              name="in_clinic_services"
                              value={editedProvider.in_clinic_services || ""}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">In-Clinic Services</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
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
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="contact-us">Contact Us</option>
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

                    <button
                      type="button"
                      onClick={() => setIsCountiesModalOpen(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      Edit Counties Served
                    </button>
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
                    setSelectedCounties(
                      provider.attributes.counties_served || []
                    );
                    setSelectedInsurances(provider.attributes.insurance || []);
                    setLocations(provider.attributes.locations || []);
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
              providerCounties={provider.attributes.counties_served || []}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default SuperAdminEdit;
