import React, { useState } from 'react';
import defaultLogo from '../Assets/ASL_Logo_No_Letters.png';

interface ProviderLogoProps {
  provider: {
    name?: string | null;
    logo?: string | null;
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
  
  // If no logo or image failed to load, show placeholder
  if (!provider.logo || imageError) {
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
  
  // Log the logo URL for debugging
  
  
  return (
    <img 
      src={provider.logo}
      alt={alt || `${provider.name} logo`}
      onError={() => {
        setImageError(true);
  
      }}
      className={`${className} ${sizeClasses[size]} object-contain`}
    />
  );
};

export default ProviderLogo; 