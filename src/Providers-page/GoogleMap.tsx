import React, { useState, useEffect } from 'react';

interface GoogleMapProps {
  address?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ address }) => {
  const defaultAddress = 'Utah';
  const encodedAddress = encodeURIComponent(address || defaultAddress);
  
  const [borderRadius, setBorderRadius] = useState('8px 0px 0px 8px'); 

  useEffect(() => {
    const updateBorderRadius = () => {
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

  return (
    <iframe
      title="mapFeature"
      width="100%"
      height="100%"
      style={{ border: 0, borderRadius: borderRadius }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyC1h7w0gjR4gdkVEdxlfFiKjRaHKPqzXE4&q=${encodedAddress}`}
    ></iframe>
  );
};

export default GoogleMap;
