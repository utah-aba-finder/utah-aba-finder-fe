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
        // When modal opens or selectedInsurances changes, update local state
        // Match by both ID and name to handle cases where IDs might not match
        if (isOpen && insurance.length > 0 && selectedInsurances.length > 0) {
            // Match selected insurances with available insurance list by name
            const matched = selectedInsurances.map(selected => {
                // Try to find by ID first
                const byId = insurance.find(i => i.id === selected.id);
                if (byId) {
                    return {
                        id: byId.id,
                        name: byId.attributes.name,
                        accepted: selected.accepted !== undefined ? selected.accepted : true
                    };
                }
                // Try to find by name
                const byName = insurance.find(i => 
                    i.attributes?.name?.toLowerCase() === (selected.name || '').toLowerCase()
                );
                if (byName) {
                    return {
                        id: byName.id,
                        name: byName.attributes.name,
                        accepted: selected.accepted !== undefined ? selected.accepted : true
                    };
                }
                // Return as-is if no match found
                return selected;
            });
            setLocalSelectedInsurances(matched);
        } else {
            setLocalSelectedInsurances(selectedInsurances);
        }
    }, [selectedInsurances, isOpen, insurance]);

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
        (id: number) => {
            // Check by ID first
            if (localSelectedInsurances.some(i => i.id === id)) return true;
            // Also check by name in case IDs don't match
            const insuranceItem = insurance.find(i => i.id === id);
            if (insuranceItem) {
                return localSelectedInsurances.some(i => 
                    (i.name || '').toLowerCase() === (insuranceItem.attributes?.name || '').toLowerCase()
                );
            }
            return false;
        },
        [localSelectedInsurances, insurance]
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