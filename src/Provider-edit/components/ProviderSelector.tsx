import React from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../Provider-login/AuthProvider";
import {
  Building2,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import ProviderContextIndicator from "../../Utility/ProviderContextIndicator";

// Enhanced Provider Selector Component
const ProviderSelector: React.FC = () => {
  const { userProviders, activeProvider, switchProvider, fetchUserProviders } = useAuth();
  
  // Handle case where userProviders is undefined or null
  if (!userProviders || userProviders.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-blue-700">Loading providers...</p>
        </div>
      </div>
    );
  }
  
  if (userProviders.length <= 1) {
    return null; // Don't show selector if user only has one provider
  }

  const handleProviderSwitch = async (providerId: number) => {
    if (providerId !== activeProvider?.id) {
      toast.info('Switching provider context...', { position: 'top-right' });
      
      try {
        const success = await switchProvider(providerId);
        if (success) {
          toast.success('Provider context updated successfully!', { position: 'top-right' });
        } else {
          toast.error('Failed to switch provider context', { position: 'top-right' });
        }
      } catch (error) {
        toast.error('Error switching provider context', { position: 'top-right' });
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-900">Provider Context</h3>
          </div>
          
          {/* Current Provider Display */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-blue-700">Currently editing:</span>
            <ProviderContextIndicator showEmail={true} />
          </div>
          
          <div className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">
            <span className="font-medium">Provider ID:</span> {activeProvider?.id || 'None'} | 
            <span className="font-medium ml-2">Type:</span> {activeProvider?.type || 'None'} | 
            <span className="font-medium ml-2">Access:</span> {
              activeProvider?.user_id === activeProvider?.user_id ? 'Primary Owner' : 'Assigned'
            }
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-blue-900">Switch to Provider:</label>
            <select
              value={activeProvider?.id || ''}
              onChange={(e) => handleProviderSwitch(Number(e.target.value))}
              className="px-4 py-2 border-2 border-blue-300 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            >
              {userProviders.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.attributes?.name || provider.name} 
                  {provider.id === activeProvider?.id ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => {
              toast.info('Refreshing provider list...', { position: 'top-right' });
              fetchUserProviders().then(() => {
                toast.success('Provider list refreshed!', { position: 'top-right' });
              }).catch(() => {
                toast.error('Failed to refresh provider list', { position: 'top-right' });
              });
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Provider List Summary */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {userProviders.map(provider => (
            <div
              key={provider.id}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                provider.id === activeProvider?.id
                  ? 'border-blue-400 bg-blue-100 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => handleProviderSwitch(provider.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {provider.attributes?.name || provider.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {provider.attributes?.email || provider.email}
                  </div>
                </div>
                {provider.id === activeProvider?.id && (
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderSelector; 