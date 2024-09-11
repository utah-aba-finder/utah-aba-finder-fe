import React, { useState, useEffect } from 'react';
// import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Box, VStack } from "@chakra-ui/react";
import './InsuranceModal.css';
import { fetchProviders } from '../Utility/ApiCall';
import { MockProviders } from '../Utility/Types';

interface Insurance {
    name: string;
}

interface InsuranceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selectedInsurances: string[]) => void;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [selectedInsurances, setSelectedInsurances] = useState<Record<string, boolean>>({});
    const [allInsurances, setAllInsurances] = useState<Insurance[]>([]);

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>, insuranceName: string) => {
        setSelectedInsurances(prev => ({
            ...prev,
            [insuranceName]: e.target.checked
        }));
    };

    useEffect(() => {
        const getProviders = async () => {
          try {
            const providersList: MockProviders = await fetchProviders();
            const uniqueInsurances = new Set<string>();
            
            // Map over providers, add unique insurances to the Set
            providersList.data.forEach(provider => {
                provider.attributes.insurance?.forEach(insurance => {
                    uniqueInsurances.add(insurance.name || '');
                });
            });

            // Convert the Set back to an array of Insurance objects
            const mappedProviders = Array.from(uniqueInsurances).map(name => ({ name }));

            // Sort the insurances alphabetically
            const sortedInsurances = mappedProviders.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setAllInsurances(sortedInsurances );
          } catch (error) {
            console.error('Error loading providers:', error);
          }
        };
    
        getProviders();
      }, []);

    const handleSubmit = () => {
        const selectedInsuranceNames = Object.keys(selectedInsurances).filter(name => selectedInsurances[name]);
        onSelect(selectedInsuranceNames);
        onClose();
    };

    return (
        <div className="insuranceModal-overlay">
        <div className="insuranceModal-content">
          <button className="insuranceModal-close" onClick={onClose}>X</button>
                            {allInsurances.map((insurance) => (
                                <div key={insurance.name} className='insuranceInput'>
                                    <input 
                                        type="checkbox"
                                        id={insurance.name}
                                        name="insurance"
                                        value={insurance.name}
                                        checked={!!selectedInsurances[insurance.name]}
                                        onChange={(e) => handleSelect(e, insurance.name)} 
                                    />
                                    <label htmlFor={insurance.name}>{insurance.name}</label>
                                </div>
                            ))}
                        <button  onClick={handleSubmit}  className="custom-submit-button">
                            Submit
                        </button>
                        <button onClick={onClose}  className="custom-cancel-button">Cancel</button>
                    </div>
                </div>
    );
};
