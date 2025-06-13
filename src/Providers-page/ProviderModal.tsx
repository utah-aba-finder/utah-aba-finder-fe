import React from 'react';
import './ProviderModal.css';
import GoogleMap from './GoogleMap';
import { MapPin, Phone, Globe, Mail, Briefcase } from 'lucide-react'
import { useEffect, useState } from 'react';
import moment from 'moment';

interface Location {
  name?: string | null;
  address_1: string | null;
  address_2?: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone?: string | null;
  services?: Service[];
}

interface Insurance {
  name: string | null;
}

interface ProviderType {
  name: string;
}

interface ProviderAttributes {
  name: string | null;
  locations: Location[];
  insurance: Insurance[];
  website?: string | null;
  email?: string | null;
  cost?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  provider_type: ProviderType[];
  waitlist?: string | null;
  telehealth_services?: string | null;
  spanish_speakers?: string | null;
  at_home_services?: string | null;
  in_clinic_services?: string | null;
  counties_served: County[];
  logo?: string | null;
  updated_last: string | null;
  states: string[];
}

interface County {
  county_id: number | null;
  county_name: string | null;
  state?: string | null;
}

interface Service {
  name: string;
}

interface CountyData {
  id: number;
  type: string;
  attributes: {
    name: string;
    state: string;
  };
}

interface ProviderModalProps {
  provider: {
    id: number;
    type: string;
    states?: string[];
    attributes: ProviderAttributes;
  };
  address: string;
  mapAddress: string;
  onClose: () => void;
  onViewOnMapClick: (address: string) => void;
  selectedState: string | null;
  availableCounties?: CountyData[];
}

