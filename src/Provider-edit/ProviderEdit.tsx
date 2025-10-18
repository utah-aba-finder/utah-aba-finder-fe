import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../Provider-login/AuthProvider";
import Dashboard from "./components/Dashboard";
import EditLocation from "./components/EditLocation";
import LocationManagement from "./components/LocationManagement";
import { AuthModal } from "./AuthModal";
import {
  Building2,
  LogOut,
  Menu,
  X,
  BarChart,
  MapPin,
  DollarSign,
  Tag,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { ProviderData, ProviderAttributes } from "../Utility/Types";
import { fetchStates, fetchCountiesByState, uploadProviderLogo, removeProviderLogo, fetchPracticeTypes, PracticeType } from "../Utility/ApiCall";
import InsuranceModal from "./InsuranceModal";
import CountiesModal from "./CountiesModal";

interface ProviderEditProps {
  loggedInProvider: ProviderData;
  clearProviderData: () => void;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
}

const ProviderEdit: React.FC<ProviderEditProps> = ({
  loggedInProvider,
  clearProviderData,
  onUpdate,
}) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  
  // Get auth context for multi-provider support
  const { activeProvider, token, currentUser } = useAuth();
  
  // Local state for the currently edited provider
  const [currentProvider, setCurrentProvider] = useState<ProviderData | null>(null);
  const [editedProvider, setEditedProvider] = useState<ProviderAttributes | null>(null);
  const [providerState, setProviderState] = useState<string[]>([]);
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>('');
  const [selectedCounties, setSelectedCounties] = useState<any[]>([]);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<any[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<any[]>([]);
  const [practiceTypes, setPracticeTypes] = useState<PracticeType[]>([]);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCounties, setAvailableCounties] = useState<any[]>([]);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  // Enhanced common fields state (matching registration form structure)
  const [commonFields, setCommonFields] = useState({
    contact_phone: '',
    website: '',
    service_areas: [] as string[],
    waitlist_status: '',
    additional_notes: '',
    primary_address: {
      street: '',
      suite: '',
      city: '',
      state: '',
      zip: '',
      phone: ''
    },
    service_delivery: {
      in_clinic: false,
      in_home: false,
      telehealth: false
    }
  });

  // Track the previous provider ID to detect actual switches
  const previousProviderId = useRef<number | null>(null);

  // Add beforeunload event handler to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      const hasUnsavedChanges = editedProvider && currentProvider && 
        JSON.stringify(editedProvider) !== JSON.stringify(currentProvider.attributes);
      
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editedProvider, currentProvider]);

  // Helper function to extract user ID from token
  const extractUserId = useCallback(() => {
    // First try to get the user ID from currentUser (most reliable)
    if (currentUser?.id) {
      return currentUser.id.toString();
    }
    
    // Fallback to token decoding
    if (token) {
      // Check if token is already a user ID
      if (/^\d+$/.test(token)) {
        return token;
      }
      
      // Try to decode as JWT token
      try {
        const decodedToken = JSON.parse(atob(token));
        const userId = decodedToken.id?.toString();
        if (userId) {
          return userId;
        }
      } catch (e) {
        // console.log('🔍 ProviderEdit: Could not decode token'); // Removed excessive logging
      }
    }
    
    // Last resort - this should not happen if auth is working properly
    console.error('❌ ProviderEdit: No user ID available for authorization');
    return null;
  }, [currentUser?.id, token]);

  // Handler for common field changes
  const handleCommonFieldChange = useCallback((field: string, value: any) => {
    setCommonFields(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handler for nested common field changes (like service_delivery)
  const handleNestedCommonFieldChange = useCallback((parentField: keyof typeof commonFields, field: string, value: any) => {
    setCommonFields(prev => {
      const parentValue = prev[parentField];
      if (typeof parentValue === 'object' && parentValue !== null) {
        return {
          ...prev,
          [parentField]: {
            ...parentValue,
            [field]: value
          }
        };
      }
      return prev;
    });
  }, []);

  // Debug effect to track activeProvider changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    
    // If activeProvider has valid data but currentProvider doesn't match, force an update
    if (activeProvider && activeProvider.id && activeProvider.id !== currentProvider?.id) {
      
      // Force an update by calling handleProviderSwitchWithData directly
      if (activeProvider.attributes) {
        handleProviderSwitchWithData(activeProvider);
      } else {

      }
    }
  }, [activeProvider, currentProvider?.id]);
  
  // Sync currentProvider with activeProvider from auth context
  // previousProviderId.current = useRef<number | null>(null); // This line is removed as it's now in the component level
  
  // Main provider switching useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    
    // Check if we actually need to do anything
    if (!activeProvider) {
      return;
    }
    
    // Check if this is just a re-render with the same provider data
    if (activeProvider.id === previousProviderId.current && 
        activeProvider.id === currentProvider?.id) {
      return;
    }
    
    // Check if we need to switch providers (either different provider or currentProvider is out of sync)
    const needsProviderSwitch = activeProvider.id !== currentProvider?.id;
    
    if (needsProviderSwitch) {
      
      // Check if we have the full provider data with attributes
      if (!activeProvider.attributes) {

        
        // Don't try to fetch data here - let the AuthProvider handle it
        // The AuthProvider should always provide complete data with attributes
        return;
      }
      
      // If we have attributes, proceed with the provider switch
      handleProviderSwitchWithData(activeProvider);
    } else {

    }
  }, [activeProvider, currentProvider?.id, loggedInProvider.id]);
  
  // Helper function to handle provider switching with data
  const handleProviderSwitchWithData = (providerData: any) => {
    
    // Always update the state to ensure data consistency
    // Even if it's the "same" provider, the data might be different or more complete
    
    // Convert the provider data to the format expected by ProviderEdit
      const newProviderData: ProviderData = {
      id: providerData.id,
      type: providerData.type,
      states: providerData.states || [],
        attributes: {
        id: providerData.id,
        states: providerData.states || [],
        password: '',
        username: providerData.attributes?.email || providerData.email || '',
        name: providerData.attributes?.name || providerData.name || '',
        email: providerData.attributes?.email || providerData.email || '',
        website: providerData.attributes?.website || providerData.website || '',
        cost: providerData.attributes?.cost || providerData.cost || '',
        min_age: providerData.attributes?.min_age || providerData.min_age || null,
        max_age: providerData.attributes?.max_age || providerData.max_age || null,
        waitlist: providerData.attributes?.waitlist || providerData.waitlist || null,
        telehealth_services: providerData.attributes?.telehealth_services || providerData.telehealth_services || null,
        spanish_speakers: providerData.attributes?.spanish_speakers || providerData.spanish_speakers || null,
        at_home_services: providerData.attributes?.at_home_services || providerData.at_home_services || null,
        in_clinic_services: providerData.attributes?.in_clinic_services || providerData.in_clinic_services || null,
        provider_type: providerData.attributes?.provider_type || providerData.provider_type || [],
        insurance: providerData.attributes?.insurance || providerData.insurance || [],
        counties_served: providerData.attributes?.counties_served || providerData.counties_served || [],
        locations: providerData.attributes?.locations || providerData.locations || [],
        logo: providerData.attributes?.logo || providerData.logo || null,
        updated_last: providerData.attributes?.updated_last || providerData.updated_last || null,
        status: providerData.attributes?.status || providerData.status || null,
        in_home_only: providerData.attributes?.in_home_only || providerData.in_home_only || false,
        service_delivery: providerData.attributes?.service_delivery || providerData.service_delivery || { in_home: false, in_clinic: false, telehealth: false }
      }
    };
    
    
      setCurrentProvider(newProviderData);
    previousProviderId.current = providerData.id;
      
    // Always update all local state variables to match the new provider data
    
    // Update all local state variables to match the new provider
      setEditedProvider(newProviderData.attributes);
      setProviderState(newProviderData.states || []);
    setActiveStateForCounties(newProviderData.states?.[0] || '');
      setSelectedCounties(newProviderData.attributes.counties_served || []);
      setSelectedProviderTypes(newProviderData.attributes.provider_type || []);
      setSelectedInsurances(newProviderData.attributes.insurance || []);
      setSelectedLogoFile(null);
    
    // Initialize common fields with provider data
    setCommonFields({
      contact_phone: newProviderData.attributes.contact_phone || '',
      website: newProviderData.attributes.website || '',
      service_areas: newProviderData.attributes.service_areas || [],
      waitlist_status: newProviderData.attributes.waitlist_status || '',
      additional_notes: newProviderData.attributes.additional_notes || '',
      primary_address: newProviderData.attributes.primary_address || {
        street: '',
        suite: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
      },
      service_delivery: newProviderData.attributes.service_delivery || {
        in_clinic: false,
        in_home: false,
        telehealth: false
      }
    });
    
    // Reset form state when switching providers
    setSelectedTab("dashboard");
    setIsOpen(false);
    
  };

  // Also sync when loggedInProvider changes (for initial load)
  useEffect(() => {
    if (loggedInProvider && !currentProvider) {
      const initialProviderData: ProviderData = {
        ...loggedInProvider,
        attributes: {
          ...loggedInProvider.attributes,
          provider_type: loggedInProvider.attributes.provider_type || [],
          insurance: loggedInProvider.attributes.insurance || [],
          counties_served: loggedInProvider.attributes.counties_served || [],
          locations: loggedInProvider.attributes.locations || [],
        }
      };
      setCurrentProvider(initialProviderData);
      setEditedProvider(initialProviderData.attributes);
      setProviderState(initialProviderData.states || []);
      setSelectedCounties(initialProviderData.attributes.counties_served || []);
      setSelectedProviderTypes(initialProviderData.attributes.provider_type || []);
      setSelectedInsurances(initialProviderData.attributes.insurance || []);
      setSelectedLogoFile(null);
      previousProviderId.current = initialProviderData.id;
      
      // Initialize common fields with initial provider data
      setCommonFields({
        contact_phone: initialProviderData.attributes.contact_phone || '',
        website: initialProviderData.attributes.website || '',
        service_areas: initialProviderData.attributes.service_areas || [],
        waitlist_status: initialProviderData.attributes.waitlist_status || '',
        additional_notes: initialProviderData.attributes.additional_notes || '',
        primary_address: initialProviderData.attributes.primary_address || {
          street: '',
          suite: '',
          city: '',
          state: '',
          zip: '',
          phone: ''
        },
        service_delivery: initialProviderData.attributes.service_delivery || {
          in_clinic: false,
          in_home: false,
          telehealth: false
        }
      });
    }
  }, [loggedInProvider, currentProvider]);
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    toast.dismiss("session-warning");
    toast.info("Logging out...", {
      toastId: "logging-out",
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      logout('manual');
      clearProviderData();
    }, 2000);
  }, [logout, clearProviderData]);

  const refreshProviderData = useCallback(async () => {
    try {
      
      
      // Check if we have a valid token for authorization
      if (!token) {
        console.error('🔍 ProviderEdit: No JWT token available for authorization');
        toast.error('Failed to refresh provider data - no authentication token');
        return;
      }
      
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${currentProvider?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser?.id?.toString() || ''}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ProviderEdit: Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const providerData = data.data?.[0] || {};
      
      
      
      // Ensure we have all required properties with defaults
      const updatedProvider: ProviderData = {
        id: providerData.id || currentProvider?.id || 0,
        type: providerData.type || 'Provider',
        states: providerData.states || [],
        attributes: {
          id: providerData.id || currentProvider?.id || 0,
          states: providerData.states || [],
          password: '',
          username: providerData.attributes?.email || providerData.email || '',
          name: providerData.attributes?.name || providerData.name || '',
          email: providerData.attributes?.email || providerData.email || '',
          website: providerData.attributes?.website || providerData.website || '',
          logo: providerData.attributes?.logo || providerData.logo || null,
          provider_type: providerData.attributes?.provider_type || [],
          insurance: providerData.attributes?.insurance || [],
          counties_served: providerData.attributes?.counties_served || [],
          locations: providerData.attributes?.locations || [],
          cost: providerData.attributes?.cost || null,
          min_age: providerData.attributes?.min_age || null,
          max_age: providerData.attributes?.max_age || null,
          waitlist: providerData.attributes?.waitlist || null,
          telehealth_services: providerData.attributes?.telehealth_services || null,
          spanish_speakers: providerData.attributes?.spanish_speakers || null,
          at_home_services: providerData.attributes?.at_home_services || null,
          in_clinic_services: providerData.attributes?.in_clinic_services || null,
          updated_last: providerData.attributes?.updated_last || null,
          status: providerData.attributes?.status || null,
          in_home_only: providerData.attributes?.in_home_only || false,
          service_delivery: providerData.attributes?.service_delivery || { in_home: false, in_clinic: false, telehealth: false }
        }
      };
      
      setCurrentProvider(updatedProvider);
      setEditedProvider(updatedProvider.attributes);
      setProviderState(updatedProvider.states || []);
      setSelectedCounties(updatedProvider.attributes.counties_served || []);
      setSelectedProviderTypes(updatedProvider.attributes.provider_type || []);
      setSelectedInsurances(updatedProvider.attributes.insurance || []);
      setSelectedLogoFile(null);
      
      toast.success('Provider data refreshed successfully');
    } catch (error) {
      console.error('🔍 ProviderEdit: Error in refreshProviderData:', error);
      toast.error('Failed to refresh provider data');
    }
  }, [currentProvider?.id, currentUser?.id, token]);

  // Initialize provider state and fetch counties for saved states
  useEffect(() => {
    const initializeStatesAndCounties = async () => {
      try {
        // Fetch all available states
        const states = await fetchStates();
        setAvailableStates(states);

        // Get the provider's saved states
        const savedStates = activeProvider?.states || loggedInProvider?.states || [];
        setProviderState(savedStates);

        // If there are saved states, set the first one as active and fetch counties
        if (savedStates.length > 0) {
          setActiveStateForCounties(savedStates[0]);
          
          // Fetch counties for all saved states
          const stateIds = states
            .filter(s => savedStates.includes(s.attributes.name))
            .map(s => s.id);
          
          const countiesPromises = stateIds.map(id => fetchCountiesByState(id));
          const countiesResults = await Promise.all(countiesPromises);
          const allCounties = countiesResults.flat();
          setAvailableCounties(allCounties);
        }
      } catch (error) {
  
        toast.error('Failed to load states and counties');
      }
    };

    initializeStatesAndCounties();
  }, [activeProvider?.states, loggedInProvider?.states]); // Update dependency to use correct path

  // Update provider data when loggedInProvider changes
  // useEffect(() => {
  //   setCurrentProvider({
  //     ...loggedInProvider,
  //     attributes: {
  //       ...loggedInProvider.attributes,
  //       provider_type: loggedInProvider.attributes.provider_type || [],
  //       insurance: loggedInProvider.attributes.insurance || [],
  //       counties_served: loggedInProvider.attributes.counties_served || [],
  //       locations: loggedInProvider.attributes.locations || [],
  //     }
  //   });
  //   setProviderState(loggedInProvider.states || []);
  //   setSelectedCounties(loggedInProvider.attributes.counties_served || []);
  //   setSelectedProviderTypes(loggedInProvider.attributes.provider_type || []);
  //   setSelectedInsurances(loggedInProvider.attributes.insurance || []);
  //   setSelectedLogoFile(null);
  // }, [loggedInProvider]);

  useEffect(() => {
    const hideAuthModal = localStorage.getItem("hideAuthModal");
    if (hideAuthModal === "true") {
      setAuthModalOpen(false);
    }
  }, []);

  // Fetch managed providers on component mount
  // Temporarily disabled due to 404 error on accessible_providers endpoint
  // useEffect(() => {
  //   fetchManagedProviders();
  // }, [fetchManagedProviders]);

  // Monitor accessible providers (silent)
  useEffect(() => {
    // Silent monitoring - no console output
  }, []);

  useEffect(() => {
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");
    if (tokenExpiry) {
      const updateSessionTime = () => {
        const timeLeft = Math.max(
          0,
          Math.floor((parseInt(tokenExpiry) - Date.now()) / 1000)
        );
        setSessionTimeLeft(timeLeft);

        if (timeLeft <= 300 && timeLeft > 0) {
          toast.warn(
            `Your session will expire in ${timeLeft} seconds. Please save your work.`,
            {
              toastId: "session-warning",
              position: "top-center",
              autoClose: false,
            }
          );
        } else if (timeLeft === 0) {
          toast.error("Your session has expired. Please log in again.", {
            toastId: "session-expired",
            position: "top-center",
            autoClose: false,
          });
          handleLogout();
        }
      };

      const timer = setInterval(updateSessionTime, 1000);
      return () => clearInterval(timer);
    }
  }, [handleLogout]);

  // Cleanup toasts when component unmounts
  React.useEffect(() => {
    return () => {
      toast.dismiss("session-warning");
      toast.dismiss("session-expired");
      toast.dismiss("session-warning-five-min");
      toast.dismiss("session-warning-one-min");
      toast.dismiss("inactivity-warning");
      toast.dismiss("inactivity-logout");
    };
  }, []);

  const handleProviderUpdate = useCallback(
    async (updatedAttributes: ProviderAttributes) => {
      setCurrentProvider((prev) => {
        if (!prev) return null;
        return {
        ...prev,
        attributes: updatedAttributes,
        };
      });

      await refreshProviderData();
      // Remove success toast from here since it's now in refreshProviderData
    },
    [refreshProviderData]
  );

  const handleShownModal = (hideModal: boolean) => {
    setAuthModalOpen(false);
    if (hideModal) {
      localStorage.setItem("hideAuthModal", "true");
    }
  };

  // Add this effect to handle state changes
  useEffect(() => {
    if (providerState.length > 0 && !activeStateForCounties) {
      setActiveStateForCounties(providerState[0]);
    }
  }, [providerState, activeStateForCounties]);

  useEffect(() => {
    const loadPracticeTypes = async () => {
      try {
        const response = await fetchPracticeTypes();
        setPracticeTypes(response.data);
      } catch (error) {
        console.error("Failed to load practice types:", error);
        toast.error("Failed to load practice types");
      }
    };
    loadPracticeTypes();
  }, []);

  const getProviderTypeId = (typeName: string): number => {
    const practiceType = practiceTypes.find(type => type.name === typeName);
    return practiceType?.id ?? 0; // Return 0 (invalid) for unknown types
  };

  const handleLogoUpload = async () => {
    if (!selectedLogoFile) {
      toast.error('Please select a logo file first');
      return;
    }

    try {
      setIsSaving(true);
      
      // Check if we have a valid token for authorization
      if (!token) {
        toast.error('No authentication token available');
        return;
      }

      // Use the corrected uploadProviderLogo function
      // For regular providers, isSuperAdmin should be false to use Bearer token
      const result = await uploadProviderLogo(currentProvider?.id || 0, selectedLogoFile, token, false);
      
      if (!result.success) {
        toast.error(`Failed to upload logo: ${result.error}`);
        return;
      }
      
      toast.success('Logo uploaded successfully!');
      setSelectedLogoFile(null);
      
      // Update both currentProvider and editedProvider states with the new logo
      if (result.updatedProvider?.data?.attributes?.logo) {
        const newLogoUrl = result.updatedProvider.data.attributes.logo;
        
        // Update currentProvider state
        setCurrentProvider(prev => prev ? {
          ...prev,
          attributes: {
            ...prev.attributes,
            logo: newLogoUrl
          }
        } : null);
        
        // Update editedProvider state to ensure logo is preserved in future saves
        setEditedProvider(prev => prev ? {
          ...prev,
          logo: newLogoUrl
        } : null);
        
        // console.log('🔍 Logo updated in state:', newLogoUrl); // Removed excessive logging
      }
      
      // Refresh provider data to get the new logo URL from backend
      await refreshProviderData();
      
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Ensure we preserve the current logo URL if it exists
      const currentLogo = currentProvider?.attributes?.logo || editedProvider?.logo || null;
      
      const updatedAttributes = {
        // Basic fields only - remove complex nested objects temporarily
        name: editedProvider?.name || '',
        email: editedProvider?.email || '',
        website: editedProvider?.website || '',
        logo: currentLogo || null,
        provider_type: selectedProviderTypes.map(type => ({ name: type.name })), // Send objects with name property as per API docs
        insurance: selectedInsurances.map(ins => ins.name || ins), // Send just names
        counties_served: selectedCounties.map(county => county.name || county), // Send just names
        states: providerState || [],
        // Add some fields that might be required by the backend
        status: editedProvider?.status || 'approved',
        in_home_only: editedProvider?.in_home_only || false,
        // Remove complex nested objects temporarily to test
        // primary_address: commonFields.primary_address,
        // service_delivery: commonFields.service_delivery,
        // locations: currentLocations,
        // services: currentLocations.map(location => location.services || []).flat(),
      };

      // Data type validation and cleaning
      const cleanedAttributes: any = {};
      Object.entries(updatedAttributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Ensure arrays are actually arrays
          if (Array.isArray(value)) {
            cleanedAttributes[key] = value.filter(item => item !== undefined && item !== null);
          } else {
            cleanedAttributes[key] = value;
          }
        }
      });

      // Essential debugging for provider_type issue
      console.log('🔍 ProviderEdit: Provider type being sent:', cleanedAttributes.provider_type);
      
      // Get the proper user ID for authorization using the existing helper
      const userId = extractUserId();

      if (!userId) {
        throw new Error('No user ID available for authorization');
      }

      // Use loggedInProvider ID as the primary source, fallback to currentProvider ID
      const providerId = loggedInProvider?.id || currentProvider?.id;
      
      if (!providerId) {
        throw new Error('No provider ID available for update');
      }

      // Check if this provider ID makes sense
      if (typeof providerId !== 'number' || providerId <= 0) {
        console.error('❌ ProviderEdit: Invalid provider ID:', providerId);
        throw new Error(`Invalid provider ID: ${providerId}`);
      }

      // Verify currentUser exists before proceeding
      if (!currentUser?.id) {
        throw new Error('No current user ID available for provider verification');
      }

      // Verify the provider exists before attempting update
      console.log('🔍 ProviderEdit: Verifying provider exists before update...');
      try {
        const verifyResponse = await fetch(
          `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${providerId}`,
          {
            headers: {
              'Authorization': `Bearer ${currentUser.id.toString()}`,
            },
          }
        );
        
        if (!verifyResponse.ok) {
          if (verifyResponse.status === 404) {
            throw new Error(`Provider ID ${providerId} does not exist in the database`);
          } else {
            throw new Error(`Failed to verify provider: ${verifyResponse.status} ${verifyResponse.statusText}`);
          }
        }
        
        console.log('✅ ProviderEdit: Provider verified successfully');
      } catch (verifyError) {
        console.error('❌ ProviderEdit: Provider verification failed:', verifyError);
        throw verifyError;
      }

      // Determine which endpoint to use based on what provider is being edited
      // Use the correct provider_self endpoint as per API documentation
      const apiEndpoint = 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_self';
      
      console.log('🔍 ProviderEdit: Using API endpoint:', apiEndpoint);

      const requestBody = {
        data: [{
          id: providerId, // Add the provider ID so backend knows which provider to update
          attributes: cleanedAttributes,
        }]
      };

      // Debug: Log the exact data being sent to help debug 500 error
      console.log('🔍 ProviderEdit: Full request body being sent:', requestBody);
      console.log('🔍 ProviderEdit: Provider type in request:', cleanedAttributes.provider_type);
      console.log('🔍 ProviderEdit: Insurance in request:', cleanedAttributes.insurance);
      console.log('🔍 ProviderEdit: Counties in request:', cleanedAttributes.counties_served);

      // Step 1: Set the active provider context before updating (optional - don't fail if it doesn't work)
      // Removed provider context call due to 403 errors - going straight to provider update
      /*
      try {
        const contextResponse = await fetch(
          'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_context',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentUser.id.toString()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ provider_id: providerId })
          }
        );

        if (contextResponse.ok) {
          console.log('✅ ProviderEdit: Active provider context set successfully');
        } else {
          const contextErrorText = await contextResponse.text();
          console.warn('⚠️ ProviderEdit: Failed to set active provider context:', contextResponse.status, contextErrorText);
        }
      } catch (contextError) {
        console.warn('⚠️ ProviderEdit: Error setting provider context:', contextError);
      }
      */

      const response = await fetch(
        apiEndpoint,
        {
          method: "PATCH", // Use PATCH method as specified in API documentation
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${currentUser.id.toString()}`, // Use user ID with Bearer prefix for backend authentication
          },
          body: JSON.stringify(requestBody),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ProviderEdit: Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      
      // Only call onUpdate if we have valid data
      if (responseData.data?.attributes) {
        onUpdate(responseData.data.attributes);
      }
      
      // Try to refresh data, but don't fail if it doesn't work
      // Only refresh if we're not in the middle of editing the same provider
      try {
        // Only refresh if we're dealing with a different provider or if explicitly needed
        if (responseData.data?.id !== currentProvider?.id) {
        await refreshProviderData();
        } else {
          // Don't refresh if we're editing the same provider
        }
      } catch (refreshError) {
        // Don't fail the save operation if refresh fails
      }
      
      // Show success toast only after everything is complete
      toast.success("Changes saved successfully!");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save changes: ${errorMessage}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Check if we have a valid provider to work with
  const hasValidProvider = currentProvider && currentProvider.id && Number(currentProvider.id) > 0;
  
  if (!hasValidProvider) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading provider data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we load your information...</p>
        </div>
      </div>
    );
  }

  // Don't hide the entire page while saving - just show a loading indicator
  // if (isSaving) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  const renderSessionWarning = () => {
    if (sessionTimeLeft && sessionTimeLeft <= 300) {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            Session expires in: {Math.floor(sessionTimeLeft / 60)}:
            {(sessionTimeLeft % 60).toString().padStart(2, "0")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Floating Header */}
          <header className="sticky top-0 z-30 px-2">
            <div className="bg-white shadow-lg rounded-lg mx-2 mt-4 mb-2">
              <div className="p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Menu Button */}
                    <button
                      className="flex-shrink-0 md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsOpen(true)}
                      aria-label="Open menu"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    
                    {/* Title - Responsive */}
                    <div className="text-lg font-semibold truncate min-w-0 flex-1">
                      {selectedTab === "dashboard" && "Provider Dashboard"}
                      {selectedTab === "edit" && "Edit Provider Details"}
                      {selectedTab === "details" && "Provider Logo"}
                      {selectedTab === "coverage" && "Coverage & Counties"}
                      {selectedTab === "locations" && "Location Management"}
                      {selectedTab === "provider-types" && "Provider Services"}
                      {selectedTab === "common-fields" && "Contact & Services"}
                      {selectedTab === "billing" && "Billing Management"}
                    </div>
                    
                    {/* Saving indicator */}
                    {isSaving && (
                      <div className="flex items-center space-x-2 text-blue-600 flex-shrink-0">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium hidden sm:inline">Saving...</span>
                      </div>
                    )}
                  </div>
                  {/* Provider Info and Actions - Mobile Optimized */}
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    {/* Provider Logo - Hidden on small screens */}
                    <div className="hidden sm:block">
                      {currentProvider?.attributes?.logo ? (
                        <div className="flex-shrink-0">
                          <img
                            src={currentProvider.attributes.logo}
                            alt={`${currentProvider.attributes.name} logo`}
                            className="w-12 h-12 object-contain rounded border border-gray-200 shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-400 text-lg">📷</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Provider Info - Responsive */}
                    <div className="text-right min-w-0 hidden sm:block">
                      <div className="text-sm font-medium text-gray-700 truncate max-w-[120px] lg:max-w-none">
                        {currentProvider?.attributes?.name || 'Unknown Provider'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedTab === 'dashboard' ? 'Dashboard View' : 'Edit Mode'}
                      </div>
                    </div>
                    
                    {/* Logout Button - Mobile Optimized */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 sm:px-3 sm:py-2 rounded-lg transition-colors duration-200"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

    <div className="flex">
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          bg-white shadow-lg w-80 md:w-64 flex flex-col
          fixed md:static h-[calc(100vh-2rem)] my-4 mx-0 md:mx-4
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 z-40
        `}
      >
        {/* Dashboard Header */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-[#4A6FA5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ASL</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Provider Panel</span>
                {isSaving && (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span className="text-xs text-white opacity-80">Saving</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile Logout Button */}
              <button 
                onClick={handleLogout}
                className="md:hidden flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded transition-colors duration-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              {/* Mobile Close Button */}
            <button className="md:hidden" onClick={() => setIsOpen(false)}>
              <X className="ml-2 w-4 h-4 cursor-pointer" />
            </button>
          </div>
        </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 flex flex-col justify-center gap-4 py-2 px-4">
          <button
            onClick={() => setSelectedTab("dashboard")}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                selectedTab === "dashboard"
                  ? "bg-[#4A6FA5] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <BarChart className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => setSelectedTab("edit")}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                selectedTab === "edit"
                  ? "bg-[#4A6FA5] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Basic Details</span>
          </button>

          <button
                onClick={() => setSelectedTab("details")}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                    selectedTab === "details"
                  ? "bg-[#4A6FA5] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Provider Logo</span>
          </button>

          <button
                onClick={() => setSelectedTab("provider-types")}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                    selectedTab === "provider-types"
                  ? "bg-[#4A6FA5] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
                <Tag className="w-4 h-4" />
            <span className="text-sm">Provider Services</span>
          </button>

          <button
            onClick={() => setSelectedTab("common-fields")}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                selectedTab === "common-fields"
                  ? "bg-[#4A6FA5] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Contact & Services</span>
          </button>

          <button
            onClick={() => setSelectedTab("coverage")}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                selectedTab === "coverage"
                  ? "bg-[#4A6FA5] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Coverage Area</span>
          </button>

                  <button
                    onClick={() => setSelectedTab("locations")}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                      transition-colors duration-200
                      ${
                        selectedTab === "locations"
                          ? "bg-[#4A6FA5] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Locations</span>
              </button>

              <button
                onClick={() => setSelectedTab("insurance")}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  transition-colors duration-200
                  ${
                    selectedTab === "insurance"
                      ? "bg-[#4A6FA5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Insurance</span>
              </button>
            </nav>

            {/* Sidebar Footer - Removed logout button, now in header */}
          </aside>

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col min-w-0 h-screen">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 max-w-none">
              {/* Tab Navigation */}
              {selectedTab === "dashboard" && (
                <Dashboard key={currentProvider?.id} provider={currentProvider} />
              )}
              {selectedTab === "edit" && (
                <>
                  <EditLocation
                        key={currentProvider?.id}
                    provider={currentProvider}
                    onUpdate={handleProviderUpdate}
                  />
                </>
              )}
              {selectedTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Billing Management
                    </h2>
                    <p className="text-gray-600">
                      Billing features coming soon...
                    </p>
                  </div>
                </div>
              )}
              {selectedTab === "details" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Provider Logo</h2>
                    
                    {/* Logo Upload */}
                    <div className="mb-6">
                      <label className="block text-sm text-gray-600 mb-2">Provider Logo</label>
                      <div className="space-y-4">
                        {/* Current Logo Display */}
                            <div className="mb-6">
                              <p className="text-sm text-gray-600 mb-3">Current Logo:</p>
                              
                          {currentProvider?.attributes?.logo ? (
                                <div className="space-y-3">
                                  <div className="flex justify-center">
                              <img 
                                src={currentProvider.attributes.logo} 
                                alt="Current Provider Logo" 
                                      className="w-48 h-48 object-contain border border-gray-300 rounded-lg shadow-sm"
                                onError={(e) => {
                                  console.error('🔍 Logo image failed to load:', currentProvider.attributes.logo);
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                                onLoad={() => {
                                  console.log('🔍 Logo image loaded successfully:', currentProvider.attributes.logo);
                                }}
                              />
                              </div>
                                  <div className="text-center">
                              <div className="text-xs text-gray-500">
                                      ✅ Logo successfully uploaded
                                    </div>
                              </div>
                            </div>
                          ) : (
                                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                              <div className="text-center">
                                    <div className="text-gray-400 text-4xl mb-2">📷</div>
                                    <div className="text-sm text-gray-500">No logo uploaded</div>
                                    <div className="text-xs text-gray-400 mt-1">Upload a logo to display here</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* File upload input */}
                        <div className="space-y-4">
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                
                                if (file) {
                                  // Validate file size (5MB limit)
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast.error('File size must be less than 5MB');
                                    return;
                                  }
                                  
                                  // Validate file type
                                  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
                                  if (!allowedTypes.includes(file.type)) {
                                    toast.error('Please select a PNG, JPEG, or GIF file');
                                    return;
                                  }
                                  
                                  setSelectedLogoFile(file);
                                  toast.success('Logo file selected successfully');
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
                          
                          {selectedLogoFile && (
                            <button
                              onClick={handleLogoUpload}
                              disabled={isSaving}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {isSaving ? "Uploading..." : "Upload Logo"}
                            </button>
                          )}
                          
                          {/* Logo removal button */}
                          {currentProvider?.attributes?.logo && (
                            <button
                              onClick={async () => {
                                try {
                                  setIsSaving(true);
                                  
                                  // Check if we have a valid token for authorization
                                  if (!token) {
                                    toast.error('No authentication token available');
                                    return;
                                  }

                                  // Use the corrected removeProviderLogo function
                                  const result = await removeProviderLogo(currentProvider?.id || 0, token);
                                  
                                  if (!result.success) {
                                    toast.error(`Failed to remove logo: ${result.error}`);
                                    return;
                                  }
                                  
                                  toast.success('Logo removed successfully!');
                                  
                                  // Update local state to remove the logo
                                  setCurrentProvider(prev => prev ? {
                                    ...prev,
                                    attributes: {
                                      ...prev.attributes,
                                      logo: null
                                    }
                                  } : null);
                                  
                                  await refreshProviderData();
                                } catch (error) {
                                  console.error('Logo removal error:', error);
                                  toast.error('Failed to remove logo. Please try again.');
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              disabled={isSaving}
                              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {isSaving ? "Removing..." : "Remove Current Logo"}
                            </button>
                          )}
                          
                          <p className="text-xs text-gray-500">
                            Supported formats: PNG, JPEG, GIF. Max size: 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                    
                                         {/* Provider Services - Removed duplicate, kept in provider-types tab */}
                  </div>

                  {/* Save and Discard Buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedProviderTypes(loggedInProvider.attributes.provider_type || []);
                        toast.info("Provider types changes discarded");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={async () => {
                        await handleSaveChanges();
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
              {selectedTab === "provider-types" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                                           <h3 className="text-sm font-medium text-gray-700 mb-4">Provider Services</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(selectedProviderTypes || []).map((type) => (
                        <div key={type?.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {type?.name || 'Unknown'}
                          <button
                            onClick={() => setSelectedProviderTypes(prev => prev.filter(t => t.id !== type.id))}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <select
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value=""
                      onChange={(e) => {
                        const typeName = e.target.value;
                        if (typeName && !selectedProviderTypes.some(t => t.name === typeName)) {
                          setSelectedProviderTypes(prev => [...prev, {
                            id: getProviderTypeId(typeName),
                            name: typeName
                          }]);
                        }
                      }}
                    >
                      <option value="">Add provider type...</option>
                      {practiceTypes
                        .filter(type => !selectedProviderTypes.some(t => t.name === type.name))
                        .map(type => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                    </select>
                        
                        {/* Save and Discard Buttons */}
                        <div className="mt-6 flex justify-end space-x-4">
                          <button
                            onClick={() => {
                              setSelectedProviderTypes(loggedInProvider.attributes.provider_type || []);
                              toast.info("Provider types changes discarded");
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Discard Changes
                          </button>
                          <button
                            onClick={async () => {
                              await handleSaveChanges();
                            }}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                </div>
              )}
              {selectedTab === "common-fields" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Contact & Service Information</h2>
                    
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={commonFields.contact_phone || ''}
                          onChange={(e) => handleCommonFieldChange('contact_phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter contact phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={commonFields.website || ''}
                          onChange={(e) => handleCommonFieldChange('website', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    {/* Service Delivery Options */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Service Delivery Options</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={commonFields.service_delivery?.in_clinic || false}
                            onChange={(e) => handleNestedCommonFieldChange('service_delivery', 'in_clinic', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">In-Clinic Services</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={commonFields.service_delivery?.in_home || false}
                            onChange={(e) => handleNestedCommonFieldChange('service_delivery', 'in_home', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">In-Home Services</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={commonFields.service_delivery?.telehealth || false}
                            onChange={(e) => handleNestedCommonFieldChange('service_delivery', 'telehealth', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Telehealth Services</span>
                        </label>
                      </div>
                    </div>

                    {/* Waitlist Status */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Waitlist Status</label>
                      <select
                        name="waitlist_status"
                        value={commonFields.waitlist_status || ''}
                        onChange={(e) => handleCommonFieldChange('waitlist_status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select waitlist status...</option>
                        <option value="Currently accepting clients">Currently accepting clients</option>
                        <option value="Short waitlist">Short waitlist</option>
                        <option value="Long waitlist">Long waitlist</option>
                        <option value="Not accepting new clients">Not accepting new clients</option>
                      </select>
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                      <textarea
                        value={commonFields.additional_notes || ''}
                        onChange={(e) => handleCommonFieldChange('additional_notes', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter any additional information about your services..."
                      />
                    </div>

                    {/* Save and Discard Buttons */}
                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          // Reset to original values
                          setCommonFields({
                            contact_phone: currentProvider?.attributes?.contact_phone || '',
                            website: currentProvider?.attributes?.website || '',
                            service_areas: currentProvider?.attributes?.service_areas || [],
                            waitlist_status: currentProvider?.attributes?.waitlist_status || '',
                            additional_notes: currentProvider?.attributes?.additional_notes || '',
                            primary_address: currentProvider?.attributes?.primary_address || {
                              street: '',
                              suite: '',
                              city: '',
                              state: '',
                              zip: '',
                              phone: ''
                            },
                            service_delivery: currentProvider?.attributes?.service_delivery || {
                              in_clinic: false,
                              in_home: false,
                              telehealth: false
                            }
                          });
                          toast.info("Contact & service changes discarded");
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Discard Changes
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveChanges();
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedTab === "coverage" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Coverage Area</h2>
                    
                    {/* States Section */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Coverage States</label>
                        <>
                          {providerState.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {providerState.map((stateName) => (
                                <div
                                  key={stateName}
                                  className={`px-3 py-1 rounded-full text-sm flex items-center cursor-pointer justify-between ${activeStateForCounties === stateName ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
                                >
                                  <span
                                    onClick={() => {
                                      const stateData = availableStates.find(s => s.attributes.name === stateName);
                                      if (stateData) {
                                        const togglingTo = activeStateForCounties === stateName ? '' : stateName;
                                        setActiveStateForCounties(togglingTo);
                                        if (togglingTo) {
                                          fetchCountiesByState(stateData.id).then(counties => {
                                            setAvailableCounties(prev => {
                                              const filtered = prev.filter(c => c.attributes.state !== stateName);
                                              return [...filtered, ...counties];
                                            });
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    {stateName}
                                  </span>
                                  <X
                                    className="ml-2 h-4 w-4 cursor-pointer"
                                    onClick={() => {
                                      setProviderState(prev => prev.filter(s => s !== stateName));
                                      setSelectedCounties(prev => prev.filter(c => c.state !== stateName));
                                      if (activeStateForCounties === stateName) {
                                        setActiveStateForCounties('');
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mb-4">No states selected yet. Select states from the dropdown below.</p>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {providerState.length > 0 ? 'Add More States' : 'Select States'}
                            </label>
                            <select
                              onChange={async (e) => {
                                const selectedStateName = e.target.value;
                                if (selectedStateName && !providerState.includes(selectedStateName)) {
                                  const stateData = availableStates.find(s => s.attributes.name === selectedStateName);
                                  if (stateData) {
                                    setActiveStateForCounties(selectedStateName);
                                    setProviderState(prev => [...prev, selectedStateName]);
                                    const counties = await fetchCountiesByState(stateData.id);
                                    setAvailableCounties(prev => {
                                      const filtered = prev.filter(c => c.attributes.state !== selectedStateName);
                                      return [...filtered, ...counties];
                                    });
                                  }
                                }
                                e.target.value = '';
                              }}
                              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              value=""
                              disabled={false}
                            >
                              <option value="">Select a state...</option>
                              {availableStates
                                .filter(state => !providerState.includes(state.attributes.name))
                                .map(state => (
                                  <option key={state.id} value={state.attributes.name}>
                                    {state.attributes.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </>
                      </div>

                      {/* Counties Section */}
                      {activeStateForCounties && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Counties in {activeStateForCounties}</h3>
                          <div className="flex flex-wrap gap-2">
                            {availableCounties
                              .filter(county => county.attributes.state === activeStateForCounties)
                              .map(county => {
                                const isSelected = selectedCounties.some(c => c.county_id === county.id);
                                return (
                                  <div
                                    key={county.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        const remaining = selectedCounties.filter(c => c.county_id !== county.id);
                                        if (!remaining.some(c => c.state === activeStateForCounties)) {
                                          setSelectedCounties(prev => [...prev.filter(c => c.state !== activeStateForCounties), {
                                            county_id: 0,
                                            county_name: 'Contact us',
                                            state: activeStateForCounties,
                                          }]);
                                        } else {
                                          setSelectedCounties(remaining);
                                        }
                                      } else {
                                        setSelectedCounties(prev => [
                                          ...prev.filter(c => !(c.state === activeStateForCounties && c.county_name === 'Contact us')),
                                          {
                                            county_id: county.id,
                                            county_name: county.attributes.name,
                                            state: county.attributes.state,
                                          },
                                        ]);
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                  >
                                    <span>{county.attributes.name}</span>
                                    {isSelected && <X className="h-4 w-4 ml-2" />}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save and Discard Buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setProviderState(loggedInProvider.states || []);
                        setSelectedCounties(loggedInProvider.attributes.counties_served || []);
                        setActiveStateForCounties('');
                        toast.info("Coverage area changes discarded");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={async () => {
                        await handleSaveChanges();
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
                  {selectedTab === "locations" && (
                    <LocationManagement
                      key={currentProvider?.id}
                      providerId={currentProvider?.id || 0}
                      currentLocations={currentProvider?.attributes?.locations || []}
                      onLocationsUpdate={(locations) => {
                        // Update the currentProvider with new locations
                        if (currentProvider) {
                          const updatedProvider = {
                            ...currentProvider,
                            attributes: {
                              ...currentProvider.attributes,
                              locations: locations
                            }
                          };
                          setCurrentProvider(updatedProvider);
                        }
                      }}
                    />
              )}
              {selectedTab === "insurance" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Insurance Coverage</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedInsurances.map((insurance) => (
                        <div key={insurance.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {insurance.name}
                          <X 
                                className="ml-2 h-4 w-4 cursor-pointer" 
                            onClick={() => {
                              const updatedInsurance = selectedInsurances.filter(i => i.id !== insurance.id) || [];
                              setSelectedInsurances(updatedInsurance);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInsuranceModalOpen(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Edit Insurance Coverage
                    </button>
                  </div>

                  {/* Save and Discard Buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedInsurances(loggedInProvider.attributes.insurance || []);
                        toast.info("Insurance changes discarded");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={async () => {
                        await handleSaveChanges();
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
 
      {/* Floating Logout Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
      
      {/* Loading overlay removed - replaced with subtle header indicators */}
      
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          handleShownModal={handleShownModal}
        />
      )}
 
      {renderSessionWarning()}
 
      {isCountiesModalOpen && (
        <CountiesModal
          isOpen={isCountiesModalOpen}
          onClose={() => setIsCountiesModalOpen(false)}
          selectedCounties={selectedCounties}
          onCountiesChange={setSelectedCounties}
          availableCounties={availableCounties}
          currentState={activeStateForCounties}
          states={providerState}
          onStateChange={setActiveStateForCounties}
        />
      )}
 
      {isInsuranceModalOpen && (
        <InsuranceModal
          isOpen={isInsuranceModalOpen}
          onClose={() => setIsInsuranceModalOpen(false)}
          selectedInsurances={selectedInsurances}
          onInsurancesChange={(insurances) => {
            setSelectedInsurances(insurances);
            setIsInsuranceModalOpen(false);
          }}
          providerInsurances={selectedInsurances}
        />
      )}
    </div>
  );
};
 
export default ProviderEdit;
