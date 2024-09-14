import React from 'react';
import "./InsuranceModal.css";

const InsuranceModal = ({
    isOpen,
    onClose,
    selectedInsurance,
    setSelectedInsurance,
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedInsurance: string[];
    setSelectedInsurance: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    const insuranceOptions = [
        'Insurance ABCDEFG', 'Insurance B', 'Insurance C', 'Insurance D', 'Insurance E',
        'Insurance F', 'Insurance G', 'Insurance H', 'Insurance I', 'Insurance J',
        'Insurance K', 'Insurance L', 'Insurance M', 'Insurance N', 'Insurance O',
        'Insurance P', 'Insurance Q', 'Insurance R', 'Insurance S', 'Insurance T',
        'Insurance U', 'Insurance V', 'Insurance W', 'Insurance X', 'Insurance Y',
        'Insurance Z'
    ];

    const handleSelect = (option: string) => {
        setSelectedInsurance(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal">
                <h2>Select Insurance Coverage</h2>
                <div className="modal-insurance-container">
                    {insuranceOptions.map(option => (
                        <div key={option} className='modal-insurance'>
                            <input
                                type="checkbox"
                                checked={selectedInsurance.includes(option)}
                                onChange={() => handleSelect(option)}
                            />
                            {option}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className='insuranceModalButton'>Close</button>
            </div>
        </>
    );
};

export default InsuranceModal;