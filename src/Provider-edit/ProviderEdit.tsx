import React, { useState, useEffect } from 'react';
import "./ProviderEdit.css";
import InsuranceModal from './InsuranceModal';
import CountiesModal from './CountiesModal';
import { Insurance, CountiesServed, MockProviderData } from '@/Utility/Types';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Provider-login/AuthProvider';

interface ProviderEditProps {
    loggedInProvider: MockProviderData | null;
    clearProviderData: () => void;
}

const ProviderEdit: React.FC<ProviderEditProps> = ({ loggedInProvider, clearProviderData }) => {
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState<Insurance[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [showError, setShowError] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
    }


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
        in_clinic_services: '',
        at_home_services: '',
        min_age: 0,
        max_age: 0,
        telehealth: ''
    });

    const handleLogout = () => {
        console.log('TOKEN STATUS', setToken(null))
        setToken(null);
        clearProviderData();
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('authToken')
        navigate('/login');

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
            setSelectedInsurance(loggedInProvider.attributes.insurance ?? []);
            setSelectedCounties(loggedInProvider.attributes.counties_served ?? []);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setShowError('Failed to load provider data. Please try again later.');
        }
    }, [loggedInProvider]);


    useEffect(() => {
        if (isSaving) {
            const updateProviderData = async () => {
                try {
                    const response = await fetch(`https://your-api-url.com/providers/${loggedInProvider?.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            provider: formData
                        })
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        console.log('error data:', responseData);
                        throw new Error('Failed to update provider data');
                    }
                    console.log('response data:', responseData);

                    setShowError('');
                } catch (error) {
                    console.log('failed to update provider data:', error);
                    setShowError('Failed to save provider data. Please try again later.');
                } finally {
                    setIsSaving(false);
                }
            };

            updateProviderData();
        }
    }, [isSaving, formData, loggedInProvider?.id]);

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const locationIndex = parseInt(e.target.value);
        setSelectedLocation(locationIndex);

        if (loggedInProvider && loggedInProvider.attributes.locations[locationIndex]) {
            const selectedLoc = loggedInProvider.attributes.locations[locationIndex];
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
        <div className='provider-edit-container'>
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
                    <select
                        id="dropdown-menu"
                        name="Select location"
                        onChange={handleLocationChange}
                        value={selectedLocation !== null ? selectedLocation : ''}
                    >
                        <option value="">Select location</option>
                        {loggedInProvider?.attributes.locations?.map((location, index) => (
                            <option key={index} value={index}>
                                {location.name}
                            </option>
                        ))}
                    </select>

                    {selectedLocation !== null && (
                        <>
                            <label className='editLabels' htmlFor='name' aria-label='provider name'>Provider Name: </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Provider/clinic name"
                            />
                            <label className='editLabels' htmlFor='location' aria-label='location name'>Location Name: </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Location name"
                            />
                            <label className='editLabels' htmlFor='address' aria-label='location address'>Location Address: </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street address"
                            />
                            <label className='editLabels' htmlFor='city' aria-label='location city'>Location City: </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                            />
                            <label className='editLabels' htmlFor='state' aria-label='location state'>Location State: </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="State"
                            />
                            <label className='editLabels' htmlFor='zipCode' aria-label='location zipcode'>Location Zipcode: </label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                placeholder="Zip code"
                            />
                            <label className='editLabels' htmlFor='phone' aria-label='location phone'>Location Phone: </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Phone number"
                            />
                        </>
                    )}
                    <label className='editLabels' htmlFor='website' aria-label='webiste link'>Website: </label>
                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="Link to the provider's site"
                    />
                    <label className='editLabels' htmlFor='logo' aria-label='provider logo'>Link to Provider Logo: </label>
                    <input
                        type="text"
                        name="logo"
                        value={formData.logo}
                        onChange={handleInputChange}
                        placeholder="Link to the provider's logo"
                    />
                    <label className='editLabels' htmlFor='spanish' aria-label='spanish speaker availability'>Spanish Speakers: </label>
                    <input
                        type="text"
                        name="spanish"
                        value={formData.spanishSpeakers}
                        onChange={handleInputChange}
                        placeholder="Spanish speakers?"
                    />
                    <label className='editLabels' htmlFor='min_age' aria-label='minimum age served'>Minimum Age Served: </label>
                    <input
                        type="number"
                        name="min_age"
                        value={formData.min_age}
                        onChange={handleInputChange}
                        placeholder="Min age served"
                    />
                    <label className='editLabels' htmlFor='max_age' aria-label='maximum age served'>Maximum Age Served: </label>
                    <input
                        type="number"
                        name="max_age"
                        value={formData.max_age}
                        onChange={handleInputChange}
                        placeholder="Max age served"
                    />
                    <label className='editLabels' htmlFor='waitlist' aria-label='waitlist'>Waitlist Information: </label>
                    <input
                        type="text"
                        name="waitlist"
                        value={formData.waitlistTime}
                        onChange={handleInputChange}
                        placeholder="Waitlist? possible timeframe?"
                    />
                    <label className='editLabels' htmlFor='clinicServices' aria-label='in clinic service'>In-clinic services: </label>
                    <input
                        type="text"
                        name="clinicServices"
                        value={formData.in_clinic_services}
                        onChange={handleInputChange}
                        placeholder="In clinic services? Yes, no?"
                    />
                    <label className='editLabels' htmlFor='homeServices' aria-label='at home services'>Home Services: </label>
                    <input
                        type="text"
                        name="homeServices"
                        value={formData.at_home_services}
                        onChange={handleInputChange}
                        placeholder="Home services? Yes, no?"
                    />
                    <label className='editLabels' htmlFor='telehealthServices' aria-label='at home services'>Telehealth Services: </label>
                    <input
                        type="text"
                        name="telehealthServices"
                        value={formData.telehealth}
                        onChange={handleInputChange}
                        placeholder="Telehealth services? Yes, no?"
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
                            providerInsurance={loggedInProvider?.attributes.insurance ?? []}
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