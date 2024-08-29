import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';
import { mockProviders, MockProviders, MockProviderData, ProviderAttributes } from './NewMockProviders';
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

  const mapSectionRef = useRef<HTMLDivElement>(null); // Add a ref for the map section

  useEffect(() => {
    const providersList: ProviderAttributes[] = mockProviders.data.map((provider: MockProviderData) => ({
      name: provider.attributes.name,
      locations: provider.attributes.locations,
      insurance: provider.attributes.insurance,
      counties_served: provider.attributes.counties_served,
      website: provider.attributes.website,
      email: provider.attributes.email,
      cost: provider.attributes.cost,
      min_age: provider.attributes.min_age,
      max_age: provider.attributes.max_age,
      waitlist: provider.attributes.waitlist,
      telehealth_services: provider.attributes.telehealth_services,
      spanish_speakers: provider.attributes.spanish_speakers,
      at_home_services: provider.attributes.at_home_services,
      in_clinic_services: provider.attributes.in_clinic_services,
    }));

    setAllProviders(providersList);
    setFilteredProviders(providersList);
    setMapAddress('Utah');
  }, []);

  const handleSearch = useCallback((query: string) => {
    const normalizedCounty = selectedCounty.toLowerCase();
    const normalizedInsurance = selectedInsurance.toLowerCase();
    const normalizedSpanish = selectedSpanish.toLowerCase();

    const filtered = allProviders.filter(provider =>
      provider.name?.toLowerCase().includes(query.toLowerCase()) &&
      (!selectedCounty || provider.counties_served.some(c => c.county?.toLowerCase().includes(normalizedCounty))) &&
      (!selectedInsurance || provider.insurance.some(i => i.name?.toLowerCase().includes(normalizedInsurance))) &&
      (selectedSpanish === '' || (provider.spanish_speakers && provider.spanish_speakers.toLowerCase() === normalizedSpanish))
    );

    setFilteredProviders(filtered);
    setIsFiltered(true);
  }, [allProviders, selectedCounty, selectedInsurance, selectedSpanish]);

  useEffect(() => {
    handleSearch('');
  }, [handleSearch]);

  const handleProviderCardClick = (provider: ProviderAttributes) => {
    setSelectedProvider(provider);
  };

  const handleViewOnMapClick = (address: string | null) => {
    setMapAddress(address || 'Utah');
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' }); 
    }
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
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

  const handleResults = (results: MockProviders) => {
    setFilteredProviders(results.data.map(p => ({
      name: p.attributes.name,
      locations: p.attributes.locations,
      insurance: p.attributes.insurance,
      counties_served: p.attributes.counties_served,
      website: p.attributes.website,
      email: p.attributes.email,
      cost: p.attributes.cost,
      min_age: p.attributes.min_age,
      max_age: p.attributes.max_age,
      waitlist: p.attributes.waitlist,
      telehealth_services: p.attributes.telehealth_services,
      spanish_speakers: p.attributes.spanish_speakers,
      at_home_services: p.attributes.at_home_services,
      in_clinic_services: p.attributes.in_clinic_services,
    })));
  };

  return (
    <div className="providers-page">
      <section className="find-your-provider-section">
        <img src={childrenBanner} alt="Find Your Provider" className="banner-image" />
        <h1 className="providers-banner-title">Find Your Provider</h1>
      </section>

      <SearchBar
        mockProviders={mockProviders}
        onResults={handleResults}
        onSearch={handleSearch}
        onCountyChange={handleCountyChange}
        onInsuranceChange={handleInsuranceChange}
        onSpanishChange={handleSpanishChange}
        onReset={handleResetSearch}
      />

      <section className="google-map-section" ref={mapSectionRef}>
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
                    <h4>{provider.locations[0]?.address_1 || 'N/A'} {provider.locations[0]?.address_2 || 'N/A'}, {provider.locations[0]?.city || 'N/A'}, {provider.locations[0]?.state || 'N/A'}, {provider.locations[0]?.zip || 'N/A'}</h4>
                  </div>
                  <div className="searched-provider-card-info">
                    <p><strong>Phone:</strong> {provider.locations[0]?.phone || 'N/A'}</p>
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
                  onClick={() => handleViewOnMapClick(provider.locations[0]?.address_1)}
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
