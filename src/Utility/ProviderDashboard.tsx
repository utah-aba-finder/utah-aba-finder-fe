import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Edit3, Users, Settings, Plus } from 'lucide-react';
import { useAuth } from '../Provider-login/AuthProvider';
import ProviderContextIndicator from './ProviderContextIndicator';

interface ProviderDashboardProps {
  showQuickActions?: boolean;
  showProviderList?: boolean;
  className?: string;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  showQuickActions = true,
  showProviderList = true,
  className = ''
}) => {
  const { userProviders, activeProvider, switchProvider, isAuthenticated } = useAuth();

  if (!isAuthenticated || !userProviders || userProviders.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Provider Dashboard</h2>
          </div>
          <ProviderContextIndicator compact={true} />
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to={`/providerEdit/${activeProvider?.id || userProviders[0].id}`}
              className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Edit Provider</span>
            </Link>
            
            <button className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Manage Staff</span>
            </button>
            
            <button className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <Settings className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Settings</span>
            </button>
            
            <button className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
              <Plus className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Add Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Provider List */}
      {showProviderList && userProviders.length > 1 && (
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Providers</h3>
          <div className="space-y-2">
            {userProviders.map(provider => (
              <div
                key={provider.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  provider.id === activeProvider?.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {provider.attributes?.name || provider.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {provider.attributes?.email || provider.email}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {provider.id === activeProvider?.id && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                  
                  <button
                    onClick={() => switchProvider(provider.id)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      provider.id === activeProvider?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {provider.id === activeProvider?.id ? 'Current' : 'Switch To'}
                  </button>
                  
                  <Link
                    to={`/providerEdit/${provider.id}`}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard; 