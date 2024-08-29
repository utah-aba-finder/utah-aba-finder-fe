import React from 'react';

interface GoogleMapProps {
  address?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ address }) => {
  const defaultAddress = 'Utah';
  const encodedAddress = encodeURIComponent(address || defaultAddress);

  return (
    <iframe
      title='mapFeature'
      width="100%"
      height="100%"
      style={{ border: 0,borderRadius: '0.5rem' }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyC1h7w0gjR4gdkVEdxlfFiKjRaHKPqzXE4&q=${encodedAddress}`}
    ></iframe>
  );
};

export default GoogleMap;
