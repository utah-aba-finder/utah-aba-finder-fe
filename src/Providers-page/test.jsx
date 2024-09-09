// import React, { useState, useEffect, useCallback } from 'react';
// import './ProvidersPage.css';
// import ProviderModal from './ProviderModal';
// import SearchBar from './SearchBar';
// import GoogleMap from './GoogleMap';
// import { fetchProviders } from '../Utility/ApiCall';
// import { MockProviders, ProviderAttributes, Insurance } from '../Utility/Types';
// import puzzleLogo from './puzzle.png';

// const ProvidersPage: React.FC = () => {
//   const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
//   const [filteredProviders, setFilteredProviders] = useState<ProviderAttributes[]>([]);
//   const [uniqueInsuranceOptions, setUniqueInsuranceOptions] = useState<string[]>([]); // Store unique insurance names
//   const [mapAddress, setMapAddress] = useState<string>('Utah');
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const providersPerPage = 8;

//   useEffect(() => {
//     const getProviders = async () => {
//       try {
//         const providersList: MockProviders = await fetchProviders();
//         const mappedProviders = providersList.data.map(provider => provider.attributes);
//         setAllProviders(mappedProviders);
//         setFilteredProviders(mappedProviders);

//         // Extract unique insurance names
//         const uniqueInsurances = Array.from(new Set(
//           mappedProviders.flatMap(provider => provider.insurance.map(ins => ins.name || ''))
//         ));

//         setUniqueInsuranceOptions(uniqueInsurances);
//         setMapAddress('Utah');
//       } catch (error) {
//         console.error('Error loading providers:', error);
//       }
//     };

//     getProviders();
//   }, []);

//   const handleSearch = useCallback(({ query, county, insurance, spanish }: { query: string; county: string; insurance: string; spanish: string }) => {
//     // Filtering logic remains the same
//   }, [allProviders]);

//   const handleResetSearch = () => {
//     // Reset logic remains the same
//   };

//   const indexOfLastProvider = currentPage * providersPerPage;
//   const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
//   const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);

//   return (
//     <div className="providers-page">
//       <SearchBar
//         onSearch={handleSearch}
//         onReset={handleResetSearch}
//         insuranceOptions={uniqueInsuranceOptions} // Pass the unique insurances to SearchBar
//       />
//       <section className="provider-cards-grid">
//         {currentProviders.map((provider, index) => (
//           <div key={index} className="searched-provider-card">
//             <img src={provider.logo || puzzleLogo} alt="Provider Logo" className="provider-logo" />
//             {/* Provider information rendering */}
//           </div>
//         ))}
//       </section>
//     </div>
//   );
// };

// export default ProvidersPage;


// import React, { useState } from 'react';
// import './SearchBar.css';

// interface SearchBarProps {
//   onSearch: (params: { query: string; county: string; insurance: string; spanish: string }) => void;
//   onReset: () => void;
//   insuranceOptions: string[]; // Receive insurance options as prop
// }

// const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onReset, insuranceOptions }) => {
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [selectedCounty, setSelectedCounty] = useState<string>('');
//   const [selectedInsurance, setSelectedInsurance] = useState<string>('');
//   const [selectedSpanish, setSelectedSpanish] = useState<string>('');

//   const handleSearch = () => {
//     onSearch({ query: searchQuery, county: selectedCounty, insurance: selectedInsurance, spanish: selectedSpanish });
//   };

//   const handleReset = () => {
//     setSearchQuery('');
//     setSelectedCounty('');
//     setSelectedInsurance('');
//     setSelectedSpanish('');
//     onReset();
//   };

//   return (
//     <section className="provider-map-search-section">
//       <div className="provider-map-searchbar">
//         <input
//           type="text"
//           placeholder="Search for a provider..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
        
//         <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
//           <option value="">All Counties</option>
//           {/* Add county options */}
//         </select>

//         <select value={selectedInsurance} onChange={(e) => setSelectedInsurance(e.target.value)}>
//           <option value="">All Insurances</option>
//           {insuranceOptions.map((insurance, index) => (
//             <option key={index} value={insurance}>{insurance}</option>
//           ))}
//         </select>

//         <select value={selectedSpanish} onChange={(e) => setSelectedSpanish(e.target.value)}>
//           <option value="">Spanish?</option>
//           <option value="yes">Yes</option>
//           <option value="no">No</option>
//         </select>

//         <button onClick={handleSearch}>Search</button>
//         <button onClick={handleReset}>Reset</button>
//       </div>
//     </section>
//   );
// };

// export default SearchBar;