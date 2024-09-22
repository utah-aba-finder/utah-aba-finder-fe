import React, { useState, useEffect } from 'react';
import "./ProviderEdit.css";
import InsuranceModal from './InsuranceModal';
import CountiesModal from './CountiesModal';
import { Insurance, CountiesServed, MockProviderData } from '@/Utility/Types';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Provider-login/AuthProvider';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { useCallback } from 'react';

interface ProviderEditProps {
    loggedInProvider: MockProviderData | null;
    clearProviderData: () => void;
}

const ProviderEdit: React.FC<ProviderEditProps> = ({ loggedInProvider, clearProviderData }) => {
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [locations, setLocations] = useState<any[]>([]);

    const [showError, setShowError] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [providerData, setProviderData] = useState<MockProviderData | null>(null);
    


    const handleSave = () => {
        setIsSaving(true);
    }


    const [formData, setFormData] = useState({
        logo: '',
        name: '',
        website: '',
        location: '',
        address: '',
        email: '',
        cost: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        spanishSpeakers: '',
        serviceType: '',
        waitlistTime: '',
        in_clinic_services: '',
        at_home_services: '',
        min_age: 0,
        max_age: 0,
        telehealth: ''
    });

    const handleLogout = () => {
        setToken(null);
        clearProviderData();
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('authToken')
        navigate('/login');

    };
    const addNewLocation = () => {
        const newId = Math.max(0, ...locations.map(loc => loc.id)) + 1;
    setLocations([...locations, {
        id: newId,
        name: '',
        address_1: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
        }]);
    };

    useEffect(() => {
        if (loggedInProvider) {
            setShowError('');
            setFormData({
                logo: loggedInProvider.attributes.logo ?? '',
                name: loggedInProvider.attributes.name ?? '',
                website: loggedInProvider.attributes.website ?? '',
                location: loggedInProvider.attributes.locations[0].name ?? '',
                address: loggedInProvider.attributes.locations[0].address_1 ?? '',
                email: loggedInProvider.attributes.email ?? '',
                cost: loggedInProvider.attributes.cost ?? '',
                city: loggedInProvider.attributes.locations[0].city ?? '',
                state: loggedInProvider.attributes.locations[0].state ?? '',
                zipCode: loggedInProvider.attributes.locations[0].zip ?? '',
                phone: loggedInProvider.attributes.locations[0].phone ?? '',
                spanishSpeakers: loggedInProvider.attributes.spanish_speakers ?? '',
                serviceType: loggedInProvider.attributes.in_clinic_services ?? '',
                waitlistTime: loggedInProvider.attributes.waitlist ?? '',
                telehealth: loggedInProvider.attributes.telehealth_services ?? '',
                in_clinic_services: loggedInProvider.attributes.in_clinic_services ?? '',
                at_home_services: loggedInProvider.attributes.at_home_services ?? '',
                min_age: loggedInProvider.attributes.min_age ?? 0,
                max_age: loggedInProvider.attributes.max_age ?? 0,
            });
            setLocations(loggedInProvider.attributes.locations ?? []);
            setSelectedInsurances(loggedInProvider.attributes.insurance.map(ins => ({
                ...ins,
                accepted: true 
            })));
            setSelectedCounties(loggedInProvider.attributes.counties_served ?? []);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setShowError('Failed to load provider data. Please try again later.');
        }
    }, [loggedInProvider]);

    const updateLocalProviderData = useCallback((updatedData: MockProviderData) => {
        setProviderData(updatedData);
        setFormData({
            logo: updatedData.attributes.logo ?? '',
            name: updatedData.attributes.name ?? '',
            website: updatedData.attributes.website ?? '',
            location: updatedData.attributes.locations[0].name ?? '',
            address: updatedData.attributes.locations[0].address_1 ?? '',
            city: updatedData.attributes.locations[0].city ?? '',
            email: updatedData.attributes.email ?? '',
            cost: updatedData.attributes.cost ?? '',
            state: updatedData.attributes.locations[0].state ?? '',
            zipCode: updatedData.attributes.locations[0].zip ?? '',
            phone: updatedData.attributes.locations[0].phone ?? '',
            spanishSpeakers: updatedData.attributes.spanish_speakers ?? '',
            serviceType: updatedData.attributes.in_clinic_services ?? '',
            waitlistTime: updatedData.attributes.waitlist ?? '',
            telehealth: updatedData.attributes.telehealth_services ?? '',
            in_clinic_services: updatedData.attributes.in_clinic_services ?? '',
            at_home_services: updatedData.attributes.at_home_services ?? '',
            min_age: updatedData.attributes.min_age ?? 0,
            max_age: updatedData.attributes.max_age ?? 0,
        });
        setSelectedInsurances(updatedData.attributes.insurance ?? []);
        setSelectedCounties(updatedData.attributes.counties_served ?? []);
    }, []);
    useEffect(() => {
        if (loggedInProvider) {
            updateLocalProviderData(loggedInProvider);
            setSelectedInsurances(loggedInProvider.attributes.insurance.map(ins => ({
                ...ins,
                accepted: true 
              })));
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setShowError('Failed to load provider data. Please try again later.');
        }
    }, [loggedInProvider, updateLocalProviderData]);


    useEffect(() => {
        if (isSaving) {
            const updateProviderData = async () => {
                try {
                    const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${loggedInProvider?.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            data: [
                                {
                                    type: "provider",
                                    attributes: {
                                        name: formData.name,
                                        locations: locations.map(location => ({
                                            id: location.id,
                                            name: location.name,
                                            address_1: location.address_1,
                                            city: location.city,
                                            state: location.state,
                                            zip: location.zip,
                                            phone: location.phone
                                        })),
                                        website: formData.website,
                                        email: formData.email,
                                        cost: formData.cost,
                                        insurance: selectedInsurances.map(ins => ({
                                            name: ins.name,
                                            id: ins.id,
                                            accepted: true
                                        })),
                                        counties_served: selectedCounties.map(county => ({
                                            county: county.county
                                        })),
                                        min_age: formData.min_age,
                                        max_age: formData.max_age,
                                        waitlist: formData.waitlistTime,
                                        telehealth_services: formData.telehealth,
                                        spanish_speakers: formData.spanishSpeakers,
                                        at_home_services: formData.at_home_services,
                                        in_clinic_services: formData.in_clinic_services,
                                        logo: formData.logo
                                    }
                                }
                            ]
                        })
                    });
                    const responseData = await response.json();
                    console.log('Response status:', response.status);
                    console.log('Response headers:', Object.fromEntries(response.headers));
                    console.log('RESPONSE DATA FROM PATCH:', responseData)
                    if (!response.ok) {
                        throw new Error('Failed to update provider data') &&
                        toast.error('Failed to update data, if the issue persists contact the admin')
                    }
                    setSelectedInsurances(responseData.data[0].attributes.insurance || []);
                    setSelectedCounties(responseData.data[0].attributes.counties_served || []);
                    toast.success('Provider data updated successfully');
                    setShowError('');
                } catch (error) {
                    setShowError('Failed to save provider data. Please try again later.')
                    toast.error('Failed to save provider data. Please try again later.')
                } finally {
                    setIsSaving(false);
                }
            };

            updateProviderData();
        }
    }, [isSaving, formData, loggedInProvider?.id, loggedInProvider?.attributes.email, loggedInProvider?.attributes.cost, selectedInsurances, selectedCounties, updateLocalProviderData, locations]);
    useEffect(() => {
    }, [locations]);

    const handleLocationChange = (index: number, field: string, value: string) => {
        const updatedLocations = [...locations];
        updatedLocations[index] = { ...updatedLocations[index], [field]: value };
        setLocations(updatedLocations);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    const handleCountiesChange = (newCounties: CountiesServed[]) => {
        setSelectedCounties(newCounties);
    };

    const handleInsurancesChange = (newInsurances: Insurance[]) => {
        setSelectedInsurances(newInsurances);
        console.log('Updated insurances:', newInsurances); // Add this log
      };

    const toggleInsuranceModal = () => {
        setIsInsuranceModalOpen(!isInsuranceModalOpen);
    };
    useEffect(() => {
        console.log('selectedInsurances updated:', selectedInsurances);
      }, [selectedInsurances]);

    const toggleCountiesModal = () => {
        setIsCountiesModalOpen(!isCountiesModalOpen);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <img src={gearImage} alt="Loading..." className="loading-gear" />
                <p>Loading provider data...</p>
            </div>
        );
    }

    return (
        <div className='provider-edit-container'>
            <ToastContainer />
            <div className='user-info-section'>
                <h1>Welcome, {loggedInProvider?.attributes.name}</h1>
                <p>Last edited: </p>
                <button className='logoutButton' onClick={handleLogout}>Logout</button>
                <p>For any questions to the admin, please use the contact page.</p>
                <Link to="/contact" className='contact-link'>Click here to go to the contact page</Link>
            </div>

            <h1>Edit Your Information</h1>
            {showError ? (
                <div className='error-message'>{showError}</div>
            ) : (
                <div className='provider-edit-form'>
                    {locations.map((location, index) => (
                    <div key={index} className="location-section">
                        <div>
                        <h3>Location {index + 1}</h3>
                        </div>
                        <label htmlFor={`location-name-${index}`} className="editLabels">Location Name:</label>
                        <input
                            id={`location-name-${index}`}
                            type="text"
                            value={location.name}
                            onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                            placeholder="Location name"
                        />
                        <label htmlFor={`location-address-${index}`} className="editLabels">Street Address:</label>
                        <input
                            id={`location-address-${index}`}
                            type="text"
                            value={location.address_1}
                            onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)}
                            placeholder="Street address"
                        />
                        <label htmlFor={`location-city-${index}`} className="editLabels">City:</label>
                        <input
                            id={`location-city-${index}`}
                            type="text"
                            value={location.city}
                            onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                            placeholder="City"
                        />
                        <label htmlFor={`location-state-${index}`} className="editLabels">State:</label>
                        <input
                            id={`location-state-${index}`}
                            type="text"
                            value={location.state}
                            onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                            placeholder="State"
                        />
                        <label htmlFor={`location-zip-${index}`} className="editLabels">Zip Code:</label>
                        <input
                            id={`location-zip-${index}`}
                            type="text"
                            value={location.zip}
                            onChange={(e) => handleLocationChange(index, 'zip', e.target.value)}
                            placeholder="Zip code"
                        />
                        <label htmlFor={`location-phone-${index}`} className="editLabels">Phone Number:</label>
                        <input
                            id={`location-phone-${index}`}
                            type="text"
                            value={location.phone}
                            onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
                            placeholder="Phone number"
                        />
                    </div>
                ))}
                <button onClick={addNewLocation} className="add-location-button">
                    Add New Location
                </button>
            <label htmlFor='name' className='editLabels'>Provider Name:</label>
            <input id='name' type='text' name='name' value={formData.name} onChange={handleInputChange} />
            
            <label htmlFor='email' className='editLabels'>Provider Email:</label>
            <input id='email' type='text' name='email' value={formData.email} onChange={handleInputChange} />

            <label htmlFor='cost' className='editLabels'>Provider Email:</label>
            <input id='cost' type='text' name='cost' value={formData.cost} onChange={handleInputChange} />


            <label htmlFor='website' className='editLabels'>Website: </label>
            <input id='website' type="text" name="website" value={formData.website} onChange={handleInputChange} />
            
            <label htmlFor='logo' className='editLabels'>Link to Provider Logo: </label>
            <input id='logo' type="text" name="logo" value={formData.logo} onChange={handleInputChange} placeholder='url to logo here'/>
            
            <label htmlFor='spanishSpeakers' className='editLabels'>Spanish Speakers: </label>
            <input id='spanishSpeakers' type="text" name="spanishSpeakers" value={formData.spanishSpeakers} onChange={handleInputChange} placeholder='Yes, No, Limited?'/>
            
            <label htmlFor='min_age' className='editLabels'>Minimum Age Served: </label>
            <input id='min_age' type="number" name="min_age" value={formData.min_age} onChange={handleInputChange} />
            
            <label htmlFor='max_age' className='editLabels'>Maximum Age Served: </label>
            <input id='max_age' type="number" name="max_age" value={formData.max_age} onChange={handleInputChange} />
            
            <label htmlFor='waitlist' className='editLabels'>Waitlist Information: </label>
            <input id='waitlist' type="text" name="waitlistTime" value={formData.waitlistTime} onChange={handleInputChange} placeholder='Yes, No? Timeline?'/>
            
            <label htmlFor='clinicServices' className='editLabels'>In-clinic services: </label>
            <input id='clinicServices' type="text" name="in_clinic_services" value={formData.in_clinic_services} onChange={handleInputChange} placeholder='Yes, No?'/>
            
            <label htmlFor='at_home_services' className='editLabels'>Home Services: </label>
            <input id='at_home_services' type="text" name="at_home_services" value={formData.at_home_services} onChange={handleInputChange} placeholder='Yes, No?'/>
            
            <label htmlFor='telehealth' className='editLabels'>Telehealth Services: </label>
            <input id='telehealth' type="text" name="telehealth" value={formData.telehealth} onChange={handleInputChange} placeholder='Yes, No?'/>
            
                    <button onClick={toggleInsuranceModal} className='select-insurance-button'>
                        Select Insurance Coverage
                    </button>
                    {isInsuranceModalOpen && (
                        <InsuranceModal
                        isOpen={isInsuranceModalOpen}
                        onClose={() => setIsInsuranceModalOpen(false)}
                        selectedInsurances={selectedInsurances}
                        onInsurancesChange={handleInsurancesChange}
                        providerInsurances={selectedInsurances}
                    />
                    )}

                    <button onClick={toggleCountiesModal} className='select-counties-button'>
                        Select Counties
                    </button>
                    {isCountiesModalOpen && (
                <CountiesModal
                isOpen={isCountiesModalOpen}
                onClose={() => setIsCountiesModalOpen(false)}
                selectedCounties={selectedCounties}
                onCountiesChange={handleCountiesChange}
                providerCounties={loggedInProvider?.attributes.counties_served ?? []}
            />
                    )}
                    <div className='buttons-section'>
                        <button className='cancel-button'>Cancel</button>
                        <button className='save-button' onClick={handleSave}>Save</button>
                    </div>
                </div>

            )}
        </div>
    );
};

export default ProviderEdit;