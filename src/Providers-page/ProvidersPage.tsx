import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ProvidersPage.css";
import childrenBanner from "../Assets/children-banner-2.jpg";
import ProviderModal from "./ProviderModal";
import SearchBar from "./SearchBar";
import ProviderCard from "./ProviderCard";
import { MockProviders, ProviderAttributes, InsuranceData, Insurance, CountiesServed as County, ProviderType as ProviderTypeInterface } from "../Utility/Types";
import gearImage from "../Assets/Gear@1x-0.5s-200px-200px.svg";
import Joyride, { Step, STATUS } from "react-joyride";
import { fetchProviders, fetchProvidersByStateIdAndProviderType } from "../Utility/ApiCall";

interface FavoriteDate {
  [providerId: number]: string;
}

// Add type interfaces for the filter functions
interface ProviderResponse {
  data: {
    id: number;
    attributes: ProviderAttributes;
  }[];
}

const ProvidersPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderAttributes | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderAttributes[]>([]);
  // const [providersByTypeandState, setProvidersByTypeAndState] = useState<any[]>([])
  const [filteredProviders, setFilteredProviders] = useState<
    ProviderAttributes[]
  >([]);
  const [preFilterExecuted, setPreFilterExecuted] = useState<boolean>(false)
  const [uniqueInsuranceOptions, setUniqueInsuranceOptions] = useState<
    InsuranceData[]
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
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showError, setShowError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [favoriteProviders, setFavoriteProviders] = useState<
    ProviderAttributes[]
  >([]);
  const [favoriteDates, setFavoriteDates] = useState<FavoriteDate>({});
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [selectedProviderType, setSelectedProviderType] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const providersPerPage = 8;
  const [pageTransition, setPageTransition] = useState<"next" | "prev" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps] = useState<Step[]>([
    {
      target: ".provider-type-select",
      content: "First select the type of provider you are looking for.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: ".provider-map-searchbar",
      content:
        "Use this search section to find providers by name, county, insurance, spanish speaking, services and waitlist status.",
      placement: "bottom",
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

  useEffect(() => {
    const hasVisited = localStorage.getItem("providersPageVisited");
    if (!hasVisited) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem("providersPageVisited", "true");
      setRun(false);
    } else if (type === "step:after" && index === 0) {
      // After first step, wait for provider type selection
      if (selectedProviderType && selectedProviderType !== 'none') {
        setStepIndex(index + 1);
      }
    } else if (action === "next" && type === "step:after") {
      setStepIndex(index + 1);
    } else if (action === "prev" && type === "step:after") {
      setStepIndex(index - 1);
    }
  };
  
  // Update Joyride when provider type is selected
  useEffect(() => {
    if (selectedProviderType && selectedProviderType !== 'none' && stepIndex === 0) {
      setStepIndex(1);
    }
  }, [selectedProviderType, stepIndex]);

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
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        const providersList: MockProviders = await fetchProviders();
        const mappedProviders = providersList.data.map((provider) => ({
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

        // const uniqueInsurances = Array.from(
        //   new Set(
        //     sortedProviders
        //       .flatMap((provider) =>
        //         provider.insurance.map((ins) => ins.name || "")
        //       )
        //       .sort() as string[]
        //   )
        // );
        // setUniqueInsuranceOptions(uniqueInsurances);
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
      query, 
      county_name, 
      insurance, 
      spanish, 
      service, 
      waitlist, 
      age, 
      providerType, 
      stateId 
    }: {
      query: string;
      county_name: string;
      insurance: string;
      spanish: string;
      service: string;
      waitlist: string;
      age: string;
      providerType: string;
      stateId: string;
    }) => {
      try {
        setIsLoading(true);
        setFilteredProviders([]); // Reset filtered providers before new search
        
        // If both state and provider type are selected, use the specific API endpoint
        if (stateId !== 'none' && providerType !== 'none') {
          const response = await fetchProvidersByStateIdAndProviderType(stateId, providerType);
          const providersToFilter = response.data.map(provider => ({
            ...provider.attributes,
            id: provider.id,
          }));
          
          // Show message if no providers found
          if (providersToFilter.length === 0) {
            setShowError(`We currently don't have any ${providerType} providers for this state please check back periodically!`);
            setIsLoading(false);
            return;
          }
          
          // Apply additional filters and sort the results
          const filtered = providersToFilter
            .filter((provider: ProviderAttributes) => 
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
                (waitlist === "6 Months or Less" &&
                  (provider.waitlist
                    ? parseInt(provider.waitlist, 10) <= 6
                    : false)) ||
                (waitlist === "no" &&
                  provider.waitlist?.toLowerCase() === "no")) &&
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
                    provider.max_age <= 16 &&
                    provider.min_age >= 18) ||
                  (age === "19+" &&
                    provider.max_age <= 19)))) &&
              (!providerType ||
                provider.provider_type.some((type: ProviderTypeInterface) => 
                  type.name.toLowerCase() === providerType.toLowerCase()
                ))
            )
            .sort((a: ProviderAttributes, b: ProviderAttributes) => {
              const nameA = a.name || "";
              const nameB = b.name || "";
              return nameA.localeCompare(nameB);
            });
          
          setFilteredProviders(filtered);
          setCurrentPage(1);
          setShowError(""); // Clear error if providers found
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error during search:', error);
        setShowError('Error filtering providers. Please try again.');
        setIsLoading(false);
      }
    },
    [allProviders]
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
    setSelectedProviderType("");
    setIsFiltered(false);
    setMapAddress("Utah");
    setCurrentPage(1);
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

  const handleResults = (results: MockProviders) => {
    const mappedResults = results.data.map((p) => ({
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
  const combinedProviders = [...filteredWithService, ...filteredWithoutService];
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
      }, 300);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleAgeChange = (age: string) => {
    setSelectedAge(age);
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

  return (
    <div className="providers-page">

      {/* 
      <button onClick={handleResetTutorial} className="reset-tutorial-button">
      Reset Tutorial
      </button> */}

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
      <div className="glass-container">
        {selectedStateId === '' && selectedProviderType === '' ? (
          <div className="glass-two">
            <h2 className="searched-provider-number-status-title">
              Please select a state and provider type to get started with your search
            </h2>
          </div>
        ) : null}
      </div>
      <main>
        <div className="provider-page-search-cards-section">
          <SearchBar
            providers={filteredProviders}
            totalProviders={allProviders.length}
            onResults={handleResults}
            onSearch={handleSearch}
            onCountyChange={handleCountyChange}
            onInsuranceChange={handleInsuranceChange}
            insuranceOptions={uniqueInsuranceOptions}
            onSpanishChange={handleSpanishChange}
            onServiceChange={handleServiceChange}
            onWaitListChange={handleWaitListChange}
            onAgeChange={handleAgeChange}
            onProviderTypeChange={handleProviderTypeChange}
            onReset={handleResetSearch}
          />
          <section className="glass">
            <section className="searched-provider-map-locations-list-section">
              {isLoading && (
                <div className="loading-container">
                  <img
                    src={gearImage}
                    alt="Loading..."
                    className="loading-gear"
                  />
                  <p>Loading providers...</p>
                </div>
              )}
              {!isLoading && showError && (
                <div className="error-message-container">{showError}</div>
              )}
              {!isLoading && !showError && (
                <div className="card-container">
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
            provider={selectedProvider}
            address={selectedAddress || "Address not available"}
            mapAddress={mapAddress}
            onClose={handleCloseModal}
            onViewOnMapClick={handleViewOnMapClick}
          />
        )}
      </main>
    </div>
  );
};

export default ProvidersPage;