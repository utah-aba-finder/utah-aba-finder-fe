import React, { useState, useEffect, useCallback } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { CountyData, Providers, ProviderAttributes, InsuranceData } from '../Utility/Types';
import { fetchCountiesByState, fetchStates } from '../Utility/ApiCall';
import { ChevronDown, ChevronUp, Search, RotateCcw, MapPin } from 'lucide-react';

interface SearchBarProps {
  onResults: (results: Providers) => void;
  onSearch: (params: {
    query: string;
    county_name: string;
    insurance: string;
    spanish: string;
    service: string;
    waitlist: string;
    age: string;
    providerType: string;
    stateId: string;
    state: string;
    hasReviews: string;
  }) => void;
  onCountyChange: (county_name: string) => void;
  insuranceOptions: InsuranceData[];
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onServiceChange: (service: string) => void;
  onWaitListChange: (waitlist: string) => void;
  onAgeChange: (age: string) => void;
  onReviewsChange: (hasReviews: string) => void;
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
  onReviewsChange,
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
  const [selectedHasReviews, setSelectedHasReviews] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState<string>('none');
  const [providerStates, setProviderStates] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedStateId, setSelectedStateId] = useState<string>('none');
  const [selectedState, setSelectedState] = useState<string>('none');
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [advancedOptions, setAdvancedOptions] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    const getStates = async () => {
      try {
        const statesData = await fetchStates();
        setProviderStates(statesData);
      } catch {
        setError('We are currently experiencing issues displaying states. Please try again later.');
      }
    };
    getStates();
  }, []);

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
          setError('Error loading counties. Please try again later.');
        }
      } else {
        setCounties([]);
        setSelectedCounty('');
        onCountyChange('');
      }
    };

    getCounties();
  }, [selectedStateId]);

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
      stateId: selectedStateId,
      state: selectedState,
      hasReviews: selectedHasReviews,
    });
    setShowNotification(true);
    setIsVisible(true);
  }, [
    searchQuery,
    selectedCounty,
    selectedInsurance,
    selectedSpanish,
    selectedService,
    selectedWaitList,
    selectedAge,
    selectedProviderType,
    selectedStateId,
    selectedState,
    selectedHasReviews,
    onSearch,
  ]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setSelectedService('');
    setSelectedWaitList('');
    setSelectedAge('');
    setSelectedHasReviews('');
    setSelectedProviderType('none');
    setSelectedStateId('none');
    onReset();
    onCountyChange('');
    onInsuranceChange('');
    onSpanishChange('');
    onServiceChange('');
    onWaitListChange('');
    onAgeChange('');
    onReviewsChange('');
    onProviderTypeChange('none');
    setSelectedState('none');
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
        <div className="filter-container">
          <div className={`filter-item provider-state-dropdown ${selectedStateId === 'none' ? 'focus' : ''}`}>
            <select
              className="provider-state-select"
              value={selectedStateId}
              onChange={(e) => {
                const stateId = e.target.value;
                setSelectedStateId(stateId);
                if (stateId !== 'none') {
                  const state = providerStates.find(s => s.id.toString() === stateId);
                  setSelectedState(state?.attributes.abbreviation || 'none');
                } else {
                  setSelectedState('none');
                }
              }}
              aria-label="Select State"
              required
            >
              <option value="none"> <MapPin size={18} /> Choose a state</option>
              {providerStates.map((providerState) => (
                <option 
                  key={providerState.id} 
                  value={providerState.id}
                >
                  {providerState.attributes.name}
                </option>
              ))}
            </select>
          </div>

          <div className={`filter-item provider-type-dropdown ${selectedProviderType === 'none' ? 'focus' : ''}`}>
            <select
              className="provider-type-select"
              value={selectedProviderType}
              onChange={(e) => {
                const newValue = e.target.value;
                setSelectedProviderType(newValue);
                onProviderTypeChange(newValue);
              }}
              required
              aria-label="Select Provider Type"
            >
              {providerTypeOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search by name"
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

          <div className="filter-item provider-insurance-dropdown">
            <input
              type="text"
              className="provider-insurance-select"
              value={selectedInsurance}
              onChange={(e) => {
                setSelectedInsurance(e.target.value);
                onInsuranceChange(e.target.value);
              }}
              list="insurance-options"
              placeholder="Search by insurance"
              aria-label="Select Insurance"
            />
            <datalist id="insurance-options">
              <option value="">All Insurance</option>
              {insuranceOptions
                .filter((insurance) => insurance.attributes.name !== 'Contact us')
                .sort((a, b) => a.attributes.name.localeCompare(b.attributes.name))
                .map((insurance, index) => (
                  <option key={index} value={insurance.attributes.name} />
                ))}
            </datalist>
          </div>
        </div>

        {advancedOptions && (
          <div className="filter-group">
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
                required
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
                <option value="in_home_available">In-Home Available</option>
                <option value="in_clinic_available">In-Clinic Available</option>
                <option value="both_available">Both Available</option>
                <option value="both_waitlist">Both on Waitlist</option>
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

            <div className="filter-item provider-reviews-dropdown">
              <select
                className="provider-reviews-select"
                value={selectedHasReviews}
                onChange={(e) => {
                  setSelectedHasReviews(e.target.value);
                  onReviewsChange(e.target.value);
                }}
                aria-label="Reviews Filter"
              >
                <option value="">All Providers</option>
                <option value="has_reviews">Has Google Reviews</option>
                <option value="no_reviews">No Google Reviews</option>
              </select>
              <small className="text-xs text-gray-500 mt-1 block">
                Filter by Google review availability
              </small>
            </div>
          </div>
        )}

        <div className="button-group">
          <button className="advanced-options-button" onClick={() => setAdvancedOptions(!advancedOptions)}>
            <span className="flex items-center gap-2">
              Advanced Options
              {advancedOptions ? <ChevronUp /> : <ChevronDown />}
            </span>
          </button>
          <button
            className="provider-search-button"
            onClick={handleSearch}
            disabled={selectedStateId === 'none' || selectedProviderType === 'none'}
          >
            <Search size={18} />Search
          </button>
          <button className="provider-reset-button" onClick={handleReset}>
            <RotateCcw size={18} />Reset
          </button>
        </div>
        
      </div>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`bg-steelblue text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${showNotification ? 'animate-jump-in' : 'animate-jump-out'}`}>
            <span className="font-bold">
              {providers.length === 0
                ? `No ${selectedProviderType} providers found for the selected state make sure to check back periodically!`
                : `Your search resulted in ${providers.length} ${selectedProviderType} providers`}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchBar;