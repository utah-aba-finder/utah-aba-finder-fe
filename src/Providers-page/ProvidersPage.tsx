import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ProvidersPage.css";
import childrenBanner from "../Assets/children-banner-2.jpg";
import ProviderModal from "./ProviderModal";
import SearchBar from "./SearchBar";
import ProviderCard from "./ProviderCard";
import { Providers, ProviderAttributes, InsuranceData, Insurance, CountiesServed as County, ProviderType as ProviderTypeInterface, ProviderData, CountyData, Location } from "../Utility/Types";
import gearImage from "../Assets/Gear@1x-0.5s-200px-200px.svg";
import Joyride, { Step, STATUS } from "react-joyride";
import { fetchProviders, fetchInsurance, fetchCountiesByState, testAPIHealth, fetchProvidersByStateIdAndProviderType } from "../Utility/ApiCall";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SEO from "../Utility/SEO";
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
  const [selectedStateAbbr, setSelectedStateAbbr] = useState<string | null>(null);
  const [selectedHasReviews, setSelectedHasReviews] = useState<string>("");
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [providersWithReviews, setProvidersWithReviews] = useState<Set<number>>(new Set());
  const [isCheckingReviews, setIsCheckingReviews] = useState(false);
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
      try {
        if (isMountedRef.current) setIsLoading(true);
        
        const providers = await fetchProviders();
        
        // Add null check for providers.data
        if (!providers || !providers.data || !Array.isArray(providers.data)) {
          console.warn('Invalid providers data received:', providers);
          setAllProviders([]);
          setFilteredProviders([]);
          return;
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
        
        setAllProviders(mappedProviders);
        setFilteredProviders(mappedProviders);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setShowError("Failed to load providers. Please try again later.");
        setAllProviders([]);
        setFilteredProviders([]);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };
    getProviders();
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async (searchParams: any) => {
    if (isMountedRef.current) setIsLoading(true);
    setShowResultMessage(false); // Hide result message immediately when search starts
    setIsSearchRefined(false); // Reset search refined state until we have results
    setShowSearchNotification(false); // Reset search notification
    try {
      const { stateId, providerType, query, county_name, insurance, spanish, service, waitlist, age, hasReviews } = searchParams;
      const results = await fetchProvidersByStateIdAndProviderType(stateId, providerType);
      
      // Add null check for results.data
      if (!results || !results.data || !Array.isArray(results.data)) {
        console.warn('Invalid results data received in handleSearch:', results);
        setFilteredProviders([]);
        setCurrentPage(1);
        if (isMountedRef.current) setIsLoading(false);
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
        setShowError('Error filtering providers. Please try again.');
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

  const handleCloseModal = () => {
    setSelectedProvider(null);
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

  const handleResults = (results: Providers) => {
    // Add null check for results.data
    if (!results || !results.data || !Array.isArray(results.data)) {
      console.warn('Invalid results data received:', results);
      setFilteredProviders([]);
      setCurrentPage(1);
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
      console.error('Error checking reviews for provider:', provider.name, error);
      return false;
    }
  };

  // Function to filter providers based on reviews
  const filterProvidersByReviews = async (providers: ProviderAttributes[]): Promise<ProviderAttributes[]> => {
    if (!selectedHasReviews) return providers;

    const reviewsMap = new Map<number, boolean>();
    
    // Check reviews for all providers in parallel
    const reviewChecks = providers.map(async (provider) => {
      const hasReviews = await checkProviderHasReviews(provider);
      reviewsMap.set(provider.id, hasReviews);
      return { provider, hasReviews };
    });

    await Promise.all(reviewChecks);

    // Update the providers with reviews set
    const providersWithReviewsSet = new Set<number>();
    reviewsMap.forEach((hasReviews, providerId) => {
      if (hasReviews) {
        providersWithReviewsSet.add(providerId);
      }
    });
    setProvidersWithReviews(providersWithReviewsSet);

    // Filter based on selection
    return providers.filter(provider => {
      const hasReviews = reviewsMap.get(provider.id) || false;
      if (selectedHasReviews === 'has_reviews') {
        return hasReviews;
      } else if (selectedHasReviews === 'no_reviews') {
        return !hasReviews;
      }
      return true;
    });
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

  const handleResetTutorial = () => {
    localStorage.removeItem("providersPageVisited");
    setRun(true);
    setStepIndex(0);
  };

  useEffect(() => {
    const getInsuranceOptions = async () => {
      try {
        const insuranceData = await fetchInsurance();
        setInsuranceOptions(insuranceData);
      } catch (error) {
        console.error('Error fetching insurance options:', error);
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
                <div className="error-message-container">{showError}</div>
              ) : isCheckingReviews ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <img
                      src={gearImage}
                      alt="Checking reviews..."
                      className="loading-gear w-16 h-16 mx-auto mb-4"
                    />
                    <p className="text-lg text-gray-600">Checking Google reviews...</p>
                  </div>
                </div>
              ) : (
                <div className="card-container">
                  {!isSearchRefined && (
                    <>
                      <p className="text-center text-red-500">Currently showing all providers within the United States.</p>
                      <p className="text-center text-red-500">If you are looking for a provider in a specific state, please use the search bar to filter by state and provider type.</p>
                    </>
                  )}
                  {selectedHasReviews && providersWithReviews.size > 0 && showResultMessage && (
                    <div className="text-center mb-4">
                      <p className="text-green-600 font-semibold">
                        ⭐ {providersWithReviews.size} provider{providersWithReviews.size !== 1 ? 's' : ''} with Google reviews found
                      </p>
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
                          selectedState={selectedStateAbbr === 'none' ? '' : selectedStateAbbr || ''}
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
            selectedState={selectedStateAbbr}
            availableCounties={counties}
          />
        )}
      </main>
    </div>
  );
};

export default ProvidersPage;