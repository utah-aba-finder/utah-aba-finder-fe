import React, { useState, useEffect } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';

interface ProviderAttributes {
  name: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  insurance: string;
  locations_served: string;
  cost: string;
  ages_served: string;
  waitlist: string;
  telehealth_services: string;
  spanish_speakers: string;
}

interface MockProviders {
  data: {
    type: string;
    id: number;
    attributes: ProviderAttributes;
  }[];
}

const mockProviders: MockProviders = {
  data: [
    {
      type: 'provider',
      id: 1,
      attributes: {
        name: 'A BridgeCare ABA',
        website: 'https://www.bridgecareaba.com/locations/utah',
        address: '1234 West Road Drive',
        phone: '(123) 456-7890',
        email: 'info@bridgecareaba.com',
        insurance: 'All insurances besides Tricare',
        locations_served: 'Salt Lake, Utah, Davis, and Weber',
        cost: 'N/A',
        ages_served: '2-16 years',
        waitlist: 'None',
        telehealth_services: 'Yes',
        spanish_speakers: 'Yes',
      },
    },
    {
      type: 'provider',
      id: 2,
      attributes: {
        name: 'Above & Beyond Therapy',
        website: 'https://www.abtaba.com/locations/aba-therapy-in-utah',
        address: '311 Boulevard of The Americas, Suite 304 Lakewood, NJ 08701',
        phone: '(801) 610-2400',
        email: 'info@ababpa.com',
        insurance: 'Medicaid, DMBA, EMI Health, University of Utah Healthcare, Blue Cross Blue Shield',
        locations_served: 'Utah, Salt Lake, Davis, and Tooele',
        cost: 'Out-of-Network and single-case agreements',
        ages_served: '2-21',
        waitlist: 'No waitlist',
        telehealth_services: 'Yes, if necessary',
        spanish_speakers: 'Yes',
      },
    },
    {
      type: 'provider',
      id: 3,
      attributes: {
        name: 'Autism Specialists',
        website: 'https://www.bridgecareaba.com/locations/utah',
        address: '1234 West Road Drive',
        phone: '(123) 456-7890',
        email: 'info@bridgecareaba.com',
        insurance: 'All insurances besides Tricare',
        locations_served: 'Iron, Wayne, and Sanpete',
        cost: 'N/A',
        ages_served: '2-16 years',
        waitlist: 'None',
        telehealth_services: 'Yes',
        spanish_speakers: 'Yes',
      },
    },
  ],
};

const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('Utah');

  useEffect(() => {
    const providersList = mockProviders.data.map(p => p.attributes);
    setAllProviders(providersList);
    setFilteredProviders(providersList);
  }, []);

  const handleProviderCardClick = (provider: ProviderAttributes) => {
    setSelectedProvider(provider);
  };

  const handleViewOnMapClick = (address: string) => {
    setMapAddress(address);
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
  };

  const handleSearch = (query: string) => {
    const normalizedCounty = selectedCounty.replace(/-/g, ' ').toLowerCase();

    const filtered = allProviders.filter(provider =>
      provider.name.toLowerCase().includes(query.toLowerCase()) &&
      provider.locations_served.toLowerCase().includes(normalizedCounty)
    );

    setFilteredProviders(filtered);

    if (filtered.length > 0) {
      setMapAddress(filtered[0].address);
    } else {
      setMapAddress('Utah');
    }
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
  };

  return (
    <div className="providers-page">
      <section className="find-your-provider-section">
        <img src={childrenBanner} alt="Find Your Provider" className="banner-image" />
        <h1 className="providers-banner-title">Find Your Provider</h1>
      </section>

      <SearchBar onSearch={handleSearch} onCountyChange={handleCountyChange} />

      <section className="google-map-section">
       
          <GoogleMap address={mapAddress} />
      
      </section>

      <section className="provider-list-section">
        
          <div className="searched-provider-map-locations-list">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <div key={index} className="searched-provider-card">
                  <h3>{provider.name}</h3>
                  <p><strong>Address:</strong> {provider.address || 'N/A'}</p>
                  <p><strong>Phone:</strong> {provider.phone || 'N/A'}</p>
                  <div className="provider-card-buttons">
                    <button
                      className="view-details-button"
                      onClick={() => handleProviderCardClick(provider)}
                    >
                      View Details
                    </button>
                    <button
                      className="view-on-map-button"
                      onClick={() => handleViewOnMapClick(provider.address)}
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No providers found matching your search criteria.</p>
            )}
          </div>
       
      </section>

      {selectedProvider && <ProviderModal provider={selectedProvider} onClose={handleCloseModal} />}
    </div>
  );
};

export default ProvidersPage;