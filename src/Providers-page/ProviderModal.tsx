import React from 'react';
import './ProviderModal.css';

interface Location {
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
}

interface ProviderModalProps {
  provider: ProviderAttributes;
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ provider, onClose }) => {
  if (!provider) return null;

  // Get the main address (address_1 and address_2)
  const address = provider.locations[0]?.address_1 || 'N/A';
  const address2 = provider.locations[0]?.address_2 ? `, ${provider.locations[0]?.address_2}` : '';
  const city = provider.locations[0]?.city || 'N/A';
  const state = provider.locations[0]?.state || 'N/A';
  const zip = provider.locations[0]?.zip || 'N/A';
  const phone = provider.locations[0]?.phone || 'N/A';

  // Join insurance names
  const insuranceNames = provider.insurance.map(i => i.name).join(', ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{provider.name}</h2>
        {provider.website && (
          <p><strong>Website:</strong> <a href={provider.website} target="_blank" rel="noopener noreferrer">{provider.website}</a></p>
        )}
        <p><strong>Address:</strong> {address}{address2}, {city}, {state}, {zip}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Email:</strong> {provider.email || 'N/A'}</p>
        <p><strong>Insurance:</strong> {insuranceNames || 'N/A'}</p>
        <p><strong>Cost:</strong> {provider.cost || 'N/A'}</p>
        <p><strong>Ages Served:</strong> {provider.min_age || 'N/A'} - {provider.max_age || 'N/A'}</p>
        <p><strong>Waitlist:</strong> {provider.waitlist || 'N/A'}</p>
        <p><strong>Telehealth Services:</strong> {provider.telehealth_services || 'N/A'}</p>
        <p><strong>Spanish Speakers:</strong> {provider.spanish_speakers || 'N/A'}</p>
        <p><strong>At Home Services:</strong> {provider.at_home_services || 'N/A'}</p>
        <p><strong>In Clinic Services:</strong> {provider.in_clinic_services || 'N/A'}</p>
        <p><strong>Counties Served:</strong> {provider.counties_served.map(c => c.county).join(', ') || 'N/A'}</p>
      </div>
    </div>
  );
};

export default ProviderModal;
