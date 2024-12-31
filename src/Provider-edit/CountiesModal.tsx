import React, { useState, useEffect } from 'react';
import './CountiesModal.css';
import { CountiesServed, CountyData } from '../Utility/Types';

interface CountiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCounties: CountiesServed[];
    onCountiesChange: (counties: CountiesServed[]) => void;
    availableCounties: CountyData[];
}

const CountiesModal: React.FC<CountiesModalProps> = ({
    isOpen,
    onClose,
    selectedCounties,
    onCountiesChange,
    availableCounties
}) => {
    const [localCheckedCounties, setLocalCheckedCounties] = useState<CountiesServed[]>([]);

    useEffect(() => {
        setLocalCheckedCounties(selectedCounties);
    }, [selectedCounties, isOpen]);

    const handleSelect = (countyId: number, countyName: string) => {
        console.log('Selected county:', {
            id: countyId,
            name: countyName,
            state: availableCounties.find(c => c.id === countyId)?.attributes.state
        });

        setLocalCheckedCounties(prev => {
            if (prev.some(c => c.county_id === countyId)) {
                return prev.filter(c => c.county_id !== countyId);
            } else {
                return [...prev, { 
                    county_id: countyId, 
                    county_name: countyName,
                    state: availableCounties.find(c => c.id === countyId)?.attributes.state
                }];
            }
        });
    };

    const handleSubmit = () => {
        onCountiesChange(localCheckedCounties);
        onClose();
    };

    const handleCancel = () => {
        setLocalCheckedCounties(selectedCounties);
        onClose();
    };

    console.log("Available counties in modal:", availableCounties); // Debug log

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>

            <div className="counties-modal">
                <h2>Select Counties</h2>

                <div className="counties-options">
                    {availableCounties.length > 0 ? (
                        availableCounties.map(county => (
                            <div key={county.id} className="county-option">
                                <input
                                    type="checkbox"
                                    checked={localCheckedCounties.some(c => c.county_id === county.id)}
                                    onChange={() => handleSelect(county.id, county.attributes.name)}
                                    id={`county-${county.id}`}
                                />
                                <label htmlFor={`county-${county.id}`}>
                                    {county.attributes.name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p>No counties available for selected state</p>
                    )}
                </div>

                <div className='countyModalButtonSection'>
                    <button className="counties-options-button" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="counties-options-button" onClick={handleSubmit}>
                        Save
                    </button>
                </div>

            </div>
        </>
    );
};

export default CountiesModal;
