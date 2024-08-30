import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';
import { fetchProviders } from '../Utility/ApiCall';
import { MockProviders, ProviderAttributes } from '../Utility/Types';
import klayLogo from './klay.png';


const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('Utah');
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const providersPerPage = 5;

  useEffect(() => {
    const getProviders = async () => {
      try {
        const providersList: MockProviders = await fetchProviders();
        const mappedProviders = providersList.data.map(provider => provider.attributes);
        setAllProviders(mappedProviders);
        setFilteredProviders(mappedProviders);
        setMapAddress('Utah');
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    };

    getProviders();
  }, []);

  const handleSearch = useCallback(({ query, county, insurance, spanish }: { query: string; county: string; insurance: string; spanish: string }) => {
    const normalizedCounty = county.toLowerCase();
    const normalizedInsurance = insurance.toLowerCase();
    const normalizedSpanish = spanish.toLowerCase();

    const filtered = allProviders.filter(provider =>
      provider.name?.toLowerCase().includes(query.toLowerCase()) &&
      (!county || provider.counties_served.some(c => c.county?.toLowerCase().includes(normalizedCounty))) &&
      (!insurance || provider.insurance.some(i => i.name?.toLowerCase().includes(normalizedInsurance))) &&
      (spanish === '' || (provider.spanish_speakers && provider.spanish_speakers.toLowerCase() === normalizedSpanish))
    );

    setFilteredProviders(filtered);
    setIsFiltered(true);
    setCurrentPage(1);
  }, [allProviders]);

  useEffect(() => {
    handleSearch({ query: '', county: '', insurance: '', spanish: '' });
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
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);

  const renderViewOnMapButton = (provider: ProviderAttributes) => {
    const isAddressAvailable = provider.locations.length > 0 && provider.locations[0]?.address_1;

    if (provider.locations.length > 1) {
      return (
        <select
          className={`view-on-map-dropdown ${!isAddressAvailable ? 'disabled' : ''}`}
          onChange={(e) => {
            const index = e.target.value;
            const location = provider.locations[parseInt(index)];
            const fullAddress = `${location.address_1 || ''} ${location.address_2 || ''}, ${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim();
            console.log('Selected Address from Dropdown:', fullAddress);
            handleViewOnMapClick(fullAddress);
          }}
          defaultValue=""
          disabled={!isAddressAvailable}
        >
          <option value="" disabled>Select Location to View on Map</option>
          {provider.locations.map((location, index) => (
            <option key={index} value={index}>
              {location.name} - {location.address_1 || ''}, {location.city}, {location.state} {location.zip}
            </option>
          ))}
        </select>
      );
    }

    return (
      <button
        className={`view-on-map-button ${!isAddressAvailable ? 'disabled' : ''}`}
        onClick={() => {
          const location = provider.locations[0];
          const fullAddress = `${location.address_1 || ''} ${location.address_2 || ''}, ${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim();
          handleViewOnMapClick(fullAddress);
        }}
        disabled={!isAddressAvailable}
      >
        View on Map
      </button>
    );
  };

  return (
    <div className="providers-page">
      <section className="find-your-provider-section">
        <img src={childrenBanner} alt="Find Your Provider" className="banner-image" />
        <h1 className="providers-banner-title">Find Your Provider</h1>
      </section>

      <SearchBar
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
        <h2>
          {isFiltered
            ? `Showing ${filteredProviders.length} of ${allProviders.length} Providers`
            : `Showing ${allProviders.length} of ${allProviders.length} Providers`}
        </h2>
      </section>

      <section className="searched-provider-map-locations-list-section">
        {currentProviders.map((provider, index) => (
          <div key={index} className="searched-provider-card">
            <div className="searched-provider-card-content">
              <img src={klayLogo} alt="Provider Logo" className="provider-logo" />
              <div className="title-and-info">
                <div className="searched-provider-card-title">
                  <h3>{provider.name}</h3>
                  <h4>{provider.locations[0]?.address_1 || 'Physical address is not available for this provider.'} {provider.locations[0]?.address_2} {provider.locations[0]?.city} {provider.locations[0]?.state} {provider.locations[0]?.zip}</h4>
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
              {renderViewOnMapButton(provider)}
            </div>
          </div>
        ))}
      </section>

      <div className="pagination-controls">
        {currentPage > 1 && (
          <button className="pagination-button" onClick={handlePreviousPage}>
            &lt; Previous
          </button>
        )}
        {currentPage < totalPages && (
          <button className="pagination-button" onClick={handleNextPage}>
            Next &gt;
          </button>
        )}
      </div>

      {selectedProvider && <ProviderModal provider={selectedProvider} onClose={handleCloseModal} />}
    </div>
  );
};

export default ProvidersPage;
