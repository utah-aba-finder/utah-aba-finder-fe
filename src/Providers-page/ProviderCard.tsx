import React from 'react';
import puzzleLogo from '../Assets/puzzle.png';
import { ProviderAttributes } from '../Utility/Types';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import './ProviderCard.css'

interface ProviderCardProps {
  provider: ProviderAttributes;
  onViewDetails: (provider: ProviderAttributes) => void;
  renderViewOnMapButton: (provider: ProviderAttributes) => React.ReactNode;
  onToggleFavorite: (providerId: number) => void;
  isFavorited: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewDetails, renderViewOnMapButton, onToggleFavorite, isFavorited }) => {
  return (

    <div className={`searched-provider-card ${provider.locations.length > 1 ? 'multiple-locations' : ''}`}>

      <div className="provider-card">
        <div className="card-logo-and-text">

          <div className="card-grid-logo">
            <img src={provider.logo || puzzleLogo} alt="Provider Logo" className="provider-logo" />
          </div>
          <div className="card-text-and-buttons">
            <div className="card-text text">
              <h2 className="card-name title">{provider.name}</h2>
              <h4>
                <strong><MapPin style={{ marginRight: '8px' }} />
                  <span>Address: </span></strong>
                {provider.locations[0]?.address_1
                  ? `${provider.locations[0]?.address_1}${provider.locations[0]?.address_2 ? ', ' : ''}`
                  : 'Physical address is not available for this provider.'}
                {provider.locations[0]?.address_2 && `${provider.locations[0]?.address_2}, `}
                {provider.locations[0]?.city && `${provider.locations[0]?.city}, `}
                {provider.locations[0]?.state && `${provider.locations[0]?.state} `}
                {provider.locations[0]?.zip && `${provider.locations[0]?.zip}`}
              </h4>
              <h4>
                <strong><Phone style={{ marginRight: '8px' }} />
                  Phone: </strong>{provider.locations[0]?.phone || 'Phone number is not available.'}
              </h4>
              <h4>
                <strong><Mail style={{ marginRight: '8px' }} />
                  Email: </strong>{provider.email || 'Email is not available.'}
              </h4>
              <h4>
                <strong><Globe style={{ marginRight: '8px' }} />
                  Website: </strong>
                <a
                  href={provider.website ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="custom-link"
                >
                  {provider.website ?? 'Provider does not have a website yet.'}
                </a>
              </h4>
            </div>

            <div className="provider-card-buttons">
              <button className="view-details-button" onClick={() => onViewDetails(provider)}>
                View Details
              </button>
              <button
                className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(provider.id);
                }}
              >
                {isFavorited ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ProviderCard;
