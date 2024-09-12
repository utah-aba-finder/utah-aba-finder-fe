import React from 'react';
import './CountiesModal.css';

const CountiesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedCounties: string[];
    setSelectedCounties: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ isOpen, onClose, selectedCounties, setSelectedCounties }) => {
    const countiesOptions = [
        'Beaver County', 'Box Elder County', 'Cache County', 'Carbon County', 'Daggett County',
        'Davis County', 'Duchesne County', 'Emery County', 'Garfield County', 'Grand County',
        'Iron County', 'Juab County', 'Kane County', 'Millard County', 'Morgan County',
        'Piute County', 'Rich County', 'Salt Lake County', 'San Juan County', 'Sanpete County',
        'Sevier County', 'Summit County', 'Tooele County', 'Uintah County', 'Utah County',
        'Wasatch County', 'Washington County', 'Wayne County', 'Weber County'
    ];

    const handleSelect = (option: string) => {
        setSelectedCounties(prev =>
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
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
                                checked={selectedCounties.includes(option)}
                                onChange={() => handleSelect(option)}
                            />
                            {option}
                        </div>
                    ))}
                </div>
                <button onClick={onClose}>Close</button>
            </div>
        </>
    );
};

export default CountiesModal;