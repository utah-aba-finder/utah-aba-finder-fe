import { useEffect, useCallback, useState } from 'react';
import "./InsuranceModal.css";
import { Insurance } from '@/Utility/Types';

interface InsuranceModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedInsurances: Insurance[];
    onInsurancesChange: (insurances: Insurance[]) => void;
    providerInsurances: Insurance[];
}

const InsuranceModal: React.FC<InsuranceModalProps> = ({
    isOpen,
    onClose,
    selectedInsurances,
    onInsurancesChange,
    providerInsurances
}) => {
    const [localSelectedInsurances, setLocalSelectedInsurances] = useState<Insurance[]>([]);

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
      useEffect(() => {
        setLocalSelectedInsurances(selectedInsurances);
    }, [selectedInsurances, isOpen]);

    const handleSelect = useCallback((insurance: Omit<Insurance, 'accepted'>) => {
        setLocalSelectedInsurances(prev => {
            const exists = prev.some(i => i.id === insurance.id);
            if (exists) {
                return prev.filter(i => i.id !== insurance.id);
            } else {
                return [...prev, { ...insurance, accepted: true }];
            }
        });
    }, []);
    
    
    const isInsuranceSelected = useCallback(
        (id: number) => localSelectedInsurances.some(i => i.id === id),
        [localSelectedInsurances]
    );

    const handleSubmit = () => {
        onInsurancesChange(localSelectedInsurances);
        onClose();
    };
    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="insurance-modal">
                <h2>Select Insurance Coverage</h2>
                <div className="modal-insurance-container">
                    {insuranceOptions.map(option => (
                        <div key={option.id} className='modal-insurance'>
                            <input
                                type="checkbox"
                                checked={isInsuranceSelected(option.id)}
                                onChange={() => handleSelect(option)}
                                />
                            {option.name}
                        </div>
                    ))}
                </div>
                <div className='insuranceModalButtons'>
                    <button onClick={onClose} className='insurance'>Close</button>
                    <button onClick={handleSubmit} className='insurance'>Save</button>
                </div>
            </div>
        </>
    );
};

export default InsuranceModal;