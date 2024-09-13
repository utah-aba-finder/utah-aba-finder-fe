import React from 'react';
import { Button } from '@chakra-ui/react';
import { InsuranceModal } from './InsuranceModal';
import { X, User, Mail, Globe, DollarSign, Calendar, Clock, Home, Building, NotebookPen, MoveDown, Search, LockKeyhole, FilePenLine } from 'lucide-react';import './Signup.css';
import { useState} from 'react';
import emailjs from '@emailjs/browser';
import { toast, ToastContainer } from 'react-toastify';
import './SignupModal.css'

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
  
  interface ProviderData {
    name: string;
    locations: Location[];
    website: string;
    email: string;
    cost: string;
    insurance: string[];
    counties_served: string[];
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

export const SignupModal: React.FC<SignupModalProps> = ({isOpen, onClose}) => {
  const [provider, setProvider] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurances] = useState<string[]>([])
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
    setProviderData({ ...providerData, insurance: selectedInsurances });
    setIsModalOpen(false);
  };
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const templateParams = {
        provider: provider,
        email: email
    }

    setIsLoading(true);
    emailjs.send('service_d6byt4s', 'template_rdrgmli', templateParams, 'YtcUeRrOLBFogwZI7')
        .then((res: EmailJSResponse) => {
            toast.success(`Email sent successfully!, ${res.text}`);
            setProvider('');
            setIsLoading(false);
        })
        .catch((err: any) => {
            toast.error(`Error sending email, ${err}`);
            setIsLoading(false);
        });
}

if (isLoading) {
    toast.info('Sending email...');
}
const handleSelect = (selectedInsurances: string[]) => {
    setSelectedInsurances(prev => {
        const newSelections = {} as Record<string, boolean>;
        selectedInsurances.forEach(insurance => {
            newSelections[insurance] = true;
        });
        return { ...prev, ...newSelections };
    });
    setIsModalOpen(false);
};
  if (!isOpen) return null;

  return (
    <div className="signup-modal-overlay">
        <ToastContainer />
      <div className="signup-modal-content">
        <form className='signupForm'>
        <div className='closeButton'>
      <X onClick={onClose} className='close'/>
        </div>
          <input
            type='text'
            name='name'
            value={providerData.name}
            placeholder='Provider Name'
            onChange={handleInputChange}
          />
           <input
                    type='email'
                    name='email'
                    value={providerData.email}
                    placeholder='Email'
                    onChange={handleInputChange}
                />
                <input
                    type='url'
                    name='website'
                    value={providerData.website}
                    placeholder='Website'
                    onChange={handleInputChange}
                />
          {providerData.locations.map((location, index) => (
            <div key={index} className='locationSection'>
              <h3 className='locationHeader'>Location {index + 1}</h3>
              <input
                type='text'
                placeholder='Location Name'
                value={location.name}
                onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
              />
              <input
                type='text'
                placeholder='Address 1'
                value={location.address_1}
                onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)}
              />
              <input
                type='text'
                placeholder='suite/unit'
                value={location.address_2}
                onChange={(e) => handleLocationChange(index, 'address_2', e.target.value)}
              />
              <input
                type='text'
                placeholder='City'
                value={location.city}
                onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
              />
              <input
                type='text'
                placeholder='State'
                value={location.state}
                onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
              />
              <input
                type='text'
                placeholder='ZIP'
                value={location.zip}
                onChange={(e) => handleLocationChange(index, 'zip', e.target.value)}
              />
              <input
                type='tel'
                placeholder='Phone'
                value={location.phone}
                onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addLocation}>Add Location</Button>
          
          <input
            type='text'
            name='cost'
            value={providerData.cost}
            placeholder='Cost'
            onChange={handleInputChange}
          />
          <Button onClick={() => setIsInsuranceModalOpen(true)}>Add Insurances</Button>
          {isInsuranceModalOpen && (
            <InsuranceModal
              isOpen={isInsuranceModalOpen}
              onClose={() => setIsInsuranceModalOpen(false)}
              onSelect={handleInsuranceSelect}
            />
          )}
          <input
            type='number'
            name='min_age'
            value={providerData.min_age}
            placeholder='Minimum Age'
            onChange={handleInputChange}
          />
          <input
            type='number'
            name='max_age'
            value={providerData.max_age}
            placeholder='Maximum Age'
            onChange={handleInputChange}
          />
          <input
            type='text'
            name='waitlist'
            value={providerData.waitlist}
            placeholder='Waitlist'
            onChange={handleInputChange}
          />
          <input
            type='text'
            name='telehealth_services'
            value={providerData.telehealth_services}
            placeholder='Telehealth Services'
            onChange={handleInputChange}
          />
          <input
            type='text'
            name='spanish_speakers'
            value={providerData.spanish_speakers}
            placeholder='Spanish Speakers'
            onChange={handleInputChange}
          />
          <input
            type='text'
            name='at_home_services'
            value={providerData.at_home_services}
            placeholder='At Home Services'
            onChange={handleInputChange}
          />
          <input
            type='text'
            name='in_clinic_services'
            value={providerData.in_clinic_services}
            placeholder='In Clinic Services'
            onChange={handleInputChange}
          />
        <Button className='submitButton'>Register</Button>
        </form>
      </div>
    </div>
  );
};