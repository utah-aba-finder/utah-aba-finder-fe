import React from 'react';
import puzzleLogo from './puzzle.png';
import { ProviderAttributes } from '../Utility/Types';


interface ProviderCardProps {
  provider: ProviderAttributes;
  onViewDetails: (provider: ProviderAttributes) => void;
  renderViewOnMapButton: (provider: ProviderAttributes) => React.ReactNode;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewDetails, renderViewOnMapButton }) => {
  return (
    <div className={`searched-provider-card ${provider.locations.length > 1 ? 'multiple-locations' : ''}`}>

      <img src={provider.logo || puzzleLogo} alt="Provider Logo" className="provider-logo" />
      
      <div className="title-and-info">
        <div className="searched-provider-card-title">
          <h3>{provider.name}</h3>
          <h4>
            {provider.locations[0]?.address_1 || 'Physical address is not available for this provider.'} {provider.locations[0]?.address_2} {provider.locations[0]?.city} {provider.locations[0]?.state} {provider.locations[0]?.zip}
          </h4>
        </div>
        <div className="searched-provider-card-info">
          <p>
            <strong>Phone:</strong> {provider.locations[0]?.phone || 'Phone number is not available.'}
          </p>
          <p>
            <strong>Email:</strong> {provider.email || 'Email is not avaialble.'}
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
