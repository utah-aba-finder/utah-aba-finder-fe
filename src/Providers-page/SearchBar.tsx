import React, { useState, useCallback, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { CountyData, MockProviders, ProviderAttributes } from '../Utility/Types';
import { fetchCountiesByState, fetchStates } from '../Utility/ApiCall'

interface SearchBarProps {
  onResults: (results: MockProviders) => void;
  onSearch: (params: { query: string; county_name: string; insurance: string; spanish: string; service: string; waitlist: string; age: string; providerType: string; stateId: string;}) => void;
  onCountyChange: (county_name: string) => void;
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
  onProviderTypeChange
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
  const [providerStates, setProviderStates] = useState<any[]>([]) // need to update type from any
  const [error, setError] = useState<string>("") // need to create space for error message, if applicable
  const [selectedStateId, setSelectedStateId] = useState<string>('none');
  const [counties, setCounties] = useState<CountyData[]>([]);

  // Fetch states on component mount
  useEffect(() => {
    const getStates = async () => {
      try {
        const statesData = await fetchStates()
        setProviderStates(statesData)
      } catch {
        setError("We are currently experiencing issues displaying states. Please try again later.")
      }
    }
    getStates()
  }, [])

  // Fetch counties whenever selected state changes
  useEffect(() => {
    const getCounties = async () => {
      if (selectedStateId !== 'none') {
        try {
          const countiesData = await fetchCountiesByState(parseInt(selectedStateId));
          setCounties(countiesData);
          // Only reset county if state changes and not during initial load
          if (selectedCounty !== '') {
            setSelectedCounty('');
            onCountyChange('');
          }
        } catch (err) {
          console.error('Error fetching counties:', err);
          setCounties([]);
          setError("Error loading counties. Please try again later.");
        }
      } else {
        setCounties([]);
        setSelectedCounty('');
        onCountyChange('');
      }
    };

    getCounties();
  }, [selectedStateId, selectedProviderType, selectedCounty, selectedAge, selectedInsurance, selectedService, selectedWaitList, selectedSpanish, searchQuery, onSearch, onCountyChange, onAgeChange, onInsuranceChange, onServiceChange, onWaitListChange, onSpanishChange, onSearch]); 

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

  const handleSearch = useCallback(() => {
    onSearch({
      query: searchQuery,
      county_name: selectedCounty,
      insurance: selectedInsurance,
      spanish: selectedSpanish,
      service: selectedService,
      waitlist: selectedWaitList,
      age: selectedAge,
      providerType: selectedProviderType,
      stateId: selectedStateId
    });
    setShowNotification(true);
    setIsVisible(true);
  }, [searchQuery, selectedCounty, selectedInsurance, selectedSpanish, 
    selectedService, selectedWaitList, selectedAge, selectedProviderType, 
    selectedStateId, onSearch]);

  // Add effect to trigger search when state or provider type changes
  useEffect(() => {
    if (selectedStateId !== 'none' && selectedProviderType !== 'none') {
      handleSearch();
    }
  }, [selectedStateId, selectedProviderType, handleSearch]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setSelectedService('');
    setSelectedWaitList('');
    setSelectedAge('');
    setSelectedProviderType('none');
    setSelectedStateId('none');
    onReset();
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
    { label: 'ABA Therapy', value: 'ABA Therapy', id: 1 },
    { label: 'Autism Evaluation', value: 'Autism Evaluation', id: 2 },
    { label: 'Occupational Therapy', value: 'Occupational Therapy', id: 3 },
    { label: 'Speech Therapy', value: 'Speech Therapy', id: 4 },
  ];

  return (
    <section className="provider-map-search-section">
      <div className="provider-map-searchbar">
        <div className="search-group">
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

        <div className="filter-group">
          <div className="filter-item provider-state-dropdown">
            <select
              className="provider-state-select"
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              aria-label="Select State"
            >
              <option value="none">All States</option>
              {providerStates.map((providerState) => (
                <option key={providerState.id} value={providerState.id}>
                  {providerState.attributes.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item provider-type-dropdown">
            <select
              className="provider-type-select"
              value={selectedProviderType}
              onChange={(e) => {
                const newValue = e.target.value;
                setSelectedProviderType(newValue);
                onProviderTypeChange(newValue);
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

          <div className="filter-item provider-county-dropdown">
            <select
              className="provider-county-select"
              value={selectedCounty}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCounty(value);
                onCountyChange(value);
              }}
              aria-label="Select County"
              disabled={selectedStateId === 'none'}
            >
              <option value="">All Counties</option>
              {counties.map((county) => (
                <option key={county.id} value={county.attributes.name}>
                  {county.attributes.name}
                </option>
              ))}
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
          <button 
            className="provider-search-button" 
            onClick={handleSearch}
          >
            Search
          </button>
          <button className="provider-reset-button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`bg-steelblue text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${showNotification ? 'animate-jump-in' : 'animate-jump-out'}`}>
            <span className="font-bold">
              {providers.length === 0 
                ? `No ${selectedProviderType} providers found for the selected state` 
                : `Your search resulted in ${providers.length} ${selectedProviderType} providers`
              }
            </span>
          </div>
        </div>
      )}
      <ToastContainer />
    </section>
  );
};

export default SearchBar;
