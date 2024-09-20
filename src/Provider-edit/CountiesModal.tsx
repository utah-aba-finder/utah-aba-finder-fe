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
    const [localCheckedCounties, setLocalCheckedCounties] = useState<string[]>([]);

    const countiesOptions = [
        'Beaver', 'Box Elder', 'Cache', 'Carbon', 'Daggett',
        'Davis', 'Duchesne', 'Emery', 'Garfield', 'Grand',
        'Iron', 'Juab', 'Kane', 'Millard', 'Morgan',
        'Piute', 'Rich', 'Salt Lake', 'San Juan', 'Sanpete',
        'Sevier', 'Summit', 'Tooele', 'Uintah', 'Utah',
        'Wasatch', 'Washington', 'Wayne', 'Weber'
    ];

    useEffect(() => {
        setLocalCheckedCounties(selectedCounties.map(c => c.county).filter((county): county is string => county !== null));
    }, [selectedCounties, isOpen]);

    const handleSelect = useCallback((value: string) => {
        setLocalCheckedCounties(prev => 
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
    }, []);

     const isCountyChecked = useCallback(
        (value: string) => localCheckedCounties.includes(value),
        [localCheckedCounties]
    );

    const handleSubmit = () => {
        onCountiesChange(localCheckedCounties.map(county => ({ county })));
        onClose();
    };

    const handleCancel = () => {
        setLocalCheckedCounties(selectedCounties.map(c => c.county).filter((county): county is string => county !== null));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal">
                <h2>Select Counties</h2>
                <div className="counties-options">
                    {countiesOptions.map(option => (
                        <div key={option} className="county-option">
                            <input
                                type="checkbox"
                                checked={isCountyChecked(option)}
                                onChange={() => handleSelect(option)}
                                id={`county-${option}`}
                            />
                            <label htmlFor={`county-${option}`}>{option}</label>
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
