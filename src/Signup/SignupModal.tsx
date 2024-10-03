import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { InsuranceModal } from './InsuranceModal';
import { X } from 'lucide-react';
import './Signup.css';
import './SignupModal.css';
import { CountiesServed } from '../Utility/Types';
import CountiesModal from '../Provider-edit/CountiesModal';
import { toast, ToastContainer } from 'react-toastify';

interface EmailJSResponse {
  text: string;
  status: number;
}

interface Location {
  name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface County {
  county: string;
}

interface Insurance {
  name: string;
}

interface ProviderData {
  name: string;
  locations: Location[];
  website: string;
  email: string;
  cost: string;
  insurance: Insurance[];
  counties_served: County[];
  min_age: number;
  max_age: number;
  waitlist: string;
  telehealth_services: string;
  spanish_speakers: string;
  at_home_services: string;
  in_clinic_services: string;
  logo: string;
}

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
  const [providerData, setProviderData] = useState<ProviderData>({
    name: '',
    locations: [{ name: '', address_1: '', address_2: '', city: '', state: '', zip: '', phone: '' }],
    website: '',
    email: '',
    cost: '',
    insurance: [],
    counties_served: [],
    min_age: 0,
    max_age: 0,
    waitlist: '',
    telehealth_services: '',
    spanish_speakers: '',
    at_home_services: '',
    in_clinic_services: '',
    logo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProviderData({ ...providerData, [name]: value });
  };

  const handleLocationChange = (index: number, field: keyof Location, value: string) => {
    const newLocations = [...providerData.locations];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setProviderData({ ...providerData, locations: newLocations });
  };

  const addLocation = () => {
    setProviderData({
      ...providerData,
      locations: [...providerData.locations, { name: '', address_1: '', address_2: '', city: '', state: '', zip: '', phone: '' }],
    });
  };

  const handleInsuranceSelect = (selectedInsurances: string[]) => {
    const insuranceObjects = selectedInsurances.map(name => ({ name }));
    setProviderData({ ...providerData, insurance: insuranceObjects });
    setIsInsuranceModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const providerPostData = {
      data: {
        type: 'provider',
        attributes: {
          ...providerData,
          counties_served: selectedCounties,
        },
      },
    };

    setIsLoading(true);

    setTimeout(() => {
      console.log(providerPostData); // This is where you'd make the actual API call
      toast.success('Provider information submitted successfully');
      setIsLoading(false);

      setProviderData({
        name: '',
        locations: [{ name: '', address_1: '', address_2: '', city: '', state: '', zip: '', phone: '' }],
        website: '',
        email: '',
        cost: '',
        insurance: [],
        counties_served: [],
        min_age: 0,
        max_age: 0,
        waitlist: '',
        telehealth_services: '',
        spanish_speakers: '',
        at_home_services: '',
        in_clinic_services: '',
        logo: '',
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="signup-modal-overlay">
      <ToastContainer />
      <div className="signup-modal-content">
        <form className="signupForm" onSubmit={handleSubmit}>

          <div className="closeButton">
            <X onClick={onClose} className="close" />
          </div>
          <h1 className='registerTitle'>Register</h1>
          <input
            type="text"
            name="name"
            value={providerData.name}
            placeholder="Provider Name"
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            value={providerData.email}
            placeholder="Email"
            onChange={handleInputChange}
          />
          <input
            type="url"
            name="website"
            value={providerData.website}
            placeholder="Website"
            onChange={handleInputChange}
          />

          {providerData.locations.map((location, index) => (
            <div key={index} className="locationSection">
              <h3 className="locationHeader">Location {index + 1}</h3>
              <input
                type="text"
                placeholder="Location Name"
                value={location.name}
                onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Address 1"
                value={location.address_1}
                onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)}
              />
              <input
                type="text"
                placeholder="Suite/Unit"
                value={location.address_2}
                onChange={(e) => handleLocationChange(index, 'address_2', e.target.value)}
              />
              <input
                type="text"
                placeholder="City"
                value={location.city}
                onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
              />
              <input
                type="text"
                placeholder="State"
                value={location.state}
                onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
              />
              <input
                type="text"
                placeholder="ZIP"
                value={location.zip}
                onChange={(e) => handleLocationChange(index, 'zip', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={location.phone}
                onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addLocation} className='addLocationButton'>Add Location</Button>



          <Button onClick={() => setIsCountiesModalOpen(true)} className='addLocationButton'>
            Select Counties Served
          </Button>


          {selectedCounties.length > 0 && (
            <div className="selected-counties">
              <p>Selected Counties: </p> {selectedCounties[0].county}
            </div>
          )}


          <input
            type="text"
            name="cost"
            value={providerData.cost}
            placeholder="Cost"
            onChange={handleInputChange}
          />


          <Button onClick={() => setIsInsuranceModalOpen(true)} className='addInsuranceButton'>Add Insurances</Button>
          {isInsuranceModalOpen && (
            <InsuranceModal
              isOpen={isInsuranceModalOpen}
              onClose={() => setIsInsuranceModalOpen(false)}
              onSelect={handleInsuranceSelect}
            />
          )}



          <div className="ageInputContainer">
            <div className="ageInputGroup">
              <label htmlFor="min_age" className="min_age">Minimum Age</label>
              <input
                type="number"
                name="min_age"
                value={providerData.min_age}
                placeholder="Minimum Age"
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="ageInputGroup">
              <label htmlFor="max_age" className="max_age">Maximum Age</label>
              <input
                type="number"
                name="max_age"
                id="max_age"
                value={providerData.max_age}
                placeholder="Maximum Age"
                onChange={handleInputChange}
                max="100"
              />
            </div>
          </div>

          <select
            name="waitlist"
            value={providerData.waitlist}
            onChange={handleInputChange}
            className="waitlist"
          >
            <option value="">Waitlist: Select an option</option>
            <option value="none">No waitlist</option>
            <option value="6 months or less">6 Months or less</option>
          </select>
          <select
            name="telehealth_services"
            value={providerData.telehealth_services}
            onChange={handleInputChange}
            className="telehealthServices"
          >
            <option value="">Telehealth Services: Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="limited">Limited</option>
          </select>

          <select
            name="spanish_speakers"
            value={providerData.spanish_speakers}
            onChange={handleInputChange}
            className='spanishSpeakers'
          >
            <option value="">Spanish Speakers: Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="contact us">Contact Us</option>
          </select>

          <div className='inClinicServices'>
            <h3 className='inClinicServicesHeader'>Select all types of services provided</h3>
            <label>
              <input
                type="checkbox"
                name="in_clinic_services"
                value="telehealth services"
                checked={providerData.in_clinic_services.includes('telehealth services')}
                onChange={(e) => {
                  const value = e.target.value;
                  const isChecked = e.target.checked;
                  setProviderData((prevData) => {
                    const services = prevData.in_clinic_services.split(', ');
                    if (isChecked) {
                      services.push(value);
                    } else {
                      const index = services.indexOf(value);
                      if (index > -1) {
                        services.splice(index, 1);
                      }
                    }
                    return { ...prevData, in_clinic_services: services.join(', ') };
                  });
                }}
              />
              Telehealth Services
            </label>

            <label>
              <input
                type="checkbox"
                name="in_clinic_services"
                value="at home services"
                checked={providerData.in_clinic_services.includes('at home services')}
                onChange={(e) => {
                  const value = e.target.value;
                  const isChecked = e.target.checked;
                  setProviderData((prevData) => {
                    const services = prevData.in_clinic_services.split(', ');
                    if (isChecked) {
                      services.push(value);
                    } else {
                      const index = services.indexOf(value);
                      if (index > -1) {
                        services.splice(index, 1);
                      }
                    }
                    return { ...prevData, in_clinic_services: services.join(', ') };
                  });
                }}
              />
              At Home Services
            </label>

            <label>
              <input
                type="checkbox"
                name="in_clinic_services"
                value="in clinic services"
                checked={providerData.in_clinic_services.includes('in clinic services')}
                onChange={(e) => {
                  const value = e.target.value;
                  const isChecked = e.target.checked;
                  setProviderData((prevData) => {
                    const services = prevData.in_clinic_services.split(', ');
                    if (isChecked) {
                      services.push(value);
                    } else {
                      const index = services.indexOf(value);
                      if (index > -1) {
                        services.splice(index, 1);
                      }
                    }
                    return { ...prevData, in_clinic_services: services.join(', ') };
                  });
                }}
              />
              In Clinic Services
            </label>
          </div>

          <Button className="submitButton" type="submit" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <CountiesModal
          isOpen={isCountiesModalOpen}
          onClose={() => setIsCountiesModalOpen(false)}
          selectedCounties={selectedCounties}
          onCountiesChange={(counties) => setSelectedCounties(counties)}
          providerCounties={providerData.counties_served}
        />

      </div>
    </div>
  );
};