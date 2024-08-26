import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCountyChange: (county: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onCountyChange }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [inputError, setInputError] = useState<boolean>(false);
  const [countyError, setCountyError] = useState<boolean>(false);

  const handleSearch = () => {
    let isValid = true;

    setInputError(false);
    setCountyError(false);

    if (!searchQuery) {
      setInputError(true);
      toast.error('Please enter a search query.');
      isValid = false;
    }

    if (!selectedCounty) {
      setCountyError(true);
      toast.error('Please select a county.');
      isValid = false;
    }

    if (isValid) {
      onSearch(searchQuery);
    }
  };

  const handleCountyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const county = event.target.value;
    setSelectedCounty(county);
    onCountyChange(county);

    if (county) {
      setCountyError(false);
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
              <option value="" disabled>Select a county</option>
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

          <button className="provider-search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default SearchBar;
