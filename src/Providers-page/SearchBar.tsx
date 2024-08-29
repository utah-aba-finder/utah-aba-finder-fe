import React, { useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { MockProviders } from './NewMockProviders';

interface SearchBarProps {
  mockProviders: MockProviders;
  onResults: (results: MockProviders) => void; // Pass filtered results back to parent
  onSearch: (query: string) => void;
  onCountyChange: (county: string) => void;
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onReset: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  mockProviders,
  onResults,
  onSearch,
  onCountyChange,
  onInsuranceChange,
  onSpanishChange,
  onReset
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>('');
  const [inputError, setInputError] = useState<boolean>(false);
  const [countyError, setCountyError] = useState<boolean>(false);
  const [insuranceError, setInsuranceError] = useState<boolean>(false);
  const [spanishError, setSpanishError] = useState<boolean>(false);

  const handleSearch = useCallback(() => {
    let isValid = true;

    setInputError(false);
    setCountyError(false);
    setInsuranceError(false);
    setSpanishError(false);

    // if (!searchQuery) {
    //   setInputError(true);
    //   toast.error('Please enter a search query.');
    //   isValid = false;
    // }

    // if (!selectedCounty) {
    //   setCountyError(true);
    //   toast.error('Please select a county.');
    //   isValid = false;
    // }

    // if (!selectedInsurance) {
    //   setInsuranceError(true);
    //   toast.error('Please select an insurance company.');
    //   isValid = false;
    // }

    if (!selectedSpanish) {
      setSpanishError(true);
      toast.error('Please select if Spanish is spoken.');
      isValid = false;
    }

    if (isValid) {
      const filteredProviders = mockProviders.data.filter(provider => {
        const nameMatches = provider.attributes.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const countyMatches = provider.attributes.counties_served.some(countyObj =>
          countyObj.county?.toLowerCase().includes(selectedCounty.toLowerCase())
        );
        const insuranceMatches = provider.attributes.insurance.some(ins =>
          ins.name?.toLowerCase() === selectedInsurance.toLowerCase()
        );
        const spanishMatches = provider.attributes.spanish_speakers?.toLowerCase() === selectedSpanish.toLowerCase();

        return nameMatches && countyMatches && insuranceMatches && spanishMatches;
      });

      onResults({ data: filteredProviders });
      onSearch(searchQuery);
      onCountyChange(selectedCounty);
      onInsuranceChange(selectedInsurance);
      onSpanishChange(selectedSpanish);
    }
  }, [searchQuery, selectedCounty, selectedInsurance, selectedSpanish, mockProviders, onResults, onSearch, onCountyChange, onInsuranceChange, onSpanishChange]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setInputError(false);
    setCountyError(false);
    setInsuranceError(false);
    setSpanishError(false);

    onResults(mockProviders); // Reset to all providers
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
            className={inputError ? 'input-error' : ''}
          />
          <div className="provider-county-dropdown">
            <select
              className={`provider-county-select ${countyError ? 'input-error' : ''}`}
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
            >
              <option value="" disabled>County</option>
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
              className={`provider-insurance-select ${insuranceError ? 'input-error' : ''}`}
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
            >
              <option value="" disabled>Insurance</option>
              <option value="Aetna">Aetna</option>
              <option value="Regence (BCBS)">Regence (BCBS)</option>
              <option value="Cigna">Cigna</option>
              <option value="Health Choice Utah">Health Choice Utah</option>
              <option value="Healthy U Medicaid (University of Utah Health Plans)">Healthy U Medicaid (University of Utah Health Plans)</option>
              <option value="United HealthCare (UHC)">United HealthCare (UHC)</option>
            </select>
          </div>

          <div className="provider-spanish-dropdown">
            <select
              className={`provider-spanish-select ${spanishError ? 'input-error' : ''}`}
              value={selectedSpanish}
              onChange={(e) => setSelectedSpanish(e.target.value)}
            >
              <option value="" disabled>Spanish?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
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
