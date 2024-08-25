import React from 'react';
import './ProviderModal.css';

interface ProviderAttributes {
  name: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  insurance: string;
  locations_served: string;
  cost: string;
  ages_served: string;
  waitlist: string;
  telehealth_services: string;
  spanish_speakers: string;
}

interface ProviderModalProps {
  provider: ProviderAttributes;
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ provider, onClose }) => {
  if (!provider) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{provider.name}</h2>
        <p><strong>Website:</strong> <a href={provider.website} target="_blank" rel="noopener noreferrer">{provider.website}</a></p>
        <p><strong>Address:</strong> {provider.address}</p>
        <p><strong>Phone:</strong> {provider.phone}</p>
        <p><strong>Email:</strong> {provider.email}</p>
        <p><strong>Insurance:</strong> {provider.insurance}</p>
        <p><strong>Locations Served:</strong> {provider.locations_served}</p>
        <p><strong>Cost:</strong> {provider.cost}</p>
        <p><strong>Ages Served:</strong> {provider.ages_served}</p>
        <p><strong>Waitlist:</strong> {provider.waitlist}</p>
        <p><strong>Telehealth Services:</strong> {provider.telehealth_services}</p>
        <p><strong>Spanish Speakers:</strong> {provider.spanish_speakers}</p>
      </div>
    </div>
  );
};

export default ProviderModal;
