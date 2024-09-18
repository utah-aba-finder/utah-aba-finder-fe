import React from 'react';
import "./InsuranceModal.css";
import { Insurance } from '@/Utility/Types';

const InsuranceModal = ({
    isOpen,
    onClose,
    selectedInsurance,
    setSelectedInsurance,
    providerInsurance,
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedInsurance: Insurance[];
    setSelectedInsurance: React.Dispatch<React.SetStateAction<Insurance[]>>;
    providerInsurance: Insurance[];
}) => {
    const insuranceOptions = [
        { id: 1, name: "Contact us" },
        { id: 2, name: "Administrator Benefits" },
        { id: 3, name: "Aetna" },
        { id: 4, name: "Meritain (Aetna)" },
        { id: 5, name: "Anthem (BCBS)" },
        { id: 6, name: "Regence (BCBS)" },
        { id: 7, name: "Beacon Health" },
        { id: 8, name: "Blue Cross Blue Shield (BCBS)" },
        { id: 9, name: "Cigna" },
        { id: 10, name: "Compsych" },
        { id: 11, name: "Deseret Mutual Benefit Administrators (DMBA)" },
        { id: 12, name: "EMI Health" },
        { id: 13, name: "Evernorth (Cigna)" },
        { id: 14, name: "FSA" },
        { id: 15, name: "Health Choice Utah" },
        { id: 16, name: "Healthy U Medicaid (University of Utah Health Plans)" },
        { id: 17, name: "HSA" },
        { id: 18, name: "Magellan" },
        { id: 19, name: "Medicaid" },
        { id: 20, name: "Molina" },
        { id: 21, name: "MotivHealth" },
        { id: 22, name: "Optum (UnitedHealth Group)" },
        { id: 23, name: "PEHP (Public Employees Health Program)" },
        { id: 24, name: "Select Health" },
        { id: 25, name: "Tall Tree" },
        { id: 26, name: "TRICARE" },
        { id: 27, name: "UMR (UHC)" },
        { id: 28, name: "United Behavioral Health (UBH)" },
        { id: 29, name: "United HealthCare (UHC)" },
        { id: 30, name: "University of Utah Health Plans" },
        { id: 31, name: "Utah’s Children’s Health Insurance Program (CHIP)" },
        { id: 32, name: "Utah Services for People with Disabilities (DSPD)" },
        { id: 33, name: "Wise Imagine" }
      ];
      

    const handleSelect = (option: Insurance) => {
        setSelectedInsurance(prev =>
            prev.some(item => item.id === option.id)
                ? prev.filter(item => item.id !== option.id)
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
                        <div key={option.id} className='modal-insurance'>
                            <input
                                type="checkbox"
                                checked={selectedInsurance.some(item => item.id === option.id) || 
                                        providerInsurance.some(item => item.id === option.id)}
                                onChange={() => handleSelect(option)}
                                />
                            {option.name}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className='insurance'>Close</button>
            </div>
        </>
    );
};

export default InsuranceModal;