import { useState, useEffect} from 'react'
import './SuperAdmin.css'
import { MockProviderData, MockProviders, ProviderAttributes } from '../Utility/Types'
import  ProviderEdit  from '../Provider-edit/ProviderEdit'
import { SuperAdminEdit } from './SuperAdminEdit'
interface SuperAdminProps {
    providers: MockProviderData[];
    setProviders: React.Dispatch<React.SetStateAction<MockProviderData[]>>;
  }

export const SuperAdmin: React.FC<SuperAdminProps> = ({ providers, setProviders }) => {
    const [selectedProvider, setSelectedProvider] = useState<MockProviderData | null>(null)
    

    const handleProviderSelect = (provider: ProviderAttributes) => {
        setSelectedProvider(provider as unknown as MockProviderData);
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
    <div>
      <h1>Super Admin Dashboard</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%' }}>
          <h2>Providers List</h2>
          {providers.map(provider => (
            <div key={provider.id} onClick={() => handleProviderSelect(provider.attributes)}>
              {provider?.attributes?.name}
            </div>
          ))}
        </div>
        <div style={{ width: '70%' }}>
          {selectedProvider ? (
            <SuperAdminEdit
              providers={providers} 
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