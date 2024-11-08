import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SuperAdmin.css'
import { MockProviderData, ProviderAttributes, CountiesServed, Insurance, MockProviders } from '../Utility/Types'
import { SuperAdminEdit } from './SuperAdminEdit'
import { useAuth } from '../Provider-login/AuthProvider'
import SuperAdminCreate from './SuperAdminCreate'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'; 

export const SuperAdmin = () => {
    const { setToken } = useAuth();
    const [selectedProvider, setSelectedProvider] = useState<MockProviderData | null>(null)
    const [providers, setProviders] = useState<MockProviderData[]>([]);
    const [openNewProviderForm, setOpenNewProviderForm] = useState(false);
    const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        const tokenExpiry = sessionStorage.getItem('tokenExpiry');
        if (tokenExpiry) {
            const updateSessionTime = () => {
                const timeLeft = Math.max(0, Math.floor((parseInt(tokenExpiry) - Date.now()) / 1000));
                setSessionTimeLeft(timeLeft);
                
                if (timeLeft <= 300 && timeLeft > 0) { // Show warning when 5 minutes or less remain
                    toast.warn(`Your session will expire in ${timeLeft} seconds. Please save your work.`, {
                        position: "top-center",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else if (timeLeft === 0) {
                    toast.error('Your session has expired. Please log in again.', {
                        position: "top-center",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    handleLogout();
                }
            };

            const timer = setInterval(updateSessionTime, 1000);
            return () => clearInterval(timer);
        }
    }, );

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

  useEffect(() => {
    fetchAllProviders();
  }, [])

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
            <ToastContainer />
            {sessionTimeLeft !== null && sessionTimeLeft <= 300 && (
                <div className="session-warning">
                    Session expires in: {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
                </div>
            )}
            <h1>Super Admin Dashboard</h1>

            <button className='superAdminLogoutButton' onClick={handleLogout}>Logout</button>

            <div className='superAdminDashboardWrapper'>
                <div className='superAdminProvidersListWrapper'>
                    <h2>Providers List</h2>
                    <select onChange={handleProviderSelect} value={selectedProvider?.id || ""}>
                        <option value="">Select a provider</option>
                        {providers.sort((a, b) => (a.attributes.name || '').localeCompare(b.attributes.name || ''))
                            .map(provider => (
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
                {openNewProviderForm ? <SuperAdminCreate handleCloseForm={toggleNewProviderForm} onProviderCreated={fetchAllProviders}/> : null}
            </div>
        </div>
    );
};
