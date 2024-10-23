import React, { useState } from 'react';
import './SuperAdminCreate.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CountiesModal from '../Provider-edit/CountiesModal';
import { CountiesServed, Insurance } from '../Utility/Types';
import { InsuranceModal } from '../Signup/InsuranceModal';

interface SuperAdminCreateProps {
    handleCloseForm: () => void;
}

const SuperAdminCreate: React.FC<SuperAdminCreateProps> = ({ handleCloseForm }) => {
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        locations: [{ id: null, name: '', address_1: '', city: '', state: '', zip: '', phone: '' }],
        insurances: [] as string[],
        counties_served: [] as string[],
        website: '',
        cost: '',
        min_age: '',
        max_age: '',
        waitlist: '',
        telehealth_services: '',
        spanish_speakers: '',
        at_home_services: '',
        in_clinic_services: '',
        logo: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
    const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (index: number, field: string, value: string) => {
        const updatedLocations = [...formData.locations];
        updatedLocations[index] = { ...updatedLocations[index], [field]: value };
        setFormData(prev => ({ ...prev, locations: updatedLocations }));
    };

    const addNewLocation = () => {
        setFormData(prev => ({
            ...prev,
            locations: [...prev.locations, { id: null, name: '', address_1: '', city: '', state: '', zip: '', phone: '' }]
        }));
    };

    const removeLocation = (index: number) => {
        const updatedLocations = [...formData.locations];
        updatedLocations.splice(index, 1);
        setFormData(prev => ({ ...prev, locations: updatedLocations }));
    };

    // Counties Modal Handlers
    const handleOpenCountiesModal = () => {
        setIsCountiesModalOpen(true);
    };

    const handleCloseCountiesModal = () => {
        setIsCountiesModalOpen(false);
    };

    const handleCountiesChange = (newCounties: CountiesServed[]) => {
        const countyNames = newCounties.map(county => county.county).filter(county => county !== null) as string[];
        setSelectedCounties(countyNames);
        setFormData(prev => ({ ...prev, counties_served: countyNames }));
    };

    // Insurance Modal Handlers
    const handleOpenInsuranceModal = () => {
        setIsInsuranceModalOpen(true);
    };

    const handleCloseInsuranceModal = () => {
        setIsInsuranceModalOpen(false);
    };

    // Updated to ensure insurance is saved and modal closes
    const handleInsurancesChange = (selectedInsuranceNames: string[]) => {
        setSelectedInsurances(selectedInsuranceNames);
        setFormData(prev => ({ ...prev, insurances: selectedInsuranceNames }));
        setIsInsuranceModalOpen(false); // Manually close modal after selection
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    data: [
                        {
                            type: "provider",
                            attributes: {
                                name: formData.name,
                                locations: formData.locations.map(location => ({
                                    id: location.id,
                                    name: location.name,
                                    address_1: location.address_1,
                                    city: location.city,
                                    state: location.state,
                                    zip: location.zip,
                                    phone: location.phone,
                                })),
                                website: formData.website,
                                email: formData.email,
                                cost: formData.cost,
                                insurance: formData.insurances.map(ins => ({
                                    name: ins,
                                    accepted: true
                                })),
                                counties_served: formData.counties_served.map(county => ({
                                    county
                                })),
                                min_age: parseInt(formData.min_age),
                                max_age: parseInt(formData.max_age),
                                waitlist: formData.waitlist,
                                telehealth_services: formData.telehealth_services,
                                spanish_speakers: formData.spanish_speakers,
                                at_home_services: formData.at_home_services,
                                in_clinic_services: formData.in_clinic_services,
                                logo: formData.logo,
                            }
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create provider');
            }

            setFormData({
                id: null,
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                locations: [{ id: null, name: '', address_1: '', city: '', state: '', zip: '', phone: '' }],
                insurances: [],
                counties_served: [],
                website: '',
                cost: '',
                min_age: '',
                max_age: '',
                waitlist: '',
                telehealth_services: '',
                spanish_speakers: '',
                at_home_services: '',
                in_clinic_services: '',
                logo: '',
            });

            toast.success('Provider created successfully!');
            handleCloseForm();
        } catch (error) {
            console.error('Error creating provider:', error);
            setError('There was an error creating the provider. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <ToastContainer />
            <div className='superAdminCreateWrapper'>
                <h1>Create New Provider</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className='superAdmin-input-wrapper'>
                        <label htmlFor="name">Provider Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Provider Name" required />
                    </div>
                    <div className='superAdmin-input-wrapper'>
                        <label htmlFor="email">E-mail Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail Address" required />
                    </div>

                    {formData.locations.map((location, index) => (
                        <div key={location.id || index} className='superAdmin-location-wrapper'>
                            <h3>Location {index + 1}</h3>
                            <input type="text" placeholder="Location Name" value={location.name} onChange={(e) => handleLocationChange(index, 'name', e.target.value)} />
                            <input type="text" placeholder="Street Address" value={location.address_1} onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)} />
                            <input type="text" placeholder="City" value={location.city} onChange={(e) => handleLocationChange(index, 'city', e.target.value)} />
                            <input type="text" placeholder="State" value={location.state} onChange={(e) => handleLocationChange(index, 'state', e.target.value)} />
                            <input type="text" placeholder="Zip" value={location.zip} onChange={(e) => handleLocationChange(index, 'zip', e.target.value)} />
                            <input type="text" placeholder="Phone" value={location.phone} onChange={(e) => handleLocationChange(index, 'phone', e.target.value)} />
                            <div>
                                <button type="button" onClick={addNewLocation} className='superAdmin-add-location-button'>Add Location</button>
                            </div>
                        </div>
                    ))}

                    <div className='superAdmin-counties-modal-container'>
                        <button type="button" onClick={handleOpenCountiesModal} className='superAdmin-open-counties-button'>
                            Select Counties
                        </button>

                        {isCountiesModalOpen && (
                            <CountiesModal
                                isOpen={isCountiesModalOpen}
                                onClose={handleCloseCountiesModal}
                                selectedCounties={selectedCounties.map(county => ({ county }))}
                                onCountiesChange={handleCountiesChange}
                                providerCounties={[] as CountiesServed[]}
                            />
                        )}
                    </div>

                    <div className='superAdmin-insurance-modal-container'>
                        <button type="button" onClick={handleOpenInsuranceModal} className='superAdmin-open-insurance-button'>
                            Select Insurances
                        </button>

                        {isInsuranceModalOpen && (
                            <InsuranceModal
                                isOpen={isInsuranceModalOpen}
                                onClose={handleCloseInsuranceModal}
                                onSelect={handleInsurancesChange}

                            />
                        )}
                    </div>

                    <div className='superAdmin-input-wrapper'>
                        <label htmlFor="website">Website</label>
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            onBlur={(e) => {
                                if (!e.target.value.startsWith('https://') && !e.target.value.startsWith('http://') && e.target.value.trim() !== '') {
                                    setFormData(prev => ({ ...prev, website: `https://${e.target.value}` }));
                                }
                            }}
                            placeholder="'https://' will be added automatically"
                            required
                        />
                    </div>
                    <div className='superAdmin-input-wrapper'>
                        <label htmlFor="cost">Cost</label>
                        <input type="text" name="cost" value={formData.cost} onChange={handleChange} placeholder="Cost" required />
                    </div>
                    <div className='superAdmin-age-container'>
                        <div className='superAdmin-input-wrapper'>
                            <label htmlFor="min_age">Min Age</label>
                            <input
                                type="number"
                                name="min_age"
                                value={formData.min_age}
                                onChange={handleChange}
                                placeholder="higher than 0"
                                min="1"
                                max="99"
                                required
                            />
                        </div>
                        <div className='superAdmin-input-wrapper'>
                            <label htmlFor="max_age">Max Age</label>
                            <input
                                type="number"
                                name="max_age"
                                value={formData.max_age}
                                onChange={handleChange}
                                placeholder="higher than min age"
                                min="1"
                                max="99"
                                required
                            />
                        </div>
                    </div>

                    <div className='superAdmin-input-wrapper'>
                        <label htmlFor="logo">Logo URL</label>
                        <input type="text" name="logo" value={formData.logo} onChange={handleChange} placeholder="Logo URL" />
                    </div>

                    <div className='superAdmin-waitlist-container'>
                        <label htmlFor="waitlist">Waitlist Information</label>
                        <select name="waitlist" className='superAdmin-waitlist-select' value={formData.waitlist} onChange={handleChange} required>
                            <option value="" disabled>Select Waitlist Information</option>
                            <option value="no wait list">No wait list</option>
                            <option value="6 months or less">6 months or less</option>
                        </select>
                    </div>

                    <div className='superAdmin-input-wrapper-telehealth'>
                        <label htmlFor="telehealth_services">Telehealth Services</label>
                        <select
                            id="telehealth_services"
                            name="telehealth_services"
                            value={formData.telehealth_services}
                            onChange={handleChange}
                        >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="limited">Limited</option>
                        </select>
                    </div>
                    <div className='superAdmin-input-wrapper-at-home'>
                        <label htmlFor="at_home_services">At Home Services</label>
                        <select
                            id="at_home_services"
                            name="at_home_services"
                            value={formData.at_home_services}
                            onChange={handleChange}
                        >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div className='superAdmin-input-wrapper-in-clinic'>
                        <label htmlFor="in_clinic_services">In Clinic Services</label>
                        <select
                            id="in_clinic_services"
                            name="in_clinic_services"
                            value={formData.in_clinic_services}
                            onChange={handleChange}
                        >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div className='superAdmin-input-wrapper-spanish'>
                        <label htmlFor="spanish_speakers">Spanish Speakers</label>
                        <select
                            name="spanish_speakers"
                            value={formData.spanish_speakers}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="contact-us">Contact Us</option>
                        </select>
                    </div>
                    <div className='superAdmin-create-buttons-container'>
                        <button className='superAdmin-create-new-provider-button' type="submit" disabled={isSaving}>Create Provider</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminCreate;