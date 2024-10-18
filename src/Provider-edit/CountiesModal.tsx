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
    const [localCheckedCounties, setLocalCheckedCounties] = useState<String[]>([]);

    const countiesOptions = [
        'Beaver', 'Box Elder', 'Cache', 'Carbon', 'Daggett',
        'Davis', 'Duchesne', 'Emery', 'Garfield', 'Grand',
        'Iron', 'Juab', 'Kane', 'Millard', 'Morgan',
        'Piute', 'Rich', 'Salt Lake', 'San Juan', 'Sanpete',
        'Sevier', 'Summit', 'Tooele', 'Uintah', 'Utah',
        'Wasatch', 'Washington', 'Wayne', 'Weber'
    ];

    useEffect(() => {
        if (selectedCounties.length > 0 && selectedCounties[0].county) {
            setLocalCheckedCounties(selectedCounties[0].county.split(', '));
        } else {
            setLocalCheckedCounties([]);
        }
    }, [selectedCounties, isOpen]);

    const handleSelect = (county: string) => {
        setLocalCheckedCounties(prev => {
            if (prev.includes(county)) {
                return prev.filter(c => c !== county);
            } else {
                return [...prev, county];
            }
        });
    };

    const isCountyChecked = useCallback(
        (value: string) => localCheckedCounties.includes(value),
        [localCheckedCounties]
    );

    const handleSubmit = () => {
        const selectedCountiesString = localCheckedCounties.join(', ');
        onCountiesChange([{ county: selectedCountiesString }]);
        onClose();
    };

    const handleCancel = () => {
        setLocalCheckedCounties(selectedCounties[0]?.county?.split(', ') || []);
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
