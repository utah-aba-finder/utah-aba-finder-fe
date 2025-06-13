import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {  X, Eye, EyeOff, Building2 } from "lucide-react";
import { CountiesServed, StateData, CountyData, Service } from "../Utility/Types";
import { fetchStates, fetchCountiesByState } from "../Utility/ApiCall";
import "react-toastify/dist/ReactToastify.css";
import emailjs from 'emailjs-com';
import Confetti from 'react-confetti';

interface SignupModalProps {
  handleCloseForm: () => void;
  onProviderCreated: () => void;
}

interface Location {
  id: null;
  name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  services: Service[];
}

const SignupModal: React.FC<SignupModalProps> = ({
  handleCloseForm,
  onProviderCreated,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    state: "",
    provider_type: [] as Service[],
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    registrant_name: "",
    affiliation: "",
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
      },
    ],
    insurances: [] as string[],
    counties_served: [] as CountiesServed[],
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
    status: "pending",
  });

  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProviderInfoSubmitted, setIsProviderInfoSubmitted] = useState(false);

  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [newInsurance, setNewInsurance] = useState('');
  const [stateCounties, setStateCounties] = useState<{ [key: string]: CountyData[] }>({});
  const [selectedState, setSelectedState] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const servicesList = [
    { id: 1, name: "ABA Therapy" },
    { id: 2, name: "Autism Evaluation" },
    { id: 3, name: "Speech Therapy" },
    { id: 4, name: "Occupational Therapy" }
  ] as const;

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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validatePasswordStrength = (password: string): boolean => {
    const hasMinLength = password.length >= 7;
    const hasMaxLength = password.length <= 15;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    
    return hasMinLength && hasMaxLength && hasSpecialChar && hasNumber && hasUpperCase && hasLowerCase;
  };

  const getPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 7 && password.length <= 15,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /[0-9]/.test(password),
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password)
    };
  };

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
        fetchCountiesByState(selectedState.id)
          .then(counties => {
            setAvailableCounties(counties);
            setSelectedCounties([]);
          })
          .catch(error => {
            console.error("Failed to load counties:", error);
            toast.error("Failed to load counties");
          });
      }
    }

    // Check password match and strength when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        if (!validatePasswordStrength(value)) {
          setPasswordError("Password must be 7-15 characters long and contain at least one number and one special character");
        } else if (formData.confirmPassword && value !== formData.confirmPassword) {
          setPasswordError("Passwords do not match");
        } else {
          setPasswordError("");
        }
      } else {
        if (formData.password && value !== formData.password) {
          setPasswordError("Passwords do not match");
        } else if (!validatePasswordStrength(formData.password)) {
          setPasswordError("Password must be 7-15 characters long and contain at least one number and one special character");
        } else {
          setPasswordError("");
        }
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
          services: [] as Service[]
        },
      ],
    }));
  };

  const validateForm = () => {
    // Basic information validation
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.confirmPassword || !formData.website || !formData.registrant_name || !formData.affiliation) {
      toast.error("Please fill out all basic information fields");
      return false;
    }

    // Check password strength
    if (!validatePasswordStrength(formData.password)) {
      toast.error("Password must be 7-15 characters long and contain at least one number and one special character");
      return false;
    }

    // Check provider type
    if (formData.provider_type.length === 0) {
      toast.error("Please select at least one provider type");
      return false;
    }

    // Check locations
    for (const location of formData.locations) {
      if (!location.name || !location.address_1 || !location.city || !location.state || !location.zip || !location.phone) {
        toast.error("Please fill out all required location fields");
        return false;
      }
      if (location.services.length === 0) {
        toast.error("Please select at least one service for each location");
        return false;
      }
    }

    // Check counties
    if (selectedCounties.length === 0) {
      toast.error("Please select at least one county or select Contact Us for counties served");
      return false;
    }

    // Check additional information
    if (!formData.cost || !formData.min_age || !formData.max_age || !formData.waitlist) {
      toast.error("Please fill out all additional information fields");
      return false;
    }

    // Check spanish_speakers separately since it's a select field
    if (!formData.spanish_speakers || formData.spanish_speakers === "") {
      toast.error("Please select whether you have Spanish speaking staff");
      return false;
    }

    return true;
  };

  const handleProviderInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const providerData = {
        name: formData.name,
        provider_type: formData.provider_type.map(type => type.name).join(", "),
        email: formData.email,
        username: formData.username,
        password: formData.password,
        website: formData.website,
        locations: formData.locations.map(location => ({
          ...location,
          services: location.services.map(service => service.name).join(", ")
        })),
        counties: selectedCounties.map(county => `${county.county_name}, ${county.state}`).join(", "),
        insurances: formData.insurances.join(", "),
        cost: formData.cost,
        min_age: formData.min_age,
        max_age: formData.max_age,
        waitlist: formData.waitlist,
        telehealth_services: formData.telehealth_services,
        spanish_speakers: formData.spanish_speakers,
        at_home_services: formData.at_home_services,
        in_clinic_services: formData.in_clinic_services
      };

      await emailjs.send(
        'service_b9y8kte',
        'template_a2x7i2h',
        {
          to_email: 'register@autismserviceslocator.com',
          from_email: formData.email,
          provider_data: JSON.stringify(providerData, null, 2),
          message: `New Provider Registration\n\nProvider Information:\n${JSON.stringify(providerData, null, 2)}`
        },
        '1FQP_qM9qMVxNGTmi'
      );

      toast.success(
        "Provider information submitted successfully! We will review your application and get back to you soon.",
        {
          position: "top-center",
          autoClose: 20000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Reset all form fields
      setFormData({
        id: null,
        name: "",
        state: "",
        provider_type: [] as Service[],
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        registrant_name: "",
        affiliation: "",
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
            services: []
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
        status: "pending",
      });

      // Reset other state variables
      setSelectedCounties([]);
      setSelectedInsurances([]);
      setSelectedStates([]);
      setSelectedState('');
      setPasswordError("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError("");
      setIsProviderInfoSubmitted(true);

      // Close the modal after a delay
      setTimeout(() => {
        handleCloseForm();
      }, 3000);
    } catch (error) {
      console.error("Error submitting provider info:", error);
      setError("There was an error submitting the provider information. Please try again.");
    }
  };

  const handleAddState = async (stateName: string) => {
    if (!selectedStates.includes(stateName)) {
      const selectedState = availableStates.find(state => state.attributes.name === stateName);
      if (selectedState) {
        try {
          const counties = await fetchCountiesByState(selectedState.id);
          setStateCounties(prev => ({
            ...prev,
            [stateName]: counties
          }));
          setSelectedStates(prev => [...prev, stateName]);
          setSelectedState(''); // Reset the select
        } catch (error) {
          console.error("Failed to load counties:", error);
          toast.error("Failed to load counties for selected state");
        }
      }
    }
  };

  const handleAddCounty = (stateName: string, countyName: string) => {
    if (countyName) {
      const county = stateCounties[stateName]?.find(c => c.attributes.name === countyName);
      if (county && !selectedCounties.some(c => c.county_id === county.id)) {
        setSelectedCounties(prev => [...prev, {
          county_id: county.id,
          county_name: county.attributes.name,
          state: stateName
        }]);
        setSelectedCounty(''); // Reset the select
      }
    }
  };

  const handleRemoveState = (stateName: string) => {
    setSelectedStates(prev => prev.filter(s => s !== stateName));
    setSelectedCounties(prev => prev.filter(c => c.state !== stateName));
    setStateCounties(prev => {
      const newStateCounties = { ...prev };
      delete newStateCounties[stateName];
      return newStateCounties;
    });
  };

  const handleRemoveCounty = (index: number) => {
    setSelectedCounties(selectedCounties.filter((_, i) => i !== index));
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

  const handleProviderTypeChange = (service: Service) => {
    const currentTypes = formData.provider_type || [];
    const serviceExists = currentTypes.some(s => s.id === service.id);
    
    if (serviceExists) {
      setFormData(prev => ({
        ...prev,
        provider_type: currentTypes.filter(s => s.id !== service.id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        provider_type: [...currentTypes, service]
      }));
    }
  };

  const handleRemoveLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <ToastContainer />
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-10 mx-auto p-8 border w-[95%] max-w-6xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Provider Registration</h3>
            <button
              onClick={handleCloseForm}
              className="text-gray-400 hover:text-gray-500 bg-transparent border-none"
            >
              <X className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
            </button>
          </div>

          <form onSubmit={handleProviderInfoSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Provider/Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="ABA Solutions"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Provider Type
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.provider_type?.map((service) => (
                      <div
                        key={service.id}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center"
                      >
                        <span>{service.name}</span>
                        <button
                          type="button"
                          onClick={() => handleProviderTypeChange(service)}
                          className="ml-2 border-none bg-transparent"
                        >
                          <X className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <select
                    className="w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    value=""
                    onChange={(e) => {
                      const [id, name] = e.target.value.split('|');
                      if (id && name) {
                        handleProviderTypeChange({ id: parseInt(id), name });
                      }
                    }}
                  >
                    <option value="">Add a provider type...</option>
                    {servicesList
                      .filter(service => !formData.provider_type?.some(s => s.id === service.id))
                      .map(service => (
                        <option key={service.id} value={`${service.id}|${service.name}`}>
                          {service.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Registrant Name
                  </label>
                  <input
                    type="text"
                    name="registrant_name"
                    placeholder="John Doe"
                    value={formData.registrant_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Your Affiliation
                  </label>
                  <input
                    type="text"
                    name="affiliation"
                    placeholder="BCBA/Owner"
                    value={formData.affiliation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Username (Email)
                  </label>
                  <input
                    type="email"
                    name="username"
                    placeholder="john.doe@example.com"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Password
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          passwordError ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 border-none bg-transparent"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium mb-1">Password Requirements:</p>
                      <div className="flex items-center space-x-2">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).length ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).length && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>7-15 characters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).upperCase ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).upperCase && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one uppercase letter</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).lowerCase ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).lowerCase && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one lowercase letter</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).specialChar ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).specialChar && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).number ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).number && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one number</span>
                      </div>
                    </div>
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 border-none bg-transparent"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Locations Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Locations</h3>
              {formData.locations.map((location, index) => (
                <div key={index} className="p-6 border rounded-lg space-y-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Location {index + 1}
                    </h3>
                    {formData.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(index)}
                        className="border-none bg-transparent"
                      >
                        <X className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Location Name"
                      value={location.name}
                      onChange={(e) => handleLocationChange(index, "name", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={location.phone}
                      onChange={(e) => handleLocationChange(index, "phone", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={location.address_1}
                      onChange={(e) => handleLocationChange(index, "address_1", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={location.address_2}
                      onChange={(e) => handleLocationChange(index, "address_2", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={location.city}
                      onChange={(e) => handleLocationChange(index, "city", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="State"
                        value={location.state}
                        onChange={(e) => handleLocationChange(index, "state", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={location.zip}
                        onChange={(e) => handleLocationChange(index, "zip", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="mt-6">
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Services Offered at this Location
                    </label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {location.services?.map((service) => (
                        <div
                          key={service.id}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center"
                        >
                          <span>{service.name}</span>
                          <button
                            type="button"
                            onClick={() => handleServiceChange(index, service)}
                            className="ml-2 border-none bg-transparent"
                          >
                            <X className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <select
                      className="w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      value=""
                      onChange={(e) => {
                        const [id, name] = e.target.value.split('|');
                        if (id && name) {
                          handleServiceChange(index, { id: parseInt(id), name });
                        }
                      }}
                    >
                      <option value="">Add a service...</option>
                      {servicesList
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
              <button
                type="button"
                onClick={addNewLocation}
                className="mt-4 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Another Location
              </button>
            </div>

            {/* States and Counties Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Coverage Area</h3>
              <div className="space-y-6">
                {/* State Selection */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Add States</h4>
                  <div className="flex gap-4">
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a state...</option>
                      {availableStates
                        .filter(state => !selectedStates.includes(state.attributes.name))
                        .map(state => (
                          <option key={state.id} value={state.attributes.name}>
                            {state.attributes.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddState(selectedState)}
                      disabled={!selectedState}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Add State
                    </button>
                  </div>
                </div>

                {/* Selected States and Their Counties */}
                {selectedStates.map(stateName => (
                  <div key={stateName} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">{stateName}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveState(stateName)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove State
                      </button>
                    </div>
                    
                    {/* Counties for this state */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <select
                          value={selectedCounty}
                          onChange={(e) => setSelectedCounty(e.target.value)}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Add counties in {stateName}...</option>
                          {stateCounties[stateName]?.filter(county => 
                            !selectedCounties.some(c => c.county_id === county.id)
                          ).map(county => (
                            <option key={county.id} value={county.attributes.name}>
                              {county.attributes.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddCounty(stateName, selectedCounty)}
                          disabled={!selectedCounty}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          Add County
                        </button>
                      </div>

                      {/* Selected Counties */}
                      <div className="flex flex-wrap gap-2">
                        {selectedCounties
                          .filter(county => county.state === stateName)
                          .map((county, index) => (
                            <div
                              key={county.county_id}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              <span>{county.county_name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCounty(index)}
                                className="ml-2 border-none bg-transparent"
                              >
                                <X className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Insurance</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    placeholder="Enter insurance name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInsurance.trim() && !selectedInsurances.includes(newInsurance.trim())) {
                        setSelectedInsurances(prev => [...prev, newInsurance.trim()]);
                        setNewInsurance('');
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Insurance
                  </button>
                </div>
                
                {selectedInsurances.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedInsurances.map((insurance, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <span>{insurance}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newInsurances = selectedInsurances.filter((_, i) => i !== index);
                            setSelectedInsurances(newInsurances);
                          }}
                          className="ml-2 border-none bg-transparent"
                        >
                          <X className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost</label>
                  <input
                    type="text"
                    name="cost"
                    placeholder="Insurance only or deductible/out of pocket"
                    value={formData.cost}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Age</label>
                  <input
                    type="number"
                    name="min_age"
                    value={formData.min_age}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Age</label>
                  <input
                    type="number"
                    name="max_age"
                    value={formData.max_age}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Waitlist</label>
                  <select
                    name="waitlist"
                    value={formData.waitlist}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select one...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Contact us">Contact us</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Telehealth Services</label>
                  <select
                    name="telehealth_services"
                    value={formData.telehealth_services}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select one...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Contact us">Contact us</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Spanish Speakers</label>
                  <select
                    name="spanish_speakers"
                    value={formData.spanish_speakers}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                   <option value="">Select one...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Contact us">Contact us</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">At-Home Services</label>
                  <select
                    name="at_home_services"
                    value={formData.at_home_services}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select one...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Contact us">Contact us</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">In-Clinic Services</label>
                  <select
                    name="in_clinic_services"
                    value={formData.in_clinic_services}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select one...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Contact us">Contact us</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;