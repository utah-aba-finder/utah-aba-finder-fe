import React, { useState, useEffect } from 'react';
import './InsuranceModal.css';
import { fetchProviders } from '../Utility/ApiCall';
import { Providers } from '../Utility/Types';

interface Insurance {
    name: string;
}

interface InsuranceModalProps {
    isOpen: boolean | any;
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
                const providersList: Providers = await fetchProviders();
                const uniqueInsurances = new Set<string>();

                providersList.data.forEach(provider => {
                    provider.attributes.insurance?.forEach(insurance => {
                        if (insurance.name) {
                            uniqueInsurances.add(insurance.name);
                        }
                    });
                });

                const sortedInsurances = Array.from(uniqueInsurances)
                    .map(name => ({ name }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setAllInsurances(sortedInsurances);
            } catch (error) {
                console.error('Error loading providers:', error);
            }
        };

        getProviders();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const selectedInsuranceNames = Object.keys(selectedInsurances).filter(name => selectedInsurances[name]);
        onSelect(selectedInsuranceNames);
        onClose();
    };

    const handleClose = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        onClose();
    };
    

    return (
        <div className="insuranceModal-overlay" onClick={handleClose}>

            <div className="insuranceModal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className='insuranceModal-title'>Select Insurance</h2>
                {/* <button className="insuranceModal-close" onClick={handleClose}>X</button> */}

                <form onSubmit={handleSubmit} className="insurancesForm">
                    {allInsurances.map((insurance) => (
                        <div key={insurance.name} className="insuranceInput">
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
                </form>

                <div className="buttonContainer">
                    <button type="button" onClick={handleClose} className="custom-cancel-button">Cancel</button>
                    <button type="submit" className="custom-submit-button">
                        Submit
                    </button>
                </div>


            </div>
        </div>
    );
};