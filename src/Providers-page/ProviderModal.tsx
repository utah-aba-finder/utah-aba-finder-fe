import React from 'react';
import './ProviderModal.css';
import GoogleMap from './GoogleMap';
import { MapPin, Phone, Globe, Mail } from 'lucide-react'
import { useEffect, useState } from 'react';

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

interface ProviderAttributes {
  name: string | null;
  locations: Location[];
  insurance: Insurance[];
  website?: string | null;
  email?: string | null;
  cost?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  waitlist?: string | null;
  telehealth_services?: string | null;
  spanish_speakers?: string | null;
  at_home_services?: string | null;
  in_clinic_services?: string | null;
  counties_served: { county: string | null }[];
  logo?: string | null;
}

interface ProviderModalProps {
  provider: ProviderAttributes;
  address: string;
  mapAddress: string;
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ provider, address, mapAddress, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the modal to appear with animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);
  if (!provider) return null;

  const hasMultipleLocations = provider.locations.length > 1;

  return (
    <div className={`modal-overlay ${isVisible ? 'show' : ''}`}>
      <div className="modal-container">
        <button className="close-button" onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        <div className="modal-grid">
          <div className="modal-grid-map">
            <GoogleMap address={mapAddress} />
          </div>

          <div className="modal-grid-text">
            <div className="modal-logo">
              <img src={provider.logo ?? undefined} alt={provider.name ?? undefined} className="modal-img" />
            </div>
            <div className="provider-main-info">
              <h2 className="provider-name title">{provider.name}</h2>
              <p className="provider-address-phone text">
                {provider.locations.length > 0 ? (
                  provider.locations.map((location, index) => (
                    <div key={index} className="provider-address-phone">
                      {hasMultipleLocations && (
                        <p><strong>Location {index + 1}: </strong></p>
                      )}
                      <p>
                        <MapPin style={{ marginRight: '8px' }} />
                        <strong>Address: </strong>
                        {location.address_1
                          ? `${location.address_1}${location.address_2 ? ', ' : ''}`
                          : 'Physical address is not available for this provider.'}
                        {location.address_2 && `${location.address_2}, `}
                        {location.city && `${location.city}, `}
                        {location.state && `${location.state} `}
                        {location.zip && `${location.zip}`}
                      </p>

                      <p>
                        <Phone style={{ marginRight: '8px' }} />
                        <strong>Phone: </strong><a href={`tel:${location.phone}`}>{location.phone}</a>
                      </p>
                      <p>
                        <Globe style={{ marginRight: '8px' }} />
                        <strong>Website:</strong> <a href={provider.website ?? undefined} target="_blank" rel="noopener noreferrer">{provider.website ?? 'Provider does not have a website yet.'}</a>
                      </p>
                      <p>
                        <Mail style={{ marginRight: '8px' }} />
                        <strong>Email:</strong> <a href={`mailto:${provider.email ?? ''}`} target="_blank" rel="noopener noreferrer">{provider.email ?? 'Provider does not have an email yet.'}</a>
                      </p>
                    </div>
                  ))
                ) : (
                  <p><strong>Physical address is not available for this provider</strong></p>
                )}
              </p>
            </div>

            <div className="provider-details text">
              <p><strong>Counties Served:</strong> {provider.counties_served[0]?.county || 'Contact us'}
              </p>

              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>Ages Served:</strong> {provider.min_age} - {provider.max_age} years</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>Waitlist:</strong> {provider.waitlist || 'Contact us'}</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>Telehealth Services:</strong> {provider.telehealth_services || 'Contact us'}</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>At Home Services:</strong> {provider.at_home_services || 'Contact us'}</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>In-Clinic Services:</strong> {provider.in_clinic_services || 'Contact us'}</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>Spanish Speakers:</strong> {provider.spanish_speakers || 'Contact us'}</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

              <p><strong>Insurance:</strong> {provider.insurance.map(i => i.name).join(', ') || 'Contact us'}</p>
              <div className="update-section">
                <span className="last-update">Last Updated - </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
