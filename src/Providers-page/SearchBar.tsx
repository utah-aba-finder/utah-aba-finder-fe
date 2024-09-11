import React, { useState, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { MockProviders } from '../Utility/Types';

interface SearchBarProps {
  onResults: (results: MockProviders) => void;
  onSearch: (params: { query: string; county: string; insurance: string; spanish: string; service: string; }) => void;
  onCountyChange: (county: string) => void;
  insuranceOptions: string[];
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onServiceChange: (service: string) => void;
  onReset: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCountyChange,
  insuranceOptions,
  onInsuranceChange,
  onSpanishChange,
  onServiceChange,
  onReset,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  
  const handleSearch = useCallback(() => {
    const searchParams = {
      query: searchQuery,
      county: selectedCounty,
      insurance: selectedInsurance,
      spanish: selectedSpanish,
      service: selectedService,
    };
    onSearch(searchParams);
  }, [searchQuery, selectedCounty, selectedInsurance, selectedSpanish, selectedService, onSearch]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setSelectedService('');
    onReset();
  };

  return (
    <>
      <section className="provider-map-search-section">
        <div className="provider-map-searchbar">
          <input
            type="text"
            placeholder="Search for a provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="provider-county-dropdown">
          <select
              className={`provider-county-select`}
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
            >
              {/* <option value="" disabled>County</option> */}
              <option value="">All Counties</option>
              <option value="Salt Lake">Salt Lake County</option>
              <option value="Utah">Utah County</option>
              <option value="Davis">Davis County</option>
              <option value="Weber">Weber County</option>
              <option value="Iron">Iron County</option>
              <option value="Cache">Cache County</option>
              <option value="Box-Elder">Box Elder County</option>
              <option value="Washington">Washington County</option>
              <option value="Morgan">Morgan County</option>
              <option value="Summit">Summit County</option>
              <option value="Tooele">Tooele County</option>
              <option value="Duchesne">Duchesne County</option>
              <option value="Uintah">Uintah County</option>
              <option value="Sanpete">Sanpete County</option>
              <option value="Wayne">Wayne County</option>
            </select>
          </div>

          <div className="provider-insurance-dropdown">
            <select
              className="provider-insurance-select"
              value={selectedInsurance}
              onChange={(e) => {
                setSelectedInsurance(e.target.value);
                onInsuranceChange(e.target.value);
              }}
            >
              <option value="">All Insurances</option>
              {insuranceOptions.map((insurance, index) => (
                <option key={index} value={insurance}>
                  {insurance}
                </option>
              ))}
            </select>
          </div>

          <div className="provider-spanish-dropdown">
            <select
              className="provider-spanish-select"
              value={selectedSpanish}
              onChange={(e) => setSelectedSpanish(e.target.value)}
            >
              <option value="">Spanish?</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="provider-service-dropdown">
            <select
              className="provider-service-select"
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                
              }}
            >
              <option value="">All Services</option>
              <option value="telehealth">Telehealth Services</option>
              <option value="at_home">At Home Services</option>
              <option value="in_clinic">In Clinic Services</option>
            </select>
          </div>

          <button className="provider-search-button" onClick={handleSearch}>
            Search
          </button>
          <button className="provider-reset-button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default SearchBar;
