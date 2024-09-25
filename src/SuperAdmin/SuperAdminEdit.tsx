import React, { useState, useEffect } from 'react'
import { MockProviderData, ProviderAttributes, CountiesServed, Insurance, Location } from '../Utility/Types'
import './SuperAdminEdit.css'
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg'

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
    const [locations, setLocations] = useState<Location[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [providerData, setProviderData] = useState<MockProviderData | null>(null);
    const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
    const [originalLocations, setOriginalLocations] = useState<typeof locations | null>(null);
    const [originalInsurances, setOriginalInsurances] = useState<typeof selectedInsurances | null>(null);
    const [originalCounties, setOriginalCounties] = useState<typeof selectedCounties | null>(null);

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
        setLocations([...locations, { name: null, address_1: null, city: null, state: null, zip: null, phone: null, id: null, address_2: null }]);
    };
  
    return (
    <div className='superAdminEditWrapper'>
        <section className='superAdminEditFormWrapper'>
            <h1>Editing: <strong className='superAdminEditFormName'>{editedProvider.name}</strong></h1>
            <form className='superAdminEditForm' onSubmit={handleSubmit}>
                <label htmlFor="name">Name</label>
            <input
                type="text"
                name="name"
                value={editedProvider.name || ''}
                onChange={handleInputChange}
                placeholder="Provider Name"
            />
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
            <div className='superAdminEditFormButtonsWrapper'>
                <button className='cancelButton' type='button' onClick={() => setEditedProvider(null)}>Cancel</button>
                <button type="submit">Update Provider</button>
            </div>
        </form>
        </section>
    </div>
    )
}
