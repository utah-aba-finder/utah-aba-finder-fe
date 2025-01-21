// import React, { useState, useEffect } from 'react';
// import { Button } from '@chakra-ui/react';
// import { InsuranceModal } from './InsuranceModal';
// import { X } from 'lucide-react';
// import './Signup.css';
// import './SignupModal.css';
// import { CountiesServed, StateData, CountyData } from '../Utility/Types';
// import CountiesModal from '../Provider-edit/CountiesModal';
// import { toast, ToastContainer } from 'react-toastify';
// import { fetchStates, fetchCountiesByState } from '../Utility/ApiCall';

// interface EmailJSResponse {
//   text: string;
//   status: number;
// }

// interface Location {
//   name: string;
//   address_1: string;
//   address_2: string;
//   city: string;
//   state: string;
//   zip: string;
//   phone: string;
// }

// interface County {
//   county_id: number;
//   county_name: string;
// }

// interface Insurance {
//   name: string;
// }

// interface ProviderData {
//   name: string;
//   locations: Location[];
//   website: string;
//   email: string;
//   cost: string;
//   insurance: Insurance[];
//   counties_served: County[];
//   min_age: number;
//   max_age: number;
//   waitlist: string;
//   telehealth_services: string;
//   spanish_speakers: string;
//   at_home_services: string;
//   in_clinic_services: string;
//   logo: string;
// }

// interface SignupModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
//   const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
//   const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
//   const [providerData, setProviderData] = useState<ProviderData>({
//     name: '',
//     locations: [{ name: '', address_1: '', address_2: '', city: '', state: '', zip: '', phone: '' }],
//     website: '',
//     email: '',
//     cost: '',
//     insurance: [],
//     counties_served: [],
//     min_age: 0,
//     max_age: 0,
//     waitlist: '',
//     telehealth_services: '',
//     spanish_speakers: '',
//     at_home_services: '',
//     in_clinic_services: '',
//     logo: '',
//   });
//   const [availableStates, setAvailableStates] = useState<StateData[]>([]);
//   const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);

//   useEffect(() => {
//     const loadStates = async () => {
//       try {
//         const states = await fetchStates();
//         setAvailableStates(states);
//         // For now, just fetch Utah counties (id: 1)
//         const counties = await fetchCountiesByState(1);
//         setAvailableCounties(counties);
//       } catch (error) {
//         console.error("Failed to load states/counties:", error);
//         toast.error("Failed to load location data");
//       }
//     };
//     loadStates();
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;

//     if (name === 'website' && !value.startsWith('https://')) {
//       setProviderData({ ...providerData, [name]: `https://${value}` });
//     } else {
//       setProviderData({ ...providerData, [name]: value });
//     }
//   };

//   const handleLocationChange = (index: number, field: keyof Location, value: string) => {
//     const newLocations = [...providerData.locations];
//     newLocations[index] = { ...newLocations[index], [field]: value };
//     setProviderData({ ...providerData, locations: newLocations });
//   };

//   const addLocation = () => {
//     setProviderData({
//       ...providerData,
//       locations: [...providerData.locations, { name: '', address_1: '', address_2: '', city: '', state: '', zip: '', phone: '' }],
//     });
//   };
//   const removeLocation = () => {
//     setProviderData({
//       ...providerData,
//       locations: providerData.locations.slice(0, -1),
//     });
//   };

//   const handleInsuranceSelect = (selectedInsurances: string[]) => {
//     const insuranceObjects = selectedInsurances.map(name => ({ name }));
//     setProviderData({ ...providerData, insurance: insuranceObjects });
//     setIsInsuranceModalOpen(false);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const providerPostData = {
//       data: {
//         type: 'provider',
//         attributes: {
//           ...providerData,
//           counties_served: selectedCounties,
//         },
//       },
//     };

//     setIsLoading(true);

//     try {
//       const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer YOUR_ACCESS_TOKEN_HERE`,
//         },
//         body: JSON.stringify(providerPostData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error('Error response:', errorData);
//         throw new Error(errorData.message || 'Failed to submit provider data');
//       }

//       toast.success('Provider information submitted successfully');

//       setProviderData({
//         name: '',
//         locations: [{ name: '', address_1: '', address_2: '', city: '', state: '', zip: '', phone: '' }],
//         website: 'https://',
//         email: '',
//         cost: '',
//         insurance: [],
//         counties_served: [],
//         min_age: 0,
//         max_age: 0,
//         waitlist: '',
//         telehealth_services: '',
//         spanish_speakers: '',
//         at_home_services: '',
//         in_clinic_services: '',
//         logo: '',
//       });

//     } catch (error) {
//       console.error('Error submitting provider data:', error);
//       toast.error('Failed to submit provider information. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="signup-modal-overlay">
//       <ToastContainer />
//       <div className="signup-modal-content">
//         <form className="signupForm" onSubmit={handleSubmit}>

