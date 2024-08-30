import React, { useState, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SearchBar.css';
import { MockProviders } from '../Utility/Types';

interface SearchBarProps {
  onResults: (results: MockProviders) => void;
  onSearch: (params: { query: string; county: string; insurance: string; spanish: string }) => void; // Update this line
  onCountyChange: (county: string) => void;
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onReset: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
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

    if (isValid) {
      const searchParams = {
        query: searchQuery,
        county: selectedCounty,
        insurance: selectedInsurance,
        spanish: selectedSpanish
      };
      onSearch(searchParams); // Pass search parameters as an object
    }
  }, [searchQuery, selectedCounty, selectedInsurance, selectedSpanish, onSearch]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setInputError(false);
    setCountyError(false);
    setInsuranceError(false);
    setSpanishError(false);

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
              className={`provider-insurance-select ${insuranceError ? 'input-error' : ''}`}
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
            >
              {/* <option value="" disabled>Insurance</option> */}
              <option value="">All Insurances</option>
              <option value="Aetna">Aetna</option>
              <option value="Regence (BCBS)">Regence (BCBS)</option>
              <option value="Cigna">Cigna</option>
              <option value="Health Choice Utah">Health Choice Utah</option>
              <option value="Healthy U Medicaid (University of Utah Health Plans)">Healthy U Medicaid (University of Utah Health Plans)</option>
              <option value="United HealthCare (UHC)">United HealthCare (UHC)</option>
              <option value="Deseret Mutual Benefit Administrators (DMBA)">Deseret Mutual Benefit Administrators (DMBA)</option>
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
