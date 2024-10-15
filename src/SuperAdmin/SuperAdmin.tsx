import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './SuperAdmin.css'
import { MockProviderData, ProviderAttributes } from '../Utility/Types'
import { SuperAdminEdit } from './SuperAdminEdit'
import { useAuth } from '../Provider-login/AuthProvider'

export const SuperAdmin: React.FC = () => {
    const { setToken } = useAuth();
    const [providers, setProviders] = useState<MockProviderData[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<MockProviderData | null>(null)
    const { providerId } = useParams<{ providerId: string }>();
    
    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        if (providerId) {
            fetchSingleProvider(Number(providerId));
        }
    }, [providerId]);

    const fetchProviders = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProviders(data.data);
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    const fetchSingleProvider = async (id: number) => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSelectedProvider(data.data[0]);
        } catch (error) {
            console.error('Error fetching single provider:', error);
        }
    };
    
    const handleProviderSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProviderId = Number(event.target.value);
        fetchSingleProvider(selectedProviderId);
    };
    
    const handleProviderUpdate = async (updatedProvider: ProviderAttributes) => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${updatedProvider.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ provider: updatedProvider })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProviders(prevProviders => 
                prevProviders.map(p => p.id === data.data.id ? data.data : p)
            );
            setSelectedProvider(null);
        } catch (error) {
            console.error('Error updating provider:', error);
        }
    };

    const handleCreateProvider = async (newProvider: ProviderAttributes) => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    provider: {
                        ...newProvider, 
                        id: null, 
                        location_id: null,
                        status: newProvider.status || 'pending'
                    } 
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProviders(prevProviders => [...prevProviders, data.data]);
            setSelectedProvider(null);
        } catch (error) {
            console.error('Error creating provider:', error);
        }
    };

    const handleLogout = () => {
        setToken(null);
    };

    return (
        <div className='superAdminWrapper'>
            <h1>Super Admin Dashboard</h1>
            <button className='superAdminLogoutButton' onClick={handleLogout}>Logout</button>
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