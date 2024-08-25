import { useState } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';

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
        locations_served: 'Salt Lake, Utah, Davis, and Weber counties',
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
        website: 'https://www.ababpa.com/',
        address: '55 East Road Place',
        phone: '(801) 610-2400',
        email: 'info@ababpa.com',
        insurance: 'Medicaid, DMBA, EMI Health, University of Utah Healthcare, Blue Cross Blue Shield',
        locations_served: 'Utah County, Salt Lake County, Davis County, Logan to Spanish Fork, and Tooele',
        cost: 'Out-of-Network and single-case agreements',
        ages_served: '2-21',
        waitlist: 'No waitlist',
        telehealth_services: 'Yes, if necessary',
        spanish_speakers: 'Yes',
      },
    },
  ],
};

const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);

  const handleCardClick = (provider: ProviderAttributes) => {
    setSelectedProvider(provider);
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
  };

  return (
    <div className="providers-page">
      {/* Find Your Provider Section */}
      <section className="find-your-provider-section">
        <img src={childrenBanner} alt="Find Your Provider" className="banner-image" />
      </section>

      {/* Provider Map Search Section */}
      <section className="provider-map-search-section">
        <div className="provider-map-searchbar">
          <input type="text" placeholder="Search for a provider..." />
          <button className="provider-search-button">Search</button>
          <div className="provider-county-dropdown">
            <select className="provider-county-select" defaultValue="">
              <option value="" disabled>Select a county</option>
              <option value="salt-lake">Salt Lake County</option>
              <option value="utah">Utah County</option>
              <option value="davis">Davis County</option>
              <option value="weber">Weber County</option>
              <option value="iron">Iron County</option>
              <option value="cache">Cache County</option>
              <option value="box-elder">Box Elder County</option>
              <option value="washington">Washington County</option>
              <option value="morgan">Morgan County</option>
              <option value="summit">Summit County</option>
              <option value="tooele">Tooele County</option>
              <option value="duchesne">Duchesne County</option>
              <option value="uintah">Uintah County</option>
              <option value="sanpete">Sanpete County</option>
              <option value="wayne">Wayne County</option>
            </select>
            <span className="dropdown-arrow">&#9660;</span>
          </div>
        </div>

        <div className="provider-map-locations">
          <div className="provider-map-locations-list">
            <p>Provider Map List Placeholder</p>
          </div>
          <div className="provider-map">
            {/* Google Map will be integrated here */}
            <p>Map Placeholder</p>
          </div>
        </div>
      </section>

      <section className="provider-list-section">
        <div className="provider-list">
          {mockProviders.data.map((provider) => (
            <div
              key={provider.id}
              className="provider-card"
              onClick={() => handleCardClick(provider.attributes)}
            >
              <div className="provider-title-and-address">
                <h3>{provider.attributes.name}</h3>
                <p><strong>Address:</strong> {provider.attributes.address || 'N/A'}</p>
              </div>
              <p><strong>Phone:</strong> {provider.attributes.phone || 'N/A'}</p>
              <p><strong>Spanish speaking?</strong> {provider.attributes.spanish_speakers}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Render modal if a provider is selected */}
      {selectedProvider && (
        <ProviderModal provider={selectedProvider} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ProvidersPage;
