import React from 'react';
import './ProviderModal.css';

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
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ provider, onClose }) => {
  if (!provider) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <img src={provider.logo ?? undefined} alt={provider.name ?? undefined} className="modal-provider-logo" />

        <div className="company-info">
          <h2>{provider.name}</h2>

          {provider.locations.length > 0 ? (
            provider.locations.slice(0, 4).map((location, index) => (
              <p key={index}>
                <strong>Location {index + 1}:</strong>
                {location.name && <span> {location.name}, </span>}
                {location.address_1 && <span>{location.address_1}, </span>}
                {location.address_2 && <span>{location.address_2}, </span>}
                {location.city && <span>{location.city}, </span>}
                {location.state && <span>{location.state} </span>}
                {location.zip && <span>{location.zip}</span>}
                {location.phone && <span> - Phone: <a href={`tel:${location.phone}`}>{location.phone}</a></span>}
              </p>
            ))
          ) : (
            <p><strong>Physical address is not available for this provider</strong></p>
          )}

          <p><strong>Website:</strong> <a href={provider.website ?? undefined} target="_blank" rel="noopener noreferrer">{provider.website ?? 'N/A'}</a></p>
          <p className='email-text'><strong>Email:</strong> <a href={`mailto:${provider.email ?? ''}`} target="_blank" rel="noopener noreferrer">{provider.email ?? 'Does not have an email'}</a></p>
        </div>

        <div className="details">
          <p><strong>Counties Served:</strong> {provider.counties_served[0]?.county || 'N/A'}</p>
          <p><strong>Ages Served:</strong> {provider.min_age} - {provider.max_age} years</p>
          <p><strong>Waitlist:</strong> {provider.waitlist || 'N/A'}</p>
          <p><strong>Telehealth Services:</strong> {provider.telehealth_services || 'N/A'}</p>
          <p><strong>Spanish Speakers:</strong> {provider.spanish_speakers || 'N/A'}</p>
          <p><strong>Insurance:</strong> {provider.insurance.map(i => i.name).join(', ') || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;