import React, { useState, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { MockProviders } from '../Utility/Types';

interface SearchBarProps {
  onResults: (results: MockProviders) => void;
  onSearch: (params: { query: string; county: string; insurance: string; spanish: string; service: string; waitlist: string; }) => void;
  onCountyChange: (county: string) => void;
  insuranceOptions: string[];
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onServiceChange: (service: string) => void;
  onWaitListChange: (waitlist: string) => void;
  onReset: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCountyChange,
  insuranceOptions,
  onInsuranceChange,
  onSpanishChange,
  onServiceChange,
  onWaitListChange,
  onReset,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedWaitList, setSelectedWaitList] = useState<string>('');

  const handleSearch = useCallback(() => {
    const searchParams = {
      query: searchQuery,
      county: selectedCounty,
      insurance: selectedInsurance,
      spanish: selectedSpanish,
      service: selectedService,
      waitlist: selectedWaitList,
    };

<<<<<<< HEAD
    // If waitlist is "6 Months or Less", modify searchParams to include waitlists of 6 months or less
=======
>>>>>>> 4fe5d0604359cd4a2d0fffb762ce84de991a4e8a
    if (selectedWaitList === '6 Months or Less') {
      searchParams.waitlist = '6 Months or Less';
    }

    onSearch(searchParams);
  }, [searchQuery, selectedCounty, selectedInsurance, selectedSpanish, selectedService, selectedWaitList, onSearch]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setSelectedService('');
    setSelectedWaitList('');
    onReset();
  };

  return (
    <>
      <section className="provider-map-search-section">
        <div className="provider-map-searchbar">

          <input
            className="provider-text-select"
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
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">All Services</option>
              <option value="telehealth">Telehealth Services</option>
              <option value="at_home">At Home Services</option>
              <option value="in_clinic">In Clinic Services</option>
            </select>
          </div>

          <div className="provider-waitlist-dropdown">
            <select
              className="provider-waitlist-select"
              value={selectedWaitList}
              onChange={(e) => setSelectedWaitList(e.target.value)}
            >
              <option value="">All Waitlist Status</option>
              <option value="No">No Waitlist</option>
              <option value="6 Months or Less">6 Months or Less</option>
            </select>
          </div>

          <div className="search-bar-buttons">
            <button className="provider-search-button" onClick={handleSearch}>
              Search
            </button>
            <button className="provider-reset-button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default SearchBar;
