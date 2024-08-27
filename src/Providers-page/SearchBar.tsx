import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCountyChange: (county: string) => void;
  onInsuranceChange: (insurance: string) => void;
  onSpanishChange: (spanish: string) => void;
  onReset: () => void; // Add this line
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCountyChange,
  onInsuranceChange,
  onSpanishChange,
  onReset // Add this line
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedSpanish, setSelectedSpanish] = useState<string>(''); // New state for Spanish
  const [inputError, setInputError] = useState<boolean>(false);
  const [countyError, setCountyError] = useState<boolean>(false);
  const [insuranceError, setInsuranceError] = useState<boolean>(false);
  const [spanishError, setSpanishError] = useState<boolean>(false); // New error state for Spanish

  const handleSearch = () => {
    let isValid = true;

    setInputError(false);
    setCountyError(false);
    setInsuranceError(false);
    setSpanishError(false); // Reset Spanish error

    // if (!searchQuery) {
    //   setInputError(true);
    //   toast.error('Please enter a search query.');
    //   isValid = false;
    // }

    if (!selectedCounty) {
      setCountyError(true);
      toast.error('Please select a county.');
      isValid = false;
    }

    if (!selectedInsurance) {
      setInsuranceError(true);
      toast.error('Please select an insurance company.');
      isValid = false;
    }

    if (!selectedSpanish) {
      setSpanishError(true);
      toast.error('Please select if Spanish is spoken.');
      isValid = false;
    }

    if (isValid) {
      onSearch(searchQuery);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedInsurance('');
    setSelectedSpanish('');
    setInputError(false);
    setCountyError(false);
    setInsuranceError(false);
    setSpanishError(false);
    onReset(); // Call onReset prop
  };

  const handleCountyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const county = event.target.value;
    setSelectedCounty(county);
    onCountyChange(county);

    if (county) {
      setCountyError(false);
    }
  };

  const handleInsuranceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const insurance = event.target.value;
    setSelectedInsurance(insurance);
    onInsuranceChange(insurance);

    if (insurance) {
      setInsuranceError(false);
    }
  };

  const handleSpanishChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const spanish = event.target.value;
    setSelectedSpanish(spanish);
    onSpanishChange(spanish);

    if (spanish) {
      setSpanishError(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);

    if (event.target.value) {
      setInputError(false);
    }
  };

  return (
    <>
      <section className="provider-map-search-section">
        <div className="provider-map-searchbar">
          <input
            type="text"
            placeholder="Search for a provider..."
            value={searchQuery}
            onChange={handleInputChange}
            className={inputError ? 'input-error' : ''}
          />
          <div className="provider-county-dropdown">
            <select
              className={`provider-county-select ${countyError ? 'input-error' : ''}`}
              value={selectedCounty}
              onChange={handleCountyChange}
            >
              <option value="" disabled>County</option>
              <option value="salt-lake">Salt Lake County</option>
              <option value="utah">Utah County</option>
              <option value="davis">Davis County</option>
              <option value="weber">Weber County</option>
              <option value="iron">Iron County</option>
              <option value="cache">Cache County</option>
              <option value="box-elder">Box Elder County</option>
              <option value="washington">Washington County</option>
              <option value="morgan">Morgan County</option>
              <option value="summit">Summit County</option>
              <option value="tooele">Tooele County</option>
              <option value="duchesne">Duchesne County</option>
              <option value="uintah">Uintah County</option>
              <option value="sanpete">Sanpete County</option>
              <option value="wayne">Wayne County</option>
              <span className="dropdown-arrow">&#9660;</span>
            </select>
          </div>
          <div className="provider-insurance-dropdown">
            <select
              className={`provider-insurance-select ${insuranceError ? 'input-error' : ''}`}
              value={selectedInsurance}
              onChange={handleInsuranceChange}
            >
              <option value="" disabled>Insurance</option>
              <option value="Insurance Company 1">Insurance Company 1</option>
              <option value="Insurance Company 2">Insurance Company 2</option>
              <option value="Insurance Company 3">Insurance Company 3</option>
              <option value="Insurance Company 4">Insurance Company 4</option>
              <option value="Insurance Company 5">Insurance Company 5</option>
              <option value="Insurance Company 6">Insurance Company 6</option>
              {/* Add more insurance companies here */}
            </select>
          </div>

          <div className="provider-spanish-dropdown"> {/* New Spanish dropdown */}
            <select
              className={`provider-spanish-select ${spanishError ? 'input-error' : ''}`}
              value={selectedSpanish}
              onChange={handleSpanishChange}
            >
              <option value="" disabled>Spanish?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <button className="provider-search-button" onClick={handleSearch}>
            Search
          </button>
          <button className="provider-reset-button" onClick={handleReset}> {/* New reset button */}
            Reset
          </button>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default SearchBar;
