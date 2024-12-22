import React, { useState } from "react";
import { toast } from "react-toastify";
import InsuranceModal from "../InsuranceModal";
import CountiesModal from "../CountiesModal";
import { Dispatch, SetStateAction } from "react";
import {
  Location,
  Insurance,
  CountiesServed,
  ProviderAttributes,
  MockProviderData,
} from "../../Utility/Types";

interface CreateLocationProps {
  provider: MockProviderData;
  onLocationCreated: (updatedProvider: ProviderAttributes) => void;
  setSelectedTab: Dispatch<SetStateAction<string>>;
}

const CreateLocation: React.FC<CreateLocationProps> = ({
  provider,
  onLocationCreated,
  setSelectedTab,
}) => {
  const [location, setLocation] = useState<Location>({
    id: null,
    name: null,
    address_1: null,
    address_2: null,
    city: null,
    state: null,
    zip: null,
    phone: null,
  });

  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
  const [selectedInsurances, setSelectedInsurances] = useState<Insurance[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedLocations = [...provider.attributes.locations, location];

      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${provider.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            data: [
              {
                id: provider.id,
                type: "provider",
                attributes: {
                  ...provider.attributes,
                  locations: updatedLocations,
                  insurance:
                    selectedInsurances.length > 0
                      ? selectedInsurances
                      : provider.attributes.insurance,
                  counties_served:
                    selectedCounties.length > 0
                      ? selectedCounties
                      : provider.attributes.counties_served,
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create location");
      }

      const result = await response.json();
      onLocationCreated(result.data[0].attributes);
      toast.success("Location created successfully");
      setSelectedTab("dashboard");
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Details Card */}
      <div className="bg-white rounded-lg shadow p-8 max-w-[95%] mx-auto">
        {" "}
        <h2 className="text-xl font-semibold mb-6">New Location Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {" "}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Location Name
              </label>
              <input
                type="text"
                value={location.name || ""}
                onChange={(e) =>
                  setLocation({ ...location, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter location name"
                required
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
                  setLocation({ ...location, phone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                value={location.address_1 || ""}
                onChange={(e) =>
                  setLocation({ ...location, address_1: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter street address"
                required
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
                  setLocation({ ...location, address_2: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">City</label>
              <input
                type="text"
                value={location.city || ""}
                onChange={(e) =>
                  setLocation({ ...location, city: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">State</label>
              <input
                type="text"
                value={location.state || ""}
                onChange={(e) =>
                  setLocation({ ...location, state: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter state"
                required
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
                  setLocation({ ...location, zip: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter ZIP code"
                required
              />
            </div>
          </div>

          {/* Additional Coverage Options */}
          

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setSelectedTab("dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A6FA5] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? "Creating..." : "Create Location"}
            </button>
          </div>
        </form>
      </div>

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
          providerCounties={[]}
        />
      )}
    </div>
  );
};

export default CreateLocation;
