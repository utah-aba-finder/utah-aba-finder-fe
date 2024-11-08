import React from 'react';
import puzzleLogo from '../Assets/puzzle.png';
import { ProviderAttributes } from '../Utility/Types';
import { MapPin, Phone, Mail, Globe, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import './ProviderCard.css';
import { toast } from 'react-toastify';

interface ProviderCardProps {
  provider: ProviderAttributes;
  onViewDetails: (provider: ProviderAttributes) => void;
  renderViewOnMapButton: (provider: ProviderAttributes) => React.ReactNode;
  onToggleFavorite: (providerId: number, date?: string) => void;
  isFavorited: boolean;
  favoritedDate?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onViewDetails,
  renderViewOnMapButton,
  onToggleFavorite,
  isFavorited,
  favoritedDate
}) => {

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });

    if (isFavorited) {
      toast.info(`${provider.name} removed from favorites`, { autoClose: 3000 });
      onToggleFavorite(provider.id);
    } else {
      toast.success(`${provider.name} added to favorites`, { autoClose: 3000 });
      onToggleFavorite(provider.id, currentDate);
    }
  };

  return (
    <div className={`searched-provider-card ${provider.locations.length > 1 ? 'multiple-locations' : ''}`}>
      <div className="provider-card">
        <div className="card-logo-and-text">
          <div className="card-grid-logo">
            <img src={provider.logo || puzzleLogo} alt="Provider Logo" className="provider-logo" />
          </div>
          <div className="card-text-and-buttons">
            <div className="card-text text">
              <div className="card-name title">{provider.name}</div>
              <h4>
                <strong>
                  <MapPin style={{ marginRight: '8px' }} />
                  <span>Address: </span>
                </strong>
                {provider.locations[0]?.address_1 ? (
                  <>
                    {provider.locations[0].address_1}
                    {provider.locations[0]?.address_2 && `, ${provider.locations[0].address_2}`}
                    {provider.locations[0]?.city && `, ${provider.locations[0].city}`}
                    {provider.locations[0]?.state && `, ${provider.locations[0].state}`}
                    {provider.locations[0]?.zip && ` ${provider.locations[0].zip}`}
                  </>
                ) : (
                  'Physical address is not available for this provider.'
                )}
              </h4>
              <h4>
                <strong><Phone style={{ marginRight: '8px' }} />
                  Phone: </strong><a href={`tel:${provider.locations[0]?.phone}`} className='custom-link'>{provider.locations[0]?.phone || 'Phone number is not available.'}</a>
              </h4>
              <h4>
                <strong><Mail style={{ marginRight: '8px' }} />
                  Email: </strong><a href={`mailto:${provider.email}`} className='custom-link'>{provider.email || 'Email is not available.'}</a>
              </h4>
              <h4>
                <strong><Globe style={{ marginRight: '8px' }} />
                  Website: </strong>
                <a
                  href={provider.website?.includes('http') || provider.website?.includes('https') ? provider.website : `https://${provider.website}` ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="custom-link"
                >
                  {provider.website ?? 'Provider does not have a website yet.'}
                </a>
              </h4>
              {isFavorited && favoritedDate && (
                <div className="favorited-date text">
                  Favorited on {favoritedDate}
                </div>
              )}
            </div>
            <div className="provider-card-buttons">
              <button className="view-details-button" onClick={() => onViewDetails(provider)}>
                <Eye size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Details
              </button>
              <button
                className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
                onClick={handleToggleFavorite}
              >
                {isFavorited ? (
                  <ToggleRight size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                ) : (
                  <ToggleLeft size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                )}
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