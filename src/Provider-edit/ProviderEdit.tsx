import React, { useState, useEffect } from 'react';
import "./ProviderEdit.css";
import InsuranceModal from './InsuranceModal';
import CountiesModal from './CountiesModal';
import { Insurance, ProviderAttributes, CountiesServed } from '@/Utility/Types';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Provider-login/AuthProvider';


const mockLoggedInProvider: ProviderAttributes = {
    id: 1,
    name: "Mock Provider",
    logo: "https://logo.com",
    spanish_speakers: "yes",
    in_clinic_services: "clinic",
    at_home_services: "no",
    telehealth_services: "yes",
    password: "password",
    username: "test",
    website: "https://ourwebsite.com",
    email: "test@test.com",
    cost: "100",
    min_age: 1,
    max_age: 100,
    waitlist: "No waitlist",

    locations: [
        {
            name: "Location example Turing clinic",
            address_1: "123 Street",
            address_2: "Apt 1",
            city: "Dallas",
            state: "TX",
            zip: "75251",
            phone: "123-456-7890"
        },
        {
            name: "Location example Turing clinic2",
            address_1: "456 Street",
            address_2: "Apt 2",
            city: "Austin",
            state: "TX",
            zip: "73301",
            phone: "987-654-3210"
        }
    ],
    insurance: [
        { id: 1, name: "Contact us" },
        { id: 2, name: "Administrator Benefits" },
        { id: 3, name: "Aetna" },
    ],
    counties_served: [
        {
            county: "Salt Lake, Utah, Davis"
        }
    ]
};


interface ProviderEditProps {
    loggedInProvider?: ProviderAttributes | null;
}

const ProviderEdit: React.FC<ProviderEditProps> = () => {
    const loggedInProvider = mockLoggedInProvider;

    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState<Insurance[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
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
        if (loggedInProvider && loggedInProvider.locations?.[0]) {
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
                waitlistTime: '',
                waitlistFrequency: '',
                in_clinic_services: '',
                at_home_services: '',
                min_age: loggedInProvider.min_age ?? 0,
                max_age: loggedInProvider.max_age ?? 0,
            });
        }
    }, [loggedInProvider]);

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const locationIndex = e.target.value ? parseInt(e.target.value) : null;
        setSelectedLocation(locationIndex);

        if (loggedInProvider && locationIndex !== null && loggedInProvider.locations?.[locationIndex]) {
            const selectedLoc = loggedInProvider.locations[locationIndex];
            setFormData({
                ...formData,
                location: selectedLoc.name ?? '',
                address: selectedLoc.address_1 ?? '',
                city: selectedLoc.city ?? '',
                state: selectedLoc.state ?? '',
                zipCode: selectedLoc.zip ?? '',
                phone: selectedLoc.phone ?? '',
            });
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

    return (
        <div>
            <div className='user-info-section'>
                <h1>Hello, {loggedInProvider.name}</h1>
                <p>Last edited: time/date</p>
                <button className='logoutButton' onClick={handleLogout}>Logout</button>
                <p>For any questions to the admin, please use the contact page.</p>
                <Link to="/contact" className='contact-link'>Click here to go to the contact page</Link>
            </div>

            <h1>Edit Your Information</h1>
            <div className='provider-edit-form'>
                <select
                    id="dropdown-menu"
                    name="Select location"
                    onChange={handleLocationChange}
                    value={selectedLocation !== null ? selectedLocation : ''}
                >
                    <option value="">Select location</option>
                    {loggedInProvider.locations?.map((location, index) => (
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
                    name="logo"
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
                        providerInsurance={loggedInProvider.insurance}
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
                        providerCounties={loggedInProvider.counties_served}
                    />
                )}

                <div className='spanish-speaking-section'>
                    <div className='input-box'>
                        <label className="spanish-speaking">Spanish speakers? </label>
                        <select
                            id="spanish-speaking"
                            name="spanishSpeakers"
                            value={formData.spanishSpeakers}
                            onChange={handleInputChange}
                        >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>

                <div className='clinic-section'>
                    <div className='input-box'>
                        <label>In clinic / at-home service? </label>
                        <select
                            id="clinic-service"
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleInputChange}
                        >
                            <option value="">Select an option</option>
                            <option value="clinic">In clinic</option>
                            <option value="home">At-home</option>
                        </select>
                    </div>
                </div>

                <div className='waitList-section'>
                    <div className='input-box'>
                        <label>Waitlist </label>
                        <select id="time-service">
                            <option value="">Select an option</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                        </select>
                        <select id="frequency-service">
                            <option value="">Select an option</option>
                            <option value="0-3 days">0-3 days</option>
                            <option value="1 week">~1 week</option>
                            <option value="more than 1 week">More than 1 week</option>
                        </select>
                    </div>
                </div>

                <div className='buttons-section'>
                    <button className='cancel-button'>Cancel</button>
                    <button className='save-button'>Save</button>
                </div>
            </div>
        </div>
    );
};

export default ProviderEdit;