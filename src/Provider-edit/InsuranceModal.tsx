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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInsurance = async () => {
            try {
                setIsLoading(true);
                console.log('🔄 Loading insurances...');
                const insurances = await fetchInsurance();
                console.log('✅ Insurances loaded:', insurances);
                console.log('✅ Insurances type:', typeof insurances);
                console.log('✅ Is array?:', Array.isArray(insurances));
                console.log('✅ Insurances length:', insurances?.length);
                
                // Handle both array and undefined cases
                if (insurances && Array.isArray(insurances)) {
                    setInsurance(insurances);
                } else {
                    console.warn('⚠️ Insurances is not an array, setting empty array');
                    setInsurance([]);
                }
            } catch (error) {
                console.error('❌ Error loading insurances:', error);
                setInsurance([]);
            } finally {
                setIsLoading(false);
            }
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
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading insurance options...</p>
                        </div>
                    ) : filteredInsurances.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No insurance options found.</p>
                        </div>
                    ) : (
                        filteredInsurances.sort((a, b) => a.name.localeCompare(b.name)).map(option => (
                            <div key={option.id} className='modal-insurance'>
                                <input
                                    type="checkbox"
                                    checked={isInsuranceSelected(option.id)}
                                    onChange={() => handleSelect(option)}
                                />
                                {option.name}
                            </div>
                        ))
                    )}
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