const ProviderModal: React.FC<ProviderModalProps> = ({ 
  provider, 
  address, 
  mapAddress, 
  onViewOnMapClick, 
  onClose, 
  selectedState,
  availableCounties = []
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!provider) return null;

  // Filter locations based on selected state
  const filteredLocations = selectedState && selectedState !== 'none'
    ? provider.attributes.locations.filter(location => {
        if (!location.state || !selectedState) return false;
        return location.state.trim().toUpperCase() === selectedState.trim().toUpperCase();
      })
    : provider.attributes.locations;

  // Use the first matching location, or fall back to the first location if none match
  const primaryLocation = filteredLocations[0] || provider.attributes.locations[0];

  const handleKeyDown = (e: React.KeyboardEvent, tabName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setActiveTab(tabName);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <section className="modal-text-section">
            <div className="provider-main-info">
              <div className="update-section">
                <span className="last-update">Last Updated {moment(provider.attributes.updated_last).format('MM/DD/YYYY')}</span>
              </div>
              <p className="provider-contact text">
                <p><Phone style={{ marginRight: '8px' }} />
                  <strong>Phone: </strong>
                  {primaryLocation?.phone ? <a href={`tel:${primaryLocation.phone}`}>{primaryLocation.phone}</a> : 'Provider does not have a number for this location yet.'}
                </p>
                <p><Globe style={{ marginRight: '8px' }} />
                  <strong>Website: </strong>
                  {provider.attributes.website ? <a href={provider.attributes.website} target="_blank" rel="noopener noreferrer">{provider.attributes.website}</a> : 'Provider does not have a website yet.'}
                </p>
                <p className="email-text"><Mail style={{ marginRight: '8px' }} />
                  <strong>Email: </strong>
                  {provider.attributes.email ? <a href={`mailto:${provider.attributes.email}`} target="_blank" rel="noopener noreferrer">{provider.attributes.email}</a> : 'Provider does not have an email yet.'}
                </p>
              </p>
            </div>
            <div className="provider-details text">
              <p><strong>Counties Served:</strong> {
                (() => {
                  // Filter counties based on selected state and available counties
                  const relevantCounties = selectedState && selectedState !== 'none'
                    ? provider.attributes.counties_served.filter(county => {
                        // Get the full state name from the available counties
                        const matchingCounty = availableCounties.find(ac => 
                          ac.attributes.name === county.county_name
                        );
                        return matchingCounty !== undefined;
                      })
                    : provider.attributes.counties_served;

                  if (provider.attributes.provider_type.length > 0 && provider.attributes.provider_type[0].name === "ABA Therapy") {
                    if (relevantCounties.length === 1 && relevantCounties[0].county_name === "Contact Us") {
                      return 'Contact us';
                    }
                    return relevantCounties.length > 0
                      ? relevantCounties
                          .filter(county => county.county_name !== "Contact Us")
                          .map(county => county.county_name)
                          .join(', ')
                      : 'Not applicable for this provider';
                  }
                  
                  return relevantCounties.length > 1 || (relevantCounties.length === 1 && relevantCounties[0].county_name !== "Contact Us")
                    ? relevantCounties
                        .filter(county => county.county_name !== "Contact Us")
                        .map(county => county.county_name)
                        .join(', ')
                    : 'Not applicable for this provider';
                })()
              }</p>
              <p><strong>Ages Served:</strong> {provider.attributes.min_age} - {provider.attributes.max_age} years</p>
              <p><strong>Waitlist:</strong> {provider.attributes.waitlist || 'Contact us'}</p>
              <p><strong>Telehealth Services:</strong> {provider.attributes.telehealth_services || 'Contact us'}</p>
              <p><strong>At Home Services:</strong> {provider.attributes.provider_type.length > 0 ? (provider.attributes.at_home_services || 'Contact us') : provider.attributes.provider_type.length > 0 ? (provider.attributes.at_home_services || 'Not applicable') : null}</p>
              <p><strong>In-Clinic Services:</strong> {provider.attributes.provider_type.length > 0 ? (provider.attributes.in_clinic_services || 'Contact us') : provider.attributes.provider_type.length > 0 && provider.attributes.locations?.some(location => location.address_1 && location.city && location.state && location.zip) ? 'Yes' : 'Not applicable'}</p>
              <p><strong>Spanish Speakers:</strong> {provider.attributes.spanish_speakers || 'Contact us'}</p>
              <p><strong>Cost:</strong> {provider.attributes.cost || 'Contact us'}</p>
              <p><strong>Insurance:</strong> {provider.attributes.insurance.map(i => i.name).join(', ') || 'Contact us'}</p>
            </div>
          </section>
        );
      case 'locations':
        return <section className="location-section">
          <div className="location-map">
            <div className="location-list">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location, index) => (
                  <div key={index} className="provider-address-phone">
                    <p><strong>Location {index + 1}: {location.name ? location.name : ""}</strong></p>
                    <p>
                      <MapPin style={{ marginRight: '8px' }} />
                      <strong>Address: </strong>
                      {location.address_1 ? (
                        `${location.address_1}${location.address_2 ? `, ${location.address_2}` : ''}${location.city ? `, ${location.city}` : ''}${location.state ? `, ${location.state}` : ''} ${location.zip || ''}`
                      ) : (
                        'Physical address is not available for this provider.'
                      )}
                    </p>
                    <p><Phone style={{ marginRight: '8px' }} />
                      <strong>Phone: </strong>
                      {location.phone ? <a href={`tel:${location.phone}`}>{location.phone}</a> : 'Provider does not have a number for this location yet.'}
                    </p>
                    <p><Briefcase style={{ marginRight: '8px' }} />
                      <strong>Services: </strong>
                      {(location.services && location.services.length > 0) ? (
                        <>
                          {location.services.map(service => service.name).join(', ')}
                          {provider.attributes.provider_type.some(type => 
                            !location.services?.some(s => s.name === type.name)
                          ) && (
                            <span className="text-gray-500 text-sm ml-2">
                              (Other services available at different locations)
                            </span>
                          )}
                        </>
                      ) : (
                        'No services listed for this location.'
                      )}
                    </p>
                    <button className="view-on-map-button"
                      onClick={() => {
                        const fullAddress = `${location.address_1 || ''} ${location.address_2 || ''}, ${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim();
                        onViewOnMapClick(fullAddress);
                      }}>
                      View this address on the map
                    </button>
                  </div>
                ))
              ) : (
                <p><strong>No locations available in {selectedState}</strong></p>
              )}
            </div>
          </div>
        </section>;
      case 'reviews':
        return <section className="review-section">Client testimonial content will go here</section>;
      case 'media':
        return <section className="media-section">Media content will go here</section>;
      default:
        return null;
    }
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'show' : ''} ${isClosing ? 'hide' : ''}`}>
      <div className="modal-container">
        <button className="close-button" onClick={handleClose} aria-label="Close Modal">
          &times;
        </button>
        <div className="modal-grid">
          <div className="modal-grid-map">
            <GoogleMap address={primaryLocation?.address_1
              ? `${primaryLocation.address_1}, ${primaryLocation.city}, ${primaryLocation.state} ${primaryLocation.zip}`
              : provider.states?.[0] || ''}
            />
          </div>
          <div className="modal-grid-text">
            <section className="modal-logo">
              <img src={provider.attributes.logo ?? undefined} alt={provider.attributes.name ?? undefined} className="modal-img" />
              <h2 className="provider-name title">{provider.attributes.name}</h2>
            </section>
            <div className="modal-tabs">
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
                onKeyDown={(e) => handleKeyDown(e, 'details')}
                tabIndex={0}
              >
                Details
              </button>
              <button
                className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
                onClick={() => setActiveTab('locations')}
                onKeyDown={(e) => handleKeyDown(e, 'locations')}
                tabIndex={0}
              >
                Locations
              </button>
              <button
                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
                onKeyDown={(e) => handleKeyDown(e, 'reviews')}
                tabIndex={0}
              >
                Testimonials
              </button>
              <button
                className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
                onClick={() => setActiveTab('media')}
                onKeyDown={(e) => handleKeyDown(e, 'media')}
                tabIndex={0}
              >
                Media
              </button>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;