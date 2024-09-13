import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';
import ProviderCard from './ProviderCard';
import { fetchProviders } from '../Utility/ApiCall';
import { MockProviders, ProviderAttributes } from '../Utility/Types';


const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
  const [uniqueInsuranceOptions, setUniqueInsuranceOptions] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedWaitList, setSelectedWaitList] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('Utah');
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const providersPerPage = 8;

  useEffect(() => {
    const getProviders = async () => {
      try {
        const providersList: MockProviders = await fetchProviders();
        const mappedProviders = providersList.data.map(provider => provider.attributes);
        setAllProviders(mappedProviders);
        setFilteredProviders(mappedProviders);

        const uniqueInsurances = Array.from(new Set(
          mappedProviders.flatMap(provider => provider.insurance.map(ins => ins.name || '')).sort()
        ));
        setUniqueInsuranceOptions(uniqueInsurances);
        setMapAddress('Utah');
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    };

    getProviders();
  }, []);

  const handleSearch = useCallback(({ query, county, insurance, spanish, service, waitlist }: { query: string; county: string; insurance: string; spanish: string; service: string; waitlist: string }) => {
    const normalizedCounty = county.toLowerCase();
    const normalizedInsurance = insurance.toLowerCase();
  
    const serviceFilter = (provider: ProviderAttributes) => {
      if (!service) return true;
      switch (service) {
        case 'telehealth':
          return provider.telehealth_services?.toLowerCase() === 'yes' || provider.telehealth_services === null || provider.telehealth_services.toLowerCase() === 'limited';
        case 'at_home':
          return provider.at_home_services?.toLowerCase() === 'yes' || provider.at_home_services === null || provider.at_home_services.toLowerCase() === 'limited';
        case 'in_clinic':
          return provider.in_clinic_services?.toLowerCase() === 'yes' || provider.in_clinic_services === null || provider.in_clinic_services.toLowerCase() === 'limited';
        default:
          return true;
      }
    };
  
    const waitlistFilter = (provider: ProviderAttributes) => {
      if (!waitlist) return true;
      return waitlist === 'yes'
        ? provider.waitlist?.toLowerCase() !== 'no'
        : provider.waitlist?.toLowerCase() === 'no';
    };
  
    const filtered = allProviders.filter(provider =>
      provider.name?.toLowerCase().includes(query.toLowerCase()) &&
      (!county || provider.counties_served.some(c => c.county?.toLowerCase().includes(normalizedCounty))) &&
      (!insurance || provider.insurance.some(i => i.name?.toLowerCase().includes(normalizedInsurance))) &&
      (spanish === '' ||
        (spanish === 'no' && (!provider.spanish_speakers || provider.spanish_speakers.toLowerCase() === 'no')) ||
        (spanish === 'yes' && (provider.spanish_speakers?.toLowerCase() === 'yes' || provider.spanish_speakers === null || provider.spanish_speakers.toLowerCase() === 'limited'))) &&
      serviceFilter(provider) &&
      waitlistFilter(provider)
    );
  
    setFilteredProviders(filtered);
    setIsFiltered(true);
    setCurrentPage(1);
  }, [allProviders]);
  
  useEffect(() => {
    handleSearch({ query: '', county: '', insurance: '', spanish: '', service: '', waitlist: '' });
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
    setSelectedService('');
    setSelectedWaitList('');
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

  const handleServiceChange = (service: string) => {
    setSelectedService(service);
  };

  const handleWaitListChange = (waitlist: string) => {
    setSelectedWaitList(waitlist)
  }

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
      logo: p.attributes.logo
    })));
    setCurrentPage(1);
  };

  const filteredWithService = filteredProviders.filter(provider => {
    switch (selectedService) {
      case 'telehealth':
        return provider.telehealth_services?.toLowerCase() === 'yes';
      case 'at_home':
        return provider.at_home_services?.toLowerCase() === 'yes';
      case 'in_clinic':
        return provider.in_clinic_services?.toLowerCase() === 'yes';
      default:
        return true;
    }
  });

  const filteredWithoutService = filteredProviders.filter(provider => {
    switch (selectedService) {
      case 'telehealth':
        return provider.telehealth_services === null;
      case 'at_home':
        return provider.at_home_services === null;
      case 'in_clinic':
        return provider.in_clinic_services === null;
      default:
        return false;
    }
  });

  const combinedProviders = [...filteredWithService, ...filteredWithoutService];
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const paginatedProviders = combinedProviders.slice(indexOfFirstProvider, indexOfLastProvider);

  const totalPages = Math.ceil(combinedProviders.length / providersPerPage);

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

      <div className="map">
        <section className="google-map-section" ref={mapSectionRef}>
          <GoogleMap address={mapAddress} />
        </section>
      </div>
      <section className="provider-title-section">
        <h2>
          {isFiltered
            ? `Showing ${paginatedProviders.length} of ${combinedProviders.length} Providers`
            : `Showing ${allProviders.length} Providers`}
        </h2>
      </section>
            <SearchBar
              onResults={handleResults}
              onSearch={handleSearch}
              onCountyChange={handleCountyChange}
              onInsuranceChange={handleInsuranceChange}
              insuranceOptions={uniqueInsuranceOptions}
              onSpanishChange={handleSpanishChange}
              onServiceChange={handleServiceChange}
              onWaitListChange={handleWaitListChange}
              onReset={handleResetSearch}
            />

      <section className="searched-provider-map-locations-list-section">
        <div className="provider-cards-grid">
          {paginatedProviders.map((provider, index) => (
            <ProviderCard
              key={index}
              provider={provider}
              onViewDetails={handleProviderCardClick}
              renderViewOnMapButton={renderViewOnMapButton}
            />
          ))}
        </div>
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
