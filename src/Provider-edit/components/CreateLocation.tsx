import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InsuranceModal from "../InsuranceModal";
import CountiesModal from "../CountiesModal";
import { Dispatch, SetStateAction } from "react";
import {
  Location,
  Insurance,
  CountiesServed,
  ProviderAttributes,
  ProviderData,
  StateData,
  CountyData,
  Service,
} from "../../Utility/Types";
import { fetchStates, fetchCountiesByState } from "../../Utility/ApiCall";
import { Building2, MapPin, Phone, X } from 'lucide-react';
import { getAdminAuthHeader } from "../../Utility/config";

interface CreateLocationProps {
  provider: ProviderData;
  onLocationCreated: (updatedProvider: ProviderAttributes) => void;
  setSelectedTab: Dispatch<SetStateAction<string>>;
}

const CreateLocation: React.FC<CreateLocationProps> = ({
  provider,
  onLocationCreated,
  setSelectedTab,
}) => {
  const [newLocation, setNewLocation] = useState<Location>({
    id: null,
    name: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    services: [],
    in_home_waitlist: null,
    in_clinic_waitlist: null
  });

  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [availableStates, setAvailableStates] = useState<StateData[]>([]);
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);

  useEffect(() => {
    const loadStatesAndCounties = async () => {
      try {
        const states = await fetchStates();
        setAvailableStates(states);
        if (provider.states[0]) {
          const selectedState = states.find(
            state => state.attributes.name === provider.states[0]
          );
          if (selectedState) {
            const counties = await fetchCountiesByState(selectedState.id);
            setAvailableCounties(counties);
          }
        }
      } catch (error) {

        toast.error("Failed to load location data");
      }
    };
    loadStatesAndCounties();
  }, [provider.states]);

  const handleServiceChange = (service: Service) => {
    const serviceExists = newLocation.services.some(s => s.id === service.id);
    if (serviceExists) {
      setNewLocation({
        ...newLocation,
        services: newLocation.services.filter(s => s.id !== service.id)
      });
    } else {
      setNewLocation({
        ...newLocation,
        services: [...newLocation.services, service]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedLocations = [newLocation, ...provider.attributes.locations];
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${provider.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': provider.id.toString()
          },
          body: JSON.stringify({
            data: [{
              id: provider.id,
              type: 'provider',
              attributes: {
                ...provider.attributes,
                locations: updatedLocations
              }
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create location');
      }

      const data = await response.json();
      onLocationCreated(data.data[0].attributes);
      toast.success('Location created successfully!');
      setSelectedTab('edit');
    } catch (error) {
      
      toast.error('Failed to create location');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">New Location Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Location Name</label>
              <input
                type="text"
                value={newLocation.name || ''}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={newLocation.phone || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                  className="w-5/6 pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Address Line 1</label>
              <input
                type="text"
                value={newLocation.address_1 || ''}
                onChange={(e) => setNewLocation({ ...newLocation, address_1: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Address Line 2</label>
              <input
                type="text"
                value={newLocation.address_2 || ''}
                onChange={(e) => setNewLocation({ ...newLocation, address_2: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">City</label>
              <input
                type="text"
                value={newLocation.city || ''}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">State</label>
              <input
                type="text"
                value={newLocation.state || ''}
                onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">ZIP Code</label>
              <input
                type="text"
                value={newLocation.zip || ''}
                onChange={(e) => setNewLocation({ ...newLocation, zip: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Services Offered at this Location</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newLocation.services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center"
                  >
                    <span>{service.name}</span>
                    <X 
                      className="ml-2 w-4 h-4 cursor-pointer" 
                      onClick={() => handleServiceChange(service)}
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
                    handleServiceChange({ id: parseInt(id), name });
                  }
                }}
              >
                <option value="">Add a service...</option>
                {[
                  { id: 1, name: "ABA Therapy" },
                  { id: 2, name: "Autism Evaluation" },
                  { id: 3, name: "Speech Therapy" },
                  { id: 4, name: "Occupational Therapy" }
                ]
                  .filter(service => !newLocation.services.some(s => s.id === service.id))
                  .map(service => (
                    <option key={service.id} value={`${service.id}|${service.name}`}>
                      {service.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">In-Home Waitlist</label>
              <p className="text-sm text-gray-500 mb-2">If you don't provide this service please select "No"</p>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newLocation.in_home_waitlist === true ? "true" : newLocation.in_home_waitlist === false ? "false" : ""}
                onChange={(e) => setNewLocation({ ...newLocation, in_home_waitlist: e.target.value === "true" })}
              >
                <option value="">Select...</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">In-Clinic Waitlist</label>
              <p className="text-sm text-gray-500 mb-2">If you don't provide this service please select "No"</p>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newLocation.in_clinic_waitlist === true ? "true" : newLocation.in_clinic_waitlist === false ? "false" : ""}
                onChange={(e) => setNewLocation({ ...newLocation, in_clinic_waitlist: e.target.value === "true" })}
              >
                <option value="">Select...</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setSelectedTab('edit')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Location
          </button>
        </div>
      </form>

      {/* Modals */}
      {isInsuranceModalOpen && (
        <InsuranceModal
          isOpen={isInsuranceModalOpen}
          onClose={() => setIsInsuranceModalOpen(false)}
          selectedInsurances={selectedInsurances}
          onInsurancesChange={setSelectedInsurances}
          providerInsurances={[]}
        />
      )}

      {isCountiesModalOpen && (
        <CountiesModal
          isOpen={isCountiesModalOpen}
          onClose={() => setIsCountiesModalOpen(false)}
          selectedCounties={selectedCounties}
          onCountiesChange={setSelectedCounties}
          availableCounties={availableCounties}
        />
      )}
    </div>
  );
};

export default CreateLocation;
