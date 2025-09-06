import React, { useMemo, useState, useEffect } from 'react';
import { API_CONFIG } from '../Utility/config';

interface GoogleMapProps {
  address?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ address }) => {
  const usa = { lat: 37.0902, lng: -95.7129 };
  const apiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cleanedAddress = (address || '').trim();
  const isAddressValid = cleanedAddress.length > 0;

  // If it looks like just a state code/name/zip, help Maps a bit
  const q = isAddressValid
    ? encodeURIComponent(`${cleanedAddress}, USA`)
    : '';

  const mapUrl = useMemo(() => {
    if (!apiKey) return '';
    if (isAddressValid) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}`;
    }
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${usa.lat},${usa.lng}&zoom=4`;
  }, [apiKey, isAddressValid, q]);

  if (!apiKey) {
    // Show a clean, non-emoji fallback to avoid encoding issues
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600">
        <div className="text-center">
          <div className="text-base font-medium mb-1">Map not available</div>
          <div className="text-xs">Google Maps API key not configured</div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      title="Provider location map"
      width="100%"
      height="100%"
      className="rounded-lg lg:rounded-l-lg lg:rounded-r-none"
      style={{ border: 0, minHeight: isMobile ? '200px' : '100%' }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={mapUrl}
    />
  );
};

export default GoogleMap;