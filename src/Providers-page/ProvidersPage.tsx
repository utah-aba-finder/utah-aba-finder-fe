import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ProvidersPage.css";
import childrenBanner from "../Assets/children-banner-2.jpg";
import ProviderModal from "./ProviderModal";
import SearchBar from "./SearchBar";
import ProviderCard from "./ProviderCard";
import { Providers, ProviderAttributes, InsuranceData, Insurance, CountiesServed as County, ProviderType as ProviderTypeInterface, ProviderData, CountyData, Location } from "../Utility/Types";
import gearImage from "../Assets/Gear@1x-0.5s-200px-200px.svg";
import Joyride, { Step, STATUS } from "react-joyride";
import { fetchProviders, fetchProvidersByStateIdAndProviderType, fetchInsurance, fetchCountiesByState } from "../Utility/ApiCall";
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

  useEffect(() => {
    const hasVisited = localStorage.getItem("providersPageVisited");
    if (!hasVisited) {
      setRun(true);
    }
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
    (providerId: number) => {
      setFavoriteProviders((prevFavorites) => {
        const provider = allProviders.find((p) => p.id === providerId);
        if (!provider) return prevFavorites;

        const isFavorited = prevFavorites.some((fav) => fav.id === providerId);

        let newFavorites;
        if (isFavorited) {
          newFavorites = prevFavorites.filter((fav) => fav.id !== providerId);

          setFavoriteDates((prevDates) => {
            const { [providerId]: _, ...rest } = prevDates;
            localStorage.setItem("favoriteDates", JSON.stringify(rest));
            return rest;
          });
        } else {
          newFavorites = [...prevFavorites, provider];

          const currentDate = new Date().toLocaleDateString("en-US", {
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

        return sortedFavorites;
      });
    },
    [allProviders]
  );

  useEffect(() => {
    const getProviders = async () => {
      try {
        setShowError("");
        setIsLoading(true);
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        const providersList: Providers = await fetchProviders();
        const mappedProviders = providersList.data.map((provider: ProviderData) => ({
          ...provider.attributes,
          id: provider.id,
        }));

        const sortedProviders = mappedProviders.sort((a, b) => {
          const nameA = a.name ?? "";
          const nameB = b.name ?? "";
          return nameA.localeCompare(nameB);
        });
        setAllProviders(sortedProviders);
        setFilteredProviders(sortedProviders);

        setMapAddress("Utah");
        setIsLoading(false);
        if (sortedProviders.length === 0) {
          errorTimeoutRef.current = setTimeout(() => {
            setShowError(
              "We are currently experiencing issues displaying Providers. Please try again later."
            );
          }, 5000);
        }
      } catch (error) {
        console.error("Error loading providers:", error);
        setIsLoading(false);
        errorTimeoutRef.current = setTimeout(() => {
          setShowError(
            "We are currently experiencing issues displaying Providers. Please try again later."
          );
        }, 5000);
      }
    };
    getProviders();
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback(
    async ({ 
      state, 
      stateId, 
      providerType,
      query,
      county_name,
      insurance,
      spanish,
      service,
      waitlist,
      age,
      hasReviews
    }: {
      state: string;
      stateId: string;
      providerType: string;
      query: string;
      county_name: string;
      insurance: string;
      spanish: string;
      service: string;
      waitlist: string;
      age: string;
      hasReviews: string;
    }) => {
      setSelectedStateAbbr(state);
      setIsSearchRefined(true);
      try {
        setIsLoading(true);
        setFilteredProviders([]); // Reset filtered providers before new search

        // If a state is selected, fetch its counties
        if (stateId !== 'none') {
          const countiesData = await fetchCountiesByState(parseInt(stateId));
          setCounties(countiesData);
        } else {
          setCounties([]);
        }

        // If both state and provider type are selected, use the specific API endpoint
        if (stateId !== 'none' && providerType !== 'none') {
          const response = await fetchProvidersByStateIdAndProviderType(stateId, providerType);
          const providersToFilter = response.data.map(provider => ({
            ...provider.attributes,
            id: provider.id,
          }));

          // Show message if no providers found
          if (providersToFilter.length === 0) {
            setShowError(`We currently don't have any ${providerType} providers for this state, please check back periodically! Also ensure you have selected a state and provider type to see results!`);
            setIsLoading(false);
            return;
          }

          // Filter providers based on location-specific services or provider type
          const filtered = providersToFilter
            .filter((provider: ProviderAttributes) => {
              // Check if provider has any physical locations
              const hasPhysicalLocations = provider.locations.some(location => 
                location.address_1 || location.city || location.state || location.zip
              );

              if (hasPhysicalLocations) {
                // For providers with physical locations, check if they offer the service in the selected state
                const hasServiceInState = provider.locations.some(location => {
                  const isInSelectedState = location.state?.toUpperCase() === state.toUpperCase();
                  const hasSelectedService = location.services?.some(service => 
                    service.name === providerType
                  );
                  return isInSelectedState && hasSelectedService;
                });

                if (!hasServiceInState) return false;
              } else {
                // For providers without physical locations, check if they offer the service type
                const hasProviderType = provider.provider_type.some(type => 
                  type.name === providerType
                );
                if (!hasProviderType) return false;
              }

              // Apply additional filters
              return (
                provider.name?.toLowerCase().includes(query.toLowerCase()) &&
                (!county_name ||
                  provider.counties_served.some((c: County) =>
                    c.county_name?.toLowerCase().includes(county_name.toLowerCase())
                  )) &&
                (!insurance ||
                  provider.insurance.some((i: Insurance) =>
                    i.name?.toLowerCase().includes(insurance.toLowerCase())
                  )) &&
                (spanish === "" ||
                  (spanish === "no" &&
                    (!provider.spanish_speakers ||
                      provider.spanish_speakers.toLowerCase() === "no")) ||
                  (spanish === "yes" &&
                    (provider.spanish_speakers?.toLowerCase() === "yes" ||
                      provider.spanish_speakers === null ||
                      provider.spanish_speakers.toLowerCase() === "limited"))) &&
                (!service ||
                  (service === "telehealth" &&
                    provider.telehealth_services?.toLowerCase() === "yes") ||
                  (service === "at_home" &&
                    provider.at_home_services?.toLowerCase() === "yes") ||
                  (service === "in_clinic" &&
                    provider.in_clinic_services?.toLowerCase() === "yes")) &&
                (!waitlist ||
                  (waitlist === "in_home_available" &&
                    provider.locations.some((loc) => loc.in_home_waitlist === false)) ||
                  (waitlist === "in_clinic_available" &&
                    provider.locations.some((loc) => loc.in_clinic_waitlist === false)) ||
                  (waitlist === "both_available" &&
                    provider.locations.some((loc) => loc.in_home_waitlist === false && loc.in_clinic_waitlist === false)) ||
                  (waitlist === "both_waitlist" &&
                    provider.locations.some((loc) => loc.in_home_waitlist === true && loc.in_clinic_waitlist === true))) &&
                (!age ||
                  (provider.min_age !== null &&
                    provider.max_age !== null &&
                    ((age === "0-2" &&
                      provider.min_age <= 0 &&
                      provider.max_age >= 2) ||
                      (age === "3-5" &&
                        provider.min_age <= 3 &&
                        provider.max_age >= 5) ||
                      (age === "5-7" &&
                        provider.min_age <= 5 &&
                        provider.max_age >= 7) ||
                      (age === "8-10" &&
                        provider.min_age <= 8 &&
                        provider.max_age >= 10) ||
                      (age === "11-13" &&
                        provider.min_age <= 11 &&
                        provider.max_age >= 13) ||
                      (age === "13-15" &&
                        provider.min_age <= 13 &&
                        provider.max_age >= 15) ||
                      (age === "16-18" &&
                        provider.min_age <= 16 &&
                        provider.max_age >= 18) ||
                      (age === "19+" &&
                        provider.max_age >= 19))))
              );
            })
            .sort((a: ProviderAttributes, b: ProviderAttributes) => {
              const nameA = a.name || "";
              const nameB = b.name || "";
              return nameA.localeCompare(nameB);
            });

          // Apply reviews filter if selected
          let finalFiltered = filtered;
          if (hasReviews) {
            setIsCheckingReviews(true);
            try {
              finalFiltered = await filterProvidersByReviews(filtered);
            } finally {
              setIsCheckingReviews(false);
            }
          }
          
          setFilteredProviders(finalFiltered);
          
          // Show message if no providers found after filtering
          if (finalFiltered.length === 0) {
            setShowError('No providers found matching your search criteria. Please try adjusting your filters.');
          } else {
            setShowError(''); // Clear error if providers found
          }
          
          setCurrentPage(1);
        } else if (stateId === 'none' || providerType === 'none') {
          setShowError('Please select both a state and provider type to begin your search.');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error during search:', error);
        setShowError('Error filtering providers. Please try again.');
        setIsLoading(false);
      }
    },
    []
  );

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

  const handleResults = (results: Providers) => {
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
    }));

    const filteredResults = mappedResults.filter(
      (provider) =>
        (!selectedService ||
          (selectedService === "telehealth" &&
            provider.telehealth_services?.toLowerCase() === "yes") ||
          (selectedService === "at_home" &&
            provider.at_home_services?.toLowerCase() === "yes") ||
          (selectedService === "in_clinic" &&
            provider.in_clinic_services?.toLowerCase() === "yes")) &&
        (!selectedWaitList ||
          (selectedWaitList === "6 Months or Less" &&
            (provider.waitlist
              ? parseInt(provider.waitlist, 10) <= 6
              : false)) ||
          (selectedWaitList === "no" &&
            provider.waitlist?.toLowerCase() === "no"))
    );

    const sortedFilteredResults = filteredResults.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    setFilteredProviders(sortedFilteredResults as ProviderAttributes[]);
    setCurrentPage(1);
  };

  const filteredWithService = filteredProviders.filter((provider) => {
    switch (selectedService) {
      case "telehealth":
        return provider.telehealth_services?.toLowerCase() === "yes";
      case "at_home":
        return provider.at_home_services?.toLowerCase() === "yes";
      case "in_clinic":
        return provider.in_clinic_services?.toLowerCase() === "yes";
      default:
        return true;
    }
  });

  const filteredWithoutService = filteredProviders.filter((provider) => {
    switch (selectedService) {
      case "telehealth":
        return provider.telehealth_services === null;
      case "at_home":
        return provider.at_home_services === null;
      case "in_clinic":
        return provider.in_clinic_services === null;
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
                  {selectedHasReviews && providersWithReviews.size > 0 && (
                    <div className="text-center mb-4">
                      <p className="text-green-600 font-semibold">
                        ⭐ {providersWithReviews.size} provider{providersWithReviews.size !== 1 ? 's' : ''} with Google reviews found
                      </p>
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
                          isFavorited={favoriteProviders.some(
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