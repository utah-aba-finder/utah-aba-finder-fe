import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './SuperAdmin.css'
import { MockProviderData, ProviderAttributes } from '../Utility/Types'
import { SuperAdminEdit } from './SuperAdminEdit'

interface SuperAdminProps {
    providers: MockProviderData[];
    setProviders: React.Dispatch<React.SetStateAction<MockProviderData[]>>;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ providers, setProviders }) => {
    const [selectedProvider, setSelectedProvider] = useState<MockProviderData | null>(null)
    const { providerId } = useParams<{ providerId: string }>();
    
    useEffect(() => {
        if (providerId) {
            const providerIdNumber = Number(providerId);
            const provider = providers.find(p => p.id === providerIdNumber);
            if (provider) {
                setSelectedProvider(provider);
            }
        }
    }, [providerId, providers]);
    
    const handleProviderSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProviderId = Number(event.target.value);
        const provider = providers.find(p => p.id === selectedProviderId);
        if (provider) {
            setSelectedProvider(provider);
        }
    };
    
    const handleProviderUpdate = (updatedProvider: ProviderAttributes) => {
        const updatedProviders = providers.map(p => 
            p.id === updatedProvider.id ? { ...p, ...updatedProvider } : p
        );
        setProviders(updatedProviders);
        setSelectedProvider(null);
        
        // Here you would also make an API call to update the provider in the backend
    };

    return (
        <div className='superAdminWrapper'>
            <h1>Super Admin Dashboard</h1>
            <div className='superAdminDashboardWrapper'>
                <div className='superAdminProvidersListWrapper'>
                    <h2>Providers List</h2>
                    <select onChange={handleProviderSelect} value={selectedProvider?.id || ''}>
                        <option value="">Select a provider</option>
                        {providers.sort((a, b) => (a.attributes.name ?? '').localeCompare(b.attributes.name ?? '') || 0).map(provider => (
                            <option key={provider.id} value={provider.id}>
                                {provider?.attributes?.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='superAdminEditWrapper'>
                    {selectedProvider ? (
                        <SuperAdminEdit
                            provider={selectedProvider.attributes} 
                            onUpdate={handleProviderUpdate} 
                        />  
                    ) : (
                        <p>Select a provider to edit</p>
                    )}
                </div>
            </div>
        </div>
    );
};