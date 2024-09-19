import React, { useState, useEffect, useRef } from 'react';
import "./ProviderEdit.css";
import InsuranceModal from './InsuranceModal';
import CountiesModal from './CountiesModal';
import { Insurance, ProviderAttributes, CountiesServed } from '@/Utility/Types';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Provider-login/AuthProvider';

interface ProviderEditProps {
    loggedInProvider: ProviderAttributes | null;
}

const ProviderEdit: React.FC<ProviderEditProps> = ({ loggedInProvider }) => {
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState<Insurance[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [showError, setShowError] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth();

    const [formData, setFormData] = useState({
        logo: '',
        name: '',
        website: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        spanishSpeakers: '',
        serviceType: '',
        waitlistTime: '',
        waitlistFrequency: '',
        in_clinic_services: '',
        at_home_services: '',
        min_age: 0,
        max_age: 0,
    });

    const handleLogout = () => {
        setToken(null);
        sessionStorage.removeItem('authToken');
        navigate('/login');
    };

    useEffect(() => {
        if (loggedInProvider && loggedInProvider.locations?.length) {
            setShowError('');
            setFormData({
                logo: loggedInProvider.logo ?? '',
                name: loggedInProvider.name ?? '',
                website: loggedInProvider.website ?? '',
                location: loggedInProvider.locations[0].name ?? '',
                address: loggedInProvider.locations[0].address_1 ?? '',
                city: loggedInProvider.locations[0].city ?? '',
                state: loggedInProvider.locations[0].state ?? '',
                zipCode: loggedInProvider.locations[0].zip ?? '',
                phone: loggedInProvider.locations[0].phone ?? '',
                spanishSpeakers: loggedInProvider.spanish_speakers ?? '',
                serviceType: loggedInProvider.in_clinic_services ?? '',
                waitlistTime: loggedInProvider.waitlist ?? '',
                waitlistFrequency: '',
                in_clinic_services: loggedInProvider.in_clinic_services ?? '',
                at_home_services: loggedInProvider.at_home_services ?? '',
                min_age: loggedInProvider.min_age ?? 0,
                max_age: loggedInProvider.max_age ?? 0,
            });
            setSelectedInsurance(loggedInProvider.insurance ?? []);
            setSelectedCounties(loggedInProvider.counties_served ?? []);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setShowError('Failed to load provider data. Please try again later.');
        }
    }, [loggedInProvider]);

    console.log('this is the logged in provider', loggedInProvider)

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const locationIndex = parseInt(e.target.value);
        setSelectedLocation(locationIndex);

        if (loggedInProvider && loggedInProvider.locations[locationIndex]) {
            const selectedLoc = loggedInProvider.locations[locationIndex];
            setFormData(prevFormData => ({
                ...prevFormData,
                location: selectedLoc.name ?? '',
                address: selectedLoc.address_1 ?? '',
                city: selectedLoc.city ?? '',
                state: selectedLoc.state ?? '',
                zipCode: selectedLoc.zip ?? '',
                phone: selectedLoc.phone ?? ''
            }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const toggleInsuranceModal = () => {
        setIsInsuranceModalOpen(!isInsuranceModalOpen);
    };

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
        <div>
            <div className='user-info-section'>
                <h1>Hello, {loggedInProvider?.name}</h1>
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
                    <select
                        id="dropdown-menu"
                        name="Select location"
                        onChange={handleLocationChange}
                        value={selectedLocation !== null ? selectedLocation : ''}
                    >
                        <option value="">Select location</option>
                        {loggedInProvider?.locations?.map((location, index) => (
                            <option key={index} value={index}>
                                {location.name}
                            </option>
                        ))}
                    </select>

                    {selectedLocation !== null && (
                        <>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Provider/clinic name"
                            />
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Location name"
                            />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street address"
                            />
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                            />
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="State"
                            />
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                placeholder="Zip code"
                            />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Phone number"
                            />
                        </>
                    )}

                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="Link to the provider's site"
                    />

                    <input
                        type="text"
                        name="logo"
                        value={formData.logo}
                        onChange={handleInputChange}
                        placeholder="Link to the provider's logo"
                    />

                    <button onClick={toggleInsuranceModal} className='select-insurance-button'>
                        Select Insurance Coverage
                    </button>
                    {isInsuranceModalOpen && (
                        <InsuranceModal
                            isOpen={isInsuranceModalOpen}
                            onClose={toggleInsuranceModal}
                            selectedInsurance={selectedInsurance}
                            setSelectedInsurance={setSelectedInsurance}
                            providerInsurance={loggedInProvider?.insurance ?? []}
                        />
                    )}

                    <button onClick={toggleCountiesModal} className='select-counties-button'>
                        Select Counties
                    </button>
                    {isCountiesModalOpen && (
                        <CountiesModal
                            isOpen={isCountiesModalOpen}
                            onClose={toggleCountiesModal}
                            selectedCounties={selectedCounties}
                            setSelectedCounties={setSelectedCounties}
                            providerCounties={loggedInProvider?.counties_served ?? []}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ProviderEdit;