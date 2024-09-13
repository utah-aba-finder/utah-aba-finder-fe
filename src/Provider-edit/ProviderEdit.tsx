import React, { useState } from 'react';
import "./ProviderEdit.css";
import InsuranceModal from './InsuranceModal';
import CountiesModal from './CountiesModal';

const ProviderEdit = () => {
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<string[]>([]);

    const toggleInsuranceModal = () => {
        setIsInsuranceModalOpen(!isInsuranceModalOpen);
    };

    const toggleCountiesModal = () => {
        setIsCountiesModalOpen(!isCountiesModalOpen);
    };

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
                <input type="text" placeholder="Link to the provider's logo" />
                <input type="text" placeholder="Provider/clinic name (Ex.ABS Kids)" />
                <input type="text" placeholder="Location name (Ex.Utah County Office)" />
                <input type="text" placeholder="Street address (Ex.1140W 1130S)" />
                <input type="text" placeholder="City (Ex.Orem)" />
                <input type="text" placeholder="State (Ex.UT)" />
                <input type="text" placeholder="Zip code (Ex.84058)" />
                <input type="text" placeholder="Phone number (Ex.123-456-7890)" />

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
                        <select id="spanish-speaking">
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>

                <div className='clinic-section'>
                    <div className='input-box'>
                        <label>In clinic / at-home service? </label>
                        <select id="clinic-service">
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