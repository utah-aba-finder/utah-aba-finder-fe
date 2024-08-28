import React, { useState, useEffect } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';
import { mockProviders, ProviderAttributes } from './NewMockProviders';
import klayLogo from './klay.png';

const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('Utah');
  const [isFiltered, setIsFiltered] = useState<boolean>(false);

  useEffect(() => {
    // Map the mockProviders data to the ProviderAttributes structure
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
      provider.counties_served.some(county => county.county.toLowerCase().includes(normalizedCounty)) &&
      provider.insurance.some(ins => ins.name.toLowerCase().includes(normalizedInsurance)) &&
      (normalizedSpanish === 'any' || (provider.spanish_speakers?.toLowerCase() || 'no') === normalizedSpanish)
    );

    setFilteredProviders(filtered);
    setIsFiltered(true);
    if (filtered.length > 0) {
      const firstLocation = filtered[0].locations[0];
      if (firstLocation.city && firstLocation.state && firstLocation.address_1) {
        setMapAddress(`${firstLocation.address_1}, ${firstLocation.city}, ${firstLocation.state}`);
      } else {
        setMapAddress('Utah');
      }
    } else {
      setMapAddress('Utah');
    }
  };

  const handleResetSearch = () => {
    setFilteredProviders(allProviders);
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setIsFiltered(false);
    setMapAddress('Utah');
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
        onReset={handleResetSearch}
      />

      <section className="google-map-section">
        <GoogleMap address={mapAddress} />
      </section>

      <section className="provider-title-section">
        <h2>{isFiltered ? 'Filtered Search of Providers' : 'Total Providers List'}</h2>
      </section>

      <section className="searched-provider-map-locations-list-section">
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider, index) => (
            <div key={index} className="searched-provider-card">
              <div className="searched-provider-card-content">
                <img src={klayLogo} alt="Provider Logo" className="provider-logo" />
                <div className="title-and-info">
                  <div className="searched-provider-card-title">
                    <h3>{provider.name}</h3>
                    <h4>
                      {provider.locations[0].address_1 || 'No Address Provided'}, 
                      {provider.locations[0].city || 'No City Provided'}, 
                      {provider.locations[0].state || 'No State Provided'}
                    </h4>
                  </div>
                  <div className="searched-provider-card-info">
                    <p><strong>Phone:</strong> {provider.locations[0].phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {provider.email || 'N/A'}</p>
                  </div>
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
                  onClick={() => handleViewOnMapClick(`${provider.locations[0].address_1 || ''}, ${provider.locations[0].city || ''}, ${provider.locations[0].state || ''}`)}
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
