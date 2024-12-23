import React, { useState, useCallback, useEffect } from 'react';
import './CountiesModal.css';
import { CountiesServed } from '../Utility/Types';

interface CountiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCounties: CountiesServed[];
    onCountiesChange: (counties: CountiesServed[]) => void;
    providerCounties: CountiesServed[];
}

const CountiesModal: React.FC<CountiesModalProps> = ({
    isOpen,
    onClose,
    selectedCounties,
    onCountiesChange,
    providerCounties
}) => {
    const [localCheckedCounties, setLocalCheckedCounties] = useState<CountiesServed[]>([]);

    const countiesOptions = [
        { id: 1, name: 'Beaver' },
        { id: 2, name: 'Box Elder' }, 
        { id: 3, name: 'Cache' },
        { id: 4, name: 'Carbon' },
        { id: 5, name: 'Daggett' },
        { id: 6, name: 'Davis' },
        { id: 7, name: 'Duchesne' },
        { id: 8, name: 'Emery' },
        { id: 9, name: 'Garfield' },
        { id: 10, name: 'Grand' },
        { id: 11, name: 'Iron' },
        { id: 12, name: 'Juab' },
        { id: 13, name: 'Kane' },
        { id: 14, name: 'Millard' },
        { id: 15, name: 'Morgan' },
        { id: 16, name: 'Piute' },
        { id: 17, name: 'Rich' },
        { id: 18, name: 'Salt Lake' },
        { id: 19, name: 'San Juan' },
        { id: 20, name: 'Sanpete' },
        { id: 21, name: 'Sevier' },
        { id: 22, name: 'Summit' },
        { id: 23, name: 'Tooele' },
        { id: 24, name: 'Uintah' },
        { id: 25, name: 'Utah' },
        { id: 26, name: 'Wasatch' },
        { id: 27, name: 'Washington' },
        { id: 28, name: 'Wayne' },
        { id: 29, name: 'Weber' }
    ];

    useEffect(() => {
        if (selectedCounties.length > 0) {
            setLocalCheckedCounties(selectedCounties);
        } else {
            setLocalCheckedCounties([]);
        }
    }, [selectedCounties, isOpen]);

    const handleSelect = (county_id: number, county_name: string) => {
        setLocalCheckedCounties(prev => {
            if (prev.some(c => c.county_id === county_id)) {
                return prev.filter(c => c.county_id !== county_id);
            } else {
                return [...prev, { county_id, county_name }];
            }
        });
    };

    const isCountyChecked = useCallback(
        (id: number) => localCheckedCounties.some(county => county.county_id === id),
        [localCheckedCounties]
    );

    const handleSubmit = () => {
        onCountiesChange(localCheckedCounties);
        onClose();
    };

    const handleCancel = () => {
        setLocalCheckedCounties(selectedCounties);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>

            <div className="counties-modal">
                <h2>Select Counties</h2>

                <div className="counties-options">
                    {countiesOptions.map(option => (
                        <div key={option.id} className="county-option">
                            <input
                                type="checkbox"
                                checked={isCountyChecked(option.id)}
                                onChange={() => handleSelect(option.id, option.name)}
                                id={`county-${option.id}`}
                            />
                            <label htmlFor={`county-${option.id}`}>{option.name}</label>
                        </div>
                    ))}
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
