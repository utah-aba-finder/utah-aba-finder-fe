import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../Utility/config';

interface GoogleMapProps {
  address?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ address }) => {
  const usaCoordinates = { lat: 37.0902, lng: -95.7129 };
  const isAddressValid = Boolean(address && address.trim());
  const encodedAddress = isAddressValid
    ? encodeURIComponent(address!)
    : `${usaCoordinates.lat},${usaCoordinates.lng}`;

  const [borderRadius, setBorderRadius] = useState('8px 0px 0px 8px');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateBorderRadius = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (window.innerWidth > 1024) {
        setBorderRadius('8px 0px 0px 8px');
      } else {
        setBorderRadius('8px 8px 0px 0px');
      }
    };

    updateBorderRadius();
    window.addEventListener('resize', updateBorderRadius);

    return () => {
      window.removeEventListener('resize', updateBorderRadius);
    };
  }, []);

  // Check if we have a valid API key
  const apiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;
  console.log('🗺️ GoogleMap Debug:', { 
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
    address: address,
    isAddressValid,
    encodedAddress
  });
  
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <div className="text-sm">Map not available</div>
          <div className="text-xs">Google Maps API key not configured</div>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/${isAddressValid ? 'place' : 'view'
    }?key=${apiKey}${isAddressValid
      ? `&q=${encodedAddress}`
      : `&center=${usaCoordinates.lat},${usaCoordinates.lng}&zoom=4`
    }`;
    
  console.log('🗺️ GoogleMap URL:', mapUrl);

  return (
    <iframe
      title="mapFeature"
      width="100%"
      height="100%"
      style={{ 
        border: 0, 
        borderRadius: borderRadius,
        // Better mobile support
        minHeight: isMobile ? '200px' : '100%'
      }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={mapUrl}
    ></iframe>
  );
};

export default GoogleMap;