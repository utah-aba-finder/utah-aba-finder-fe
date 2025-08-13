import React from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../Provider-login/AuthProvider';

interface ProviderContextIndicatorProps {
  showIcon?: boolean;
  showEmail?: boolean;
  className?: string;
  compact?: boolean;
}

const ProviderContextIndicator: React.FC<ProviderContextIndicatorProps> = ({
  showIcon = true,
  showEmail = false,
  className = '',
  compact = false
}) => {
  const { activeProvider, isAuthenticated } = useAuth();

  if (!isAuthenticated || !activeProvider) {
    return null;
  }

  const providerName = activeProvider.attributes?.name || activeProvider.name;
  const providerEmail = activeProvider.attributes?.email || activeProvider.email;

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs ${className}`}>
        {showIcon && <Building2 className="h-3 w-3 text-blue-600" />}
        <span className="text-blue-900 font-medium">{providerName}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      {showIcon && <Building2 className="h-4 w-4 text-blue-600" />}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-blue-900">{providerName}</span>
        {showEmail && providerEmail && (
          <span className="text-xs text-blue-700">{providerEmail}</span>
        )}
      </div>
    </div>
  );
};

export default ProviderContextIndicator; 