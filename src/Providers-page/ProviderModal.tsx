import React from 'react';
import './ProviderModal.css';
import GoogleMap from './GoogleMap';
import { MapPin, Phone, Globe, Mail } from 'lucide-react'
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
  counties_served: { county: string | null }[];
  logo?: string | null;
  updated_last: string | null;
}

interface ProviderModalProps {
  provider: ProviderAttributes;
  address: string;
  mapAddress: string;
  onClose: () => void;
  onViewOnMapClick: (address: string) => void;
}


const ProviderModal: React.FC<ProviderModalProps> = ({ provider, address, mapAddress, onViewOnMapClick, onClose }) => {
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

  const hasMultipleLocations = provider.locations.length > 1;

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
                <span className="last-update">Last Updated {moment(provider.updated_last).format('MM/DD/YYYY')}</span>
              </div>
              <p className="provider-address-phone text">
                {provider.locations.length > 0 ? (
                  provider.locations.map((location, index) => (
                    <div key={index} className="provider-address-phone">
                      {hasMultipleLocations && (
                        <p><strong>Location {index + 1}: {location.name ? location.name : 'Unnamed Location'} -</strong>
                          <button className="view-on-map-button"
                            onClick={() => {
                              const fullAddress = `${location.address_1 || ''} ${location.address_2 || ''}, ${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim();
                              onViewOnMapClick(fullAddress);
                            }}>
                            View this address on the map
                          </button>
                        </p>
                      )}
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
                      <p><Globe style={{ marginRight: '8px' }} />
                        <strong>Website: </strong>
                        {provider.website ? <a href={provider.website} target="_blank" rel="noopener noreferrer">{provider.website}</a> : 'Provider does not have a website yet.'}
                      </p>
                      <p className="email-text"><Mail style={{ marginRight: '8px' }} />
                        <strong>Email: </strong>
                        {provider.email ? <a href={`mailto:${provider.email}`} target="_blank" rel="noopener noreferrer">{provider.email}</a> : 'Provider does not have an email yet.'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p><strong>Physical address is not available for this provider</strong></p>
                )}
              </p>
            </div>
            <div className="provider-details text">
            {provider.provider_type.length > 0 ? (
              <p><strong>Counties Served:</strong> {
                provider.counties_served?.[0]?.county && 
                provider.counties_served[0].county !== '' && 
                !provider.counties_served[0].county.includes('[]') 
                  ? (provider.counties_served[0].county.includes('ActionController') 
                      ? provider.counties_served[0].county.match(/county"=>"([^"]+)"/)?.[1] 
                      : provider.counties_served[0].county)
                  : 'Not applicable for this provider'
              }</p>
            ) : null}
              <p><strong>Ages Served:</strong> {provider.min_age} - {provider.max_age} years</p>
              <p><strong>Waitlist:</strong> {provider.waitlist || 'Contact us'}</p>
              <p><strong>Telehealth Services:</strong> {provider.telehealth_services || 'Contact us'}</p>
              <p><strong>At Home Services:</strong> {provider.provider_type.length > 0 ? (provider.at_home_services || 'Contact us') : provider.provider_type.length > 0 ? (provider.at_home_services || 'Not applicable') : null}</p>
              <p><strong>In-Clinic Services:</strong> {provider.provider_type.length > 0 ? (provider.in_clinic_services || 'Contact us') : provider.provider_type.length > 0 && provider.locations?.some(location => location.address_1 && location.city && location.state && location.zip) ? 'Yes' : 'Not applicable'}</p>
              <p><strong>Spanish Speakers:</strong> {provider.spanish_speakers || 'Contact us'}</p>
              <p><strong>Cost:</strong> {provider.cost || 'Contact us'}</p>
              <p><strong>Insurance:</strong> {provider.insurance.map(i => i.name).join(', ') || 'Contact us'}</p>
            </div>
          </section>
        );
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
            <GoogleMap address={mapAddress} />
          </div>
          <div className="modal-grid-text">
            <section className="modal-logo">
              <img src={provider.logo ?? undefined} alt={provider.name ?? undefined} className="modal-img" />
              <h2 className="provider-name title">{provider.name}</h2>
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