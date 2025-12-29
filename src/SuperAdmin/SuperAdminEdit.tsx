import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  DollarSign,
  Clock,
  Stethoscope,
  Languages,
  X,
  Plus,
  Star,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import moment from "moment";
import InsuranceModal from "../Provider-edit/InsuranceModal";
import CountiesModal from "../Provider-edit/CountiesModal";
import {
  ProviderData,
  ProviderAttributes,
  Insurance,
  CountiesServed,
  Location as ProviderLocation,
  StateData,
  CountyData,
  Service,
} from "../Utility/Types";
import { fetchStates, fetchCountiesByState, fetchPracticeTypes, PracticeType } from "../Utility/ApiCall";
import { validateLogoFile, uploadProviderLogo } from "../Utility/ApiCall";
import { getSuperAdminAuthHeader } from "../Utility/config";

// Valid waitlist options for in_home_waitlist and in_clinic_waitlist
const WAITLIST_OPTIONS = [
  "No waitlist",
  "1-2 weeks",
  "2-4 weeks",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Not accepting new clients",
  "Contact for availability",
  "No in-home services available at this location"
];

interface SuperAdminEditProps {
  provider: ProviderData;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
  setSelectedTab?: Dispatch<SetStateAction<string>>;
}

interface ProviderType {
  id: number;
  name: string;
}

