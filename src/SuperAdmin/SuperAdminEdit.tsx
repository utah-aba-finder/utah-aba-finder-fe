import React, { useState, useEffect } from 'react'
import { MockProviderData, ProviderAttributes, CountiesServed, Insurance, Location } from '../Utility/Types'
import './SuperAdminEdit.css'
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg'
import InsuranceModal from '../Provider-edit/InsuranceModal';
import CountiesModal from '../Provider-edit/CountiesModal';
import moment from 'moment';


interface SuperAdminEditProps {
    provider: ProviderAttributes;
    onUpdate: (updatedProvider: ProviderAttributes) => void
}

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({ provider , onUpdate }) => {
    const [editedProvider, setEditedProvider] = useState<ProviderAttributes | null>(null);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
    const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState('');

    useEffect(() => {
        if (provider) {
            setEditedProvider(provider);
            setSelectedCounties(provider.counties_served);
            setSelectedInsurances(provider.insurance);
            setLocations(provider.locations);
            setIsLoading(false);
        }
    }, [provider]);

    const handleSave = () => {
        setIsSaving(true);
        // Implement save logic here
        onUpdate(editedProvider!);
        setIsSaving(false);
    };

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
        telehealth: ''
    });

    useEffect(() => {
        if (provider) {
            setEditedProvider(provider);
        }
    }, [provider]);

    if (!editedProvider) {
        return  <div className="loading-container">
        <img src={gearImage} alt="Loading..." className="loading-gear" />
        <p>Loading provider data...</p>
    </div>
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedProvider(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editedProvider) {
            onUpdate(editedProvider);
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
                        <label htmlFor={`location-name-${index}`} className="editLabels">Location Name:</label>
                        <input
                            id={`location-name-${index}`}
                            type="text"
                            value={location.name || ''}
                            onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                            placeholder="Location name"
                        />
                        <label htmlFor={`location-address-${index}`} className="editLabels">Street Address:</label>
                        <input
                            id={`location-address-${index}`}
                            type="text"
                            value={location.address_1 || ''}
                            onChange={(e) => handleLocationChange(index, 'address_1', e.target.value)}
                            placeholder="Street address"
                        />
                        <label htmlFor={`location-city-${index}`} className="editLabels">City:</label>
                        <input
                            id={`location-city-${index}`}
                            type="text"
                            value={location.city || ''}
                            onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                            placeholder="City"
                        />
                        <label htmlFor={`location-state-${index}`} className="editLabels">State:</label>
                        <input
                            id={`location-state-${index}`}
                            type="text"
                                value={location.state || ''}
                            onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                            placeholder="State"
                        />
                        <label htmlFor={`location-zip-${index}`} className="editLabels">Zip Code:</label>
                        <input
                            id={`location-zip-${index}`}
                            type="text"
                            value={location.zip || ''}
                            onChange={(e) => handleLocationChange(index, 'zip', e.target.value)}
                            placeholder="Zip code"
                        />
                        <label htmlFor={`location-phone-${index}`} className="editLabels">Phone Number:</label>
                        <input
                            id={`location-phone-${index}`}
                            type="text"
                            value={location.phone || ''}
                            onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
                            placeholder="Phone number"
                        />
                        <label htmlFor={`location-address-2-${index}`} className="editLabels">Address 2:</label>
                        <input
                            id={`location-address-2-${index}`}
                            type="text"
                            value={location.address_2 || ''}
                            onChange={(e) => handleLocationChange(index, 'address_2', e.target.value)}
                            placeholder="Address 2"
                        />
                    </div>
                ))}
                <button onClick={addNewLocation} className="add-location-button">
                    Add New Location
                </button>
                </div>
                <div className='secondColumn'>
                <label htmlFor="logo">Logo</label>
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
                placeholder="Provider Email"
            />
           
            <label htmlFor="email">Email</label>
            <input 
                type="text"
                name="email"
                value={editedProvider.email || ''}
                onChange={handleInputChange}
                placeholder="Provider Name"
            />
            <label htmlFor="cost">Cost</label>
            <input 
                type="text"
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
            
            <label htmlFor='telehealth' className='editLabels'>Telehealth Services: </label>
            <input 
                id='telehealth' 
                type="text" 
                name="telehealth" 
                value={editedProvider.telehealth_services || ''} 
                onChange={handleInputChange} 
                placeholder='Yes, No?'
            />
            <label htmlFor='spanishSpeaking' className='editLabels'>Spanish Speakers: </label>
            <input 
                id='spanishSpeaking'
                type="text"
                name="spanishSpeaking"
                value={editedProvider.spanish_speakers || ''}
                onChange={handleInputChange}
                placeholder="Yes, No"
            /> 
            <label htmlFor='minAge' className='editLabels'>Minimum Age: </label>
            <input 
                id='minAge'
                type="text"
                name="minAge"
                value={editedProvider.min_age || ''}
                onChange={handleInputChange}
                placeholder="Minimum Age"
            />
            <label htmlFor='maxAge' className='editLabels'>Maximum Age: </label>
            <input 
                id='maxAge'
                type="text"
                name="maxAge"
                value={editedProvider.max_age || ''}
                onChange={handleInputChange}
                placeholder="Maximum Age"
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
