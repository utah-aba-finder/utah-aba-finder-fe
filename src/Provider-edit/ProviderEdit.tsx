import React, { useState, useEffect } from 'react';
import "./ProviderEdit.css";
import InsuranceModal from './InsuranceModal';
import CountiesModal from './CountiesModal';
import { ProviderAttributes } from '@/Utility/Types';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';

interface ProviderEditProps {
    loggedInProvider: ProviderAttributes | null;
}
const ProviderEdit: React.FC<ProviderEditProps> = ({ loggedInProvider }) => {
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        logo: '',
        name: '',
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
    });

    useEffect(() => {
        if (loggedInProvider) {
            setFormData({
                logo: loggedInProvider.logo ?? '',
                name: loggedInProvider.name ?? '',
                location: loggedInProvider.locations?.[0]?.name ?? '',
                address: loggedInProvider.locations?.[0]?.address_1 ?? '',
                city: loggedInProvider.locations?.[0]?.city ?? '',
                state: loggedInProvider.locations?.[0]?.state ?? '',
                zipCode: loggedInProvider.locations?.[0]?.zip ?? '',
                phone: loggedInProvider.locations?.[0]?.phone ?? '',
                spanishSpeakers: loggedInProvider.spanish_speakers ?? '',
                serviceType: loggedInProvider.in_clinic_services ? 'clinic' : 'home',
                waitlistTime: '', // You'll need to parse this from loggedInProvider.waitlist
                waitlistFrequency: '', // You'll need to parse this from loggedInProvider.waitlist
            });
        }
    }, [loggedInProvider]);

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
    // const handleInsuranceChange = (insurance: string[]) => {
    //     setSelectedInsurance(insurance);
    // };

    const toggleCountiesModal = () => {
        setIsCountiesModalOpen(!isCountiesModalOpen);
        
        // Update the provider's counties_served data
        const updatedProvider = {
            ...loggedInProvider,
            counties_served: selectedCounties.map(county => ({ county }))
        };
        
        // Here you would typically make an API call to update the provider data
        // For example:
        // updateProviderData(updatedProvider);
        
        console.log('Updated provider data:', updatedProvider);
    };
    if (!loggedInProvider) {
        <div className="loading-container">
                <img src={gearImage} alt="Loading..." className="loading-gear" />
            </div>
    }

    return (
        <div>
            <h1>Edit Your Information</h1>
            <div className='provider-edit-form'>
                <select id="dropdown-menu" name="Select location">
                    <option value="">Select location (only if you have multiple locations)</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </select>
                <input 
                    type="text" 
                    name="logo" 
                    value={formData.logo} 
                    onChange={handleInputChange} 
                    placeholder="Link to the provider's logo" 
                />
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Provider/clinic name (Ex.ABS Kids)" 
                />
                <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    placeholder="Location name (Ex.Utah County Office)" 
                />
                <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Street address (Ex.1140W 1130S)" 
                />
                <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    // placeholder="City (Ex.Orem)" 
                />
                <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange} 
                    placeholder="State (Ex.UT)" 
                />
                <input 
                    type="text" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleInputChange} 
                    placeholder="Zip code (Ex.84058)" 
                />
                <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="Phone number (Ex.123-456-7890)" 
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
                            <option value="more than 1 week">More than1 week</option>
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
}

export default ProviderEdit;