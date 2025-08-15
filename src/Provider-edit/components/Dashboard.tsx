import React, { useState } from "react";
import { Building2, Globe, Mail, Home, MapPin } from "lucide-react";
import moment from "moment";
import { ProviderData, Location, ProviderType, CountiesServed, CountyData } from "../../Utility/Types";
import { useAuth } from "../../Provider-login/AuthProvider";
import ProviderSelector from "./ProviderSelector";

interface DashboardProps {
  provider: ProviderData;
  onUpdate?: (updatedData: ProviderData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ provider, onUpdate }) => {
  const { attributes } = provider;
  const { activeProvider, userProviders } = useAuth();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<ProviderType[]>(
    attributes.provider_type || []
  );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCountiesModalOpen, setIsCountiesModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCounties, setSelectedCounties] = useState<CountiesServed[]>(
    attributes.counties_served || []
  );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeStateForCounties, setActiveStateForCounties] = useState<string>(
    attributes.states?.[0] || ''
  );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableCounties, setAvailableCounties] = useState<CountyData[]>([]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Provider Selector - Only show if user has multiple providers */}
      {userProviders && userProviders.length > 1 && activeProvider && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Switch Provider</h3>
          <ProviderSelector key={activeProvider?.id || 'no-provider'} />
        </div>
      )}
      
      {/* Provider Overview Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-8">
          {attributes.logo ? (
            <img
              src={attributes.logo}
              alt="Provider Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-contain bg-gray-50 p-2"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {attributes.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Last updated:{" "}
                {moment(attributes.updated_last).format("MM/DD/YYYY")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">
                    Website
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {attributes.website || "N/A"}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">
                    Email
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {attributes.email || "N/A"}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">
                    Locations
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {attributes.locations?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
              Your Locations
            </h3>
          </div>

          {/* Table Header */}
          <div className="min-w-full">
            <div className="hidden md:grid grid-cols-6 gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 text-xs sm:text-sm md:text-base font-medium text-gray-500 rounded-t-lg">
              <div className="col-span-2">Location Name</div>
              <div>Address</div>
              <div>City</div>
              <div>State</div>
              <div>Phone</div>
            </div>

            {/* Table Content */}
            <div className="divide-y divide-gray-200">
              {attributes.locations?.map(
                (location: Location, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors duration-150 items-center"
                  >
                    {/* Mobile & Desktop Location Name */}
                    <div className="col-span-2 flex items-center space-x-2 sm:space-x-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <span className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                        {location.name || `Location ${index + 1}`}
                      </span>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block text-xs sm:text-sm md:text-base text-gray-600 truncate">
                      {location.address_1}
                      {location.address_2 && `, ${location.address_2}`}
                    </div>
                    <div className="hidden md:block text-xs sm:text-sm md:text-base text-gray-600">
                      {location.city}
                    </div>
                    <div className="hidden md:block text-xs sm:text-sm md:text-base text-gray-600">
                      {location.state} {location.zip}
                    </div>
                    <div className="hidden md:block text-xs sm:text-sm md:text-base text-gray-600">
                      {location.phone}
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden col-span-1 space-y-2">
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">
                        <span className="font-medium">Address:</span>{" "}
                        {location.address_1}
                      </p>
                      {location.address_2 && (
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">
                          {location.address_2}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">
                        <span className="font-medium">City/State:</span>{" "}
                        {location.city}, {location.state} {location.zip}
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">
                        <span className="font-medium">Phone:</span>{" "}
                        {location.phone}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Services Overview
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
              Service Types
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              {attributes.provider_type?.map((type: ProviderType) => type.name).join(", ") || "Unknown"}
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
              {attributes.in_clinic_services === "yes" && (
                <li>In-clinic Services</li>
              )}
              {attributes.at_home_services === "yes" && (
                <li>At-home Services</li>
              )}
              {attributes.telehealth_services === "yes" && (
                <li>Telehealth Services</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
              Age Range
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              {attributes.min_age} - {attributes.max_age} years
            </p>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
              Waitlist Status
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              {attributes.waitlist || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
