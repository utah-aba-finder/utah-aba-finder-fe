import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../Provider-login/AuthProvider';
import { Plus, Edit, Trash2, MapPin, Phone, Building2, X, AlertCircle } from 'lucide-react';
import { Location } from '../../Utility/Types';

interface LocationManagementProps {
  providerId: number;
  currentLocations: Location[];
  onLocationsUpdate: (locations: Location[]) => void;
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
  onLocationsUpdate
}) => {
  const { loggedInProvider } = useAuth();
  const [locations, setLocations] = useState<Location[]>(currentLocations || []);
  const [isLoading, setIsLoading] = useState(false);
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

  // Update local state when prop changes
  useEffect(() => {
    setLocations(currentLocations || []);
  }, [currentLocations]);

  // Reset form when adding new location
  useEffect(() => {
    if (isAddingLocation) {
      setFormData({
        name: '',
        phone: '',
        address_1: '',
        city: '',
        state: '',
        zip: ''
      });
    }
  }, [isAddingLocation]);

  // Reset form when editing location
  useEffect(() => {
    if (editingLocation) {
      setFormData({
        name: editingLocation.name || '',
        phone: editingLocation.phone || '',
        address_1: editingLocation.address_1 || '',
        city: editingLocation.city || '',
        state: editingLocation.state || '',
        zip: editingLocation.zip || ''
      });
    }
  }, [editingLocation]);

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
    }
    return process.env.REACT_APP_API_BASE_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
  };

  const getAuthHeader = useCallback(() => {
    return loggedInProvider?.id?.toString() || '';
  }, [loggedInProvider?.id]);

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
      setLocations(fetchedLocations);
      onLocationsUpdate(fetchedLocations);
      
      console.log('🔍 LocationManagement: Fetched locations:', fetchedLocations);
    } catch (error) {
      console.error('🔍 LocationManagement: Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    } finally {
      setIsLoading(false);
    }
  }, [providerId, getAuthHeader, onLocationsUpdate]);

  // Add new location
  const handleAddLocation = async () => {
    if (!providerId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: formData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add location: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const newLocation = data.location || data.data;
      
      // Add to local state
      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      onLocationsUpdate(updatedLocations);
      
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
      
      toast.success('Location added successfully!');
      console.log('🔍 LocationManagement: Added new location:', newLocation);
    } catch (error) {
      console.error('🔍 LocationManagement: Error adding location:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add location');
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing location
  const handleUpdateLocation = async () => {
    if (!providerId || !editingLocation) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/locations/${editingLocation.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: formData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update location: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const updatedLocation = data.location || data.data;
      
      // Update local state
      const updatedLocations = locations.map(loc => 
        loc.id === editingLocation.id ? updatedLocation : loc
      );
      setLocations(updatedLocations);
      onLocationsUpdate(updatedLocations);
      
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
      
      toast.success('Location updated successfully!');
      console.log('🔍 LocationManagement: Updated location:', updatedLocation);
    } catch (error) {
      console.error('🔍 LocationManagement: Error updating location:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update location');
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

      // Remove from local state
      const updatedLocations = locations.filter(loc => loc.id !== deletingLocation.id);
      setLocations(updatedLocations);
      onLocationsUpdate(updatedLocations);
      
      // Close modal
      setDeletingLocation(null);
      
      toast.success('Location deleted successfully!');
      console.log('🔍 LocationManagement: Deleted location:', deletingLocation.id);
    } catch (error) {
      console.error('🔍 LocationManagement: Error deleting location:', error);
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
    if (editingLocation) {
      handleUpdateLocation();
    } else {
      handleAddLocation();
    }
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setIsAddingLocation(false);
  };

  const openAddModal = () => {
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
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {location.name || 'Unnamed Location'}
                  </h4>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => openEditModal(location)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
                    title="Edit location"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingLocation(location)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {(isAddingLocation || editingLocation) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 w-full max-w-xl">
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
                    className="w-full  py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                    className="w-full  py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                    className="w-full  py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                      className="w-full text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                      className="w-full text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                      className="w-full  text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="12345"
                    />
                  </div>
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
                        <strong>Note:</strong> Only the location name and phone number are required. Address fields are optional and can be filled in later.
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