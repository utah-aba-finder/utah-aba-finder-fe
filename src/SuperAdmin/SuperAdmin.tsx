import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SuperAdmin.css'
import { MockProviderData, ProviderAttributes, CountiesServed, Insurance, MockProviders } from '../Utility/Types'
import { SuperAdminEdit } from './SuperAdminEdit'
import { useAuth } from '../Provider-login/AuthProvider'
import SuperAdminCreate from './SuperAdminCreate'
import { toast } from 'react-toastify'
import { fetchProviders } from '../Utility/ApiCall'

export const SuperAdmin = () => {
    const { setToken } = useAuth();
    const [selectedProvider, setSelectedProvider] = useState<MockProviderData | null>(null)
    const [providers, setProviders] = useState<MockProviderData[]>([]);
    const [openNewProviderForm, setOpenNewProviderForm] = useState(false);;

    useEffect(() => {
      const fetchAllProviders = async () => {
          try {
              const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers', {
                  headers: {
                      'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                  }
              });
              if (!response.ok) {
                  throw new Error('Failed to fetch providers');
              }
              const fetchedProviders: MockProviders = await response.json();
              console.log(fetchedProviders);
              setProviders(fetchedProviders.data);
          } catch (error) {
              console.error('Error fetching providers:', error);
              toast.error('Failed to fetch providers. Please try again later.');
          }
      };
      fetchAllProviders();
  }, []);

    const handleProviderSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const providerId = Number(event.target.value);
        const provider = providers.find(p => p.id === providerId);
        setSelectedProvider(provider || null);
    };

    const handleProviderUpdate = (updatedProvider: ProviderAttributes) => {
        setProviders(prevProviders =>
            prevProviders.map(p =>
                p.id === updatedProvider.id ? { ...p, attributes: updatedProvider } : p
            )
        );
        toast.success('Provider updated successfully');
    };

        
    const handleLogout = () => {
        setToken(null);
    };

    const toggleNewProviderForm = () => {
      setOpenNewProviderForm(prev => !prev)
    }

    return (
        <div className='superAdminWrapper'>
            <h1>Super Admin Dashboard</h1>

            <button className='superAdminLogoutButton' onClick={handleLogout}>Logout</button>

            <div className='superAdminDashboardWrapper'>
                <div className='superAdminProvidersListWrapper'>
                    <h2>Providers List</h2>
                    <select onChange={handleProviderSelect} value={selectedProvider?.id || ""}>
                        <option value="">Select a provider</option>
                        {providers.map(provider => (
                            <option key={provider.id} value={provider.id}>
                                {provider.attributes.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='superAdminEditWrapper'>
                    {selectedProvider ? (
                        <SuperAdminEdit
                            provider={selectedProvider}
                            onUpdate={handleProviderUpdate}
                        />
                    ) : (
                        <p>Select a provider to edit</p>
                    )}
                </div>
                <div className='superAdminCreateDeleteButtonsWrapper'>
                    <button className='superAdminCreateButton' onClick={() => toggleNewProviderForm()}>{!openNewProviderForm ? 'Create New Provider' : 'Close New Provider Form'}</button>
                    <button className='superAdminDeleteButton' disabled>Delete Provider</button>
                </div>
                {openNewProviderForm ? <SuperAdminCreate handleCloseForm={toggleNewProviderForm}/> : null}
            </div>
        </div>
    );
};
