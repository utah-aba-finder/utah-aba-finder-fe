import React, { useState } from 'react';
import defaultLogo from '../Assets/ASL_Logo_No_Letters.png';

interface ProviderLogoProps {
  provider: {
    name?: string | null;
    logo?: string | null;
    logo_url?: string | null; // Added support for logo_url field
  };
  className?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
}

const ProviderLogo: React.FC<ProviderLogoProps> = ({ 
  provider, 
  className = 'provider-logo',
  alt,
  size = 'medium'
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Determine size classes
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-32 h-32'
  };
  
  // Get logo URL - check both logo_url and logo fields
  const logoUrl = provider.logo_url || provider.logo;
  
  // If no logo or image failed to load, show placeholder
  if (!logoUrl || imageError) {
    return (
      <div className={`${className} ${sizeClasses[size]} bg-gray-100 rounded border border-gray-200 flex items-center justify-center`}>
        <img 
          src={defaultLogo} 
          alt="Default Provider Logo" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }
  
  return (
    <img 
      src={logoUrl}
      alt={alt || `${provider.name} logo`}
      onError={(e) => {
        setImageError(true);
      }}
      onLoad={() => {
      }}
      className={`${className} ${sizeClasses[size]} object-contain`}
    />
  );
};

export default ProviderLogo; 