import React from 'react';
import puzzleLogo from './puzzle.png';
import { ProviderAttributes } from '../Utility/Types';
import { MapPin, Phone, Mail } from 'lucide-react'



interface ProviderCardProps {
  provider: ProviderAttributes;
  onViewDetails: (provider: ProviderAttributes) => void;
  renderViewOnMapButton: (provider: ProviderAttributes) => React.ReactNode;
  onToggleFavorite: () => void; // Function to toggle favorite
  isFavorited: boolean; // Check if the provider is favorited
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewDetails, renderViewOnMapButton, onToggleFavorite, isFavorited }) => {
  return (
    <div className={`searched-provider-card ${provider.locations.length > 1 ? 'multiple-locations' : ''}`}>
     
     <button className={`favorite-button ${isFavorited ? 'favorited' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}>
        {isFavorited ? 'Unfavorite' : 'Favorite'}
      </button>
      <img src={provider.logo || puzzleLogo} alt="Provider Logo" className="provider-logo" />

      <div className="title-and-info">
        <div className="searched-provider-card-title">
          <h3>{provider.name}</h3>
          <h4>
            <MapPin style={{ marginRight: '8px' }} />
            <span>Address: </span>
            {provider.locations[0]?.address_1
              ? `${provider.locations[0]?.address_1}${provider.locations[0]?.address_2 ? ', ' : ''}`
              : 'Physical address is not available for this provider.'}
            {provider.locations[0]?.address_2 && `${provider.locations[0]?.address_2}, `}
            {provider.locations[0]?.city && `${provider.locations[0]?.city}, `}
            {provider.locations[0]?.state && `${provider.locations[0]?.state} `}
            {provider.locations[0]?.zip && `${provider.locations[0]?.zip}`}
          </h4>
        </div>
        <div className="searched-provider-card-info">
          <p>
            <Phone style={{ marginRight: '8px' }} />
            Phone: {provider.locations[0]?.phone || 'Phone number is not available.'}
          </p>
          <p>
            <Mail style={{ marginRight: '8px' }} />
            Email: {provider.email || 'Email is not avaialble.'}
          </p>

          <div className="provider-card-buttons">
            <button className="view-details-button" onClick={() => onViewDetails(provider)}>
              View Details
            </button>
            {renderViewOnMapButton(provider)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
