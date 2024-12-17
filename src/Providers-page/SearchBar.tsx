import React, { useState, useCallback, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { MockProviders, ProviderAttributes } from '../Utility/Types';

interface SearchBarProps {
  onResults: (results: MockProviders) => void;
  onSearch: (params: { query: string; county: string; insurance: string; spanish: string; service: string; waitlist: string; age: string; providerType: string; }) => void;
  onCountyChange: (county: string) => void;
  insuranceOptions: string[];
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onServiceChange: (service: string) => void;
  onWaitListChange: (waitlist: string) => void;
  onAgeChange: (age: string) => void;
  onReset: () => void;
  providers: ProviderAttributes[];
  onProviderTypeChange: (providerType: string) => void;
  totalProviders: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCountyChange,
  insuranceOptions,
  onInsuranceChange,
  onSpanishChange,
  onServiceChange,
  onWaitListChange,
  onAgeChange,
  onReset,
  providers,
  totalProviders,
  onProviderTypeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedWaitList, setSelectedWaitList] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState<string>('none');

  const handleSearch = useCallback(() => {
    onSearch({
      query: searchQuery,
      county: selectedCounty,
      insurance: selectedInsurance,
      spanish: selectedSpanish,
      service: selectedService,
      waitlist: selectedWaitList,
      age: selectedAge,
      providerType: selectedProviderType,
    });
    setShowNotification(true);
    setIsVisible(true);
  }, [searchQuery, selectedCounty, selectedInsurance, selectedSpanish, selectedService, selectedWaitList, selectedAge, onSearch, selectedProviderType]);


  useEffect(() => {
    if (showNotification) {
      const hideTimer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(hideTimer);
    } else if (!showNotification && isVisible) {
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(removeTimer);
    }
  }, [showNotification, isVisible]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setSelectedService('');
    setSelectedWaitList('');
    setSelectedAge('');
    setSelectedProviderType('none');
    onReset();
    // Trigger search with reset values to clear results
    onSearch({
      query: '',
      county: '',
      insurance: '',
      spanish: '',
      service: '',
      waitlist: '',
      age: '',
      providerType: 'none'
    });
    // Reset all callback handlers
    onCountyChange('');
    onInsuranceChange('');
    onSpanishChange('');
    onServiceChange('');
    onWaitListChange('');
    onAgeChange('');
    onProviderTypeChange('none');
  };

  const ageOptions = [
    { label: 'All Ages', value: '' },
    { label: '0-2 years', value: '0-2' },
    { label: '3-5 years', value: '3-5' },
    { label: '5-7 years', value: '5-7' },
    { label: '8-10 years', value: '8-10' },
    { label: '11-13 years', value: '11-13' },
    { label: '13-15 years', value: '13-15' },
    { label: '16-18 years', value: '16-18' },
    { label: '19+ years', value: '19+' },
  ];

  const providerTypeOptions = [
    { label: 'Select Type', value: 'none', id: 0 },
    { label: 'Autism Evaluation', value: 'Autism Evaluation', id: 1 },
    { label: 'ABA Therapy', value: 'ABA Therapy', id: 2 },
    { label: 'Speech Therapy', value: 'Speech Therapy', id: 3 },
    { label: 'Occupational Therapy', value: 'Occupational Therapy', id: 4 },
  ];


  return (
    <section className="provider-map-search-section">
      <div className="provider-map-searchbar">
        <div className="search-group">
          <select
            className="provider-type-select"
            value={selectedProviderType}
            onChange={(e) => {
              const newValue = e.target.value;
              setSelectedProviderType(newValue);
              onProviderTypeChange(newValue);
              onSearch({
                query: searchQuery,
                county: selectedCounty,
                insurance: selectedInsurance,
                spanish: selectedSpanish,
                service: selectedService,
                waitlist: selectedWaitList,
                age: selectedAge,
                providerType: newValue,
              });
            }}
            aria-label="Select Provider Type"
          >
            {providerTypeOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedProviderType !== 'none' && (
          <>
            <div className="search-group">
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search for a provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  list="provider-names"
                />
                <datalist id="provider-names">
                  {providers.map((provider, index) => (
                    <option key={index} value={provider.name ?? ''} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-item provider-county-dropdown">
                <select
                  className="provider-county-select"
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  aria-label="Select County"
                >
                  <option value="">All Counties</option>
                  <option value="Beaver">Beaver County</option>
                  <option value="Box-Elder">Box Elder County</option>
                  <option value="Cache">Cache County</option>
                  <option value="Carbon">Carbon County</option>
                  <option value="Daggett">Daggett County</option>
                  <option value="Davis">Davis County</option>
                  <option value="Duchesne">Duchesne County</option>
                  <option value="Emery">Emery County</option>
                  <option value="Garfield">Garfield County</option>
                  <option value="Grand">Grand County</option>
                  <option value="Iron">Iron County</option>
                  <option value="Juab">Juab County</option>
                  <option value="Kane">Kane County</option>
                  <option value="Millard">Millard County</option>
                  <option value="Morgan">Morgan County</option>
                  <option value="Piute">Piute County</option>
                  <option value="Rich">Rich County</option>
                  <option value="Salt Lake">Salt Lake County</option>
                  <option value="San Juan">San Juan County</option>
                  <option value="Sanpete">Sanpete County</option>
                  <option value="Sevier">Sevier County</option>
                  <option value="Summit">Summit County</option>
                  <option value="Tooele">Tooele County</option>
                  <option value="Uintah">Uintah County</option>
                  <option value="Utah">Utah County</option>
                  <option value="Wasatch">Wasatch County</option>
                  <option value="Washington">Washington County</option>
                  <option value="Wayne">Wayne County</option>
                  <option value="Weber">Weber County</option>
                </select>
              </div>

              <div className="filter-item provider-age-dropdown">
                <select
                  className="provider-age-select"
                  value={selectedAge}
                  onChange={(e) => {
                    setSelectedAge(e.target.value);
                    onAgeChange(e.target.value);
                  }}
                  aria-label="Select Age Group"
                >
                  {ageOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item provider-insurance-dropdown">
                <select
                  className="provider-insurance-select"
                  value={selectedInsurance}
                  onChange={(e) => {
                    setSelectedInsurance(e.target.value);
                    onInsuranceChange(e.target.value);
                  }}
                  aria-label="Select Insurance"
                >
                  <option value="">All Insurances</option>
                  {insuranceOptions
                    .filter(insurance => insurance !== 'Contact us')
                    .map((insurance, index) => (
                      <option key={index} value={insurance}>
                        {insurance}
                      </option>
                    ))}
                </select>
              </div>

              <div className="filter-item provider-service-dropdown">
                <select
                  className="provider-service-select"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  aria-label="Select Service Type"
                >
                  <option value="">All Services</option>
                  <option value="telehealth">Telehealth Services</option>
                  <option value="at_home">At Home Services</option>
                  <option value="in_clinic">In Clinic Services</option>
                </select>
              </div>

              <div className="filter-item provider-waitlist-dropdown">
                <select
                  className="provider-waitlist-select"
                  value={selectedWaitList}
                  onChange={(e) => setSelectedWaitList(e.target.value)}
                  aria-label="Select Waitlist Status"
                >
                  <option value="">All Waitlist Status</option>
                  <option value="No">No Waitlist</option>
                  <option value="6 Months or Less">6 Months or Less</option>
                </select>
              </div>

              <div className="filter-item provider-spanish-dropdown">
                <select
                  className="provider-spanish-select"
                  value={selectedSpanish}
                  onChange={(e) => setSelectedSpanish(e.target.value)}
                  aria-label="Spanish Language Option"
                >
                  <option value="">Spanish?</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <div className="button-group">
              <button className="provider-search-button" onClick={handleSearch}>
                Search
              </button>
              <button className="provider-reset-button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </>
        )}
      </div>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`bg-steelblue text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${showNotification ? 'animate-jump-in' : 'animate-jump-out'}`}>
            <span className="font-bold">
              Your search resulted in {providers.length} providers of a total of {totalProviders}
            </span>
          </div>
        </div>
      )}
      <ToastContainer />
    </section>
  );
};

export default SearchBar;