//           <div className="closeButton">
//             <X onClick={onClose} className="close" />
//           </div>
//           <h1 className='registerTitle'>Register</h1>
//           <input
//             type="text"
//             name="name"
//             value={providerData.name}
//             placeholder="Provider Name"
//             onChange={handleInputChange}
//           />
//           <input
//             type="email"
//             name="email"
//             value={providerData.email}
//             placeholder="Email"
//             onChange={handleInputChange}
//           />
//           <input
//             type="url"
//             name="website"
//             value={providerData.website}
//             placeholder="Website"
//             onChange={handleInputChange}
//           />

//           {providerData.locations.map((location, index) => (
//             <div key={index} className="locationSection">
//               <h3 className="locationHeader">Location {index + 1}</h3>
//               <input
//                 type="text"
//                 placeholder="Location Name"
//                 value={location.name}
//                 onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="Address 1"
//                 value={location.address_1}
//                 onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="Suite/Unit"
//                 value={location.address_2}
//                 onChange={(e) => handleLocationChange(index, 'address_2', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="City"
//                 value={location.city}
//                 onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="State"
//                 value={location.state}
//                 onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="ZIP"
//                 value={location.zip}
//                 onChange={(e) => handleLocationChange(index, 'zip', e.target.value)}
//               />
//               <input
//                 type="tel"
//                 placeholder="Phone"
//                 value={location.phone}
//                 onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
//               />
//             </div>
//           ))}
//           <div className='locationButtonsContainer'>
//             <Button onClick={addLocation} className='addLocationButton'>Add Location</Button>
//             <Button onClick={removeLocation} className='removeLocationButton'>Remove Location</Button>
//           </div>

//           <Button onClick={() => setIsCountiesModalOpen(true)} className='selectCountiesButton'>
//             Select Counties Served
//           </Button>


//           {selectedCounties.length > 0 && (
//             <div className="selected-counties">
//               <p>Selected Counties: </p> {selectedCounties[0].county_name}
//             </div>
//           )}


//           <input
//             type="text"
//             name="cost"
//             value={providerData.cost}
//             placeholder="Cost"
//             onChange={handleInputChange}
//           />


//           <Button onClick={() => setIsInsuranceModalOpen(true)} className='addInsuranceButton'>Add Insurances</Button>
//           {isInsuranceModalOpen && (
//             <InsuranceModal
//               isOpen={isInsuranceModalOpen}
//               onClose={() => setIsInsuranceModalOpen(false)}
//               onSelect={handleInsuranceSelect}
//             />
//           )}



//           <div className="ageInputContainer">
//             <div className="ageInputGroup">
//               <label htmlFor="min_age" className="min_age">Minimum Age</label>
//               <input
//                 type="number"
//                 name="min_age"
//                 value={providerData.min_age}
//                 placeholder="Minimum Age"
//                 onChange={handleInputChange}
//                 min="1"
//               />
//             </div>

//             <div className="ageInputGroup">
//               <label htmlFor="max_age" className="max_age">Maximum Age</label>
//               <input
//                 type="number"
//                 name="max_age"
//                 id="max_age"
//                 value={providerData.max_age}
//                 placeholder="Maximum Age"
//                 onChange={handleInputChange}
//                 max="100"
//               />
//             </div>
//           </div>

//           <select
//             name="waitlist"
//             value={providerData.waitlist}
//             onChange={handleInputChange}
//             className="waitlist"
//           >
//             <option value="">Waitlist: Select an option</option>
//             <option value="none">No waitlist</option>
//             <option value="6 months or less">6 Months or less</option>
//           </select>
//           <select
//             name="telehealth_services"
//             value={providerData.telehealth_services}
//             onChange={handleInputChange}
//             className="telehealthServices"
//           >
//             <option value="">Telehealth Services: Select an option</option>
//             <option value="yes">Yes</option>
//             <option value="no">No</option>
//             <option value="limited">Limited</option>
//           </select>

//           <select
//             name="spanish_speakers"
//             value={providerData.spanish_speakers}
//             onChange={handleInputChange}
//             className='spanishSpeakers'
//           >
//             <option value="">Spanish Speakers: Select an option</option>
//             <option value="yes">Yes</option>
//             <option value="no">No</option>
//             <option value="contact us">Contact Us</option>
//           </select>