const getProviderTypeId = (typeName: string, practiceTypes: PracticeType[]): number => {
  const practiceType = practiceTypes.find(type => type.name === typeName);
  return practiceType?.id ?? 0; // Return 0 (invalid) for unknown types
};

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({
  provider,
  onUpdate,
  setSelectedTab,
}): JSX.Element => {
  const [editedProvider, setEditedProvider] =
    useState<ProviderAttributes | null>(null);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [fullProviderData, setFullProviderData] = useState<ProviderData | null>(null);
  const hasInitializedRef = useRef(false);
  
  // Use fullProviderData if available, otherwise fall back to provider from props
  const currentProvider = fullProviderData || provider;
  
  const [locations, setLocations] = useState<ProviderLocation[]>(
    currentProvider.attributes.locations?.map(location => ({
      ...location,
      services: location.services || []
    })) || []
  );
  // Track primary_location_id separately to ensure it's preserved when adding/reordering locations
  const [primaryLocationId, setPrimaryLocationId] = useState<number | null>(
    (currentProvider?.attributes as any)?.primary_location_id || null
  );
  // Track unique keys for new locations (ones without IDs) to prevent remounting on name change
  const newLocationKeysRef = useRef<Map<number, string>>(new Map());
  const newLocationCounterRef = useRef(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [providerState, setProviderState] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<ProviderType[]>(
    currentProvider.attributes.provider_type || []
  );
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>(providerState[0] || '');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [practiceTypes, setPracticeTypes] = useState<PracticeType[]>([]);
  const [categoryFields, setCategoryFields] = useState<any[]>(currentProvider.attributes.category_fields || []);

  // Fetch full provider data including provider_attributes when provider is selected
  useEffect(() => {
    const fetchFullProviderData = async () => {
      if (provider.id) {
        try {
          const adminAuthHeader = getSuperAdminAuthHeader();
          const response = await fetch(
            `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${provider.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': adminAuthHeader, // Use admin auth to get full provider data including provider_attributes
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch provider: ${response.status}`);
          }

          const data = await response.json();
          const fullProvider = data.data?.[0];
          
          if (fullProvider) {
            setFullProviderData(fullProvider);
          }
        } catch (error) {
          // Fall back to using the provider from props
          setFullProviderData(provider);
        }
      }
    };

    fetchFullProviderData();
  }, [provider.id, provider]);

  // Update state when fullProviderData is loaded - only on initial load, not when user is editing
  useEffect(() => {
    if (fullProviderData && fullProviderData !== provider && !hasInitializedRef.current) {
      // Update locations - only on initial load
      setLocations(fullProviderData.attributes.locations?.map(location => ({
        ...location,
        services: location.services || []
      })) || []);
      // Update primary_location_id from fullProviderData
      setPrimaryLocationId((fullProviderData.attributes as any)?.primary_location_id || null);
      // Update provider state
      setProviderState(fullProviderData.states || []);
      // Update selected counties
      setSelectedCounties(fullProviderData.attributes.counties_served || []);
      // Update selected insurances
      setSelectedInsurances(fullProviderData.attributes.insurance || []);
      // Update selected provider types
      setSelectedProviderTypes(fullProviderData.attributes.provider_type || []);
      // Update editedProvider to include provider_attributes
      setEditedProvider({
        ...fullProviderData.attributes,
        in_home_only: fullProviderData.attributes.in_home_only || false,
        service_delivery: fullProviderData.attributes.service_delivery || {
          in_home: false,
          in_clinic: false,
          telehealth: false
        },
        category: fullProviderData.attributes.category || null,
        category_name: fullProviderData.attributes.category_name || null,
        provider_attributes: fullProviderData.attributes.provider_attributes || null,
        category_fields: fullProviderData.attributes.category_fields || null
      });
      hasInitializedRef.current = true;
    }
  }, [fullProviderData, provider]);

  useEffect(() => {
    if (currentProvider && !hasInitializedRef.current) { // Only run on initial load
      setEditedProvider({
        ...currentProvider.attributes,
        // Initialize new fields with defaults if they don't exist
        in_home_only: currentProvider.attributes.in_home_only || false,
        service_delivery: currentProvider.attributes.service_delivery || {
          in_home: false,
          in_clinic: false,
          telehealth: false
        },
        // Include category fields
        category: currentProvider.attributes.category || null,
        category_name: currentProvider.attributes.category_name || null,
        provider_attributes: currentProvider.attributes.provider_attributes || null,
        category_fields: currentProvider.attributes.category_fields || null
      });
      setProviderState(currentProvider.states || []);
      setSelectedCounties(currentProvider.attributes.counties_served || []);
      setSelectedInsurances(currentProvider.attributes.insurance || []);
      const mappedLocations = currentProvider.attributes.locations.map(location => ({
        ...location,
        services: location.services || [],
        // Convert old boolean waitlist values to new descriptive string format
        in_home_waitlist: typeof location.in_home_waitlist === 'boolean' 
          ? (location.in_home_waitlist ? "Contact for availability" : "No waitlist")
          : location.in_home_waitlist || "Contact for availability",
        in_clinic_waitlist: typeof location.in_clinic_waitlist === 'boolean'
          ? (location.in_clinic_waitlist ? "Contact for availability" : "No waitlist")
          : location.in_clinic_waitlist || "Contact for availability"
      })) || [];
      setLocations(mappedLocations);
      setSelectedProviderTypes(currentProvider.attributes.provider_type || []);
      // Initialize category fields - ensure we have the full structure with options
      const initialCategoryFields = currentProvider.attributes.category_fields || [];
      setCategoryFields(initialCategoryFields);
      // Category fields initialized
      setIsLoading(false);
      hasInitializedRef.current = true;
    }
  }, [currentProvider]); // Use currentProvider instead of provider

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load states
        const states = await fetchStates();
        setAvailableStates(states);

        // If provider has states, fetch counties for the first state
        if (currentProvider.states?.[0]) {
          const selectedState = states.find(
            (state) => state.attributes.name === currentProvider.states[0]
          );

          if (selectedState) {
            const counties = await fetchCountiesByState(selectedState.id);
            setAvailableCounties(counties);
            setActiveStateForCounties(currentProvider.states[0]);
          }
        }
      } catch (error) {

        toast.error("Failed to load states and counties");
      }
    };

    loadInitialData();
  }, [currentProvider.states]);

  useEffect(() => {
    const loadPracticeTypes = async () => {
      try {
        const response = await fetchPracticeTypes();
        setPracticeTypes(response.data);
      } catch (error) {
        toast.error("Failed to load practice types");
      }
    };
    loadPracticeTypes();
  }, []);

  // Fetch category definition and merge with provider values for Educational Programs
  // This should run whenever provider_attributes are available, even if category_fields already exist
  useEffect(() => {
    const loadCategoryFields = async () => {
      // Use fullProviderData if available, otherwise fall back to provider
      const providerToUse = fullProviderData || currentProvider;
      const editedProviderCategory = editedProvider?.category;
      const isEducationalPrograms = providerToUse.attributes.category === 'educational_programs' || editedProviderCategory === 'educational_programs';
      
      // Always try to load if it's Educational Programs (similar to ProviderEdit)
      // We fetch the category definition and merge with provider_attributes if they exist
      if (isEducationalPrograms && providerToUse.id) {
        try {
          // Fetch all categories and find the educational programs one
          const categoryResponse = await fetch(
            `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_categories`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!categoryResponse.ok) {
            throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
          }

          const categoryData = await categoryResponse.json();
          
          // Find the educational programs category - check both slug formats
          const category = categoryData.data?.find((cat: any) => 
            cat.attributes?.slug === 'educational-programs' || 
            cat.attributes?.slug === 'educational_programs' ||
            cat.attributes?.name?.toLowerCase().includes('educational')
          );
          
          
          if (category && category.attributes?.category_fields && category.attributes.category_fields.length > 0) {
            const fieldDefinitions = category.attributes.category_fields;
            // provider_attributes might be null, undefined, or an empty object - handle all cases
            // Use provider_attributes from providerToUse (which prioritizes fullProviderData)
            const providerAttributes = providerToUse.attributes.provider_attributes || {};
            
            
            // Merge field definitions with provider's current values
            // Backend returns provider_attributes with field names (e.g., "Program Types") not slugs (e.g., "program_types")
            const mergedFields = fieldDefinitions.map((fieldDef: any) => {
              // Try to get value by field name first (backend format), then fall back to slug
              let currentValue = providerAttributes[fieldDef.name];
              if (currentValue === undefined) {
                currentValue = providerAttributes[fieldDef.slug];
              }
              
              // Backend may return comma-separated strings for multi_select, convert to arrays
              if (fieldDef.field_type === 'multi_select' && typeof currentValue === 'string') {
                currentValue = currentValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
              }
              
              // Backend may return string booleans ("true"/"false") for boolean fields, convert to actual booleans
              if (fieldDef.field_type === 'boolean' && typeof currentValue === 'string') {
                currentValue = currentValue.toLowerCase() === 'true' || currentValue === '1';
              }
              
              // Also handle numeric booleans (1/0) for boolean fields
              if (fieldDef.field_type === 'boolean' && typeof currentValue === 'number') {
                currentValue = currentValue === 1;
              }
              
              // Handle options - they might be in fieldDef.options as an array
              const options = fieldDef.options || (Array.isArray(fieldDef.options) ? fieldDef.options : []);
              
              return {
                id: fieldDef.id,
                name: fieldDef.name,
                slug: fieldDef.slug,
                field_type: fieldDef.field_type,
                required: fieldDef.required,
                help_text: fieldDef.help_text,
                display_order: fieldDef.display_order,
                options: options,
                value: currentValue !== undefined ? currentValue : (fieldDef.field_type === 'boolean' ? false : (fieldDef.field_type === 'multi_select' ? [] : null))
              };
            });
            
            setCategoryFields(mergedFields);
          } else {
            if (category) {
            }
            // Even if category_fields aren't found, set empty array to prevent "No category fields available" message
            setCategoryFields([]);
          }
        } catch (error) {
          toast.error('Failed to load program details. Please refresh and try again.');
          // Set empty array on error to prevent infinite loading state
          setCategoryFields([]);
        }
      } else if (isEducationalPrograms && !providerToUse.id) {
      }
    };

    // Only run if we have a provider ID and it's Educational Programs
    // Wait for fullProviderData to load if it's being fetched
    if (fullProviderData || currentProvider.id) {
      loadCategoryFields();
    }
  }, [
    fullProviderData, 
    fullProviderData?.id,
    fullProviderData?.attributes?.category,
    fullProviderData?.attributes?.provider_attributes,
    currentProvider, 
    currentProvider.id, 
    currentProvider.attributes.category, 
    currentProvider.attributes.provider_attributes, 
    editedProvider
  ]);

  useEffect(() => {
    const loadCountiesForState = async () => {
      if (activeStateForCounties && availableStates.length > 0) {
        const selectedState = availableStates.find(
          state => state.attributes.name === activeStateForCounties
        );
        
        if (selectedState) {
          try {
            const counties = await fetchCountiesByState(selectedState.id);
            setAvailableCounties(counties);
          } catch (error) {
            toast.error("Failed to load counties");
          }
        }
      }
    };

    loadCountiesForState();
  }, [activeStateForCounties, availableStates]);

  // Clean up counties when states change to maintain data consistency
  useEffect(() => {
    // Only run this effect if we have both providerState and availableCounties
    // AND if we're not in the middle of adding new states/counties
    if (providerState.length > 0 && availableCounties.length > 0) {
      // Only remove counties that are explicitly associated with removed states
      // Don't remove counties that might be for states we're adding
      setSelectedCounties(prev => prev.filter(county => {
        // If we have county data and it's not associated with any selected state, remove it
        const countyData = availableCounties.find(c => c.id === county.county_id);
        if (countyData) {
          return providerState.includes(countyData.attributes.state);
        }
        // If we don't have county data yet, keep it (it might be for a state we're adding)
        return true;
      }));
    }
    // Don't clear counties if we have no states - this might be during initialization
  }, [providerState, availableCounties]); // Add availableCounties back to satisfy ESLint

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "state") {
      const selectedState = availableStates.find(
        state => state.attributes.name === value
      );
      
      if (selectedState) {
        // Add the new state to the existing array instead of replacing it
        setProviderState(prev => {
          if (prev.includes(value)) {
            return prev; // State already exists
          }
          return [...prev, value]; // Add new state
        });
        
        // Set active state for counties
        setActiveStateForCounties(value);
        
        fetchCountiesByState(selectedState.id)
          .then(counties => {
            setAvailableCounties(prev => [...prev, ...counties]);
          })
          .catch(error => {
            toast.error("Failed to load counties");
          });
      }
    } else {
      setEditedProvider(prev =>
        prev ? { ...prev, [name]: value } : null
      );
    }
  };

  const handleLocationChange = (
    index: number,
    field: keyof ProviderLocation,
    value: string | Service[] | boolean | null
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };
    setLocations(updatedLocations);
    
    // Also update the editedProvider state to keep it synchronized
    if (editedProvider) {
      const updatedEditedProvider = { ...editedProvider };
      if (!updatedEditedProvider.locations) {
        updatedEditedProvider.locations = [];
      }
      updatedEditedProvider.locations[index] = { ...updatedEditedProvider.locations[index], [field]: value };
      setEditedProvider(updatedEditedProvider);
    }
  };

  // Address parsing function - automatically splits full address into components
  const parseAddress = (fullAddress: string, locationIndex: number) => {
    if (!fullAddress.trim()) return;
    
    let address = fullAddress.trim();
    address = address.replace(/\n+/g, ', ').replace(/\s+/g, ' ').trim();
    
    // Extract phone number first
    const phoneMatch = address.match(/phone:\s*\(?(\d{3})\)?\s*-?\s*(\d{3})\s*-?\s*(\d{4})/i);
    let phone = '';
    if (phoneMatch) {
      phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
      address = address.replace(phoneMatch[0], '').trim();
    }
    
    // Extract ZIP code
    const zipMatch = address.match(/\b(\d{5}(?:-\d{4})?)\b/);
    let zip = '';
    if (zipMatch) {
      zip = zipMatch[1];
      address = address.replace(zipMatch[0], '').trim();
    }
    
    // Extract state
    const stateMatch = address.match(/\b([A-Z]{2,3})\b/);
    let state = '';
    if (stateMatch) {
      state = stateMatch[1];
      address = address.replace(stateMatch[0], '').trim();
    }
    
    // Clean up any trailing commas
    address = address.replace(/,\s*$/, '').trim();
    
    // Split by commas and process
    const parts = address.split(',').map(part => part.trim()).filter(part => part);
    
    let streetAddress = '';
    let suite = '';
    let city = '';
    let locationName = '';
    
    if (parts.length >= 1) {
      // For your format: "4927 Calloway Dr. Bakersfield CA, 93312"
      // We want: street = "4927 Calloway Dr.", city = "Bakersfield", state = "CA", zip = "93312"
      
      // First part contains both street and city - we need to separate them
      const firstPart = parts[0];
      
      // Find where the street address ends and city begins
      // Look for the last occurrence of a street type word
      const words = firstPart.split(' ');
      let lastStreetTypeIndex = -1;
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (/\b(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|way|pl|place|ct|court)\b/i.test(word)) {
          lastStreetTypeIndex = i;
        }
      }
      
      let streetWords = [];
      let cityWords = [];
      
      if (lastStreetTypeIndex >= 0) {
        // Everything up to and including the street type is street address
        streetWords = words.slice(0, lastStreetTypeIndex + 1);
        // Everything after the street type is city
        cityWords = words.slice(lastStreetTypeIndex + 1);
      } else {
        // Fallback: if no street type found, assume last word is city
        streetWords = words.slice(0, -1);
        cityWords = words.slice(-1);
      }
      
      // Join the words back together
      streetAddress = streetWords.join(' ');
      city = cityWords.join(' ');
    }
    
    // Extract suite/unit from street address
    const suiteMatch = streetAddress.match(/\b(suite|ste|unit|apt|apartment|#)\s*\.?\s*([a-z0-9-]+)\b/i);
    if (suiteMatch) {
      suite = `${suiteMatch[1]} ${suiteMatch[2]}`;
      streetAddress = streetAddress.replace(suiteMatch[0], '').trim();
    }
    
    // Auto-generate location name based on city
    if (city) {
      locationName = `${city} Clinic`;
    } else if (state) {
      locationName = `${state} Clinic`;
    } else {
      locationName = 'Main Clinic';
    }
    
    // Update the locations state
    const updatedLocations = [...locations];
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      address_1: streetAddress,
      address_2: suite,
      city: city,
      state: state,
      zip: zip,
      phone: phone,
      name: locationName
    };
    setLocations(updatedLocations);
    
    // Update editedProvider state to trigger re-render
    setEditedProvider(prev => prev ? {
      ...prev,
      locations: updatedLocations
    } : null);
  };

  // Clear all address fields for a location
  const clearAddressFields = (locationIndex: number) => {
    const updatedLocations = [...locations];
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      address_1: null,
      address_2: null,
      city: null,
      state: null,
      zip: null
    };
    
    setLocations(updatedLocations);
    
    toast.info('Address fields cleared', {
      position: "top-right",
      autoClose: 1500,
    });
  };

  const addNewLocation = () => {
    console.log('🚀🚀🚀 SuperAdmin addNewLocation CALLED 🚀🚀🚀');
    console.log('📍 Current primaryLocationId state:', primaryLocationId);
    console.log('📍 Current locations count:', locations.length);
    console.log('📍 Current locations:', locations.map((l: any) => ({ id: l.id, name: l.name })));
    
    const newLocation: ProviderLocation = {
      id: null,
      name: null,
      address_1: null,
      address_2: null,
      city: null,
      state: null,
      zip: null,
      phone: null,
      services: [],
      in_home_waitlist: "Contact for availability",
      in_clinic_waitlist: "Contact for availability"
    };
    
    // Add new location at the END to avoid any potential issues with primary location
    // Primary location is determined by primary_location_id (ID-based), not array index
    const updatedLocations = [...locations, newLocation];
    const newLocationIndex = updatedLocations.length - 1;
    
    // Generate a stable key for this new location based on index (won't change when name changes)
    newLocationKeysRef.current.set(newLocationIndex, `new-location-${newLocationCounterRef.current++}-${Date.now()}`);
    
    setLocations(updatedLocations);
    
    // Note: services state doesn't need to be updated here since each location
    // has its own services array (location.services), not a separate services state per location
    
    console.log('✅ New location added at END of array. Primary location ID preserved:', primaryLocationId);
    
    // Auto-scroll to the new location after a brief delay to allow DOM update
    setTimeout(() => {
      // Find the last location element (the newly added one) using the index
      const newLocationElement = document.querySelector(`[data-location-index="${newLocationIndex}"]`);
      if (newLocationElement) {
        newLocationElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    const updatedServices = services.filter((_, i) => i !== index);
    
    // Clean up the key mapping for removed location and reindex remaining new locations
    if (updatedLocations.length > 0) {
      const newKeysMap = new Map<number, string>();
      updatedLocations.forEach((loc, newIndex) => {
        if (!loc.id && newLocationKeysRef.current.has(index)) {
          // Preserve the key for locations that were after the removed one
          const oldKey = newLocationKeysRef.current.get(index);
          if (oldKey) {
            newKeysMap.set(newIndex, oldKey);
          }
        }
      });
      // Also preserve keys for locations before the removed index
      newLocationKeysRef.current.forEach((key, oldIndex) => {
        if (oldIndex < index) {
          newKeysMap.set(oldIndex, key);
        } else if (oldIndex > index) {
          newKeysMap.set(oldIndex - 1, key);
        }
      });
      newLocationKeysRef.current = newKeysMap;
    } else {
      newLocationKeysRef.current.clear();
    }
    
    setServices(updatedServices);
    setLocations(updatedLocations);
  };

  // Move location to top (set as primary)
  const handleSetAsPrimary = (index: number) => {
    if (index < 0 || index >= locations.length) return;
    
    const locationToMakePrimary = locations[index];
    
    // If location doesn't have an ID yet (new location), can't set as primary
    if (!locationToMakePrimary.id) {
      toast.error('Cannot set a new location as primary until it is saved');
      return;
    }
    
    // Update primary_location_id to the selected location's ID
    setPrimaryLocationId(locationToMakePrimary.id);
    console.log('🎯 Setting primary_location_id to:', locationToMakePrimary.id);
    
    const reorderedLocations = [
      locations[index],
      ...locations.slice(0, index),
      ...locations.slice(index + 1)
    ];
    
    // Also reorder services array to match
    const reorderedServices = [
      services[index],
      ...services.slice(0, index),
      ...services.slice(index + 1)
    ];
    
    setLocations(reorderedLocations);
    setServices(reorderedServices);
    
    // Update editedProvider if it exists
    if (editedProvider) {
      const updatedEditedProvider = { ...editedProvider };
      if (!updatedEditedProvider.locations) {
        updatedEditedProvider.locations = [];
      }
      updatedEditedProvider.locations = reorderedLocations;
      setEditedProvider(updatedEditedProvider);
    }
    
    toast.success('Location set as primary (will appear first)');
  };

  // Move location up in the list
  const handleMoveUp = (index: number) => {
    if (index <= 0 || index >= locations.length) return;
    
    const reorderedLocations = [...locations];
    [reorderedLocations[index - 1], reorderedLocations[index]] = 
      [reorderedLocations[index], reorderedLocations[index - 1]];
    
    // Also reorder services array to match
    const reorderedServices = [...services];
    [reorderedServices[index - 1], reorderedServices[index]] = 
      [reorderedServices[index], reorderedServices[index - 1]];
    
    setLocations(reorderedLocations);
    setServices(reorderedServices);
    
    // Update editedProvider if it exists
    if (editedProvider) {
      const updatedEditedProvider = { ...editedProvider };
      if (!updatedEditedProvider.locations) {
        updatedEditedProvider.locations = [];
      }
      updatedEditedProvider.locations = reorderedLocations;
      setEditedProvider(updatedEditedProvider);
    }
    
    toast.info('Location order updated');
  };

  // Move location down in the list
  const handleMoveDown = (index: number) => {
    if (index < 0 || index >= locations.length - 1) return;
    
    const reorderedLocations = [...locations];
    [reorderedLocations[index], reorderedLocations[index + 1]] = 
      [reorderedLocations[index + 1], reorderedLocations[index]];
    
    // Also reorder services array to match
    const reorderedServices = [...services];
    [reorderedServices[index], reorderedServices[index + 1]] = 
      [reorderedServices[index + 1], reorderedServices[index]];
    
    setLocations(reorderedLocations);
    setServices(reorderedServices);
    
    // Update editedProvider if it exists
    if (editedProvider) {
      const updatedEditedProvider = { ...editedProvider };
      if (!updatedEditedProvider.locations) {
        updatedEditedProvider.locations = [];
      }
      updatedEditedProvider.locations = reorderedLocations;
      setEditedProvider(updatedEditedProvider);
    }
    
    toast.info('Location order updated');
  };

  const handleInsurancesChange = (insurances: Insurance[]) => {
    setSelectedInsurances(insurances);
  };

  const handleCountiesChange = (counties: CountiesServed[]) => {
    setSelectedCounties(counties);
  };

  const validateLocations = () => {
    // Check if provider offers in-clinic services and needs locations
    const needsLocations = editedProvider?.service_delivery?.in_clinic;
    const isTelehealthOnly = editedProvider?.service_delivery?.telehealth && !editedProvider?.service_delivery?.in_clinic && !editedProvider?.service_delivery?.in_home;
    
    if (!needsLocations) {
      // For telehealth-only providers, they still need at least one location with a phone number
      if (isTelehealthOnly) {
        const locationsWithPhone = locations.filter(loc => loc.phone && loc.phone.trim());
        if (locationsWithPhone.length === 0) {
          toast.error("❌ Telehealth providers need at least one location with a phone number");
          return false;
        }
        return true;
      }
      // For in-home only providers, no location validation needed
      return true;
    }

    // Provider needs physical locations - validate them
    const locationsWithServices = locations.filter(loc => loc.services && loc.services.length > 0);
    
    if (locationsWithServices.length === 0) {
      toast.error("❌ At least one location with services is required for in-clinic providers");
      return false;
    }

    for (let i = 0; i < locationsWithServices.length; i++) {
      const location = locationsWithServices[i];
      const locationNum = i + 1;
      const missingFields = [];

      // Check required fields for locations with services
      if (!location.name?.trim()) missingFields.push("Location Name");
      if (!location.address_1?.trim()) missingFields.push("Street Address");
      if (!location.city?.trim()) missingFields.push("City");
      if (!location.state?.trim()) missingFields.push("State");
      if (!location.zip?.trim()) missingFields.push("ZIP Code");
      if (!location.phone?.trim()) missingFields.push("Phone Number");

      if (missingFields.length > 0) {
        toast.error(`❌ Location ${locationNum} is missing required fields: ${missingFields.join(", ")}`);
        return false;
      }

      // Validate phone number format
      if (location.phone && !/^[\d\s\-()]+$/.test(location.phone)) {
        toast.error(`❌ Location ${locationNum}: Please enter a valid phone number`);
        return false;
      }

      // Validate ZIP code format
      if (location.zip && !/^\d{5}(-\d{4})?$/.test(location.zip)) {
        toast.error(`❌ Location ${locationNum}: Please enter a valid ZIP code (12345 or 12345-6789)`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all locations first
    if (!validateLocations()) {
      return;
    }
    
    setIsSaving(true);

    try {
      // CRITICAL: Backend uses "replace all" strategy - MUST send ALL locations or they get deleted!
      // Send ALL locations from state - do NOT filter any out
      // Strip null IDs from new locations to prevent validation issues
      const filteredLocations = locations
        .map(({ id, in_home_waitlist, in_clinic_waitlist, ...rest }) => {
          const base = {
            ...rest,
            // Set default values for optional fields if they're empty
            name: rest.name || 'Virtual Location',
            address_1: rest.address_1 || null,
            address_2: rest.address_2 || null,
            city: rest.city || null,
            state: rest.state || null,
            zip: rest.zip || null,
            phone: rest.phone || null, // Allow null phone numbers
            services: rest.services || [],
            // Convert boolean waitlist values to descriptive strings
            in_home_waitlist: typeof in_home_waitlist === 'boolean' 
              ? (in_home_waitlist ? "Contact for availability" : "No waitlist")
              : (in_home_waitlist || "Contact for availability"),
            in_clinic_waitlist: typeof in_clinic_waitlist === 'boolean'
              ? (in_clinic_waitlist ? "Contact for availability" : "No waitlist")
              : (in_clinic_waitlist || "Contact for availability")
          };
          
          // Only include id if it's a real number (existing location)
          // For new locations, omit the id field entirely
          return (typeof id === 'number' && id > 0) ? { id, ...base } : base;
        });

      // Build attributes object with only what the API expects
      const attributes: any = {
        // Don't spread editedProvider - it might contain conflicting fields
        // Only include the specific fields we want to update
        name: editedProvider?.name,
        logo: editedProvider?.logo,
        email: editedProvider?.email,
        website: editedProvider?.website,
        cost: editedProvider?.cost,
        min_age: editedProvider?.min_age,
        max_age: editedProvider?.max_age,
        waitlist: editedProvider?.waitlist,
        status: editedProvider?.status,
        telehealth_services: editedProvider?.telehealth_services,
        spanish_speakers: editedProvider?.spanish_speakers,
        at_home_services: editedProvider?.at_home_services,
        in_clinic_services: editedProvider?.in_clinic_services,
        in_home_only: editedProvider?.in_home_only,
        service_delivery: editedProvider?.service_delivery,
        // Keep only what API expects
        provider_type: selectedProviderTypes.map(type => ({ id: type.id, name: type.name })),
        insurance: selectedInsurances,
        counties_served: selectedCounties
          .filter(county => {
            // Don't filter out counties if we don't have state data yet
            // This prevents losing counties for states we're adding
            const countyData = availableCounties.find(c => c.id === county.county_id);
            if (!countyData) {
              // If we don't have county data yet, keep it (it might be for a state we're adding)
              return true;
            }
            // Only include counties that are associated with selected states
            return providerState.includes(countyData.attributes.state);
          })
          .map(c => ({ 
            county_id: c.county_id, 
            county_name: c.county_name 
          })),
        locations: filteredLocations,
        states: providerState,
      };
      
      // CRITICAL VALIDATION: Ensure we're sending ALL locations
      if (filteredLocations.length !== locations.length) {
        console.error('❌ Location count mismatch in SuperAdminEdit!', {
          sending: filteredLocations.length,
          expected: locations.length
        });
        throw new Error(`Location count mismatch: sending ${filteredLocations.length} but expected ${locations.length}. This would delete locations!`);
      }
      
      // Always include primary_location_id if it exists (use state variable, not currentProvider)
      if (primaryLocationId !== null && primaryLocationId !== undefined) {
        attributes.primary_location_id = primaryLocationId;
      }
      
      console.log('💾 Saving with primary_location_id:', primaryLocationId);
      console.log('💾 Sending ALL', filteredLocations.length, 'locations:', filteredLocations.map((l: any) => ({ id: l.id, name: l.name })));
      console.log('💾 Full attributes object:', JSON.stringify(attributes, null, 2));

      // Add provider_attributes for Educational Programs separately to ensure they're included
      const isEducationalPrograms = provider.attributes.category === 'educational_programs' || editedProvider?.category === 'educational_programs';
      if (isEducationalPrograms && categoryFields && categoryFields.length > 0) {
        const providerAttrs = categoryFields.reduce((acc, field) => {
          // Only include fields that have values
          if (field.value !== null && field.value !== undefined && field.value !== '') {
            if (Array.isArray(field.value) && field.value.length > 0) {
              // Backend will handle array values by joining with commas
              acc[field.name] = field.value;
            } else if (!Array.isArray(field.value)) {
              acc[field.name] = field.value;
            }
          }
          return acc;
        }, {} as Record<string, any>);
        
        
        // Only add provider_attributes if we have actual values
        if (Object.keys(providerAttrs).length > 0) {
          attributes.provider_attributes = providerAttrs;
        } else {
        }
      } else {
      }

      const requestBody = { data: [{ attributes }] };
      
      // Log the final attributes object to verify provider_attributes is included

      // Comprehensive debug logging for Educational Programs

      if (isEducationalPrograms) {
      }

      // Log the exact JSON string being sent
      const requestBodyString = JSON.stringify(requestBody);
      
      if (isEducationalPrograms) {
        // Log a portion of the request body to verify provider_attributes
        const providerAttrsMatch = requestBodyString.match(/"provider_attributes":\{[^}]*\}/);
        if (providerAttrsMatch) {
        } else {
          // Try to find it with a more flexible regex
          const flexibleMatch = requestBodyString.match(/"provider_attributes":\s*\{[^}]*\}/);
          if (flexibleMatch) {
          } else {
          }
        }
        
        // Also verify the attributes object directly
      }

      // Use correct endpoint and method per spec
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/providers/${provider.id}`,
        {
          method: "PUT", // PUT per spec, not PATCH
          headers: {
            "Content-Type": "application/json",
            'Authorization': getSuperAdminAuthHeader(), // Use super admin header
          },
          body: requestBodyString,
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to update provider: ${response.status} - ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }
      
      // Check if response has the expected structure
      if (!responseData?.data?.[0]?.attributes) {
        throw new Error('Invalid response format from server - missing provider data');
      }

      const updatedProvider = responseData.data[0];
      
      // Debug: Log what we received for Educational Programs
      if (provider.attributes.category === 'educational_programs' || editedProvider?.category === 'educational_programs') {
      }
      
      // Verify that all locations were saved
      const savedLocations = updatedProvider.attributes.locations || [];
      if (savedLocations.length !== filteredLocations.length) {
      }
      
      // Build the complete updated data object for the parent component
      // This ensures proper merging of API response with local state for services persistence
      const completeUpdatedData = {
        ...updatedProvider.attributes, // Override with API response data
        // Merge API response with local state for critical fields
        locations: (updatedProvider.attributes.locations || []).map((apiLocation: any, index: number) => {
          // If API location has no services but local location does, preserve local services
          const localLocation = locations[index];
          if (apiLocation.services && apiLocation.services.length === 0 && 
              localLocation && localLocation.services && localLocation.services.length > 0) {
            return {
              ...apiLocation,
              services: localLocation.services // Keep local services if API didn't save them
            };
          }
          return apiLocation;
        }),
        states: updatedProvider.attributes.states || providerState, // Use API response if available, fallback to local
        counties_served: updatedProvider.attributes.counties_served || selectedCounties, // Use API response if available, fallback to local
        // Include provider_attributes from API response if available
        ...(updatedProvider.attributes.provider_attributes && {
          provider_attributes: updatedProvider.attributes.provider_attributes
        }),
        id: provider.id
      };
      
      onUpdate(completeUpdatedData);
      
      // Update fullProviderData with the latest data from API response
      if (fullProviderData) {
        setFullProviderData({
          ...fullProviderData,
          attributes: {
            ...fullProviderData.attributes,
            ...updatedProvider.attributes,
            // Include primary_location_id if it was updated
            ...((completeUpdatedData as any).primary_location_id !== undefined && {
              primary_location_id: (completeUpdatedData as any).primary_location_id
            }),
            // Include provider_attributes if they were updated
            ...(completeUpdatedData.provider_attributes && {
              provider_attributes: completeUpdatedData.provider_attributes
            })
          }
        });
      }
      
      // Update local state to reflect the changes immediately
      setEditedProvider(prev => prev ? {
        ...prev,
        ...updatedProvider.attributes,
        // Use API response locations if available, otherwise keep local
        locations: completeUpdatedData.locations, // Use our merged locations
        // Include provider_attributes if they were updated
        ...(completeUpdatedData.provider_attributes && {
          provider_attributes: completeUpdatedData.provider_attributes
        })
      } : null);
      
      // Update categoryFields state with the saved values from API response
      // Backend returns field names (e.g., "Program Types") not slugs (e.g., "program_types")
      if (updatedProvider.attributes.provider_attributes && categoryFields.length > 0) {
        const updatedCategoryFields = categoryFields.map(field => {
          // Try to find the saved value by field name (backend format)
          let savedValue = updatedProvider.attributes.provider_attributes[field.name];
          if (savedValue === undefined) {
            // Fall back to slug
            savedValue = updatedProvider.attributes.provider_attributes[field.slug];
          }
          
          if (savedValue !== undefined) {
            // Backend may return comma-separated strings for multi_select, convert back to arrays
            if (field.field_type === 'multi_select' && typeof savedValue === 'string') {
              const arrayValue = savedValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
              return { ...field, value: arrayValue };
            }
            return { ...field, value: savedValue };
          }
          return field;
        });
        setCategoryFields(updatedCategoryFields);
      }
      
      // Update local locations state with our merged locations
      setLocations(completeUpdatedData.locations);
      
      // Update primary_location_id from the API response (check both updatedProvider and completeUpdatedData)
      const newPrimaryLocationId = (completeUpdatedData as any).primary_location_id || 
                                   (updatedProvider.attributes as any)?.primary_location_id;
      if (newPrimaryLocationId !== undefined) {
        setPrimaryLocationId(newPrimaryLocationId || null);
        console.log('🔄 Updated primary_location_id from API response:', newPrimaryLocationId);
      }
      
      // Update local counties state to match what was saved
      if (updatedProvider.attributes.counties_served) {
        setSelectedCounties(updatedProvider.attributes.counties_served);
      }
      
      // Show success toast only after everything is confirmed successful
      toast.success(`Provider ${editedProvider?.name} updated successfully!`);
      
      // Handle logo upload separately if a file is selected
      if (selectedLogoFile) {
        try {
          
          // Use the regular provider endpoint with admin authentication
          const adminAuthHeader = getSuperAdminAuthHeader();
          
          const logoResult = await uploadProviderLogo(provider.id, selectedLogoFile, adminAuthHeader, true);
          
          if (logoResult.success) {
            toast.success('Logo uploaded successfully');
            setSelectedLogoFile(null);
            
            // Update the local provider state with the new logo URL
            if (logoResult.updatedProvider && logoResult.updatedProvider.data) {
              const updatedProviderData = logoResult.updatedProvider.data[0];
              if (updatedProviderData && updatedProviderData.attributes && updatedProviderData.attributes.logo) {
                // Update the provider object with the new logo
                const updatedProvider = {
                  ...provider,
                  attributes: {
                    ...provider.attributes,
                    logo: updatedProviderData.attributes.logo
                  }
                };
                
                // Call the onUpdate function to update the parent state
                onUpdate(updatedProvider.attributes);
                
              }
            }
          } else {
            toast.error(`Logo upload failed: ${logoResult.error}`);
          }
        } catch (logoError) {
          toast.error('Failed to upload logo');
        }
      }
      
      // Don't redirect - let user stay on edit page to see the updated data
      // if (setSelectedTab) {
      //   setSelectedTab("view");
      // }
    } catch (error) {
      
      toast.error(error instanceof Error ? error.message : "Failed to update provider", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: `error-${provider.id}-${Date.now()}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceChange = (locationIndex: number, service: Service) => {
    const updatedLocations = [...locations];
    const locationServices = updatedLocations[locationIndex].services || [];
    
    // Check if service already exists in this location
    const serviceExists = locationServices.some(s => s.id === service.id);
    
    if (serviceExists) {
      // Remove service if it exists
      updatedLocations[locationIndex].services = locationServices.filter(s => s.id !== service.id);
    } else {
      // Add service if it doesn't exist
      updatedLocations[locationIndex].services = [...locationServices, service];
    }
    
    setLocations(updatedLocations);
    
    // Also update the editedProvider state to keep it synchronized
    if (editedProvider) {
      const updatedEditedProvider = { ...editedProvider };
      if (!updatedEditedProvider.locations) {
        updatedEditedProvider.locations = [];
      }
      updatedEditedProvider.locations[locationIndex] = { 
        ...updatedEditedProvider.locations[locationIndex], 
        services: updatedLocations[locationIndex].services 
      };
      setEditedProvider(updatedEditedProvider);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!editedProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No provider data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="w-full overflow-x-hidden">
          <div className="px-2 sm:px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start space-x-6 mb-4">
                {provider.attributes.logo ? (
                  <div className="flex-shrink-0">
                    <img 
                      src={provider.attributes.logo}
                      alt={`${editedProvider.name} logo`}
                      className="w-24 h-24 object-contain rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
        
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-3xl">📷</span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Editing: <span className="text-blue-600">{editedProvider.name}</span>
                  </h1>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">ID: {provider.id}</h2>
                  <p className="text-sm text-gray-500">
                    Last updated:{" "}
                    {editedProvider.updated_last
                      ? moment(editedProvider.updated_last).format("MM/DD/YYYY")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedTab?.("view")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900 flex items-center space-x-2`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Back to List</span>
                </button>

                <button
                  onClick={() => setActiveTab("basic")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "basic"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab("locations")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "locations"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Locations
                </button>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "services"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Services & Coverage
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px] mx-auto px-4">
                  {/* Provider Details Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Provider Details
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Provider Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editedProvider.name || ""}
                          onChange={handleInputChange}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Provider Types Selection */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Provider Types</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedProviderTypes.map((type) => (
                            <div key={type.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                              <span>{type.name}</span>
                              <X 
                                className="ml-2 w-4 h-4 cursor-pointer" 
                                onClick={() => setSelectedProviderTypes(prev => prev.filter(t => t.id !== type.id))}
                              />
                            </div>
                          ))}
                        </div>
                        <select
                          onChange={(e) => {
                            const type = e.target.value;
                            if (!type) return;
                            if (!selectedProviderTypes.some(t => t.name === type)) {
                              const id = getProviderTypeId(type, practiceTypes);
                              if (id === 0) {
                                toast.error(`Unknown provider type: ${type}`);
                                return;
                              }
                              setSelectedProviderTypes(prev => [...prev, { id, name: type }]);
                            }
                          }}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300"
                        >
                          <option value="">Add a provider type...</option>
                          {practiceTypes
                            .filter(type => !selectedProviderTypes.some(t => t.name === type.name))
                            .map(type => (
                              <option key={type.id} value={type.name}>{type.name}</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={editedProvider.status || ""}
                          onChange={handleInputChange}
                          className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="denied">Denied</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Contact Information
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Website
                        </label>
                        <div className="relative flex items-center w-[95%]">
                          <Globe className="absolute left-3 z-10 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="website"
                            value={editedProvider.website || ""}
                            onChange={handleInputChange}
                            className="block w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Email
                        </label>
                        <div className="relative flex items-center w-[95%]">
                          <Mail className="absolute left-3 z-10 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={editedProvider.email || ""}
                            onChange={handleInputChange}
                            className="block w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Logo
                        </label>
                        <div className="space-y-2">
                          {/* File upload input */}
                          <div className="space-y-4">
                            <div className="relative group">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/gif"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const validation = validateLogoFile(file);
                                    if (!validation.isValid) {
                                      toast.error(validation.error);
                                      return;
                                    }
                                    setSelectedLogoFile(file);
                                    toast.success('Logo file selected');
                                  }
                                }}
                                className="w-full px-4 py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 transition-all duration-200 group-hover:bg-blue-50 group-hover:border-blue-400"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-3xl mb-2">📁</div>
                                <span className="text-gray-600 text-sm font-medium">Click to select logo file</span>
                                <span className="text-gray-400 text-xs mt-1">or drag and drop</span>
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Choose Logo File
                              </button>
                            </div>
                          </div>
                          {selectedLogoFile && (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="text-green-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-green-800">Selected: {selectedLogoFile.name}</span>
                                  <span className="text-xs text-green-600 block">{(selectedLogoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedLogoFile(null)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Supported formats: PNG, JPEG, GIF. Max size: 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Fields Section for Educational Programs */}
                  {editedProvider && (editedProvider.category === 'educational_programs' || provider.attributes.category === 'educational_programs') && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                          <Stethoscope className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Program Details (Educational Programs)
                        </h2>
                      </div>
                      
                      <div className="space-y-6">
                        {categoryFields && categoryFields.length > 0 ? (
                          categoryFields
                            .sort((a, b) => (a.id || 0) - (b.id || 0))
                            .map((field, fieldIndex) => (
                            <div key={field.id || field.slug || fieldIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field.name} {field.required && <span className="text-red-500">*</span>}
                              </label>
                              {field.help_text && (
                                <p className="text-xs text-gray-500 mb-2">{field.help_text}</p>
                              )}
                              
                              {field.field_type === 'multi_select' && (
                                <div className="space-y-2">
                                  <div className="text-xs text-blue-600 mb-2">Multi-select field - Select multiple options</div>
                                  {(!field.options || field.options.length === 0) ? (
                                    <div className="text-sm text-gray-500 italic">No options available for this field</div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                                      {(Array.isArray(field.options) ? field.options : []).map((option: string) => {
                                      const currentValues = Array.isArray(field.value) ? field.value : [];
                                      const isChecked = currentValues.includes(option);
                                      return (
                                        <label key={option} className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              const updatedFields = [...categoryFields];
                                              const currentValues = Array.isArray(updatedFields[fieldIndex].value) 
                                                ? updatedFields[fieldIndex].value 
                                                : [];
                                              if (e.target.checked) {
                                                updatedFields[fieldIndex].value = [...currentValues, option];
                                              } else {
                                                updatedFields[fieldIndex].value = currentValues.filter((v: string) => v !== option);
                                              }
                                              setCategoryFields(updatedFields);
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <span className="ml-2 text-sm text-gray-700">{option}</span>
                                        </label>
                                      );
                                    })}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {field.field_type === 'boolean' && (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value === true || field.value === 'true' || field.value === 1}
                                    onChange={(e) => {
                                      const updatedFields = [...categoryFields];
                                      updatedFields[fieldIndex].value = e.target.checked;
                                      setCategoryFields(updatedFields);
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{field.help_text || field.name}</span>
                                </label>
                              )}
                              
                              {(field.field_type === 'text' || field.field_type === 'select' || field.field_type === 'textarea' || field.field_type === 'text_area') && (
                                <div>
                                  {field.field_type === 'select' && field.options && field.options.length > 0 ? (
                                    <select
                                      value={typeof field.value === 'string' ? field.value : ''}
                                      onChange={(e) => {
                                        const updatedFields = [...categoryFields];
                                        updatedFields[fieldIndex].value = e.target.value;
                                        setCategoryFields(updatedFields);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select {field.name}...</option>
                                      {field.options.map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  ) : (field.field_type === 'textarea' || field.field_type === 'text_area' || field.name?.toLowerCase().includes('information') || field.name?.toLowerCase().includes('description') || field.name?.toLowerCase().includes('notes')) ? (
                                    <textarea
                                      value={typeof field.value === 'string' ? field.value : ''}
                                      onChange={(e) => {
                                        const updatedFields = [...categoryFields];
                                        updatedFields[fieldIndex].value = e.target.value;
                                        setCategoryFields(updatedFields);
                                      }}
                                      rows={4}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={field.help_text || `Enter ${field.name}...`}
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={typeof field.value === 'string' ? field.value : ''}
                                      onChange={(e) => {
                                        const updatedFields = [...categoryFields];
                                        updatedFields[fieldIndex].value = e.target.value;
                                        setCategoryFields(updatedFields);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={field.help_text || `Enter ${field.name}`}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 italic p-4">
                            No category fields available. Category fields will appear here once the provider is approved and category data is loaded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "locations" && (
                <div className="max-w-[1200px] mx-auto px-4 space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Provider Locations
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={addNewLocation}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Location
                    </button>
                  </div>

                  {locations.map((location, index) => {
                    // Generate a unique key: use ID if available, otherwise use a stable key from ref
                    // For new locations (id is null), use a stable key that doesn't change when name changes
                    // This prevents React from remounting the component when typing in the name field
                    const locationKey = location.id 
                      ? `location-${location.id}` 
                      : (newLocationKeysRef.current.get(index) || `new-location-${index}`);
                    
                    const isPrimary = location.id !== null && location.id === primaryLocationId;
                    const isNewLocation = location.id === null;
                    
                    return (
                    <div
                      key={locationKey}
                      data-location-index={index}
                      className={`rounded-lg shadow-sm border p-6 ${
                        isNewLocation 
                          ? 'border-2 border-blue-400 border-dashed bg-blue-50' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {isNewLocation && (
                        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
                          <p className="text-sm font-semibold text-blue-800 flex items-center">
                            <span className="mr-2">🆕</span>
                            New Location - Fill in the details below and save
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            {isPrimary && (
                              <span title="Primary location">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              </span>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900">
                              Location {index + 1} of {locations.length}
                              {isPrimary && (
                                <span className="ml-2 text-sm text-gray-500">(Primary)</span>
                              )}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* Reorder buttons - only show if more than one location */}
                          {locations.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSetAsPrimary(index)}
                                disabled={isPrimary || !location.id}
                                className="p-2 text-gray-400 hover:text-yellow-600 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                title={!location.id ? "Save location first to set as primary" : "Set as primary location (appears first)"}
                              >
                                <Star className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <ChevronUp className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === locations.length - 1}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                <ChevronDown className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeLocation(index)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                            title="Remove location"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Location Name
                          </label>
                          <input
                            type="text"
                            value={location.name || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "name", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={location.phone || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "phone", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Address Parser - Paste Full Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            🚀 Quick Address Entry - Paste Full Address
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Paste full address from Google Maps, business listing, etc..."
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              onBlur={(e) => parseAddress(e.target.value, index)}
                            />
                            <button
                              type="button"
                              onClick={() => clearAddressFields(index)}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                              title="Clear all address fields"
                            >
                              Clear
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Paste a full address like: "123 Main St, Suite 100, Salt Lake City, UT 84101"
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={location.address_1 || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "address_1", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={location.address_2 || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "address_2", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={location.city || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "city", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={location.state || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "state", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={location.zip || ""}
                            onChange={(e) =>
                              handleLocationChange(index, "zip", e.target.value)
                            }
                            className="w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            In-Home Waitlist
                          </label>
                          <p className="text-sm text-gray-500 mb-2">Select the current waitlist status for in-home services</p>
                          <select
                            value={typeof location.in_home_waitlist === 'boolean' ? '' : String(location.in_home_waitlist || '')}
                            onChange={(e) =>
                              handleLocationChange(index, "in_home_waitlist", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select waitlist status...</option>
                            {WAITLIST_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-2">
                            In-Clinic Waitlist
                          </label>
                          <p className="text-sm text-gray-500 mb-2">Select the current waitlist status for in-clinic services</p>
                          <select
                            value={typeof location.in_clinic_waitlist === 'boolean' ? '' : String(location.in_clinic_waitlist || '')}
                            onChange={(e) =>
                              handleLocationChange(index, "in_clinic_waitlist", e.target.value || null)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select waitlist status...</option>
                            {WAITLIST_OPTIONS.filter(option => option !== "No in-home services available at this location").map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm text-gray-600 mb-2">
                          Services Offered at this Location
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {location.services?.map((service) => (
                            <div
                              key={service.id}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              <span>{service.name}</span>
                              <X 
                                onClick={() => handleServiceChange(index, service)}
                                className="ml-2 hover:text-red-500 p-0 border-0 bg-transparent cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                        <select
                          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value=""
                          onChange={(e) => {
                            const [id, name] = e.target.value.split('|');
                            if (id && name) {
                              handleServiceChange(index, { id: parseInt(id), name });
                            }
                          }}
                        >
                          <option value="">Add a service...</option>
                          {practiceTypes
                            .filter(service => !location.services?.some(s => s.id === service.id))
                            .map(service => (
                              <option key={service.id} value={`${service.id}|${service.name}`}>
                                {service.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}

              {activeTab === "services" && (
                <div className="max-w-[1200px] mx-auto px-4 space-y-6">
                  {/* Service Information Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Service Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Cost Information */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Cost Information
                          </label>
                          <div className="relative w-[95%]">
                            <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                              name="cost"
                              value={editedProvider.cost || ""}
                              onChange={handleInputChange}
                              rows={2}
                              style={{ textIndent: "2rem" }}
                              className="block w-[95%] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Enter cost details..."
                            />
                          </div>
                        </div>

                        {/* Waitlist Status */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Waitlist Status
                          </label>
                          <div className="relative w-[95%]">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              name="waitlist"
                              value={editedProvider.waitlist || ""}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select waitlist status</option>
                              <option value="Currently accepting clients">Currently accepting clients</option>
                              <option value="Short waitlist">Short waitlist</option>
                              <option value="Long waitlist">Long waitlist</option>
                              <option value="Not accepting new clients">Not accepting new clients</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Age Range */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Age Range
                          </label>
                          <div className="gap-2 w-[95%] items-center">
                            <div>
                              <input
                                type="number"
                                name="min_age"
                                value={editedProvider.min_age || ""}
                                onChange={handleInputChange}
                                placeholder="Min Age"
                                min="0"
                                step="0.5"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                              <span className="mx-2 text-gray-500">to</span>
                              <input
                                type="number"
                                name="max_age"
                                value={editedProvider.max_age || ""}
                                onChange={handleInputChange}
                                placeholder="Max Age"
                                min="0"
                                step="0.5"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Service Delivery Options */}
                          <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-600 mb-4">
                              Service Delivery Options
                            </label>
                            
                            {/* Service Delivery Options */}
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Delivery Options
                              </label>
                              <div className="space-y-2">
                                {/* In-Home Services */}
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editedProvider.service_delivery?.in_home || false}
                                    onChange={(e) =>
                                      setEditedProvider({
                                        ...editedProvider,
                                        service_delivery: { 
                                          ...editedProvider.service_delivery,
                                          in_home: e.target.checked 
                                        },
                                        in_home_only: e.target.checked && !editedProvider.service_delivery?.in_clinic && !editedProvider.service_delivery?.telehealth
                                      })
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    In-Home Services
                                  </span>
                                </label>

                                {/* In-Clinic Services */}
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editedProvider.service_delivery?.in_clinic || false}
                                    onChange={(e) =>
                                      setEditedProvider({
                                        ...editedProvider,
                                        service_delivery: { 
                                          ...editedProvider.service_delivery,
                                          in_clinic: e.target.checked 
                                        },
                                        in_home_only: !e.target.checked && editedProvider.service_delivery?.in_home && !editedProvider.service_delivery?.telehealth
                                      })
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    In-Clinic Services
                                  </span>
                                </label>

                                {/* Telehealth Services */}
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editedProvider.service_delivery?.telehealth || false}
                                    onChange={(e) =>
                                      setEditedProvider({
                                        ...editedProvider,
                                        service_delivery: { 
                                          ...editedProvider.service_delivery,
                                          telehealth: e.target.checked 
                                        }
                                      })
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    Telehealth Services
                                  </span>
                                </label>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Select all service delivery methods this provider offers. Physical locations are only required for in-clinic services.
                              </p>
                            </div>


                            {/* Removed duplicate service dropdowns - keeping only the checkboxes above */}
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage & Language Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Languages className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Coverage & Language
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Spanish Speaking Staff */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Spanish Speaking Staff
                        </label>
                        <div className="relative w-[95%]">
                          <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            name="spanish_speakers"
                            value={editedProvider.spanish_speakers || ""}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Contact us">Contact us</option>
                          </select>
                        </div>
                      </div>

                      {/* Coverage Buttons */}
                      <div className="space-y-3 w-[95%]">
                        <button
                          type="button"
                          onClick={() => setIsInsuranceModalOpen(true)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DollarSign className="w-5 h-5 mr-2" />
                          Edit Insurance Coverage
                        </button>

                        {/* States Selection */}
                        <div className="mt-4">
                          <label className="block text-sm text-gray-600 mb-2">
                            States Served
                          </label>
                          
                          {/* Display currently selected states */}
                          {providerState.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {providerState.map((stateName) => (
                                <div key={stateName} className="bg-green-100 text-green-800 px-3 py-1 rounded-md flex items-center">
                                  <span>{stateName}</span>
                                  <X 
                                    className="ml-2 w-4 h-4 cursor-pointer hover:text-red-600" 
                                    onClick={() => {
                                      // Remove the state
                                      setProviderState(prev => prev.filter(s => s !== stateName));
                                      
                                      // Remove associated counties
                                      setSelectedCounties(prev => prev.filter(c => c.state !== stateName));
                                      
                                      // Update active state if this was the active one
                                      if (activeStateForCounties === stateName) {
                                        const remainingStates = providerState.filter(s => s !== stateName);
                                        setActiveStateForCounties(remainingStates[0] || '');
                                      }
                                      
                                      toast.success(`Removed ${stateName} and associated counties`);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* State selection dropdown */}
                          <select
                            onChange={(e) => {
                              const newState = e.target.value;
                              if (newState && !providerState.includes(newState)) {
                                // Add the new state
                                setProviderState(prev => [...prev, newState]);
                                
                                // Set as active state for counties if no active state
                                if (!activeStateForCounties) {
                                  setActiveStateForCounties(newState);
                                }
                                
                                // Load counties for the new state
                                const stateData = availableStates.find(s => s.attributes.name === newState);
                                if (stateData) {
                                  fetchCountiesByState(stateData.id)
                                    .then(counties => {
                                      setAvailableCounties(prev => [...prev, ...counties]);
                                    })
                                    .catch(error => {
                                      toast.error(`Failed to load counties for ${newState}`);
                                    });
                                }
                              }
                            }}
                            className="block w-full px-3 py-2 rounded-lg border border-gray-300"
                            value="" // Reset to empty after selection
                          >
                            <option value="">Add a state...</option>
                            {availableStates
                              .filter(state => !providerState.includes(state.attributes.name))
                              .map((state) => (
                                <option key={state.id} value={state.attributes.name}>
                                  {state.attributes.name}
                                </option>
                              ))
                            }
                          </select>
                        </div>

                        {/* Counties Selection */}
                        <div className="mt-4">
                          <label className="block text-sm text-gray-600 mb-2">
                            Counties Served
                          </label>
                          
                          {/* State selector for counties */}
                          {providerState.length > 0 && (
                            <div className="mb-3">
                              <label className="block text-xs text-gray-500 mb-1">
                                Select state to manage counties:
                              </label>
                              <select
                                value={activeStateForCounties}
                                onChange={(e) => setActiveStateForCounties(e.target.value)}
                                className="block w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                              >
                                {providerState.map((stateName) => (
                                  <option key={stateName} value={stateName}>
                                    {stateName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Counties for selected state */}
                          {activeStateForCounties && (
                            <>
                              <label className="block text-sm text-gray-600 mb-2">
                                Counties for {activeStateForCounties}
                              </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {selectedCounties
                                  .filter(county => {
                                    const countyData = availableCounties.find(c => c.id === county.county_id);
                                    return countyData?.attributes.state === activeStateForCounties;
                                  })
                                  .map((county) => (
                                    <div key={county.county_id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                                      <span>{county.county_name}</span>
                                      <X 
                                        className="ml-2 w-4 h-4 cursor-pointer" 
                                        onClick={() => {
                                          setSelectedCounties(prev => prev.filter(c => c.county_id !== county.county_id));
                                        }}
                                      />
                                    </div>
                                ))}
                              </div>
                              
                              {/* Add county dropdown */}
                              <select
                                onChange={(e) => {
                                  const [id, name] = e.target.value.split('|');
                                  if (id && name && !selectedCounties.some(c => c.county_id === parseInt(id))) {
                                    setSelectedCounties(prev => [...prev, { 
                                      county_id: parseInt(id), 
                                      county_name: name,
                                      state: activeStateForCounties // Add state association
                                    }]);
                                  }
                                }}
                                className="block w-full px-3 py-2 rounded-lg border border-gray-300"
                                value="" // Reset to empty after selection
                              >
                                <option value="">Add a {activeStateForCounties} county...</option>
                                {availableCounties
                                  .filter(county => 
                                    county.attributes.state === activeStateForCounties &&
                                    !selectedCounties.some(c => c.county_id === county.id)
                                  )
                                  .map((county) => (
                                    <option key={county.id} value={`${county.id}|${county.attributes.name}`}>
                                      {county.attributes.name}
                                    </option>
                                  ))
                                }
                              </select>
                              
                              {/* Add All Counties Button */}
                              {availableCounties.filter(county => 
                                county.attributes.state === activeStateForCounties &&
                                !selectedCounties.some(c => c.county_id === county.id)
                              ).length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const countiesToAdd = availableCounties
                                      .filter(county => 
                                        county.attributes.state === activeStateForCounties &&
                                        !selectedCounties.some(c => c.county_id === county.id)
                                      )
                                      .map(county => ({
                                        county_id: county.id,
                                        county_name: county.attributes.name,
                                        state: activeStateForCounties // Add state association
                                      }));
                                    
                                    setSelectedCounties(prev => [...prev, ...countiesToAdd]);
                                    
                                    toast.success(`Added ${countiesToAdd.length} counties for ${activeStateForCounties}`, {
                                      position: "top-right",
                                      autoClose: 3000,
                                    });
                                  }}
                                  className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 border border-green-300 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  <MapPin className="w-4 h-4 mr-2" />
                                  Add All {activeStateForCounties} Counties ({availableCounties.filter(county => 
                                    county.attributes.state === activeStateForCounties &&
                                    !selectedCounties.some(c => c.county_id === county.id)
                                  ).length})
                                </button>
                              )}
                            </>
                          )}
                          
                          {!activeStateForCounties && providerState.length > 0 && (
                            <p className="text-sm text-gray-500">Please select a state above to manage counties</p>
                          )}
                          
                          {providerState.length === 0 && (
                            <p className="text-sm text-gray-500">Please add states first</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="max-w-[1200px] mx-auto px-4">
                <div className="flex justify-end space-x-4 bg-white p-4 border-t mt-6 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      if (provider?.attributes) {
                        setEditedProvider(provider.attributes);
                        setSelectedCounties(provider.attributes.counties_served || []);
                        setSelectedInsurances(provider.attributes.insurance || []);
                        setLocations(provider.attributes.locations.map(location => ({
                          ...location,
                          services: location.services || [],
                          // Convert old boolean waitlist values to new descriptive string format
                          in_home_waitlist: typeof location.in_home_waitlist === 'boolean' 
                            ? (location.in_home_waitlist ? "Contact for availability" : "No waitlist")
                            : location.in_home_waitlist || "Contact for availability",
                          in_clinic_waitlist: typeof location.in_clinic_waitlist === 'boolean'
                            ? (location.in_clinic_waitlist ? "Contact for availability" : "No waitlist")
                            : location.in_clinic_waitlist || "Contact for availability"
                        })) || []);
                        setSelectedProviderTypes(provider.attributes.provider_type || []);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Modals */}
              {isInsuranceModalOpen && (
                <InsuranceModal
                  isOpen={isInsuranceModalOpen}
                  onClose={() => setIsInsuranceModalOpen(false)}
                  selectedInsurances={selectedInsurances}
                  onInsurancesChange={handleInsurancesChange}
                  providerInsurances={provider.attributes.insurance || []}
                />
              )}

              {isCountiesModalOpen && (
                <CountiesModal
                  isOpen={isCountiesModalOpen}
                  onClose={() => setIsCountiesModalOpen(false)}
                  selectedCounties={selectedCounties}
                  onCountiesChange={handleCountiesChange}
                  availableCounties={availableCounties.filter(county => 
                    county.attributes.state === activeStateForCounties
                  )}
                  currentState={activeStateForCounties}
                  states={providerState}
                  onStateChange={setActiveStateForCounties}
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminEdit;
