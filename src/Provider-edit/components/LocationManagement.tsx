import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../Provider-login/AuthProvider';
import { Plus, Edit, Trash2, MapPin, Phone, Building2, X, AlertCircle, ChevronUp, ChevronDown, Star } from 'lucide-react';
import { Location, Service } from '../../Utility/Types';
import { fetchPracticeTypes, PracticeType } from '../../Utility/ApiCall';

interface LocationManagementProps {
  providerId: number;
  currentLocations: Location[];
  primaryLocationId?: number | null; // Primary location ID from provider.attributes.primary_location_id
  onLocationsUpdate: (locations: Location[]) => void;
  onPrimaryLocationChange?: (newPrimaryLocationId?: number | null) => void; // Optional callback with new primary location ID for optimistic update
}

interface LocationFormData {
  name: string;
  phone: string;
  address_1: string;
  city: string;
  state: string;
  zip: string;
}

const LocationManagement: React.FC<LocationManagementProps> = ({
  providerId,
  currentLocations,
  primaryLocationId,
  onLocationsUpdate,
  onPrimaryLocationChange
}) => {
  // Removed excessive logging that was causing performance issues
  // console.log('📍 LocationManagement component rendered - primaryLocationId:', primaryLocationId);
  
  const { currentUser } = useAuth();
  const [locations, setLocations] = useState<Location[]>(currentLocations || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // Removed debug logging to prevent console spam
  // useEffect(() => {
  //   console.log('📍 LocationManagement component mounted');
  //   console.log('📍 Primary location ID:', primaryLocationId);
  //   console.log('📍 Current locations:', locations.length);
  // }, []);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    phone: '',
    address_1: '',
    city: '',
    state: '',
    zip: ''
  });
  // Store practice_types as strings (canonical format) - no dependency on practiceTypes being loaded
  const [locationPracticeTypes, setLocationPracticeTypes] = useState<string[]>([]);
  const [practiceTypes, setPracticeTypes] = useState<PracticeType[]>([]);
  const initializedLocationIdRef = useRef<number | null>(null);

  // Update local state when prop changes
  // Use primary_location_id from backend (stable, database-backed) instead of array index
  // Use ref to track previous values and prevent infinite loops
  const prevLocationsRef = useRef<string>('');
  const prevPrimaryLocationIdRef = useRef<number | null | undefined>(undefined);
  
  useEffect(() => {
    // Create a stable string representation of locations to compare
    const currentLocationIds = (currentLocations || []).map(loc => loc.id).sort().join(',');
    const prevLocationIds = prevLocationsRef.current;
    const prevPrimaryId = prevPrimaryLocationIdRef.current;
    
    // Only update if locations or primaryLocationId actually changed
    if (currentLocationIds !== prevLocationIds || prevPrimaryId !== primaryLocationId) {
      // Normalize locations: Convert practice_types to services if needed
      const locationsWithPrimary = (currentLocations || []).map((loc: any) => {
        let services: Service[] = [];
        
        // Prefer services format (backend now provides this)
        if (loc.services && Array.isArray(loc.services) && loc.services.length > 0) {
          services = loc.services.map((s: any) => {
            if (typeof s === 'object' && s.id && s.name) {
              return { id: s.id, name: s.name };
            }
            if (typeof s === 'string') {
              const practiceType = practiceTypes.find(pt => pt.name === s);
              return practiceType ? { id: practiceType.id, name: practiceType.name } : { id: 0, name: s };
            }
            return null;
          }).filter((s: Service | null): s is Service => s !== null);
        }
        // Fallback: convert from practice_types if services not available
        else if (loc.practice_types && Array.isArray(loc.practice_types) && loc.practice_types.length > 0) {
          services = loc.practice_types
            .map((typeName: string) => {
              const practiceType = practiceTypes.find(pt => pt.name === typeName);
              // If practiceTypes not loaded yet, create a temporary service object with the name
              return practiceType ? { id: practiceType.id, name: practiceType.name } : { id: 0, name: typeName };
            })
            .filter((s: Service | null): s is Service => s !== null);
        }
        
        return {
          ...loc,
          services: services, // Always use normalized services array
          // Use primary flag from API response (backend provides this)
          // If not present, determine based on primaryLocationId prop
          primary: loc.primary !== undefined 
            ? loc.primary 
            : (primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId)
        };
      });
      
      // Sort locations so primary location appears first
      const sortedLocations = locationsWithPrimary.sort((a: Location, b: Location) => {
        // Primary location comes first
        if (primaryLocationId && a.id === primaryLocationId) return -1;
        if (primaryLocationId && b.id === primaryLocationId) return 1;
        // Keep original order for non-primary locations
        return 0;
      });
      
      setLocations(sortedLocations);
      
      // Update refs
      prevLocationsRef.current = currentLocationIds;
      prevPrimaryLocationIdRef.current = primaryLocationId;
    }
  }, [currentLocations, primaryLocationId, practiceTypes]);

  // Load practice types for services selector
  useEffect(() => {
    const loadPracticeTypes = async () => {
      try {
        const response = await fetchPracticeTypes();
        setPracticeTypes(response.data);
      } catch (error) {
        toast.error('Failed to load practice types');
      }
    };
    loadPracticeTypes();
  }, []);

  // Initialize form when modal opens - removed useEffect to prevent re-render loops

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
    }
    return process.env.REACT_APP_API_BASE_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
  };

  const getAuthHeader = useCallback(() => {
    // Use user ID for authorization, not provider ID
    return currentUser?.id ? `Bearer ${currentUser.id.toString()}` : '';
  }, [currentUser?.id]);

  // Fetch all locations for the provider
  const fetchLocations = useCallback(async () => {
    if (!providerId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }

      const data = await response.json();
      const fetchedLocations = data.locations || data.data || [];
      
      // Backend now returns both services and practice_types
      // Normalize to services format (prefer services, fallback to practice_types conversion)
      const normalizedLocations = fetchedLocations.map((loc: any) => {
        let services: Service[] = [];
        
        // Prefer services format (backend now provides this)
        if (loc.services && Array.isArray(loc.services) && loc.services.length > 0) {
          services = loc.services.map((s: any) => {
            // If it's already in {id, name} format, use it
            if (typeof s === 'object' && s.id && s.name) {
              return { id: s.id, name: s.name };
            }
            // If it's a string, try to find matching practice type
            if (typeof s === 'string') {
              const practiceType = practiceTypes.find(pt => pt.name === s);
              // If practiceTypes not loaded yet, create a temporary service object
              return practiceType ? { id: practiceType.id, name: practiceType.name } : { id: 0, name: s };
            }
            return null;
          }).filter((s: Service | null): s is Service => s !== null);
        }
        // Fallback: convert from practice_types if services not available
        else if (loc.practice_types && Array.isArray(loc.practice_types) && loc.practice_types.length > 0) {
          services = loc.practice_types
            .map((typeName: string) => {
              const practiceType = practiceTypes.find(pt => pt.name === typeName);
              // If practiceTypes not loaded yet, create a temporary service object with the name
              // This ensures services are displayed even if practiceTypes isn't loaded
              return practiceType ? { id: practiceType.id, name: practiceType.name } : { id: 0, name: typeName };
            })
            .filter((s: Service | null): s is Service => s !== null);
        }
        
        return {
          ...loc,
          services: services, // Always use normalized services array
          // Keep practice_types for reference (backend provides both)
        };
      });
      
      // Backend now provides primary flag on each location object
      // Use it directly (it's already set by backend based on primary_location_id)
      
      // Sort locations so primary location appears first
      const sortedLocations = normalizedLocations.sort((a: Location, b: Location) => {
        // Primary location comes first (check both primary flag and primaryLocationId)
        const aIsPrimary = (a as any).primary || (primaryLocationId && a.id === primaryLocationId);
        const bIsPrimary = (b as any).primary || (primaryLocationId && b.id === primaryLocationId);
        if (aIsPrimary) return -1;
        if (bIsPrimary) return 1;
        // Keep original order for non-primary locations
        return 0;
      });
      
      setLocations(sortedLocations);
      onLocationsUpdate(sortedLocations);
      
    } catch (error) {
      toast.error('Failed to fetch locations');
    } finally {
      setIsLoading(false);
    }
  }, [providerId, getAuthHeader, onLocationsUpdate, practiceTypes, primaryLocationId]);

  // Handle service change - work with practice type names (strings)
  const handleServiceChange = (service: Service) => {
    const serviceName = service.name;
    const exists = locationPracticeTypes.includes(serviceName);
    if (exists) {
      setLocationPracticeTypes(locationPracticeTypes.filter(name => name !== serviceName));
    } else {
      setLocationPracticeTypes([...locationPracticeTypes, serviceName]);
    }
  };

  // Add new location
  const handleAddLocation = async () => {
    // DEBUG: Alert to confirm function is called
    console.log('🚀🚀🚀 handleAddLocation CALLED 🚀🚀🚀');
    console.log('Current primaryLocationId:', primaryLocationId);
    console.log('Current locations count:', locations.length);
    console.log('Current locations:', locations.map((l: any) => ({ id: l.id, name: l.name, primary: (l as any).primary })));
    
    if (!providerId) {
      console.error('❌ No providerId, returning early');
      return;
    }
    
    setIsLoading(true);
    try {
      // NEW APPROACH: Use primary_location_id (database-backed, stable)
      // Preserve existing primary_location_id when adding new location
      console.log('🔍 Step 1: Building new location data...');
      
      // Step 1: Build the new location object (without id since it's new)
      const newLocationData = {
        name: formData.name || null,
        phone: formData.phone || null,
        address_1: formData.address_1 || null,
        address_2: null, // LocationFormData doesn't include address_2
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        // Only include practice_types if user selected some
        ...(locationPracticeTypes.length > 0 ? { practice_types: locationPracticeTypes } : {}),
        in_home_waitlist: null,
        in_clinic_waitlist: null,
        primary: false // New location is NOT primary
      };
      
      // Step 2: Build complete locations array with ALL existing locations + new one
      // CRITICAL: Put primary location FIRST in array as a safeguard
      // Backend should use primary_location_id, but putting primary first ensures correct behavior
      const primaryLocation = locations.find((loc: any) => primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId);
      const otherLocations = locations.filter((loc: any) => !(primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId));
      
      const allLocations = [
        // Primary location FIRST (with primary: true flag)
        ...(primaryLocation ? [{
          ...primaryLocation,
          primary: true
        }] : []),
        // Other existing locations
        ...otherLocations.map((loc: any) => ({
          ...loc,
          primary: false
        })),
        // New location LAST (with primary: false flag)
        {
          ...newLocationData,
          primary: false
        }
      ].filter(Boolean); // Remove any undefined entries
      
      // Step 3: Prepare all locations for backend (include IDs for existing locations, omit for new)
      const locationsToSend = allLocations.map((loc: any) => {
        // Determine if this location is the primary one
        const isPrimary = primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId;
        
        const locationData: any = {
          // Only include id if it's an existing location
          ...(loc.id !== null && loc.id !== undefined && typeof loc.id === 'number' && { id: loc.id }),
          name: loc.name ?? null,
          phone: loc.phone ?? null,
          address_1: loc.address_1 ?? null,
          address_2: loc.address_2 ?? null,
          city: loc.city ?? null,
          state: loc.state ?? null,
          zip: loc.zip ?? null,
          services: loc.services || [],
          in_home_waitlist: loc.in_home_waitlist ?? null,
          in_clinic_waitlist: loc.in_clinic_waitlist ?? null,
          // CRITICAL: Include primary flag - backend uses this to determine primary location
          // Only the location matching primaryLocationId should have primary: true
          primary: isPrimary
        };
        
        // Preserve any additional fields from existing locations
        if (loc.id) {
          Object.keys(loc).forEach(key => {
            if (!(key in locationData) && key !== 'primary') {
              locationData[key] = loc[key];
            }
          });
        }
        
        return locationData;
      });
      
      // Step 4: Send ALL locations + preserve primary_location_id
      // CRITICAL: Backend uses "replace all" strategy - must send ALL locations or they get deleted!
      // Backend will preserve primary_location_id since new location has primary: false
      
      // VALIDATION: Ensure we're sending all existing locations + the new one
      const expectedCount = locations.length + 1; // All existing + 1 new
      if (locationsToSend.length !== expectedCount) {
        console.error('❌ Location count mismatch when adding!', {
          sending: locationsToSend.length,
          expected: expectedCount,
          existing: locations.length
        });
        throw new Error(`Location count mismatch: sending ${locationsToSend.length} but expected ${expectedCount} (${locations.length} existing + 1 new). This would delete locations!`);
      }
      
      console.log('🔍 Step 4: About to send request to backend');
      console.log('✅ Sending ALL', locationsToSend.length, 'locations (', locations.length, 'existing + 1 new)');
      console.log('Payload summary:', {
        totalLocations: locationsToSend.length,
        primaryLocationInArray: locationsToSend.find((loc: any) => loc.primary === true)?.id,
        primary_location_id: primaryLocationId,
        firstLocationInArray: locationsToSend[0]?.id,
        lastLocationInArray: locationsToSend[locationsToSend.length - 1]?.id
      });
      
      const response = await fetch(`${getApiBaseUrl()}/api/v1/provider_self`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            id: providerId,
            attributes: {
              locations: locationsToSend,
              // Preserve existing primary_location_id when adding new location
              // Backend won't change it since no location has primary: true
              ...(primaryLocationId !== null && primaryLocationId !== undefined && { primary_location_id: primaryLocationId })
            }
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add location: ${response.status} - ${errorText}`);
      }

      // Step 5: Fetch updated locations from server to get the new location's ID and updated data
      const fetchResponse = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw new Error(`Failed to fetch locations: ${fetchResponse.status} - ${errorText}`);
      }
      
      const fetchData = await fetchResponse.json();
      const fetchedLocations = fetchData.locations || fetchData.data || [];
      
      // Normalize locations (convert practice_types to services format if needed)
      const normalizedLocations = fetchedLocations.map((loc: any) => {
        let services: Service[] = [];
        
        // Prefer services format (backend now provides this)
        if (loc.services && Array.isArray(loc.services) && loc.services.length > 0) {
          services = loc.services.map((s: any) => {
            if (typeof s === 'object' && s.id && s.name) {
              return { id: s.id, name: s.name };
            }
            if (typeof s === 'string') {
              const practiceType = practiceTypes.find(pt => pt.name === s);
              return practiceType ? { id: practiceType.id, name: practiceType.name } : { id: 0, name: s };
            }
            return null;
          }).filter((s: Service | null): s is Service => s !== null);
        }
        // Fallback: convert from practice_types if services not available
        else if (loc.practice_types && Array.isArray(loc.practice_types) && loc.practice_types.length > 0) {
          services = loc.practice_types
            .map((typeName: string) => {
              const practiceType = practiceTypes.find(pt => pt.name === typeName);
              return practiceType ? { id: practiceType.id, name: practiceType.name } : { id: 0, name: typeName };
            })
            .filter((s: Service | null): s is Service => s !== null);
        }
        
        return {
          ...loc,
          services: services,
        };
      });
      
      // Verify primary location is still correct after adding new location
      const receivedPrimaryLocation = normalizedLocations.find((loc: any) => loc.primary === true);
      console.log('📥 After adding - Primary location received:', receivedPrimaryLocation?.name, 'ID:', receivedPrimaryLocation?.id);
      console.log('📥 After adding - Expected primary ID:', primaryLocationId);
      
      if (primaryLocationId !== null && primaryLocationId !== undefined) {
        if (!receivedPrimaryLocation || receivedPrimaryLocation.id !== primaryLocationId) {
          console.error('❌ PRIMARY LOCATION CHANGED! Expected:', primaryLocationId, 'Got:', receivedPrimaryLocation?.id);
          console.error('This indicates the backend did not preserve primary_location_id');
          // Refresh provider data to get updated primary_location_id from server
          if (onPrimaryLocationChange) {
            onPrimaryLocationChange();
          }
        } else {
          console.log('✅ Primary location preserved correctly');
        }
      }
      
      // Sort so primary location appears first
      const sortedNormalizedLocations = normalizedLocations.sort((a: Location, b: Location) => {
        if (primaryLocationId && a.id === primaryLocationId) return -1;
        if (primaryLocationId && b.id === primaryLocationId) return 1;
        return 0;
      });
      
      setLocations(sortedNormalizedLocations);
      onLocationsUpdate(sortedNormalizedLocations);
      
      // Reset form and close modal
      setIsAddingLocation(false);
      setFormData({
        name: '',
        phone: '',
        address_1: '',
        city: '',
        state: '',
        zip: ''
      });
      setLocationPracticeTypes([]);
      
      toast.success('Location added successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add location');
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing location
  const handleUpdateLocation = async () => {
    console.log('🔄 handleUpdateLocation called');
    console.log('🔄 providerId:', providerId);
    console.log('🔄 editingLocation:', editingLocation);
    
    if (!providerId || !editingLocation) {
      console.error('❌ Missing providerId or editingLocation');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📥 Fetching all locations before update...');
      
      // Start with local state as fallback to ensure we always have locations
      let currentLocationsFromServer = [...locations];
      
      // Try to fetch latest from server, but use local state if fetch fails
      try {
        const fetchResponse = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations`, {
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json'
          }
        });
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          const serverLocations = fetchData.locations || fetchData.data || [];
          if (serverLocations.length > 0) {
            currentLocationsFromServer = serverLocations;
            console.log('✅ Fetched', serverLocations.length, 'locations from server');
          } else {
            console.warn('⚠️ Server returned empty locations array, using local state');
          }
        } else {
          console.warn('⚠️ Failed to fetch locations from server, using local state:', fetchResponse.status);
        }
      } catch (fetchError) {
        console.warn('⚠️ Error fetching locations from server, using local state:', fetchError);
      }
      
      // CRITICAL: Validate we have locations to send
      if (currentLocationsFromServer.length === 0) {
        console.error('❌ No locations found! Cannot update without sending all locations.');
        throw new Error('Cannot update location: no locations found. This would delete all locations.');
      }
      
      console.log('📥 Using', currentLocationsFromServer.length, 'locations for update');
      
      // Helper function to preserve a location without manufacturing empty arrays
      const preserveLocation = (loc: any) => {
        const payload: any = {
          ...(loc.id !== null && loc.id !== undefined && typeof loc.id === 'number' && { id: loc.id }),
          name: loc.name ?? null,
          phone: loc.phone ?? null,
          address_1: loc.address_1 ?? null,
          address_2: loc.address_2 ?? null,
          city: loc.city ?? null,
          state: loc.state ?? null,
          zip: loc.zip ?? null,
          in_home_waitlist: loc.in_home_waitlist ?? null,
          in_clinic_waitlist: loc.in_clinic_waitlist ?? null,
          primary: primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId
        };
        
        // Preserve whichever format exists, but do NOT manufacture empty arrays
        if (Array.isArray(loc.practice_types) && loc.practice_types.length > 0) {
          payload.practice_types = loc.practice_types;
        } else if (Array.isArray(loc.services) && loc.services.length > 0) {
          // If only services format exists, preserve it (backend accepts both)
          payload.services = loc.services;
        }
        // If neither exists or both are empty, don't include the field (backend preserves existing)
        
        return payload;
      };
      
      // Build updated location with form data and preserved fields
      // CRITICAL: Only include practice_types if user actually changed them
      // Never send empty arrays - they can cause confusion even if backend preserves
      const updatedLocation: any = {
        ...(editingLocation.id !== null && editingLocation.id !== undefined && typeof editingLocation.id === 'number' && { id: editingLocation.id }),
        name: formData.name?.trim() || null,
        phone: formData.phone?.trim() || null,
        address_1: formData.address_1?.trim() || null,
        address_2: editingLocation.address_2 || null, // Preserve existing address_2
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zip: formData.zip?.trim() || null,
        // Preserve waitlist fields from existing location
        in_home_waitlist: editingLocation.in_home_waitlist || null,
        in_clinic_waitlist: editingLocation.in_clinic_waitlist || null,
        // Preserve primary flag
        primary: primaryLocationId !== null && primaryLocationId !== undefined && editingLocation.id === primaryLocationId
      };
      
      // Include practice_types from form if user selected any
      // If user cleared them all (empty array), preserve from existing location to avoid clearing them
      if (Array.isArray(locationPracticeTypes) && locationPracticeTypes.length > 0) {
        updatedLocation.practice_types = locationPracticeTypes;
      } else {
        // User didn't select any, preserve from existing location
        // Check both practice_types and services formats
        if (Array.isArray((editingLocation as any).practice_types) && (editingLocation as any).practice_types.length > 0) {
          updatedLocation.practice_types = (editingLocation as any).practice_types;
        } else if (Array.isArray(editingLocation.services) && editingLocation.services.length > 0) {
          // Convert services format to practice_types format
          updatedLocation.practice_types = editingLocation.services.map((s: any) => s.name || s);
        }
        // If neither exists, don't include the field (backend will handle it)
      }
      
      console.log('📝 Updated location practice_types from form:', locationPracticeTypes);
      console.log('📝 Updated location object:', updatedLocation);
      
      // Map all locations - update the one being edited, preserve all others
      const locationsToSend = currentLocationsFromServer.map((loc: any) => {
        if (loc.id === editingLocation.id) {
          // This is the location being updated - use the updated data
          return updatedLocation;
        } else {
          // Preserve all other locations - use preserveLocation helper
          return preserveLocation(loc);
        }
      });
      
      // CRITICAL VALIDATION: Ensure we're sending ALL locations
      if (locationsToSend.length !== currentLocationsFromServer.length) {
        console.error('❌ Location count mismatch!', {
          sending: locationsToSend.length,
          expected: currentLocationsFromServer.length
        });
        throw new Error(`Location count mismatch: sending ${locationsToSend.length} but expected ${currentLocationsFromServer.length}. This would delete locations!`);
      }
      
      console.log('📤 Updating location - sending ALL', locationsToSend.length, 'locations:', locationsToSend);
      console.log('📤 Updated location data:', updatedLocation);
      
      // CRITICAL: Send ALL locations - backend uses "replace all" strategy
      const response = await fetch(`${getApiBaseUrl()}/api/v1/provider_self`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            id: providerId,
            attributes: {
              locations: locationsToSend,
              // Preserve primary_location_id
              ...(primaryLocationId !== null && primaryLocationId !== undefined && { primary_location_id: primaryLocationId })
            }
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to update location. Status:', response.status);
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to update location: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Location update response:', responseData);
      
      // Use the response data instead of making another fetch
      // The backend returns the updated provider data with all locations
      if (responseData.data && responseData.data[0] && responseData.data[0].attributes) {
        const updatedLocations = responseData.data[0].attributes.locations || [];
        
        // Normalize locations (convert practice_types to services format if needed)
        const normalizedLocations = updatedLocations.map((loc: any) => {
          let services: Service[] = [];
          
          if (loc.services && Array.isArray(loc.services) && loc.services.length > 0) {
            services = loc.services.map((s: any) => {
              if (typeof s === 'object' && s.id && s.name) {
                return { id: s.id, name: s.name };
              }
              return null;
            }).filter((s: Service | null): s is Service => s !== null);
          } else if (loc.practice_types && Array.isArray(loc.practice_types)) {
            services = loc.practice_types
              .map((typeName: string) => {
                const practiceType = practiceTypes.find(pt => pt.name === typeName);
                return practiceType ? { id: practiceType.id, name: practiceType.name } : null;
              })
              .filter((s: Service | null): s is Service => s !== null);
          }
          
          return {
            ...loc,
            services: services
          };
        });
        
        // Sort so primary location appears first
        const sortedNormalizedLocations = normalizedLocations.sort((a: Location, b: Location) => {
          if (primaryLocationId && a.id === primaryLocationId) return -1;
          if (primaryLocationId && b.id === primaryLocationId) return 1;
          return 0;
        });
        
        setLocations(sortedNormalizedLocations);
        onLocationsUpdate(sortedNormalizedLocations);
      } else {
        // Fallback to fetch if response format is unexpected
        await fetchLocations();
      }
      
      // Reset form and close modal
      setEditingLocation(null);
      setFormData({
        name: '',
        phone: '',
        address_1: '',
        city: '',
        state: '',
        zip: ''
      });
      setLocationPracticeTypes([]);
      
      toast.success('Location updated successfully!');
    } catch (error) {
      console.error('❌ Error updating location:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  // Set location as primary using primary_location_id (database-backed)
  const handleSetAsPrimary = async (locationId: number | null) => {
    console.log('⭐ handleSetAsPrimary called with locationId:', locationId);
    console.log('⭐ current primaryLocationId:', primaryLocationId);
    
    if (!locationId) {
      console.error('❌ No locationId provided');
      return;
    }
    
    // Check if already primary
    if (primaryLocationId === locationId) {
      console.log('ℹ️ Location is already primary');
      toast.info('Location is already primary');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('📥 Setting primary location using current locations state');
      
      // Use local locations state directly - it should already have the latest data
      // We don't need to fetch again since locations are already loaded when component mounts
      const currentLocationsFromServer = [...locations];
      
      // CRITICAL VALIDATION: Ensure we have locations to send
      if (currentLocationsFromServer.length === 0) {
        console.error('❌ No locations found! Cannot set primary without sending all locations.');
        throw new Error('Cannot set primary location: no locations found. This would delete all locations.');
      }
      
      console.log('📥 Setting primary - sending ALL', currentLocationsFromServer.length, 'locations');
      console.log('📥 Locations:', currentLocationsFromServer);
      
      // Prepare all locations with correct primary flags
      const locationsToSend = currentLocationsFromServer.map((loc: any) => {
        const locationData: any = {
          ...(loc.id !== null && loc.id !== undefined && typeof loc.id === 'number' && { id: loc.id }),
          name: loc.name ?? null,
          phone: loc.phone ?? null,
          address_1: loc.address_1 ?? null,
          address_2: loc.address_2 ?? null,
          city: loc.city ?? null,
          state: loc.state ?? null,
          zip: loc.zip ?? null,
          services: loc.services || [],
          in_home_waitlist: loc.in_home_waitlist ?? null,
          in_clinic_waitlist: loc.in_clinic_waitlist ?? null,
          primary: loc.id === locationId // New primary location
        };
        
        // Preserve any additional fields
        Object.keys(loc).forEach(key => {
          if (!(key in locationData) && key !== 'primary') {
            locationData[key] = loc[key];
          }
        });
        
        return locationData;
      });
      
      console.log('⭐ Prepared locationsToSend:', locationsToSend);
      console.log('⭐ Setting primary_location_id to:', locationId);
      
      // Update provider with new primary_location_id
      const response = await fetch(`${getApiBaseUrl()}/api/v1/provider_self`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            attributes: {
              primary_location_id: locationId // Set new primary location
              // Only include locations if backend requires them
              // If not required, sending just primary_location_id is safer
            }
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to set primary location. Status:', response.status);
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to set primary location: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Primary location update response:', JSON.stringify(responseData, null, 2));
      console.log('✅ Primary location update - primary_location_id in response:', responseData.data?.[0]?.attributes?.primary_location_id);
      
      // OPTIMISTIC UI UPDATE: Update immediately, don't wait for backend response
      // Backend may not return primary_location_id in response, so we update UI optimistically
      console.log('🔄 Updating UI optimistically with primary_location_id:', locationId);
      
      // Update local locations state immediately with primary flag and sort
      setLocations(prev => {
        const updated = prev.map(l => ({ 
          ...l, 
          primary: l.id === locationId 
        }));
        // Sort so primary location appears first
        return updated.sort((a: Location, b: Location) => {
          if (a.id === locationId) return -1;
          if (b.id === locationId) return 1;
          return 0;
        });
      });
      
      // Update refs to reflect the new primary location
      prevPrimaryLocationIdRef.current = locationId;
      
      // Notify parent to update its state optimistically
      // Pass the new primary location ID so parent can update immediately
      if (onPrimaryLocationChange) {
        // The parent will update currentProvider.attributes.primary_location_id optimistically
        onPrimaryLocationChange(locationId);
      }
      
      // Use the response data directly instead of making another fetch
      // The backend returns the updated provider data with all locations
      // CRITICAL: Set primary flag based on locationId we just set as primary
      if (responseData.data && responseData.data[0] && responseData.data[0].attributes) {
        const updatedLocations = responseData.data[0].attributes.locations || [];
        
        // Normalize locations (convert practice_types to services format if needed)
        // IMPORTANT: Set primary flag based on the locationId we just set as primary
        const normalizedLocations = updatedLocations.map((loc: any) => {
          let services: Service[] = [];
          
          if (loc.services && Array.isArray(loc.services) && loc.services.length > 0) {
            services = loc.services.map((s: any) => {
              if (typeof s === 'object' && s.id && s.name) {
                return { id: s.id, name: s.name };
              }
              return null;
            }).filter((s: Service | null): s is Service => s !== null);
          } else if (loc.practice_types && Array.isArray(loc.practice_types)) {
            services = loc.practice_types
              .map((typeName: string) => {
                const practiceType = practiceTypes.find(pt => pt.name === typeName);
                return practiceType ? { id: practiceType.id, name: practiceType.name } : null;
              })
              .filter((s: Service | null): s is Service => s !== null);
          }
          
          return {
            ...loc,
            services: services,
            // CRITICAL: Set primary flag based on locationId (backend may not return it correctly)
            primary: loc.id === locationId
          };
        });
        
        // Sort so primary location appears first
        const sortedNormalizedLocations = normalizedLocations.sort((a: Location, b: Location) => {
          if (a.id === locationId) return -1;
          if (b.id === locationId) return 1;
          return 0;
        });
        
        setLocations(sortedNormalizedLocations);
        onLocationsUpdate(sortedNormalizedLocations);
      }
      
      // Don't call fetchLocations here - we use the response data instead
      
      toast.success('Location set as primary successfully!');
    } catch (error) {
      console.error('❌ Error setting primary location:', error);
      await fetchLocations();
      toast.error(error instanceof Error ? error.message : 'Failed to set primary location');
    } finally {
      setIsLoading(false);
    }
  };

  // Move location up in the list
  const handleMoveUp = async (locationId: number | null) => {
    if (!locationId) return;
    
    try {
      setIsLoading(true);
      
      // First, fetch ALL current locations from server to ensure we have the complete list
      const fetchResponse = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch locations: ${fetchResponse.status}`);
      }
      
      const fetchData = await fetchResponse.json();
      const currentLocationsFromServer = fetchData.locations || fetchData.data || [];
      
      const locationIndex = currentLocationsFromServer.findIndex((loc: Location) => loc.id === locationId);
      if (locationIndex <= 0) {
        setIsLoading(false);
        return; // Already first or not found
      }
      
      // Swap with previous location
      const reorderedLocations = [...currentLocationsFromServer];
      [reorderedLocations[locationIndex - 1], reorderedLocations[locationIndex]] = 
        [reorderedLocations[locationIndex], reorderedLocations[locationIndex - 1]];
      
      // Sort so primary location appears first (user reordering doesn't change which location is primary)
      const sortedReorderedLocations = reorderedLocations.sort((a: Location, b: Location) => {
        if (primaryLocationId && a.id === primaryLocationId) return -1;
        if (primaryLocationId && b.id === primaryLocationId) return 1;
        return 0;
      });
      
      // Update local state
      setLocations(sortedReorderedLocations);
      onLocationsUpdate(sortedReorderedLocations);
      
      // Helper function to preserve location data properly (same as in handleUpdateLocation)
      const preserveLocation = (loc: any) => {
        const payload: any = {
          ...(loc.id !== null && loc.id !== undefined && typeof loc.id === 'number' && { id: loc.id }),
          name: loc.name ?? null,
          phone: loc.phone ?? null,
          address_1: loc.address_1 ?? null,
          address_2: loc.address_2 ?? null,
          city: loc.city ?? null,
          state: loc.state ?? null,
          zip: loc.zip ?? null,
          in_home_waitlist: loc.in_home_waitlist ?? null,
          in_clinic_waitlist: loc.in_clinic_waitlist ?? null,
          primary: primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId
        };
        
        // Preserve whichever format exists, but do NOT manufacture empty arrays
        if (Array.isArray(loc.practice_types) && loc.practice_types.length > 0) {
          payload.practice_types = loc.practice_types;
        } else if (Array.isArray(loc.services) && loc.services.length > 0) {
          // If only services format exists, preserve it (backend accepts both)
          payload.services = loc.services;
        }
        // If neither exists or both are empty, don't include the field (backend preserves existing)
        
        return payload;
      };
      
      // Map all locations with complete data, preserving practice_types/services properly
      const locationsToSend = reorderedLocations.map((loc: any) => preserveLocation(loc));
      
      // Validate we're sending all locations
      if (locationsToSend.length !== currentLocationsFromServer.length) {
        throw new Error(`Location count mismatch: fetched ${currentLocationsFromServer.length} but sending ${locationsToSend.length}`);
      }
      
      // Preserve primary_location_id when reordering
      const response = await fetch(`${getApiBaseUrl()}/api/v1/provider_self`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            id: providerId,
            attributes: {
              locations: locationsToSend,
              // Preserve primary_location_id when reordering (order doesn't change primary)
              ...(primaryLocationId !== null && primaryLocationId !== undefined && { primary_location_id: primaryLocationId })
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update location order: ${response.status}`);
      }

      // Refresh locations from server to ensure UI is in sync
      await fetchLocations();
      
      toast.success('Location order updated!');
    } catch (error) {
      // Revert by fetching fresh data
      await fetchLocations();
      toast.error(error instanceof Error ? error.message : 'Failed to update location order');
    } finally {
      setIsLoading(false);
    }
  };

  // Move location down in the list
  const handleMoveDown = async (locationId: number | null) => {
    if (!locationId) return;
    
    try {
      setIsLoading(true);
      
      // First, fetch ALL current locations from server to ensure we have the complete list
      const fetchResponse = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch locations: ${fetchResponse.status}`);
      }
      
      const fetchData = await fetchResponse.json();
      const currentLocationsFromServer = fetchData.locations || fetchData.data || [];
      
      const locationIndex = currentLocationsFromServer.findIndex((loc: Location) => loc.id === locationId);
      if (locationIndex < 0 || locationIndex >= currentLocationsFromServer.length - 1) {
        setIsLoading(false);
        return; // Already last or not found
      }
      
      // Swap with next location
      const reorderedLocations = [...currentLocationsFromServer];
      [reorderedLocations[locationIndex], reorderedLocations[locationIndex + 1]] = 
        [reorderedLocations[locationIndex + 1], reorderedLocations[locationIndex]];
      
      // Sort so primary location appears first (user reordering doesn't change which location is primary)
      const sortedReorderedLocations = reorderedLocations.sort((a: Location, b: Location) => {
        if (primaryLocationId && a.id === primaryLocationId) return -1;
        if (primaryLocationId && b.id === primaryLocationId) return 1;
        return 0;
      });
      
      // Update local state
      setLocations(sortedReorderedLocations);
      onLocationsUpdate(sortedReorderedLocations);
      
      // Helper function to preserve location data properly (same as in handleUpdateLocation)
      const preserveLocation = (loc: any) => {
        const payload: any = {
          ...(loc.id !== null && loc.id !== undefined && typeof loc.id === 'number' && { id: loc.id }),
          name: loc.name ?? null,
          phone: loc.phone ?? null,
          address_1: loc.address_1 ?? null,
          address_2: loc.address_2 ?? null,
          city: loc.city ?? null,
          state: loc.state ?? null,
          zip: loc.zip ?? null,
          in_home_waitlist: loc.in_home_waitlist ?? null,
          in_clinic_waitlist: loc.in_clinic_waitlist ?? null,
          primary: primaryLocationId !== null && primaryLocationId !== undefined && loc.id === primaryLocationId
        };
        
        // Preserve whichever format exists, but do NOT manufacture empty arrays
        if (Array.isArray(loc.practice_types) && loc.practice_types.length > 0) {
          payload.practice_types = loc.practice_types;
        } else if (Array.isArray(loc.services) && loc.services.length > 0) {
          // If only services format exists, preserve it (backend accepts both)
          payload.services = loc.services;
        }
        // If neither exists or both are empty, don't include the field (backend preserves existing)
        
        return payload;
      };
      
      // Map all locations with complete data, preserving practice_types/services properly
      const locationsToSend = reorderedLocations.map((loc: any) => preserveLocation(loc));
      
      // Validate we're sending all locations
      if (locationsToSend.length !== currentLocationsFromServer.length) {
        throw new Error(`Location count mismatch: fetched ${currentLocationsFromServer.length} but sending ${locationsToSend.length}`);
      }
      
      // Preserve primary_location_id when reordering
      const response = await fetch(`${getApiBaseUrl()}/api/v1/provider_self`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            id: providerId,
            attributes: {
              locations: locationsToSend,
              // Preserve primary_location_id when reordering (order doesn't change primary)
              ...(primaryLocationId !== null && primaryLocationId !== undefined && { primary_location_id: primaryLocationId })
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update location order: ${response.status}`);
      }

      // Refresh locations from server to ensure UI is in sync
      await fetchLocations();
      
      toast.success('Location order updated!');
    } catch (error) {
      // Revert by fetching fresh data
      await fetchLocations();
      toast.error(error instanceof Error ? error.message : 'Failed to update location order');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete location
  const handleDeleteLocation = async () => {
    if (!providerId || !deletingLocation) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations/${deletingLocation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete location: ${response.status} - ${errorText}`);
      }

      // Refresh locations from server to ensure we have the complete, up-to-date list
      await fetchLocations();
      
      // Close modal
      setDeletingLocation(null);
      
      toast.success('Location deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 FORM SUBMITTED');
    console.log('📝 Current formData:', formData);
    console.log('📝 Current locationPracticeTypes:', locationPracticeTypes);
    console.log('📝 Editing location (original):', editingLocation);
    if (editingLocation) {
      console.log('📝 Calling handleUpdateLocation');
      handleUpdateLocation();
    } else {
      console.log('📝 Calling handleAddLocation');
      handleAddLocation();
    }
  };

  const openEditModal = (location: Location) => {
    // Initialize form data when opening edit modal
    setFormData({
      name: location.name || '',
      phone: location.phone || '',
      address_1: location.address_1 || '',
      city: location.city || '',
      state: location.state || '',
      zip: location.zip || ''
    });
    
    // Use practice_types first (canonical format), fallback to extracting from services
    // This works even if practiceTypes isn't loaded yet
    const practiceTypeNames: string[] = 
      Array.isArray((location as any).practice_types) ? (location as any).practice_types :
      Array.isArray(location.services) ? location.services.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean) :
      [];
    
    setLocationPracticeTypes(practiceTypeNames);
    console.log('📝 Opening edit modal - practice_types:', practiceTypeNames);
    initializedLocationIdRef.current = location.id;
    setEditingLocation(location);
    setIsAddingLocation(false);
  };

  const openAddModal = () => {
    // Initialize form data when opening add modal
    setFormData({
      name: '',
      phone: '',
      address_1: '',
      city: '',
      state: '',
      zip: ''
    });
    setLocationPracticeTypes([]);
    initializedLocationIdRef.current = null;
    setIsAddingLocation(true);
    setEditingLocation(null);
  };

  const closeModal = () => {
    setIsAddingLocation(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      phone: '',
      address_1: '',
      city: '',
      state: '',
      zip: ''
    });
    setLocationPracticeTypes([]);
    initializedLocationIdRef.current = null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Location Management</h3>
          <p className="text-sm text-gray-600">Manage your provider locations</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchLocations}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Refresh Locations
        </button>
      </div>

      {/* Locations List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading locations...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first location.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...locations].sort((a: Location, b: Location) => {
            // Primary location comes first
            if (primaryLocationId && a.id === primaryLocationId) return -1;
            if (primaryLocationId && b.id === primaryLocationId) return 1;
            // Keep original order for non-primary locations
            return 0;
          }).map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {((location as any).primary || (primaryLocationId !== null && location.id === primaryLocationId)) && (
                      <span title="Primary location">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </span>
                    )}
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {location.name || 'Unnamed Location'}
                      {((location as any).primary || (primaryLocationId !== null && location.id === primaryLocationId)) && (
                        <span className="ml-2 text-xs text-gray-500">(Primary)</span>
                      )}
                    </h4>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  {/* Reorder buttons - only show if more than one location */}
                  {locations.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSetAsPrimary(location.id);
                        }}
                        disabled={(location as any).primary || isLoading}
                        className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Set as primary location"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveUp(location.id)}
                        disabled={locations.findIndex(loc => loc.id === location.id) === 0 || isLoading}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(location.id)}
                        disabled={locations.findIndex(loc => loc.id === location.id) === locations.length - 1 || isLoading}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openEditModal(location)}
                    disabled={isLoading}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded disabled:opacity-50"
                    title="Edit location"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingLocation(location)}
                    disabled={isLoading}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded disabled:opacity-50"
                    title="Delete location"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {location.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{location.phone}</span>
                  </div>
                )}
                {(location.address_1 || location.city || location.state || location.zip) && (
                  <div className="flex items-start">
                    <Building2 className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      {location.address_1 && <div className="truncate">{location.address_1}</div>}
                      {(location.city || location.state || location.zip) && (
                        <div className="truncate">
                          {[location.city, location.state, location.zip].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {location.services && location.services.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Services:</div>
                    <div className="flex flex-wrap gap-1">
                      {location.services.slice(0, 3).map((service) => (
                        <span key={service.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {service.name}
                        </span>
                      ))}
                      {location.services.length > 3 && (
                        <span className="text-xs text-gray-500">+{location.services.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {(isAddingLocation || editingLocation) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeModal}>
          <div className="relative top-4 mx-auto p-4 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h3>
                <X 
                  onClick={closeModal}
                  className="h-6 w-6 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                />
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Location Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Main Office, Branch Location, etc."
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="555-123-4567"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address_1"
                    value={formData.address_1}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="123 Main Street"
                  />
                </div>

                {/* City, State, ZIP - Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-3 text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="City Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-3 text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="ST"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-3 text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Services Offered at this Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered at this Location
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {locationPracticeTypes.map((typeName) => {
                      // Find the service object for display (optional, just for consistency)
                      const service = practiceTypes.find(pt => pt.name === typeName);
                      return (
                        <div
                          key={typeName}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center"
                        >
                          <span>{typeName}</span>
                          <X 
                            className="ml-2 w-4 h-4 cursor-pointer" 
                            onClick={() => service && handleServiceChange(service)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <select
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    value=""
                    disabled={isLoading}
                    onChange={(e) => {
                      const [id, name] = e.target.value.split('|');
                      if (id && name) {
                        handleServiceChange({ id: parseInt(id), name });
                      }
                    }}
                  >
                    <option value="">Add a service...</option>
                    {practiceTypes
                      .filter(service => !locationPracticeTypes.includes(service.name))
                      .map(service => (
                        <option key={service.id} value={`${service.id}|${service.name}`}>
                          {service.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Helpful Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Only the location name and phone number are required. Address fields and services are optional and can be filled in later.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {editingLocation ? 'Updating...' : 'Adding...'}
                      </div>
                    ) : editingLocation ? (
                      'Update Location'
                    ) : (
                      'Add Location'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLocation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 w-full max-w-lg">
            <div className="bg-white rounded-lg shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center p-6 border-b border-gray-200">
                <AlertCircle className="h-7 w-7 text-red-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Delete Location</h3>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete <strong className="text-gray-900">"{deletingLocation.name || 'this location'}"</strong>? 
                  This action cannot be undone.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setDeletingLocation(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLocation}
                  disabled={isLoading}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Location'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement; 