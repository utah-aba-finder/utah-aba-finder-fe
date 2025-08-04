import React, { useEffect, useState } from 'react';
import { ProviderAttributes } from '../Utility/Types';
import { MapPin, Phone, Mail, Globe, Eye, ToggleLeft, ToggleRight, Briefcase, Home, Building, Monitor } from 'lucide-react';
import './ProviderCard.css';
import { toast } from 'react-toastify';
import ProviderLogo from '../Utility/ProviderLogo';

interface ProviderCardProps {
  provider: ProviderAttributes;
  onViewDetails: (provider: ProviderAttributes) => void;
  renderViewOnMapButton: (provider: ProviderAttributes) => React.ReactNode;
  onToggleFavorite: (providerId: number, date?: string) => void;
  isFavorited: boolean;
  favoritedDate?: string;
  selectedState: string;
  hasReviews?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onViewDetails,
  renderViewOnMapButton,
  onToggleFavorite,
  isFavorited,
  favoritedDate,
  selectedState,
  hasReviews
}) => {
  // Debug: Check logo data


  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });

    if (isFavorited) {
      setTimeout(() => {
        toast.info(`${provider.name} removed from favorites`, { autoClose: 3000 });
      }, 500); // 500ms delay
      onToggleFavorite(provider.id);
    } else {
      setTimeout(() => {
        toast.success(`${provider.name} added to favorites`, { autoClose: 3000 });
      }, 500); // 500ms delay
      onToggleFavorite(provider.id, currentDate);
    }
  };

  // Filter locations based on selected state
  const filteredLocations = selectedState && selectedState !== 'none' && selectedState !== ''
    ? provider.locations.filter(location => location.state?.toUpperCase() === selectedState?.toUpperCase())
    : provider.locations;

  // Use the first matching location, or fall back to the first location if none match
  const primaryLocation = filteredLocations[0] || provider.locations[0];

  // Render service delivery badges
  const renderServiceDeliveryBadges = () => {
    const badges = [];
    
    if (provider.in_home_only) {
      badges.push(
        <span key="in-home-only" className="service-badge in-home-only">
          <Home size={12} style={{ marginRight: '4px' }} />
          In-Home Only
        </span>
      );
    } else {
      if (provider.at_home_services && provider.at_home_services.toLowerCase().includes('yes')) {
        badges.push(
          <span key="in-home" className="service-badge in-home">
            <Home size={12} style={{ marginRight: '4px' }} />
            In-Home
          </span>
        );
      }
      if (provider.in_clinic_services && provider.in_clinic_services.toLowerCase().includes('yes')) {
        badges.push(
          <span key="in-clinic" className="service-badge in-clinic">
            <Building size={12} style={{ marginRight: '4px' }} />
            In-Clinic
          </span>
        );
      }
      if (provider.telehealth_services && provider.telehealth_services.toLowerCase().includes('yes')) {
        badges.push(
          <span key="telehealth" className="service-badge telehealth">
            <Monitor size={12} style={{ marginRight: '4px' }} />
            Telehealth
          </span>
        );
      }
    }
    
    return badges.length > 0 ? (
      <div className="service-delivery-badges">
        {badges}
      </div>
    ) : null;
  };

  return (
    <div className={`searched-provider-card ${provider.locations.length > 1 ? 'multiple-locations' : ''}`}>
      <div className="provider-card">
        {/* <div className="featured-badge">Proud Sponsor</div> */}
        {hasReviews && (
          <div className="reviews-badge">
            <span className="reviews-badge-text">⭐ Has Reviews</span>
          </div>
        )}
        <div className="card-logo-and-text">
          <div className="card-grid-logo">
            <ProviderLogo 
              provider={provider} 
              className="provider-logo"
              size="medium"
            />
          </div>
          <div className="card-text-and-buttons">
            <div className="card-text text">
              <div className="card-name title">{provider.name}</div>
              
              {/* Service delivery badges */}
              {renderServiceDeliveryBadges()}
              
              <h4>
                <strong>
                  <MapPin style={{ marginRight: '8px' }} />
                  <span>Address: </span>
                </strong>
                {provider.in_home_only ? (
                  'In-Home Services Only - No Physical Location'
                ) : primaryLocation ? (
                  <>
                    {primaryLocation.address_1}
                    {primaryLocation?.address_2 && `, ${primaryLocation.address_2}`}
                    {primaryLocation?.city && `, ${primaryLocation.city}`}
                    {primaryLocation?.state && `, ${primaryLocation.state}`}
                    {primaryLocation?.zip && ` ${primaryLocation.zip}`}
                  </>
                ) : (
                  'This provider offers virtual/remote services only.'
                )}
              </h4>
              <h4>
                <strong><Phone style={{ marginRight: '8px' }} />
                  Phone: </strong><a href={`tel:${primaryLocation?.phone}`} className='custom-link'>{primaryLocation?.phone || 'Phone number is not available.'}</a>
              </h4>
              {/* Only show email and website if provider is not in-home only */}
              {!provider.in_home_only && (
                <>
                  <h4>
                    <strong><Mail style={{ marginRight: '8px' }} />
                      Email: </strong><a href={`mailto:${provider.email}`} className='custom-link'>{provider.email || 'Email is not available.'}</a>
                  </h4>
                  <h4>
                    <strong><Globe style={{ marginRight: '8px' }} />
                      Website: </strong>
                    <a
                      href={provider.website 
                        ? (provider.website.startsWith('http://') || provider.website.startsWith('https://') 
                            ? provider.website 
                            : `https://${provider.website}`)
                        : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="custom-link"
                    >
                      {provider.website ?? 'Provider does not have a website yet.'}
                    </a>
                  </h4>
                </>
              )}
              {/* Show services only for in-home providers */}
              {provider.in_home_only && (
                <h4>
                  <strong><Briefcase style={{ marginRight: '8px' }} />
                    Provider Services: </strong>
                  {provider.provider_type.length > 0 ? (
                    provider.provider_type.map(type => type.name).join(', ')
                  ) : (
                    'Services information not available.'
                  )}
                </h4>
              )}
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