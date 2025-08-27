import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ProvidersPage.css";
import childrenBanner from "../Assets/children-banner-2.jpg";
import ProviderModal from "./ProviderModal";
import SearchBar from "./SearchBar";
import ProviderCard from "./ProviderCard";
import { ProviderData, ProviderAttributes, InsuranceData } from "../Utility/Types";
import gearImage from "../Assets/Gear@1x-0.5s-200px-200px.svg";
import Joyride, { Step, STATUS } from "react-joyride";
import { fetchPublicProviders, fetchInsurance, fetchProvidersByStateIdAndProviderType } from "../Utility/ApiCall";
import SEO from "../Utility/SEO";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
interface FavoriteDate {
  [providerId: number]: string;
}
const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  // const [providersByTypeandState, setProvidersByTypeAndState] = useState<any[]>([])
  const [filteredProviders, setFilteredProviders] = useState<
    ProviderAttributes[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedInsurance, setSelectedInsurance] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSpanish, setSelectedSpanish] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedWaitList, setSelectedWaitList] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [mapAddress, setMapAddress] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showError, setShowError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [favoriteProviders, setFavoriteProviders] = useState<
    ProviderAttributes[]
  >([]);
  const [favoriteDates, setFavoriteDates] = useState<FavoriteDate>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAge, setSelectedAge] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProviderType, setSelectedProviderType] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [selectedHasReviews, setSelectedHasReviews] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [providersWithReviews, setProvidersWithReviews] = useState<Set<number>>(new Set());
  const providersPerPage = 10;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageTransition, setPageTransition] = useState<"next" | "prev" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSearchRefined, setIsSearchRefined] = useState(false);
  const [showResultMessage, setShowResultMessage] = useState(false);
  const [showSearchNotification, setShowSearchNotification] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error' | 'offline'>('loading');
  const [lastFetchAttempt, setLastFetchAttempt] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [steps] = useState<Step[]>([
    {
      target: ".provider-state-select",
      content: "First select the state you are looking for.",
      disableBeacon: true,
      placement: "top",
    },
    {
      target: ".provider-type-select",
      content: "Then select the type of provider you are looking for.",
      placement: "top",
    },
    {
      target: ".provider-map-searchbar",
      content:
        "Use this search section to find providers by name, county, insurance, spanish speaking, services and waitlist status.",
      placement: "top",
    },
    {
      target: ".provider-cards-grid",
      content:
        "Here you can see the available providers. Click on a provider to see more details, and to add them to your favorites.",
      placement: "top",
    },
    {
      target: ".pagination-controls",
      content:
        "Use these buttons to navigate between different pages of providers.",
      placement: "top",
    },
  ]);
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceData[]>([]);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status, type, index } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem("providersPageVisited", "true");
      setRun(false);
    } else if (type === "step:after") {
      setStepIndex(index + 1);
    }
  };

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteProviders");
    const storedDates = localStorage.getItem("favoriteDates");

    if (storedFavorites) {
      const parsedFavorites = JSON.parse(storedFavorites);
      const sortedFavorites = parsedFavorites.sort(
        (a: ProviderAttributes, b: ProviderAttributes) => {
          const nameA = a.name?.toLowerCase() ?? "";
          const nameB = b.name?.toLowerCase() ?? "";
          return nameA.localeCompare(nameB);
        }
      );
      setFavoriteProviders(sortedFavorites);
    }

    if (storedDates) {
      setFavoriteDates(JSON.parse(storedDates));
    }
  }, []);

  const toggleFavorite = useCallback(
    (providerId: number, date?: string) => {
      // toggleFavorite called
      
      setFavoriteProviders((prevFavorites) => {
        // First try to find the provider in filtered providers, then in all providers
        const provider = filteredProviders.find((p) => p.id === providerId) || 
                        allProviders.find((p) => p.id === providerId);
        
        // Found provider
        
        if (!provider) {
          // Provider not found
          return prevFavorites;
        }

        const isFavorited = (prevFavorites ?? []).some((fav) => fav.id === providerId);
        // Current favorited state checked

        let newFavorites;
        if (isFavorited) {
          newFavorites = prevFavorites.filter((fav) => fav.id !== providerId);
          // Removing from favorites

          setFavoriteDates((prevDates) => {
            const { [providerId]: _, ...rest } = prevDates;
            localStorage.setItem("favoriteDates", JSON.stringify(rest));
            return rest;
          });
        } else {
          newFavorites = [...prevFavorites, provider];
          // Adding to favorites

          const currentDate = date || new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit",
          });
          setFavoriteDates((prevDates) => {
            const newDates = { ...prevDates, [providerId]: currentDate };
            localStorage.setItem("favoriteDates", JSON.stringify(newDates));
            return newDates;
          });
        }

        const sortedFavorites = newFavorites.sort((a, b) => {
          const nameA = a.name?.toLowerCase() ?? "";
          const nameB = b.name?.toLowerCase() ?? "";
          return nameA.localeCompare(nameB);
        });

        localStorage.setItem(
          "favoriteProviders",
          JSON.stringify(sortedFavorites)
        );

        // New favorites count updated
        return sortedFavorites;
      });
    },
    [allProviders, filteredProviders]
  );

  useEffect(() => {
    const getProviders = async () => {
      // Add a fallback timeout to ensure loading state is reset
      const loadingTimeout = setTimeout(() => {
        console.log('⏰ Loading timeout - forcing loading to false');
        setIsLoading(false);
        setApiStatus('error');
        setShowError("Request timed out. The server may be experiencing issues.");
      }, 15000); // 15 second timeout
      
      try {
        console.log('🔄 Starting to fetch providers...');
        setIsLoading(true);
        setApiStatus('loading');
        setShowError("");
        setLastFetchAttempt(new Date());
        
        // Add a more aggressive timeout for the fetch request itself
        const fetchTimeout = setTimeout(() => {
          console.log('⏰ Fetch timeout - API request taking too long');
          setApiStatus('error');
          setShowError("API request is taking too long. The server may be experiencing issues.");
          setIsLoading(false);
        }, 10000); // 10 second timeout for fetch
        
        let providers;
        try {
          providers = await fetchPublicProviders();
          clearTimeout(fetchTimeout); // Clear timeout if successful
        } catch (fetchError) {
          clearTimeout(fetchTimeout);
          console.log('❌ fetchPublicProviders threw error:', fetchError);
          throw fetchError; // Re-throw to be caught by outer catch
        }
        
        console.log('📡 API response received:', providers);
        
        // Add null check for providers.data
        if (!providers || !providers.data || !Array.isArray(providers.data)) {
          console.warn('⚠️ Invalid providers data structure:', providers);
          setAllProviders([]);
          setFilteredProviders([]);
          setApiStatus('error');
          setShowError("Invalid data received from server. Please try again later.");
          clearTimeout(loadingTimeout);
          setIsLoading(false);
          return;
        }
        
        // Check if we actually got any providers
        if (providers.data.length === 0) {
          console.warn('⚠️ No providers returned from API');
          setAllProviders([]);
          setFilteredProviders([]);
          setApiStatus('error');
          setShowError("We are experiencing issues on our end. Please try again later.");
          clearTimeout(loadingTimeout);
          setIsLoading(false);
          return;
        }
        
        console.log(`✅ Mapping ${providers.data.length} providers...`);
        const mappedProviders = providers.data.map((p: ProviderData) => ({
          id: p.attributes.id,
          name: p.attributes.name,
          locations: p.attributes.locations,
          insurance: p.attributes.insurance,
          counties_served: p.attributes.counties_served,
          password: p.attributes.password,
          username: p.attributes.username,
          website: p.attributes.website,
          email: p.attributes.email,
          cost: p.attributes.cost,
          min_age: p.attributes.min_age,
          max_age: p.attributes.max_age,
          waitlist: p.attributes.waitlist,
          telehealth_services: p.attributes.telehealth_services,
          spanish_speakers: p.attributes.spanish_speakers,
          at_home_services: p.attributes.at_home_services,
          in_clinic_services: p.attributes.in_clinic_services,
          logo: p.attributes.logo,
          // Missing required properties
          states: p.states || [],
          provider_type: p.attributes.provider_type || [],
          updated_last: p.attributes.updated_last,
          status: p.attributes.status,
          // New fields from API update
          in_home_only: p.attributes.in_home_only || false,
          service_delivery: p.attributes.service_delivery || {
            in_home: false,
            in_clinic: false,
            telehealth: false
          }
        }));
        
        console.log('📝 Mapped providers:', mappedProviders);
        setAllProviders(mappedProviders);
        setFilteredProviders(mappedProviders);
        setApiStatus('success');
        setRetryCount(0);
      } catch (error) {
        console.error('❌ Error fetching providers:', error);
        setApiStatus('error');
        setRetryCount(prev => prev + 1);
        
        // Provide more specific error messages based on error type
        if (error instanceof Error) {
          if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            setShowError("Network error - unable to connect to our servers. Please check your internet connection and try again.");
          } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
            setShowError("Request timed out. Our servers may be experiencing high traffic. Please try again in a few minutes.");
          } else if (error.message.includes('HTTP error')) {
            setShowError("Server error - our servers are experiencing issues. Please try again later.");
          } else {
            setShowError(`Failed to load providers: ${error.message}. Please try again later.`);
          }
        } else {
          setShowError("Failed to load providers. Our servers may be experiencing issues. Please try again later.");
        }
        
        setAllProviders([]);
        setFilteredProviders([]);
        setIsLoading(false);
      } finally {
        console.log('🏁 Setting loading to false');
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };
    
    // Capture the ref value to avoid cleanup warning
    const currentErrorTimeout = errorTimeoutRef.current;
    
    getProviders();
    return () => {
      if (currentErrorTimeout) {
        clearTimeout(currentErrorTimeout);
      }
    };
  }, []);

  // Add retry function
  const handleRetryFetch = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    setShowError("");
    setApiStatus('loading');
    setIsLoading(true);
    
    try {
      const providers = await fetchPublicProviders();
      
      if (!providers || !providers.data || !Array.isArray(providers.data)) {
        throw new Error('Invalid data received from server');
      }
      
      const mappedProviders = providers.data.map((p: ProviderData) => ({
        id: p.attributes.id,
        name: p.attributes.name,
        locations: p.attributes.locations,
        insurance: p.attributes.insurance,
        counties_served: p.attributes.counties_served,
        password: p.attributes.password,
        username: p.attributes.username,
        website: p.attributes.website,
        email: p.attributes.email,
        cost: p.attributes.cost,
        min_age: p.attributes.min_age,
        max_age: p.attributes.max_age,
        waitlist: p.attributes.waitlist,
        telehealth_services: p.attributes.telehealth_services,
        spanish_speakers: p.attributes.spanish_speakers,
        at_home_services: p.attributes.at_home_services,
        in_clinic_services: p.attributes.in_clinic_services,
        logo: p.attributes.logo,
        states: p.states || [],
        provider_type: p.attributes.provider_type || [],
        updated_last: p.attributes.updated_last,
        status: p.attributes.status,
        in_home_only: p.attributes.in_home_only || false,
        service_delivery: p.attributes.service_delivery || {
          in_home: false,
          in_clinic: false,
          telehealth: false
        }
      }));
      
      setAllProviders(mappedProviders);
      setFilteredProviders(mappedProviders);
      setApiStatus('success');
      setRetryCount(0);
    } catch (error) {
      console.error('❌ Retry failed:', error);
      setApiStatus('error');
      setShowError("Retry failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async (searchParams: any) => {
    console.log('🔍 handleSearch called with params:', searchParams);
    setIsLoading(true);
    setShowResultMessage(false); // Hide result message immediately when search starts
    setIsSearchRefined(false); // Reset search refined state until we have results
    setShowSearchNotification(false); // Reset search notification
    setShowError(""); // Clear any previous errors
    
    try {
      const { stateId, providerType, query, county_name, insurance, spanish, service, waitlist, age, hasReviews } = searchParams;
      console.log('🔍 Calling API with stateId:', stateId, 'providerType:', providerType);
      
      let results;
      try {
        results = await fetchProvidersByStateIdAndProviderType(stateId, providerType);
        console.log('🔍 API results received:', results);
      } catch (apiError) {
        console.error('❌ API call failed:', apiError);
        setShowError("Unable to search providers at this time. Please check your connection and try again.");
        setIsLoading(false);
        return;
      }
      
      // Add null check for results.data
      console.log('🔍 Checking results structure:', {
        hasResults: !!results,
        hasData: !!results?.data,
        isArray: Array.isArray(results?.data),
        dataLength: results?.data?.length
      });
      
      if (!results || !results.data || !Array.isArray(results.data)) {
        console.warn('⚠️ Invalid results structure, setting empty providers');
        setFilteredProviders([]);
        setCurrentPage(1);
        setIsLoading(false);
        setShowError("Search completed but no valid results were returned. Please try again.");
        return;
      }
      
      // Map API response to ProviderAttributes
      const mappedProviders = results.data.map((p: any) => ({
        id: p.attributes.id || p.id, // Use attributes.id if available, fallback to p.id
        ...p.attributes,
        states: p.states || [],
        provider_type: p.attributes.provider_type || [],
        updated_last: p.attributes.updated_last,
        status: p.attributes.status,
        in_home_only: p.attributes.in_home_only || false,
        service_delivery: p.attributes.service_delivery || { in_home: false, in_clinic: false, telehealth: false }
      }));

      // Apply comprehensive filtering
      let filteredResults = mappedProviders;
      
      // State filter - ensure providers actually serve the selected state
      if (stateId && stateId !== 'none' && stateId.trim() !== '') {
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => {
          // Check if provider has states array and serves the selected state
          if (provider.states && Array.isArray(provider.states)) {
            return provider.states.some(state => 
              state.toLowerCase() === stateId.toLowerCase()
            );
          }
          // Fallback: check locations for state
          if (provider.locations && Array.isArray(provider.locations)) {
            return provider.locations.some(location => 
              location.state && location.state.toLowerCase() === stateId.toLowerCase()
            );
          }
          return false; // If no state info, exclude the provider
        });
      }
      
      // Name filter
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
          provider.name && provider.name.toLowerCase().includes(searchTerm)
        );
      }

      // County filter
      if (county_name && county_name.trim()) {
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
          provider.counties_served && provider.counties_served.some(county => 
            county.county_name && county.county_name.toLowerCase().includes(county_name.toLowerCase())
          )
        );
      }

      // Insurance filter
      if (insurance && insurance.trim()) {
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
          provider.insurance && provider.insurance.some(ins => 
            ins.name && ins.name.toLowerCase().includes(insurance.toLowerCase())
          )
        );
      }

      // Spanish speakers filter
      if (spanish && spanish.toLowerCase() === 'yes') {
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
          provider.spanish_speakers && provider.spanish_speakers.toLowerCase().includes('yes')
        );
      }

      // Service filter
      if (service && service.trim()) {
        switch (service) {
          case "in_home_only":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => provider.in_home_only === true);
            break;
          case "telehealth":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              provider.telehealth_services && provider.telehealth_services.toLowerCase().includes('yes')
            );
            break;
          case "at_home":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              provider.at_home_services && provider.at_home_services.toLowerCase().includes('yes')
            );
            break;
          case "in_clinic":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              provider.in_clinic_services && provider.in_clinic_services.toLowerCase().includes('yes')
            );
            break;
        }
      }

      // Waitlist filter
      if (waitlist && waitlist.trim()) {
        switch (waitlist) {
          case "in_home_available":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              provider.at_home_services && provider.at_home_services.toLowerCase().includes('yes')
            );
            break;
          case "in_clinic_available":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              provider.in_clinic_services && provider.in_clinic_services.toLowerCase().includes('yes')
            );
            break;
          case "both_available":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              provider.at_home_services && provider.at_home_services.toLowerCase().includes('yes') &&
              provider.in_clinic_services && provider.in_clinic_services.toLowerCase().includes('yes')
            );
            break;
          case "both_waitlist":
            filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
              (provider.at_home_services && provider.at_home_services.toLowerCase().includes('no')) ||
              (provider.in_clinic_services && provider.in_clinic_services.toLowerCase().includes('no'))
            );
            break;
        }
      }

      // Age filter
      if (age && age.trim()) {
        const [minAge, maxAge] = age.split('-').map((ageStr: string) => parseInt(ageStr, 10));
        
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => {
          const providerMinAge = provider.min_age ? parseInt(provider.min_age.toString(), 10) : 0;
          const providerMaxAge = provider.max_age ? parseInt(provider.max_age.toString(), 10) : 99;
          
          // Check if the provider's age range overlaps with the selected age range
          return providerMinAge <= maxAge && providerMaxAge >= minAge;
        });
      }

      // Provider Type filter (frontend backup to API filtering)
      if (providerType && providerType !== 'none' && providerType.trim() !== '') {
        filteredResults = filteredResults.filter((provider: ProviderAttributes) => 
          provider.provider_type && provider.provider_type.some(type => 
            type.name === providerType
          )
        );
      }

      // Log filtering results for debugging
      console.log('🔍 Search filtering results:', {
        originalCount: mappedProviders.length,
        afterStateFilter: stateId && stateId !== 'none' ? filteredResults.length : 'N/A',
        afterNameFilter: query && query.trim() ? 'Applied' : 'N/A',
        afterCountyFilter: county_name && county_name.trim() ? 'Applied' : 'N/A',
        afterInsuranceFilter: insurance && insurance.trim() ? 'Applied' : 'N/A',
        afterProviderTypeFilter: providerType && providerType !== 'none' ? 'Applied' : 'N/A',
        finalCount: filteredResults.length,
        selectedState: stateId,
        selectedProviderType: providerType,
        selectedInsurance: insurance
      });

      // Reviews filter
      if (hasReviews && hasReviews.trim()) {
        switch (hasReviews) {
          case "has_reviews":
            // This would need to be implemented with Google Places API
            // For now, we'll skip this filter as it requires async checking
            break;
          case "no_reviews":
            // This would need to be implemented with Google Places API
            // For now, we'll skip this filter as it requires async checking
            break;
        }
      }

      if (isMountedRef.current) {
              // Removed excessive logging for performance
        setFilteredProviders(filteredResults);
        setShowError(""); // Clear error if providers found
        setIsLoading(false);
        
        // Set isSearchRefined to true only after we have processed the results
        if (isMountedRef.current) {
          // Small delay to ensure UI has updated before setting isSearchRefined
          setTimeout(() => {
            if (isMountedRef.current) {
              setIsSearchRefined(true);
              
              // If we have results, delay the result message and search notification
              if (filteredResults.length > 0) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    setShowResultMessage(true);
                    setShowSearchNotification(true);
                  }
                }, 800);
              } else {
                // If no results, show search notification immediately
                setShowSearchNotification(true);
              }
            }
          }, 50); // Small delay to ensure UI update
        }
      }
      
    } catch (err) {
      // Error handled, setting loading to false
      if (isMountedRef.current) {
        console.error('❌ Search error:', err);
        setShowError('An unexpected error occurred during search. Please try again.');
        setIsLoading(false);
      }
    }
  };

  // useEffect(() => {
  //   handleSearch({
  //     query: "",
  //     county_name: "",
  //     insurance: "",
  //     spanish: "",
  //     service: "",
  //     waitlist: "",
  //     age: "",
  //     providerType: "",
  //   });
  // }, [handleSearch]);

  const handleProviderCardClick = (provider: ProviderAttributes) => {
    setSelectedProvider(provider);

    const address =
      provider.locations.length > 0
        ? `${provider.locations[0].address_1 || ""} ${provider.locations[0].address_2 || ""
          }, ${provider.locations[0].city || ""}, ${provider.locations[0].state || ""
          } ${provider.locations[0].zip || ""}`.trim()
        : "Address not available";

    setMapAddress(address);
    setSelectedAddress(address);
  };

  const handleViewOnMapClick = (address: string) => {
    setMapAddress(address);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCloseModal = () => {
    // Implementation removed as it's unused
  };

  const handleResetSearch = () => {
    setFilteredProviders(allProviders);
    setSelectedCounty("");
    setSelectedInsurance("");
    setSelectedSpanish("");
    setSelectedService("");
    setSelectedWaitList("");
    setSelectedAge("");
    setSelectedProviderType("none");
    setIsFiltered(false);
    setMapAddress("none");
    setCurrentPage(1);
    setShowError("");
    setIsSearchRefined(false);
    setShowResultMessage(false);
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
  };

  const handleInsuranceChange = (insurance: string) => {
    setSelectedInsurance(insurance);
  };

  const handleSpanishChange = (spanish: string) => {
    setSelectedSpanish(spanish);
  };

  const handleServiceChange = (service: string) => {
    setSelectedService(service);
  };

  const handleWaitListChange = (waitlist: string) => {
    setSelectedWaitList(waitlist);
  };

  const handleProviderTypeChange = (type: string) => {
    setSelectedProviderType(type);
  };

    // Removed automatic advanced filtering - users must click search button to see results

  const handleResults = (results: { data: ProviderData[] }) => {
    // Add null check for results.data
    if (!results || !results.data || !Array.isArray(results.data)) {
      console.error('Invalid results format:', results);
      setFilteredProviders([]);
      return;
    }
    
    const mappedResults = results.data.map((p: ProviderData) => ({
      id: p.attributes.id,
      name: p.attributes.name,
      locations: p.attributes.locations,
      insurance: p.attributes.insurance,
      counties_served: p.attributes.counties_served,
      password: p.attributes.password,
      username: p.attributes.username,
      website: p.attributes.website,
      email: p.attributes.email,
      cost: p.attributes.cost,
      min_age: p.attributes.min_age,
      max_age: p.attributes.max_age,
      waitlist: p.attributes.waitlist,
      telehealth_services: p.attributes.telehealth_services,
      spanish_speakers: p.attributes.spanish_speakers,
      at_home_services: p.attributes.at_home_services,
      in_clinic_services: p.attributes.in_clinic_services,
      logo: p.attributes.logo,
      // Missing required properties - map from top level or set defaults
      states: p.states || ['Utah'], // Default to Utah if no states provided
      provider_type: p.attributes.provider_type || [],
      updated_last: p.attributes.updated_last,
      status: p.attributes.status,
      // New fields from API update
      in_home_only: p.attributes.in_home_only || false,
      service_delivery: p.attributes.service_delivery || {
        in_home: false,
        in_clinic: false,
        telehealth: false
      }
    }));

    const filteredResults = mappedResults.filter(
      (provider) => {
        // Service filtering using new service_delivery structure
        if (selectedService) {
          switch (selectedService) {
            case "in_home_only":
              return provider.in_home_only === true;
            case "telehealth":
              return provider.service_delivery?.telehealth === true;
            case "at_home":
              return provider.service_delivery?.in_home === true;
            case "in_clinic":
              return provider.service_delivery?.in_clinic === true;
            default:
              return true;
          }
        }

        // Waitlist filtering
        if (selectedWaitList) {
          switch (selectedWaitList) {
            case "6 Months or Less":
              return provider.waitlist && parseInt(provider.waitlist, 10) <= 6;
            case "no":
              return provider.waitlist?.toLowerCase() === "no";
            default:
              return true;
          }
        }

        return true;
      }
    );

    const sortedFilteredResults = filteredResults.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    if (isMountedRef.current) setFilteredProviders(sortedFilteredResults as ProviderAttributes[]);
    setCurrentPage(1);
  };

  const filteredWithService = (filteredProviders || []).filter((provider) => {
    switch (selectedService) {
      case "in_home_only":
        return provider.in_home_only === true;
      case "telehealth":
        return provider.service_delivery?.telehealth === true;
      case "at_home":
        return provider.service_delivery?.in_home === true;
      case "in_clinic":
        return provider.service_delivery?.in_clinic === true;
      default:
        return true;
    }
  });

  const filteredWithoutService = (filteredProviders || []).filter((provider) => {
    switch (selectedService) {
      case "telehealth":
        return provider.service_delivery?.telehealth === false;
      case "at_home":
        return provider.service_delivery?.in_home === false;
      case "in_clinic":
        return provider.service_delivery?.in_clinic === false;
      default:
        return false;
    }
  });

  // Combine all filtered providers without location filtering
  const combinedProviders = [...filteredWithService, ...filteredWithoutService];

  // Then do pagination on the filtered list
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const paginatedProviders = combinedProviders.slice(
    indexOfFirstProvider,
    indexOfLastProvider
  );

  const totalPages = Math.ceil(combinedProviders.length / providersPerPage);

  // Debug pagination removed for performance

  const handleNextPage = () => {
    if (currentPage < totalPages && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage - 1);
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber !== currentPage && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(pageNumber);
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const handleAgeChange = (age: string) => {
    setSelectedAge(age);
  };

  const handleReviewsChange = (hasReviews: string) => {
    setSelectedHasReviews(hasReviews);
  };

  // Function to check if a provider has Google reviews
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkProviderHasReviews = async (provider: ProviderAttributes): Promise<boolean> => {
    try {
      const googleApiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
      if (!googleApiKey) return false;

      const { GooglePlacesAPI } = await import('../Utility/GooglePlacesAPI');
      const googlePlaces = new GooglePlacesAPI(googleApiKey);
      
      const primaryLocation = provider.locations[0];
      const address = primaryLocation ? `${primaryLocation.address_1 || ''} ${primaryLocation.city || ''} ${primaryLocation.state || ''}` : '';
      
      const result = await googlePlaces.searchAndGetReviews(
        provider.name || '', 
        address, 
        provider.website || undefined
      );
      
      return result.placeDetails !== null && result.reviews.length > 0;
    } catch (error) {
      
      return false;
    }
  };

  // Function to filter providers based on reviews
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterProvidersByReviews = async (providers: ProviderAttributes[]): Promise<ProviderAttributes[]> => {
    // Implementation removed as it's unused
    return providers;
  };

  const renderViewOnMapButton = (provider: ProviderAttributes) => {
    const isAddressAvailable =
      provider.locations.length > 0 && provider.locations[0]?.address_1;

    return (
      <button
        className={`view-on-map-button ${!isAddressAvailable ? "disabled" : ""
          }`}
        onClick={() => {
          const location = provider.locations[0];
          const fullAddress = `${location.address_1 || ""} ${location.address_2 || ""
            }, ${location.city || ""}, ${location.state || ""} ${location.zip || ""
            }`.trim();
          handleViewOnMapClick(fullAddress);
        }}
        disabled={!isAddressAvailable}
      >
        View on Map
      </button>
    );
  };

  useEffect(() => {
    const getInsuranceOptions = async () => {
      try {
        const insuranceData = await fetchInsurance();
        setInsuranceOptions(insuranceData);
      } catch (error) {

      }
    };
    getInsuranceOptions();
  }, []);



  // Removed toast notification for better user experience

  return (
    <div className="providers-page">
      <SEO
        title="Find Your Provider - Pediatric Therapy Services"
        description="Discover pediatric therapy services across the United States. Find providers specializing in speech therapy, occupational therapy, and physical therapy for children."
        keywords="pediatric therapy, speech therapy, occupational therapy, physical therapy, children's therapy, therapy providers, therapy services"
      />
      <section className="find-your-provider-section">
        <Joyride
          run={run}
          steps={steps}
          stepIndex={stepIndex}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          callback={handleJoyrideCallback}
          disableOverlayClose={true}
          disableCloseOnEsc={true}
          spotlightClicks={true}
        />
        <img
          src={childrenBanner}
          alt="Find Your Provider"
          className="banner-image"
        />
        <h1 className="providers-banner-title">Find Your Provider</h1>
      </section>
      
      <main>
        <div className="provider-page-search-cards-section">
          <SearchBar
            providers={filteredProviders}
            totalProviders={allProviders.length}
            onResults={handleResults}
            onSearch={handleSearch}
            onCountyChange={handleCountyChange}
            onInsuranceChange={handleInsuranceChange}
            insuranceOptions={insuranceOptions}
            onSpanishChange={handleSpanishChange}
            onServiceChange={handleServiceChange}
            onWaitListChange={handleWaitListChange}
            onAgeChange={handleAgeChange}
            onReviewsChange={handleReviewsChange}
            onProviderTypeChange={handleProviderTypeChange}
            onReset={handleResetSearch}
            showSearchNotification={showSearchNotification}
          />
          <section className="glass">
            <section className="searched-provider-map-locations-list-section">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <img
                      src={gearImage}
                      alt="Loading..."
                      className="loading-gear w-16 h-16 mx-auto mb-4"
                    />
                    <p className="text-lg text-gray-600">Loading providers...</p>
                  </div>
                </div>
              ) : showError ? (
                <div className="error-message-container">
                  <div className="max-w-2xl mx-auto text-center py-12 px-4">
                    <div className="mb-6">
                      {apiStatus === 'error' ? (
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                      ) : (
                        <WifiOff className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                      {apiStatus === 'error' ? 'Unable to Load Providers' : 'Connection Issue'}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      {showError}
                    </p>
                    
                    {/* Retry Button */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        onClick={handleRetryFetch}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Try Again
                      </button>
                      
                      {/* Show retry count if multiple attempts */}
                      {retryCount > 0 && (
                        <div className="text-sm text-gray-500">
                          Attempt {retryCount + 1}
                        </div>
                      )}
                    </div>

                    {/* Additional Help */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                      <h4 className="font-medium text-blue-800 mb-2">💡 What you can do:</h4>
                      <ul className="text-sm text-blue-700 space-y-1 text-left">
                        <li>Check your internet connection</li>
                        <li>Try refreshing the page</li>
                        <li>Wait a few minutes and try again</li>
                        <li>Contact support if the issue persists</li>
                      </ul>
                    </div>

                    {/* Last attempt info */}
                    {lastFetchAttempt && (
                      <div className="mt-4 text-xs text-gray-400">
                        Last attempt: {lastFetchAttempt.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card-container">
                  {/* Fallback error display - show when no providers and no explicit error */}
                  {!isLoading && !showError && allProviders.length === 0 && (
                    <div className="error-message-container">
                      <div className="max-w-2xl mx-auto text-center py-12 px-4">
                        <div className="mb-6">
                          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                          No Providers Available
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          Unable to load provider information. This could be due to:
                        </p>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                          <ul className="text-sm text-red-700 space-y-1 text-left">
                            <li>Server maintenance or downtime</li>
                            <li>Network connectivity issues</li>
                            <li>Database connection problems</li>
                            <li>API service interruptions</li>
                          </ul>
                        </div>
                        
                        {/* Retry Button */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <button
                            onClick={handleRetryFetch}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Try Again
                          </button>
                        </div>

                        {/* Additional Help */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                          <h4 className="font-medium text-blue-800 mb-2">💡 What you can do:</h4>
                          <ul className="text-sm text-blue-700 space-y-1 text-left">
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page</li>
                            <li>Wait a few minutes and try again</li>
                            <li>Contact support if the issue persists</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Only show the "all providers" message when we actually have providers and no search is active */}
                  {!isSearchRefined && allProviders.length > 0 && (
                    <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center mb-3">
                        <Wifi className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-semibold text-lg">Welcome to Our Provider Network! 🎉</span>
                      </div>
                      <p className="text-blue-700 text-sm mb-3">
                        We're excited to show you {allProviders.length} amazing providers from our growing network. 
                        Use the search filters above to find providers in specific states or with particular services.
                      </p>
                      
                      {/* Enhanced Provider Registration Call-to-Action */}
                      <div className="bg-white border border-green-200 rounded-lg p-4 mt-3">
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-green-600 font-semibold text-sm">🌟 Join Our Growing Network - It's FREE!</span>
                        </div>
                        <p className="text-green-700 text-xs leading-relaxed mb-3">
                          We're building the largest network of providers serving the Autism Community in the country, and we'd love you to be part of it!
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="text-left">
                            <h5 className="font-medium text-green-800 text-xs mb-2">For Healthcare Providers:</h5>
                            <ul className="text-xs text-green-700 space-y-1">
                              <li>Register your practice in minutes - completely FREE</li>
                              <li>Get discovered by families in the Autism Community</li>
                              <li>Manage insurance and location information easily</li>
                              <li>Join {allProviders.length}+ providers already helping families</li>
                            </ul>
                          </div>
                          <div className="text-left">
                            <h5 className="font-medium text-green-800 text-xs mb-2">What You Get:</h5>
                            <ul className="text-xs text-green-700 space-y-1">
                              <li>Professional online presence</li>
                              <li>Increased visibility in your area</li>
                              <li>Easy profile management</li>
                              <li>Community support and resources</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                          <a 
                            href="/provider-signup" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                          >
                            🚀 Join Now - It's Free!
                          </a>
                          <span className="text-xs text-green-600 font-medium">
                            Know a great provider? Share this with them! 👥
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* No Results Message */}
                  {isSearchRefined && combinedProviders.length === 0 && !isLoading && (
                    <div className="text-center py-12 px-4">
                      <div className="max-w-md mx-auto">
                        <div className="mb-6">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No providers found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          We couldn't find any {selectedProviderType} providers matching your current search criteria.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-blue-800 mb-2">💡 Try these suggestions:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>Expand your search area by selecting a different state</li>
                            <li>Try a different provider type</li>
                            <li>Remove some advanced filters to see more results</li>
                            <li>Check back periodically as new providers are added regularly</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">📞 Need immediate help?</h4>
                          <p className="text-sm text-yellow-700">
                            Contact our support team for personalized assistance in finding the right provider for your needs.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show providers only when we have them and no errors */}
                  {allProviders.length > 0 && !showError && (
                    <>
                      <div
                        className={`provider-cards-grid ${pageTransition ? `page-${pageTransition}` : ""
                          }`}
                      >
                        {paginatedProviders.map((provider) => (
                          <div
                            key={provider.id}
                            className={`provider-card-wrapper ${pageTransition ? `animate-${pageTransition}` : ""
                              }`}
                          >
                            <ProviderCard
                              provider={provider}
                              onViewDetails={handleProviderCardClick}
                              renderViewOnMapButton={renderViewOnMapButton}
                              onToggleFavorite={toggleFavorite}
                              isFavorited={(favoriteProviders ?? []).some(
                                (fav) => fav.id === provider.id
                              )}
                              favoritedDate={favoriteDates[provider.id]}
                              selectedState={selectedStateId === 'none' ? '' : selectedStateId || ''}
                              hasReviews={providersWithReviews.has(provider.id)}
                            />
                          </div>
                        ))}
                      </div>
                      {combinedProviders.length > 0 && (
                        <div className="pagination-section">
                          <p className="pagination-info">
                            Page {currentPage} of {totalPages}
                          </p>
                          <div className="pagination-controls">
                            {currentPage > 1 && (
                              <button
                                className="pagination-button"
                                onClick={handlePreviousPage}
                              >
                                &lt; Previous
                              </button>
                            )}
                            
                            {/* Page Numbers */}
                            <div className="page-numbers">
                              {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                const isCurrentPage = pageNumber === currentPage;
                                
                                // Show first page, last page, current page, and pages around current page
                                if (
                                  pageNumber === 1 ||
                                  pageNumber === totalPages ||
                                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                ) {
                                  return (
                                    <button
                                      key={pageNumber}
                                      className={`page-number-button ${isCurrentPage ? 'current-page' : ''}`}
                                      onClick={() => handlePageClick(pageNumber)}
                                      disabled={isCurrentPage}
                                    >
                                      {pageNumber}
                                    </button>
                                  );
                                } else if (
                                  pageNumber === currentPage - 3 ||
                                  pageNumber === currentPage + 3
                                ) {
                                  return <span key={pageNumber} className="page-ellipsis">...</span>;
                                }
                                return null;
                              })}
                            </div>
                            
                            {currentPage < totalPages && (
                              <button
                                className="pagination-button"
                                onClick={handleNextPage}
                              >
                                Next &gt;
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              </section>
            </section>
          </div>
        {selectedProvider && (
          <ProviderModal
            provider={{
              id: selectedProvider.id,
              type: "provider",
              states: selectedProvider.states,
              attributes: selectedProvider
            }}
            address={selectedAddress || "Address not available"}
            mapAddress={mapAddress}
            onClose={() => setSelectedProvider(null)}
            onViewOnMapClick={handleViewOnMapClick}
            selectedState={selectedStateId}
            availableCounties={[]} // Counties are no longer fetched here
          />
        )}
      </main>
    </div>
  );
};

export default ProvidersPage;