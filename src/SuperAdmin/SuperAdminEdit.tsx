import React, { useState, useEffect } from 'react'
import { MockProviderData, ProviderAttributes, CountiesServed, Insurance, Location } from '../Utility/Types'
import './SuperAdminEdit.css'
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg'
import InsuranceModal from '../Provider-edit/InsuranceModal';
import CountiesModal from '../Provider-edit/CountiesModal';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface SuperAdminEditProps {
    provider: ProviderAttributes;
    onUpdate: (updatedProvider: ProviderAttributes) => void
}

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({ provider, onUpdate }) => {
    const [editedProvider, setEditedProvider] = useState<ProviderAttributes | null>(null);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
    const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState('');
    const [providerId, setProviderId] = useState<number | null>(null);


    useEffect(() => {
        if (provider && provider.id) {
            setEditedProvider(provider);
            setSelectedCounties(provider.counties_served);
            setSelectedInsurances(provider.insurance);
            setLocations(provider.locations);
            setProviderId(provider.id);
            setIsLoading(false);
        }
    }, [provider]);

    // const handleSave = () => {
    //     setIsSaving(true);
    //     onUpdate(editedProvider!);
    //     setIsSaving(false);
    // };

    const handleCancel = () => {
        setEditedProvider(provider);
        setSelectedCounties(provider.counties_served);
        setSelectedInsurances(provider.insurance);
        setLocations(provider.locations);
    };

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
        telehealth: '',
        status: '',
    });

    if (!editedProvider) {
        return <div className="loading-container">
            <img src={gearImage} alt="Loading..." className="loading-gear" />
            <p>Loading provider data...</p>
        </div>
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedProvider(prev => {
            if (!prev) return null;
            
            // Handle nested fields
            if (name === 'min_age' || name === 'max_age') {
                return {
                    ...prev,
                    [name]: parseInt(value) || 0  // Convert to number, default to 0 if NaN
                };
            }
            
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
    
        if (!provider || !provider.id) {
            console.error('Provider ID is missing');
            toast.error('Cannot update provider: Provider ID is missing');
            setIsSaving(false);
            return;
        }
    
        try {
            const requestBody = JSON.stringify({
                data: [
                    {
                        type: "provider",
                        attributes: {
                            name: editedProvider.name,
                            locations: locations.map(location => ({
                                id: location.id,
                                name: location.name,
                                address_1: location.address_1,
                                city: location.city,
                                state: location.state,
                                zip: location.zip,
                                phone: location.phone
                            })),
                            website: editedProvider.website,
                            email: editedProvider.email,
                            cost: editedProvider.cost,
                            insurance: selectedInsurances.map(ins => ({
                                name: ins.name,
                                id: ins.id,
                                accepted: true
                            })),
                            counties_served: selectedCounties.map(county => ({
                                county: county.county
                            })),
                            min_age: editedProvider.min_age,
                            max_age: editedProvider.max_age,
                            waitlist: editedProvider.waitlist,
                            telehealth_services: editedProvider.telehealth_services,
                            spanish_speakers: editedProvider.spanish_speakers,
                            at_home_services: editedProvider.at_home_services,
                            in_clinic_services: editedProvider.in_clinic_services,
                            logo: editedProvider.logo,
                            status: editedProvider.status
                        }
                    }
                ]
            });
    
            console.log('Request body:', requestBody);
            console.log('Provider ID:', providerId);
    
            const authToken = sessionStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Authentication token is missing');
            }
    
            const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${providerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: requestBody
            });
    
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again');
                }
                const errorText = await response.text();
                console.error('Response status:', response.status);
                console.error('Response text:', errorText);
                throw new Error(`Failed to update provider data: ${response.status} ${response.statusText}\n${errorText}`);
            }
    
            const updatedProvider = await response.json();
            console.log('Updated provider:', updatedProvider);
            onUpdate(updatedProvider.data[0].attributes);
            toast.success('Provider updated successfully');
        } catch (error) {
            console.error('Error updating provider:', error);
            if (error instanceof Error) {
                if (error.message.includes('Unauthorized')) {
                    toast.error('Your session has expired. Please log in again.');
                    // Implement logout or redirect to login page
                } else {
                    toast.error(`Failed to update provider: ${error.message}`);
                }
            } else {
                toast.error('An unknown error occurred');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleLocationChange = (index: number, field: string, value: string) => {
        const updatedLocations = [...locations];
        updatedLocations[index][field as keyof Location] = value as any;
        setLocations(updatedLocations);
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

    const toggleInsuranceModal = () => {
        setIsInsuranceModalOpen(prevState => !prevState);
        console.log("Insurance modal toggled:", !isInsuranceModalOpen); // Add this line
    };

    const toggleCountiesModal = () => {
        setIsCountiesModalOpen(prevState => !prevState);
        console.log("Counties modal toggled:", !isCountiesModalOpen); // Add this line
    };

    const handleInsurancesChange = (insurances: Insurance[]) => {
        setSelectedInsurances(insurances);
    };

    const handleCountiesChange = (counties: CountiesServed[]) => {
        setSelectedCounties(counties);
    };

    return (
        <div className='superAdminEditWrapper'>
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
                            <button onClick={addNewLocation} className="add-location-button">
                                Add New Location
                            </button>
                        </div>
                        <div className='secondColumn'>
                            <label htmlFor="status">Status</label>
                            <select
                                className='superAdminStatusEdit'
                                name="status"
                                value={editedProvider.status || ''}
                                onChange={(e) => handleInputChange(e as any)}
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
                                value={editedProvider.website?.includes('http') ? editedProvider.website : `https://${editedProvider.website}` || ''}
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
                            onClose={toggleInsuranceModal}
                            selectedInsurances={selectedInsurances}
                            onInsurancesChange={setSelectedInsurances}
                            providerInsurances={editedProvider.insurance}
                        />
                    )}
                    {isCountiesModalOpen && (
                        <CountiesModal
                            isOpen={isCountiesModalOpen}
                            onClose={toggleCountiesModal}
                            selectedCounties={selectedCounties}
                            onCountiesChange={setSelectedCounties}
                            providerCounties={editedProvider.counties_served}
                        />
                    )}
                    <div className='superAdminEditFormButtonsWrapper'>
                        <button className='cancelButton' type='button' onClick={() => setEditedProvider(null)}>Cancel</button>
                        <button type="submit">Update Provider</button>
                    </div>
                </form>
            </section>
        </div>
    )
}