//           <div className='inClinicServices'>
//             <h3 className='inClinicServicesHeader'>Select all types of services provided</h3>
//             <label>
//               <input
//                 type="checkbox"
//                 name="in_clinic_services"
//                 value="telehealth services"
//                 checked={providerData.in_clinic_services.includes('telehealth services')}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   const isChecked = e.target.checked;
//                   setProviderData((prevData) => {
//                     const services = prevData.in_clinic_services.split(', ');
//                     if (isChecked) {
//                       services.push(value);
//                     } else {
//                       const index = services.indexOf(value);
//                       if (index > -1) {
//                         services.splice(index, 1);
//                       }
//                     }
//                     return { ...prevData, in_clinic_services: services.join(', ') };
//                   });
//                 }}
//               />
//               Telehealth Services
//             </label>

//             <label>
//               <input
//                 type="checkbox"
//                 name="in_clinic_services"
//                 value="at home services"
//                 checked={providerData.in_clinic_services.includes('at home services')}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   const isChecked = e.target.checked;
//                   setProviderData((prevData) => {
//                     const services = prevData.in_clinic_services.split(', ');
//                     if (isChecked) {
//                       services.push(value);
//                     } else {
//                       const index = services.indexOf(value);
//                       if (index > -1) {
//                         services.splice(index, 1);
//                       }
//                     }
//                     return { ...prevData, in_clinic_services: services.join(', ') };
//                   });
//                 }}
//               />
//               At Home Services
//             </label>

//             <label>
//               <input
//                 type="checkbox"
//                 name="in_clinic_services"
//                 value="in clinic services"
//                 checked={providerData.in_clinic_services.includes('in clinic services')}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   const isChecked = e.target.checked;
//                   setProviderData((prevData) => {
//                     const services = prevData.in_clinic_services.split(', ');
//                     if (isChecked) {
//                       services.push(value);
//                     } else {
//                       const index = services.indexOf(value);
//                       if (index > -1) {
//                         services.splice(index, 1);
//                       }
//                     }
//                     return { ...prevData, in_clinic_services: services.join(', ') };
//                   });
//                 }}
//               />
//               In Clinic Services
//             </label>
//           </div>

//           <Button className="submitButton" type="submit" isLoading={isLoading}>
//             Register
//           </Button>
//         </form>

//         <CountiesModal
//           isOpen={isCountiesModalOpen}
//           onClose={() => setIsCountiesModalOpen(false)}
//           selectedCounties={selectedCounties}
//           onCountiesChange={(counties) => setSelectedCounties(counties)}
//           availableCounties={availableCounties}
//         />

//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Building2, MapPin, DollarSign, Stethoscope, Plus, X } from "lucide-react";
import CountiesModal from "../Provider-edit/CountiesModal";
import { CountiesServed, Insurance, StateData, CountyData } from "../Utility/Types";
import InsuranceModal from "../Provider-edit/InsuranceModal";
import { fetchStates, fetchCountiesByState } from "../Utility/ApiCall";
import "react-toastify/dist/ReactToastify.css";

interface SuperAdminCreateProps {
  handleCloseForm: () => void;
  onProviderCreated: () => void;
}

const SignupModal: React.FC<SuperAdminCreateProps> = ({
  handleCloseForm,
  onProviderCreated,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            data: [
              {
                type: "provider",
                states: [formData.state],
                attributes: {
                  name: formData.name,
                  provider_type: [
                    {
                      name: formData.provider_type,
                    },
                  ],
                  locations: formData.locations.map((location) => ({
                    id: location.id,
                    name: location.name,
                    address_1: location.address_1,
                    address_2: location.address_2,
                    city: location.city,
                    state: location.state,
                    zip: location.zip,
                    phone: location.phone,
                  })),
                  website: formData.website,
                  email: formData.email,
                  cost: formData.cost,
                  insurance: selectedInsurances,
                  counties_served: selectedCounties,
                  min_age: parseInt(formData.min_age),
                  max_age: parseInt(formData.max_age),
                  waitlist: formData.waitlist,
                  telehealth_services: formData.telehealth_services,
                  spanish_speakers: formData.spanish_speakers,
                  at_home_services: formData.at_home_services,
                  in_clinic_services: formData.in_clinic_services,
                  logo: formData.logo,
                  status: formData.status,
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create provider");
      }

      toast.success(`Provider ${formData.name} created successfully!`);
      onProviderCreated();
      setFormData({
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
        logo: "",
        status: "",
      });
      setTimeout(() => {
        handleCloseForm();
      }, 3000);
    } catch (error) {
      console.error("Error creating provider:", error);
      setError("There was an error creating the provider. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className=" max-w-[1152px] mx-auto px-2 sm:px-4 py-6">
      <ToastContainer />

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sign Up
        </h1>
        <p className="text-sm text-gray-500">
          Fill in the provider details below
        </p>
        <button className="ml-10  hover:text-gray-700 bg-transparent border-none" onClick={handleCloseForm}>
            <X className="w-5 h-5 hover:cursor-pointer text-red-500" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
    </div>
  );
};

export default SignupModal;