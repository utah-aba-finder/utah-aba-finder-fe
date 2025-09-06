import React from 'react';
import './ProviderModal.css';
import GoogleMap from './GoogleMap';
import { MapPin, Phone, Globe, Mail, Briefcase, Home, Building, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react';
import moment from 'moment';
import GoogleReviewsSection from './GoogleReviewsSection';
import ProviderLogo from '../Utility/ProviderLogo';

interface Location {
  name?: string | null;
  address_1: string | null;
  address_2?: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone?: string | null;
  services?: Service[];
  in_home_waitlist?: string | null;
  in_clinic_waitlist?: string | null;
}

interface Insurance {
  name: string | null;
}

interface ProviderType {
  name: string;
}

interface ServiceDelivery {
  in_home: boolean;
  in_clinic: boolean;
  telehealth: boolean;
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
  // New fields from API update
  in_home_only?: boolean;
  service_delivery?: ServiceDelivery;
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
  // Debug: Check logo data


  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
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
              
              {/* Service Delivery Information */}
              <div className="service-delivery-section">
                <h4><strong>Service Delivery Options:</strong></h4>
                <div className="service-delivery-badges">
                  {provider.attributes.in_home_only ? (
                    <span className="service-badge in-home-only">
                      <Home size={14} style={{ marginRight: '6px' }} />
                      In-Home Services Only
                    </span>
                  ) : (
                    <>
                      {provider.attributes.at_home_services && provider.attributes.at_home_services.toLowerCase().includes('yes') && (
                        <span className="service-badge in-home">
                          <Home size={14} style={{ marginRight: '6px' }} />
                          In-Home Services
                        </span>
                      )}
                      {provider.attributes.in_clinic_services && provider.attributes.in_clinic_services.toLowerCase().includes('yes') && (
                        <span className="service-badge in-clinic">
                          <Building size={14} style={{ marginRight: '6px' }} />
                          In-Clinic Services
                        </span>
                      )}
                      {provider.attributes.telehealth_services && provider.attributes.telehealth_services.toLowerCase().includes('yes') && (
                        <span className="service-badge telehealth">
                          <Monitor size={14} style={{ marginRight: '6px' }} />
                          Telehealth Services
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Waitlist Information */}
              {(provider.attributes.waitlist || (provider.attributes as any).waitlist_status) && (
                <div className="waitlist-section">
                  <h4><strong>Waitlist Information:</strong></h4>
                  <div className="waitlist-details">
                    {provider.attributes.waitlist && (
                      <p className="waitlist-item">
                        <span className="waitlist-label">General Waitlist:</span>
                        <span className="waitlist-value">{provider.attributes.waitlist}</span>
                      </p>
                    )}
                    
                    {(provider.attributes as any).waitlist_status && (
                      <p className="waitlist-item">
                        <span className="waitlist-label">Waitlist Status:</span>
                        <span className="waitlist-value">{(provider.attributes as any).waitlist_status}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="provider-contact text">
                <p><Phone style={{ marginRight: '8px' }} />
                  <strong>Phone: </strong>
                  {primaryLocation?.phone ? <a href={`tel:${primaryLocation.phone}`}>{primaryLocation.phone}</a> : 'Provider does not have a number for this location yet.'}
                </p>
                {/* Show website and email for all providers */}
                <p><Globe style={{ marginRight: '8px' }} />
                  <strong>Website: </strong>
                  {provider.attributes.website ? <a href={provider.attributes.website} target="_blank" rel="noopener noreferrer">{provider.attributes.website}</a> : 'Provider does not have a website yet.'}
                </p>
                <p className="email-text"><Mail style={{ marginRight: '8px' }} />
                  <strong>Email: </strong>
                  {provider.attributes.email ? <a href={`mailto:${provider.attributes.email}`} target="_blank" rel="noopener noreferrer">{provider.attributes.email}</a> : 'Provider does not have an email yet.'}
                </p>
              </div>
            </div>
            <div className="provider-details text">
              {/* Show counties served for all providers */}
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
              
              {/* Show ages served for all providers */}
              <p><strong>Ages Served:</strong> {provider.attributes.min_age} - {provider.attributes.max_age} years</p>
              
              {/* Show insurance for all providers */}
              <p><strong>Insurance:</strong> {provider.attributes.insurance.map(i => i.name).join(', ') || 'Contact us'}</p>
              
              {/* Only show additional details for non-in-home-only providers */}
              {!provider.attributes.in_home_only && (
                <>
                  <p><strong>Telehealth Services:</strong> {provider.attributes.telehealth_services || 'Contact us'}</p>
                  <p><strong>At Home Services:</strong> {provider.attributes.at_home_services || 'Contact us'}</p>
                  <p><strong>In-Clinic Services:</strong> {provider.attributes.in_clinic_services || 'Contact us'}</p>
                  <p><strong>Spanish Speakers:</strong> {provider.attributes.spanish_speakers || 'Contact us'}</p>
                  <p><strong>Cost:</strong> {provider.attributes.cost || 'Contact us'}</p>
                </>
              )}
              
              {/* Show simplified info for in-home-only providers */}
              {provider.attributes.in_home_only && (
                <>
                  <p><strong>Service Type:</strong> In-Home Services Only</p>
                  <p><strong>Spanish Speakers:</strong> {provider.attributes.spanish_speakers || 'Contact us'}</p>
                  <p><strong>Cost:</strong> {provider.attributes.cost || 'Contact us'}</p>
                </>
              )}
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
                      {provider.attributes.in_home_only ? (
                        'In-Home Services Only - No Physical Location'
                      ) : location.address_1 ? (
                        `${location.address_1}${location.address_2 ? `, ${location.address_2}` : ''}${location.city ? `, ${location.city}` : ''}${location.state ? `, ${location.state}` : ''} ${location.zip || ''}`
                      ) : (
                        'Physical address is not available for this provider.'
                      )}
                    </p>
                    <p><Phone style={{ marginRight: '8px' }} />
                      <strong>Phone: </strong>
                      {location.phone ? <a href={`tel:${location.phone}`}>{location.phone}</a> : 'Provider does not have a number for this location yet.'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">In-Home Waitlist:</span>{" "}
                      {location.in_home_waitlist || "Contact us"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">In-Clinic Waitlist:</span>{" "}
                      {provider.attributes.in_clinic_services === "No" 
                        ? "This service isn't provided at this clinic" 
                        : location.in_clinic_waitlist || "Contact us"}
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
        return (
          <GoogleReviewsSection 
            providerName={provider.attributes.name || ''}
            providerAddress={primaryLocation ? `${primaryLocation.address_1 || ''} ${primaryLocation.city || ''} ${primaryLocation.state || ''}` : ''}
            providerWebsite={provider.attributes.website || undefined}
            googleApiKey={process.env.REACT_APP_GOOGLE_PLACES_API_KEY || ''}
          />
        );
    }
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

  return (
    <div className={`modal-overlay ${isVisible ? 'show' : ''} ${isClosing ? 'hide' : ''}`}>
      <div className="modal-container">
        <button className="close-button" onClick={handleClose} aria-label="Close Modal">
          &times;
        </button>
        <div className="modal-grid">
          <div className="modal-grid-map">
            <GoogleMap address={mapAddress || (primaryLocation?.address_1
              ? `${primaryLocation.address_1}, ${primaryLocation.city}, ${primaryLocation.state} ${primaryLocation.zip}`
              : provider.states?.[0] || '')}
            />
            {/* Open in Google Maps link */}
            {mapAddress && (
              <div className="mt-2 text-center">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>
          <div className="modal-grid-text">
            <section className="modal-logo">
              <ProviderLogo 
                provider={provider.attributes} 
                className="modal-img"
                size="large"
              />
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
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;