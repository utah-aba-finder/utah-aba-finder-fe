import React, { useState, useEffect } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';
import { mockProviders } from './MockProviders';
import type { ProviderAttributes } from './MockProviders';

const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('Utah');
  const [isFiltered, setIsFiltered] = useState<boolean>(false); // New state for tracking if search is filtered

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
    const normalizedInsurance = selectedInsurance.replace(/-/g, ' ').toLowerCase();
    const normalizedSpanish = selectedSpanish.toLowerCase();

    const filtered = allProviders.filter(provider =>
      provider.name.toLowerCase().includes(query.toLowerCase()) &&
      provider.locations_served.toLowerCase().includes(normalizedCounty) &&
      provider.insurance.toLowerCase().includes(normalizedInsurance) &&
      (normalizedSpanish === 'any' || provider.spanish_speakers.toLowerCase() === normalizedSpanish)
    );

    setFilteredProviders(filtered);
    setIsFiltered(true); // Update state to indicate that a filter is applied

    if (filtered.length > 0) {
      setMapAddress(filtered[0].address);
    } else {
      setMapAddress('Utah');
    }
  };

  const handleResetSearch = () => {
    setFilteredProviders(allProviders); // Reset to the full providers list
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setIsFiltered(false); // Reset the filtered state
    setMapAddress('Utah'); // Optionally reset the map address to the default
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
  };

  const handleInsuranceChange = (insurance: string) => {
    setSelectedInsurance(insurance);
  };

  const handleSpanishChange = (spanish: string) => {
    setSelectedSpanish(spanish);
  };

  return (
    <div className="providers-page">
      <section className="find-your-provider-section">
        <img src={childrenBanner} alt="Find Your Provider" className="banner-image" />
        <h1 className="providers-banner-title">Find Your Provider</h1>
      </section>

      <SearchBar
        onSearch={handleSearch}
        onCountyChange={handleCountyChange}
        onInsuranceChange={handleInsuranceChange}
        onSpanishChange={handleSpanishChange}
        onReset={handleResetSearch} // Make sure onReset is included here
      />

      <section className="google-map-section">
        <GoogleMap address={mapAddress} />
      </section>

      <section className="provider-title-section">
        <h3>{isFiltered ? 'Filtered Search of Providers' : 'Total Providers List'}</h3>
      </section>

      <section className="searched-provider-map-locations-list-section">
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider, index) => (
            <div key={index} className="searched-provider-card">
              <div className="searched-provider-card-content">
                <div className="searched-provider-card-title">
                  <h3>{provider.name}</h3>
                  <p><strong>Address:</strong> {provider.address || 'N/A'}</p>
                </div>
                <div className="searched-provider-card-info">
                  <p><strong>Phone:</strong> {provider.phone || 'N/A'}</p>
                </div>
              </div>
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
      </section>

      {selectedProvider && <ProviderModal provider={selectedProvider} onClose={handleCloseModal} />}
    </div>
  );
};

export default ProvidersPage;
