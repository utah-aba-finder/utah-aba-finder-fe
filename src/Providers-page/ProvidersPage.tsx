import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProvidersPage.css';
import childrenBanner from '../Assets/children-banner.jpg';
import ProviderModal from './ProviderModal';
import SearchBar from './SearchBar';
import GoogleMap from './GoogleMap';
import ProviderCard from './ProviderCard';
import { fetchProviders } from '../Utility/ApiCall';
import { MockProviders, ProviderAttributes } from '../Utility/Types';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';


const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
  const [uniqueInsuranceOptions, setUniqueInsuranceOptions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedWaitList, setSelectedWaitList] = useState<string>('');
  const [mapAddress, setMapAddress] = useState<string>('Utah');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);


  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showError, setShowError] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const mapSectionRef = useRef<HTMLDivElement>(null);
  const providersPerPage = 8;

  useEffect(() => {
    const getProviders = async () => {
      try {
        setShowError('');
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        const providersList: MockProviders = await fetchProviders();
        const mappedProviders = providersList.data.map(provider => provider.attributes);

        const sortedProviders = mappedProviders.sort((a, b) => {
          const nameA = a.name ?? '';
          const nameB = b.name ?? '';
          return nameA.localeCompare(nameB);
        });

        setAllProviders(sortedProviders);
        setFilteredProviders(sortedProviders);

        const uniqueInsurances = Array.from(new Set(
          sortedProviders.flatMap(provider => provider.insurance.map(ins => ins.name || '')).sort() as string[]
        ));
        setUniqueInsuranceOptions(uniqueInsurances);
        setMapAddress('Utah');
        setIsLoading(false);
        if (sortedProviders.length === 0) {
          errorTimeoutRef.current = setTimeout(() => {
            setShowError('We are currently experiencing issues displaying ABA Providers. Please try again later.');
          }, 5000);
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        setIsLoading(false);
        errorTimeoutRef.current = setTimeout(() => {
          setShowError('We are currently experiencing issues displaying ABA Providers. Please try again later.');
        }, 5000);
      }
    };
    getProviders();
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
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
      if (waitlist === '6 Months or Less') {
        const waitlistTime = provider.waitlist ? parseInt(provider.waitlist, 10) : null;
        return waitlistTime !== null && waitlistTime <= 6;
      } else if (!waitlist) {
        return true;
      }
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

    const sortedFilteredProviders = filtered.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });

    setFilteredProviders(sortedFilteredProviders);

    setIsFiltered(true);
    setCurrentPage(1);
  }, [allProviders]);

  useEffect(() => {
    handleSearch({ query: '', county: '', insurance: '', spanish: '', service: '', waitlist: '' });
  }, [handleSearch]);

  const handleProviderCardClick = (provider: ProviderAttributes) => {
    setSelectedProvider(provider);
  
   
    const address = provider.locations.length > 0
      ? `${provider.locations[0].address_1 || ''} ${provider.locations[0].address_2 || ''}, ${provider.locations[0].city || ''}, ${provider.locations[0].state || ''} ${provider.locations[0].zip || ''}`.trim()
      : 'Address not available';
  
   
    setMapAddress(address);
    setSelectedAddress(address); 
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
    setSelectedWaitList(waitlist);
  };

  const handleResults = (results: MockProviders) => {
    const mappedResults = results.data.map(p => ({
      id: p.attributes.id,
      name: p.attributes.name,
      locations: p.attributes.locations,
      insurance: p.attributes.insurance,
      counties_served: p.attributes.counties_served,
      password: p.attributes.password,
      username: p.attributes.username,
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
    }));

    const filteredResults = mappedResults.filter(provider =>
      (!selectedService ||
        (selectedService === 'telehealth' && provider.telehealth_services?.toLowerCase() === 'yes') ||
        (selectedService === 'at_home' && provider.at_home_services?.toLowerCase() === 'yes') ||
        (selectedService === 'in_clinic' && provider.in_clinic_services?.toLowerCase() === 'yes')) &&
      (!selectedWaitList ||
        (selectedWaitList === '6 Months or Less' && (provider.waitlist ? parseInt(provider.waitlist, 10) <= 6 : false)) ||
        (selectedWaitList === 'no' && provider.waitlist?.toLowerCase() === 'no'))
    );

    const sortedFilteredResults = filteredResults.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });

    setFilteredProviders(sortedFilteredResults);

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
        <div className="view-on-map-dropdown-container">
          <select
            className={`view-on-map-dropdown ${!isAddressAvailable ? 'disabled' : ''}`}
            id='view-on-map-dropdown'
            aria-label="View On Map Dropdown"
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
        </div>
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
        providers={allProviders}
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
        {isLoading && (
          <div className="loading-container">
            <img src={gearImage} alt="Loading..." className="loading-gear" />
            <p>Loading providers...</p>
          </div>
        )}
        {!isLoading && showError && <div className='error-message'>{showError}</div>}
        {!isLoading && !showError && (
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
        )}
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

      {selectedProvider && (
        <ProviderModal
        provider={selectedProvider}
        address={selectedAddress || 'Address not available'} 
        mapAddress={mapAddress}
        onClose={handleCloseModal}
      />
      )}

    </div>
  );
};

export default ProvidersPage;