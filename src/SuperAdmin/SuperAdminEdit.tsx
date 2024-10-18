import React, { useState, useEffect } from 'react'
import { MockProviderData, ProviderAttributes, CountiesServed, Insurance, Location } from '../Utility/Types'
import './SuperAdminEdit.css'
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg'
import InsuranceModal from '../Provider-edit/InsuranceModal';
import CountiesModal from '../Provider-edit/CountiesModal';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SuperAdminEditProps {
    provider: MockProviderData;
    onUpdate: (updatedProvider: ProviderAttributes) => void
}

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({ provider, onUpdate }) => {
    const [editedProvider, setEditedProvider] = useState<ProviderAttributes | null>(null);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
    const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (provider && provider.attributes) {
            setEditedProvider(provider.attributes);
            setSelectedCounties(provider.attributes.counties_served || []);
            setSelectedInsurances(provider.attributes.insurance || []);
            setLocations(provider.attributes.locations || []);
            setIsLoading(false);
        } else {
            console.warn("Provider prop is null, undefined, or missing attributes");
            setIsLoading(true);
        }
    }, [provider]);

    const handleCancel = () => {
        if (provider && provider.attributes) {
            setEditedProvider(provider.attributes);
            setSelectedCounties(provider.attributes.counties_served || []);
            setSelectedInsurances(provider.attributes.insurance || []);
            setLocations(provider.attributes.locations || []);
            toast.success('Provider data reset to last saved information');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedProvider(prev => {
            if (!prev) return null;
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (!provider || !provider.id || !editedProvider) {
            console.error('Provider, Provider ID, or editedProvider is missing');
            toast.error('Cannot update provider: Missing data');
            setIsSaving(false);
            return;
        }

        try {
            const requestBody = JSON.stringify({
                data: [{
                    id: provider.id,
                    type: "provider",
                    attributes: {
                        ...editedProvider,
                        insurance: selectedInsurances,
                        counties_served: selectedCounties,
                        locations: locations
                    }
                }]
            });

            const authToken = sessionStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Authentication token is missing');
            }

            const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${provider.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: requestBody
            });

            if (!response.ok) {
                throw new Error(`Failed to update provider data: ${response.status} ${response.statusText}`);
            }

            const updatedProvider = await response.json();
            onUpdate(updatedProvider.data[0].attributes);
            setEditedProvider(updatedProvider.data[0].attributes);
            toast.success('Provider updated successfully');
        } catch (error) {
            console.error('Error updating provider:', error);
            toast.error(`Failed to update provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLocationChange = (index: number, field: string, value: string) => {
        const updatedLocations = [...locations];
        updatedLocations[index] = { ...updatedLocations[index], [field]: value };
        setLocations(updatedLocations);
    };

    const addNewLocation = () => {
        setLocations([...locations, {
            id: null,
            name: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            zip: '',
            phone: ''
        }]);
    };

    const toggleInsuranceModal = () => {
        setIsInsuranceModalOpen(prevState => !prevState);
    };

    const toggleCountiesModal = () => {
        setIsCountiesModalOpen(prevState => !prevState);
    };

    const handleCountiesChange = (newCounties: CountiesServed[]) => {
        setSelectedCounties(newCounties);
    };

    const handleInsurancesChange = (newInsurances: Insurance[]) => {
        setSelectedInsurances(newInsurances);
    };

    if (isLoading) {
        return <div className="loading-container">
            <img src={gearImage} alt="Loading..." className="loading-gear" />
            <p>Loading provider data...</p>
        </div>;
    }

    if (!editedProvider) {
        return <div>No provider data available</div>;
    }

    return (
        <div className='superAdminEditWrapper'>
            <ToastContainer />
            <section className='superAdminEditFormWrapper'>
                <h1>Editing: <strong className='superAdminEditFormName'>{editedProvider.name}</strong></h1>
                <p>Last updated: {editedProvider.updated_last ? moment(editedProvider.updated_last).format('MM/DD/YYYY') : 'N/A'}</p>
                <form className='superAdminEditForm' onSubmit={handleSubmit}>
                    <div className='providerNameWrapper'>
                        <label htmlFor="name">Name</label>
                        <input
                            className='providerNameInput'
                            type="text"
                            name="name"
                            value={editedProvider.name || ''}
                            onChange={handleInputChange}
                            placeholder="Provider Name"
                        />
                    </div>
                    <div className='formContent'>
                        <div className='firstColumn'>
                            {locations.map((location, index) => (
                                <div key={index} className="location-section">
                                    <div>
                                        <h3>Location {index + 1}</h3>
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-name-${index}`} className="editLabels">Location Name:</label>
                                        <input
                                            id={`location-name-${index}`}
                                            type="text"
                                            value={location.name || ''}
                                            onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                                            placeholder="Location name"
                                        />
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-address-${index}`} className="editLabels">Street Address:</label>
                                        <input
                                            id={`location-address-${index}`}
                                            type="text"
                                            value={location.address_1 || ''}
                                            onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)}
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-city-${index}`} className="editLabels">City:</label>
                                        <input
                                            id={`location-city-${index}`}
                                            type="text"
                                            value={location.city || ''}
                                            onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-state-${index}`} className="editLabels">State:</label>
                                        <input
                                            id={`location-state-${index}`}
                                            type="text"
                                            value={location.state || ''}
                                            onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-zip-${index}`} className="editLabels">Zip Code:</label>
                                        <input
                                            id={`location-zip-${index}`}
                                            type="text"
                                            value={location.zip || ''}
                                            onChange={(e) => handleLocationChange(index, 'zip', e.target.value)}
                                            placeholder="Zip code"
                                        />
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-phone-${index}`} className="editLabels">Phone Number:</label>
                                        <input
                                            id={`location-phone-${index}`}
                                            type="text"
                                            value={location.phone || ''}
                                            onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
                                            placeholder="Phone number"
                                        />
                                    </div>
                                    <div className='formRow'>
                                        <label htmlFor={`location-address-2-${index}`} className="editLabels">Address 2:</label>
                                        <input
                                            id={`location-address-2-${index}`}
                                            type="text"
                                            value={location.address_2 || ''}
                                            onChange={(e) => handleLocationChange(index, 'address_2', e.target.value)}
                                            placeholder="Address 2"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button onClick={addNewLocation} type="button" className="add-location-button">
                                Add New Location
                            </button>
                        </div>
                        <div className='secondColumn'>
                            <label htmlFor="status">Status</label>
                            <select
                                className='superAdminStatusEdit'
                                name="status"
                                value={editedProvider.status || ''}
                                onChange={handleInputChange}
                            >
                                <option value="" disabled>Select provider status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="denied">Denied</option>
                            </select>

                            <label htmlFor="logo">Logo:</label>
                            <input
                                type="text"
                                name="logo"
                                value={editedProvider.logo || ''}
                                onChange={handleInputChange}
                                placeholder="Provider logo url"
                            />

                            <label htmlFor="website">Website</label>
                            <input
                                type="text"
                                name="website"
                                value={editedProvider.website || ''}
                                onChange={handleInputChange}
                                placeholder="Provider website"
                            />

                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                name="email"
                                value={editedProvider.email || ''}
                                onChange={handleInputChange}
                                placeholder="Provider Email"
                            />

                            <label htmlFor="cost">Cost</label>
                            <textarea
                                className='superAdminEditCost'
                                name="cost"
                                value={editedProvider.cost || ''}
                                onChange={handleInputChange}
                                placeholder="Cost?"
                            />

                            <label htmlFor="waitlist">Waitlist</label>
                            <input
                                type="text"
                                name="waitlist"
                                value={editedProvider.waitlist || ''}
                                onChange={handleInputChange}
                                placeholder="Yes, No? Timeline? "
                            />

                            <label htmlFor='in_clinic_services' className='editLabels'>In-clinic services: </label>
                            <input
                                id='in_clinic_services'
                                type="text"
                                name="in_clinic_services"
                                value={editedProvider.in_clinic_services || ''}
                                onChange={handleInputChange}
                                placeholder='Yes, No?'
                            />

                            <label htmlFor='at_home_services' className='editLabels'>Home Services: </label>
                            <input
                                id='at_home_services'
                                type="text"
                                name="at_home_services"
                                value={editedProvider.at_home_services || ''}
                                onChange={handleInputChange}
                                placeholder='Yes, No?'
                            />

                            <label htmlFor='telehealth_services' className='editLabels'>Telehealth Services: </label>
                            <input
                                id='telehealth_services'
                                type="text"
                                name="telehealth_services"
                                value={editedProvider.telehealth_services || ''}
                                onChange={handleInputChange}
                                placeholder='Yes, No?'
                            />

                            <label htmlFor='spanish_speakers' className='editLabels'>Spanish Speakers: </label>
                            <input
                                id='spanish_speakers'
                                type="text"
                                name="spanish_speakers"
                                value={editedProvider.spanish_speakers || ''}
                                onChange={handleInputChange}
                                placeholder="Yes, No"
                            />

                            <label htmlFor='min_age' className='editLabels'>Minimum Age: </label>
                            <input
                                id='min_age'
                                type="number"
                                name="min_age"
                                value={editedProvider.min_age || ''}
                                onChange={handleInputChange}
                                placeholder="1"
                                min="1"
                            />

                            <label htmlFor='max_age' className='editLabels'>Maximum Age: </label>
                            <input
                                id='max_age'
                                type="number"
                                name="max_age"
                                value={editedProvider.max_age || ''}
                                onChange={handleInputChange}
                                placeholder="25"
                                max="100"
                            />

                            <button className='editButtons' onClick={(e) => {
                                e.preventDefault();
                                toggleInsuranceModal();
                            }}>Edit Insurances</button>
                            <button className='editButtons' onClick={(e) => {
                                e.preventDefault();
                                toggleCountiesModal();
                            }}>Edit Counties</button>

                        </div>
                    </div>
                    {isInsuranceModalOpen && (
                    <InsuranceModal
                        isOpen={isInsuranceModalOpen}
                        onClose={() => setIsInsuranceModalOpen(false)}
                        selectedInsurances={selectedInsurances}
                        onInsurancesChange={handleInsurancesChange}
                        providerInsurances={provider.attributes.insurance || []}
                    />
                    )}
                    {isCountiesModalOpen && (
                        <CountiesModal
                            isOpen={isCountiesModalOpen}
                            onClose={() => setIsCountiesModalOpen(false)}
                            selectedCounties={selectedCounties}
                            onCountiesChange={handleCountiesChange}
                            providerCounties={provider.attributes.counties_served || []}
                        />
                    )}
                    <div className='superAdminEditFormButtonsWrapper'>
                        <button className='cancelButton' type='button' onClick={handleCancel}>Cancel</button>
                        <button type="submit" disabled={isSaving}>
                            {isSaving ? 'Updating...' : 'Update Provider'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}
