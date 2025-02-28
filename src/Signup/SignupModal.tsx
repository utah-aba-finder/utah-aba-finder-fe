import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Building2, MapPin, DollarSign, Stethoscope, Plus, X } from "lucide-react";
import CountiesModal from "../Provider-edit/CountiesModal";
import { CountiesServed, Insurance, StateData, CountyData } from "../Utility/Types";
import InsuranceModal from "../Provider-edit/InsuranceModal";
import { fetchStates, fetchCountiesByState } from "../Utility/ApiCall";
import "react-toastify/dist/ReactToastify.css";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ProviderCheckoutForm from './ProviderCheckoutForm';

interface SuperAdminCreateProps {
  handleCloseForm: () => void;
  onProviderCreated: () => void;
  selectedPlan: 'free' | 'sponsor' | 'premium' | null;
}

const stripePromise = loadStripe('pk_live_51QLVtXJCAzcIvuNOwz9neiT1W3VFBfhOO1XwhxF44UsatLhu6ksdsuMqDjIbpnvzV89gidl2qWVbZRTEKxmBZDJE009Ya5sRCx');

const SignupModal: React.FC<SuperAdminCreateProps> = ({
  handleCloseForm,
  onProviderCreated,
  selectedPlan
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    state: "",
    provider_type: "",
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
      },
    ],
    insurances: [] as string[],
    counties_served: [] as string[],
    website: "",
    cost: "",
    min_age: "",
    max_age: "",
    waitlist: "",
    telehealth_services: "",
    spanish_speakers: "",
    at_home_services: "",
    in_clinic_services: "",
    logo: "",
    status: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    []
  );
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  const [isProviderInfoSubmitted, setIsProviderInfoSubmitted] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await fetchStates();
        setAvailableStates(states);
      } catch (error) {
        console.error("Failed to load states:", error);
        toast.error("Failed to load states");
      }
    };
    loadStates();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "state") {
      console.log("Selected state:", value);
      const selectedState = availableStates.find(
        state => state.attributes.name === value
      );
      console.log("Found state object:", selectedState);
      
      if (selectedState) {
        fetchCountiesByState(selectedState.id)
          .then(counties => {
            console.log("Fetched counties:", counties);
            setAvailableCounties(counties);
            setSelectedCounties([]);
          })
          .catch(error => {
            console.error("Failed to load counties:", error);
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
        ...prev.locations,
        {
          id: null,
          name: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          zip: "",
          phone: "",
        },
      ],
    }));
  };

  const handleOpenCountiesModal = () => {
    setIsCountiesModalOpen(true);
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

  const getPlanAmount = () => {
    switch(selectedPlan) {
      case 'sponsor': return 25;
      case 'premium': return 50;
      default: return 0;
    }
  };

  const handleProviderInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProviderInfoSubmitted(true);
    
    // If it's a free plan, submit directly
    if (selectedPlan === 'free') {
      try {
        // Submit provider data to your API
        onProviderCreated();
      } catch (error) {
        console.error('Error creating provider:', error);
        toast.error('Failed to create provider');
      }
    }
    // For paid plans, the checkout form will handle submission after payment
  };

  return (
    <div className="max-w-[1152px] mx-auto px-2 sm:px-4 py-6">
      <ToastContainer />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sign Up - {selectedPlan?.toUpperCase()} Plan
        </h1>
        <p className="text-sm text-gray-500">
          {selectedPlan !== 'free' ? 'Complete payment to continue with registration' : 'Fill in the provider details below'}
        </p>
      </div>

      {/* Show Payment Section First for Paid Plans */}
      {selectedPlan !== 'free' && (
        <div className="payment-section bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <Elements stripe={stripePromise}>
            <ProviderCheckoutForm 
              initialAmount={getPlanAmount()}
              providerData={formData}
              onPaymentSuccess={() => {
                setIsProviderInfoSubmitted(true);
              }}
              onClose={handleCloseForm}
            />
          </Elements>
        </div>
      )}

      {/* Show Provider Info Form only after payment for paid plans, or immediately for free plan */}
      {(selectedPlan === 'free' || isProviderInfoSubmitted) && (
        <form onSubmit={handleProviderInfoSubmit} className="space-y-6">
          <div className="flex justify-end">
            <button className=" hover:text-gray-700 bg-transparent border-none" onClick={handleCloseForm}>
              <X className="w-10 h-10 hover:cursor-pointer text-black-500 hover:text-red-500" />
            </button>
          </div>
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-full flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div >
                <label className="block text-sm text-gray-600 mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="hover:cursor-pointer w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select a state</option>
                  {availableStates.map((state) => (
                    <option key={state.id} value={state.attributes.name}>
                      {state.attributes.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Provider Type
                </label>
                <select
                  name="provider_type"
                  value={formData.provider_type}
                  onChange={handleChange}
                  className="hover:cursor-pointer w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="" disabled>
                    Select Provider Type
                  </option>
                  <option value="ABA Therapy">ABA Therapy</option>
                  <option value="Autism Evaluation">Autism Evaluation</option>
                  <option value="Speech Therapy">Speech Therapy</option>
                  <option value="Occupational Therapy">Occupational Therapy</option>
                </select>
              </div>

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
                <input
                  type="text"
                  name="logo"
                  className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 hover:cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={formData.logo}
                  onChange={handleChange}
                />
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
                  Location {index + 1}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coverage Section */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleOpenCountiesModal}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border hover:cursor-pointer border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-400"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Select Counties
                </button>

                <button
                  type="button"
                  onClick={handleOpenInsuranceModal}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border hover:cursor-pointer border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-400"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Select Insurances
                </button>
              </div>

              {/* Service Options */}
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
                    value={formData.waitlist}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    required
                  >
                    <option value="" disabled>
                      Select Waitlist Status
                    </option>
                    <option value="Contact us">Contact us</option>
                    <option value="No waitlist">No waitlist</option>
                    <option value="6 months or less">6 months or less</option>
                    <option value="6 months or more">6 months or more</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Telehealth Services
                    </label>
                    <select
                      name="telehealth_services"
                      value={formData.telehealth_services}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Limited">Limited</option>
                      <option value="Contact us">Contact us</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      At-Home Services
                    </label>
                    <select
                      name="at_home_services"
                      value={formData.at_home_services}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Limited">Limited</option>
                      <option value="Contact us">Contact us</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      In-Clinic Services
                    </label>
                    <select
                      name="in_clinic_services"
                      value={formData.in_clinic_services}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Limited">Limited</option>
                      <option value="Contact us">Contact us</option>
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
      )}
    </div>
  );
};

export default SignupModal;