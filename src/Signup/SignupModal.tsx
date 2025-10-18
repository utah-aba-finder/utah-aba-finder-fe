import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {  X, Eye, EyeOff } from "lucide-react";
import { CountiesServed, StateData, CountyData, Service } from "../Utility/Types";
import { fetchStates, fetchCountiesByState, fetchPracticeTypes, PracticeType } from "../Utility/ApiCall";
import "react-toastify/dist/ReactToastify.css";
import emailjs from 'emailjs-com';
import Confetti from 'react-confetti';
import ReCAPTCHA from "react-google-recaptcha";

interface SignupModalProps {
  handleCloseForm: () => void;
  onProviderCreated: () => void;
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
    registrant_email: "",
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
        in_home_waitlist: null,
        in_clinic_waitlist: null
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
    in_home_only: false,
    logo: null as File | null
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [practiceTypes, setPracticeTypes] = useState<PracticeType[]>([]);

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
    const loadPracticeTypes = async () => {
      try {
        const response = await fetchPracticeTypes();
        setPracticeTypes(response.data);
      } catch (error) {
        console.error("Failed to load practice types:", error);
        toast.error("Failed to load practice types");
      }
    };
    loadPracticeTypes();
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
    }
  };

  const handleLocationChange = (
    index: number,
    field: string,
    value: string | boolean | null
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
                                     services: [] as Service[],
          in_home_waitlist: null,
          in_clinic_waitlist: null
        },
      ],
    }));
  };

  const validateForm = () => {
    if (!recaptchaValue) {
      toast.error("Please complete the reCAPTCHA verification");
      return false;
    }

    // Basic information validation
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.confirmPassword || !formData.website || !formData.registrant_name || !formData.registrant_email || !formData.affiliation) {
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
      if (!location.phone) {
        toast.error("Please fill at minimum the phone number field");
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
        registrant_name: formData.registrant_name,
        registrant_email: formData.registrant_email,
        affiliation: formData.affiliation,
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
        insurances: selectedInsurances.join(", "),
        cost: formData.cost,
        min_age: formData.min_age,
        max_age: formData.max_age,
        waitlist: formData.waitlist,
        telehealth_services: formData.telehealth_services,
        spanish_speakers: formData.spanish_speakers,
        at_home_services: formData.at_home_services,
        in_clinic_services: formData.in_clinic_services,
        in_home_only: formData.in_home_only,
        logo: formData.logo
      };

      // Format the email message
      const formattedMessage = `
New Provider Registration

BASIC INFORMATION
----------------
Provider/Company Name: ${providerData.name}
Registrant Name: ${providerData.registrant_name}
Registrant Email: ${providerData.registrant_email}  
Affiliation: ${providerData.affiliation}
Provider Type: ${providerData.provider_type}
Email: ${providerData.email}
Username: ${providerData.username}
Password: ${providerData.password}
Website: ${providerData.website}

LOCATIONS
---------
${providerData.locations.map((location, index) => `
Location ${index + 1}:
Name: ${location.name}
Address: ${location.address_1}${location.address_2 ? `, ${location.address_2}` : ''}
City: ${location.city}
State: ${location.state}
ZIP: ${location.zip}
Phone: ${location.phone}
Services: ${location.services}
In-Home Waitlist: ${location.in_home_waitlist || "Not specified"}
In-Clinic Waitlist: ${location.in_clinic_waitlist || "Not specified"}
`).join('\n')}

COVERAGE AREA
------------
Counties Served: ${providerData.counties}

INSURANCE
---------
Accepted Insurances: ${providerData.insurances}

ADDITIONAL INFORMATION
---------------------
Cost: ${providerData.cost}
Age Range: ${providerData.min_age} - ${providerData.max_age}
Waitlist: ${providerData.waitlist}
Telehealth Services: ${providerData.telehealth_services}
Spanish Speakers: ${providerData.spanish_speakers}
At-Home Services: ${providerData.at_home_services}
In-Clinic Services: ${providerData.in_clinic_services}
In-Home Services Only: ${providerData.in_home_only ? "Yes" : "No"}
`;

      // Prepare email data
      const emailData: any = {
        to_email: 'registration@autismserviceslocator.com',
        from_email: formData.email,
        provider_data: formattedMessage,
        message: formattedMessage
      };

      // Add logo if provided
      if (formData.logo) {
        emailData.logo_file = formData.logo;
      }

      await emailjs.send(
        'service_b9y8kte',
        'template_a2x7i2h',
        emailData,
        '1FQP_qM9qMVxNGTmi'
      );

      setShowConfetti(true);
      setShowSuccessModal(true);

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
        registrant_email: "",
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
             services: [],
            in_home_waitlist: null,
            in_clinic_waitlist: null
          },
        ],
        insurances: [],
        counties_served: [],
        website: "",
        cost: "",
        min_age: "",
        max_age: "",
        waitlist: "",
        telehealth_services: "",
        spanish_speakers: "",
        at_home_services: "",
        in_clinic_services: "",
        in_home_only: false,
        logo: null,
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

      // Don't close the modal automatically - let user close it manually
    } catch (error) {
      
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

  const handleAddInsurance = () => {
    if (newInsurance.trim() && !selectedInsurances.includes(newInsurance.trim())) {
      setSelectedInsurances(prev => [...prev, newInsurance.trim()]);
      setNewInsurance('');
    }
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
      
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-2 sm:top-10 mx-auto p-4 sm:p-8 border w-[98%] sm:w-[95%] max-w-6xl shadow-lg rounded-md bg-white mb-20 sm:mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Provider Registration</h3>
            <button
              onClick={handleCloseForm}
              className="text-gray-400 hover:text-gray-500 bg-transparent border-none"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
            </button>
          </div>

          <form onSubmit={handleProviderInfoSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs sm:text-sm flex items-center"
                      >
                        <span>{service.name}</span>
                        <button
                          type="button"
                          onClick={() => handleProviderTypeChange(service)}
                          className="ml-2 border-none bg-transparent"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <select
                    className="w-full sm:w-3/4 rounded-lg border border-gray-300 py-2 px-3 sm:py-2.5 sm:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    value=""
                    onChange={(e) => {
                      const [id, name] = e.target.value.split('|');
                      if (id && name) {
                        handleProviderTypeChange({ id: parseInt(id), name });
                      }
                    }}
                  >
                    <option value="">Add a provider type...</option>
                    {practiceTypes
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
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Registrant Email
                  </label>
                  <input
                    type="email"
                    name="registrant_email"
                    placeholder="john.doe@example.com"
                    value={formData.registrant_email}
                    onChange={handleChange}
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    placeholder="BCBA/Owner/etc"
                    value={formData.affiliation}
                    onChange={handleChange}
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Best Contact Email Address (company email preferred)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="info@aba.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className={`w-full sm:w-3/4 px-3 py-2 rounded-lg border ${
                          passwordError ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 sm:right-14 top-1/2 transform -translate-y-1/2 border-none bg-transparent"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-700" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p className="font-medium mb-1">Password Requirements:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).length ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).length && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>7-15 characters</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).upperCase ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).upperCase && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one uppercase letter</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).lowerCase ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).lowerCase && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one lowercase letter</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full ${getPasswordRequirements(formData.password).specialChar ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {getPasswordRequirements(formData.password).specialChar && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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
                      className={`w-full sm:w-3/4 px-3 py-2 rounded-lg border ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 sm:right-14 top-1/2 transform -translate-y-1/2 border-none bg-transparent"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-700" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-700" />
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
                    className="w-full sm:w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Company Logo (Optional)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPEG, PNG, GIF. Maximum file size: 5MB.
                </p>
                {formData.logo && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Logo selected: {formData.logo.name}
                  </p>
                )}
              </div>
            </div>

            {/* In-Home Services Only Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Service Delivery Type</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">In-Home Services Only</label>
                <select
                  name="in_home_only"
                  value={formData.in_home_only ? "true" : "false"}
                  onChange={(e) => setFormData(prev => ({ ...prev, in_home_only: e.target.value === "true" }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select "Yes" if this provider only offers in-home services and has no physical clinic location.
                </p>
              </div>
            </div>

            {/* Locations Section */}
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm text-red-500 mb-2">
                <strong>Important:</strong> If you only provide in-home services and have no physical clinic locations, you can skip adding locations below. However, please provide at least one phone number for contact purposes.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                For providers with physical locations: Please add any brick and mortar locations you have. If you serve multiple states via in-home services only, please add the individual states below with the counties served and add a phone number for the location with the in-home and in-clinic waitlist marked.
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Locations</h3>
              {formData.locations.map((location, index) => (
                <div key={index} className="p-4 sm:p-6 border rounded-lg space-y-4 sm:space-y-6 bg-gray-50 grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                      Location {index + 1}
                    </h3>
                    {formData.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(index)}
                        className="border-none bg-transparent"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Location Name"
                      value={location.name}
                      onChange={(e) => handleLocationChange(index, "name", e.target.value)}
                      className="w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="form-group">
                      <label htmlFor={`location-phone-${index}`} className="block text-sm text-gray-600 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        id={`location-phone-${index}`}
                        value={location.phone}
                        onChange={(e) => {
                          // Format phone number with dashes
                          const input = e.target.value.replace(/\D/g, '');
                          let formatted = '';
                          if (input.length > 0) {
                            formatted = input.slice(0, 3);
                            if (input.length > 3) {
                              formatted += '-' + input.slice(3, 6);
                            }
                            if (input.length > 6) {
                              formatted += '-' + input.slice(6, 10);
                            }
                          }
                          handleLocationChange(index, "phone", formatted);
                        }}
                        placeholder="XXX-XXX-XXXX"
                        maxLength={12}
                        className="w-3/4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`location-in-home-waitlist-${index}`}>In-Home Waitlist</label>
                      <p className="text-sm text-gray-500 mb-2">Select the current waitlist status for in-home services</p>
                      <select
                        id={`location-in-home-waitlist-${index}`}
                        value={location.in_home_waitlist || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleLocationChange(index, "in_home_waitlist", value || null);
                        }}
                        className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select waitlist status...</option>
                        <option value="No waitlist">No waitlist</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="2-4 weeks">2-4 weeks</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6+ months">6+ months</option>
                        <option value="Not accepting new clients">Not accepting new clients</option>
                        <option value="Contact for availability">Contact for availability</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor={`location-in-clinic-waitlist-${index}`}>In-Clinic Waitlist</label>
                      <p className="text-sm text-gray-500 mb-2">Select the current waitlist status for in-clinic services</p>
                      <select
                        id={`location-in-clinic-waitlist-${index}`}
                        value={location.in_clinic_waitlist || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleLocationChange(index, "in_clinic_waitlist", value || null);
                        }}
                        className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select waitlist status...</option>
                        <option value="No waitlist">No waitlist</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="2-4 weeks">2-4 weeks</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6+ months">6+ months</option>
                        <option value="Not accepting new clients">Not accepting new clients</option>
                        <option value="Contact for availability">Contact for availability</option>
                      </select>
                    </div>
                  </div>

                  {/* Address and Services in two columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Address Section */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-3">Address Information</h4>
                      <div className="grid grid-cols-1 gap-4 p-4">
                        <div className="text-center">
                          <label className="block text-sm text-gray-600 mb-2">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            placeholder="123 S Pine Street"
                            value={location.address_1}
                            onChange={(e) => handleLocationChange(index, "address_1", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="text-center">
                          <label className="block text-sm text-gray-600 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            placeholder="suite 201"
                            value={location.address_2}
                            onChange={(e) => handleLocationChange(index, "address_2", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="text-center">
                          <label className="block text-sm text-gray-600 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="City"
                            value={location.city}
                            onChange={(e) => handleLocationChange(index, "city", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <label className="block text-sm text-gray-600 mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              placeholder="State (XX)"
                              value={location.state}
                              onChange={(e) => {
                                const input = e.target.value.toUpperCase();
                                if (input.length <= 2 && /^[A-Z]*$/.test(input)) {
                                  handleLocationChange(index, "state", input);
                                }
                              }}
                              maxLength={2}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="text-center">
                            <label className="block text-sm text-gray-600 mb-2">
                              ZIP
                            </label>
                            <input
                              type="text"
                              placeholder="ZIP"
                              value={location.zip}
                              onChange={(e) => {
                                const input = e.target.value.replace(/\D/g, '');
                                if (input.length <= 5) {
                                  handleLocationChange(index, "zip", input);
                                }
                              }}
                              maxLength={5}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services Section */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-3">Services Offered at this Location</h4>
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
                        {practiceTypes
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (selectedState) {
                            handleAddState(selectedState);
                          }
                        }
                      }}
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
                  <div key={stateName} className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-md">
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
                    <div className="space-y-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex gap-4">
                        <select
                          value={selectedCounty}
                          onChange={(e) => setSelectedCounty(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (selectedCounty) {
                                handleAddCounty(stateName, selectedCounty);
                              }
                            }
                          }}
                          className="flex-1 rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    placeholder="Enter insurance name"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInsurance();
                      }
                    }}
                    onBlur={() => {
                      if (newInsurance.trim() && !selectedInsurances.includes(newInsurance.trim())) {
                        setSelectedInsurances(prev => [...prev, newInsurance.trim()]);
                        setNewInsurance('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddInsurance}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    {selectedInsurances.includes(newInsurance.trim()) && (
                      <p className="text-sm text-red-500">
                        This insurance has already been added
                      </p>
                    )}
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
                    placeholder="I.E. $100 per session, Insurance only, etc"
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

            {/* Add reCAPTCHA before the submit button */}
            <div className="flex justify-center my-4">
              <div className="scale-90 sm:scale-100">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LfTMGErAAAAAARfviGKHaQSMBEiUqHOZeBEmRIu"
                  onChange={(value: string | null) => setRecaptchaValue(value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t sticky bottom-0 bg-white pb-4">
              <button
                type="button"
                onClick={handleCloseForm}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Registration Submitted Successfully!
              </h3>
              <div className="text-sm text-gray-600 mb-6 space-y-2">
                <p>Thank you for registering with Autism Services Locator.</p>
                <p className="font-medium text-gray-800">
                  Please check your email (including spam/junk folder) for a confirmation email from <span className="text-blue-600">Registration@autismserviceslocator.com</span> within the next 72 hours for account approval.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleCloseForm();
                }}
                className="w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupModal;