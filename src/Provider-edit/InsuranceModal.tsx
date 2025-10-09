import { useEffect, useCallback, useState } from 'react';
import "./InsuranceModal.css";
import { Insurance, InsuranceData } from '@/Utility/Types';
import { fetchInsurance } from '../Utility/ApiCall';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [insurance, setInsurance] = useState<InsuranceData[]>([]);

    useEffect(() => {
        const loadInsurance = async () => {
            const insurances = await fetchInsurance();
            setInsurance(insurances);
        }
        loadInsurance();
    }, []);

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

    const filteredInsurances = (insurance || []).filter(ins => 
        ins.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(ins => ({
        id: ins.id,
        name: ins.attributes.name
    }));

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="insurance-modal">
                <h2>Select Insurance Coverage</h2>
                <input
                    type="text"
                    placeholder="Search insurances..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 p-2 mb-4 border rounded mx-auto block"
                />
                <div className="modal-insurance-container">
                    {filteredInsurances.sort((a, b) => a.name.localeCompare(b.name)).map(option => (
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