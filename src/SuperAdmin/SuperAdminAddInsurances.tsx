import { InsuranceData } from '@/Utility/Types';
import { useState, useEffect } from 'react';
import { fetchInsurance } from '../Utility/ApiCall';
import { toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAdminAuthHeader } from "../Utility/config";

const SuperAdminAddInsurances = ({handleCloseForm}: {handleCloseForm: () => void}) => { 
    const [searchInsurance, setSearchInsurance] = useState('');
    const [insuranceName, setInsuranceName] = useState('');
    const [editingInsurance, setEditingInsurance] = useState<InsuranceData | null>(null);
    const [insurance, setInsurance] = useState<InsuranceData[]>([]);

    useEffect(() => {
        const loadInsurance = async () => {
            const insurances = await fetchInsurance();
            setInsurance(insurances);
        }
        loadInsurance();
    }, []);

    const filteredInsurance = insurance.filter((insurance) => 
        insurance.attributes.name.toLowerCase().includes(searchInsurance.toLowerCase())
    );

    const addInsurance = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const trimmedName = insuranceName.trim();
        
        if (!trimmedName) {
            toast.error("Insurance name cannot be empty");
            return;
        }

        // Check if insurance name already exists (exact match)
        const insuranceExists = insurance.some(ins => 
            ins.attributes.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (insuranceExists && !editingInsurance) {
            toast.error("This insurance name already exists");
            return;
        }

        // When editing, check if new name conflicts with any existing insurance except the one being edited
        if (editingInsurance && insuranceExists && 
            insurance.some(ins => ins.attributes.name.toLowerCase() === trimmedName.toLowerCase() && 
            ins.attributes.name.toLowerCase() !== editingInsurance.attributes.name.toLowerCase())) {
            toast.error("This insurance name already exists");
            return;
        }

        const API_BASE_URL = "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com";
        
        try {
            const endpoint = editingInsurance 
                ? `${API_BASE_URL}/api/v1/insurances/${editingInsurance.id}`
                : `${API_BASE_URL}/api/v1/insurances`;
            
            const method = editingInsurance ? "PATCH" : "POST";
            
            const body = {
                data: [{
                    ...(editingInsurance && { id: editingInsurance.id }),
                    ...(editingInsurance && { type: "insurance" }),
                    attributes: {
                        name: trimmedName
                    }
                }]
            };

            const response = await fetch(endpoint, {
                method,
                        headers: {
          "Content-Type": "application/json",
          'Authorization': getAdminAuthHeader(),
        },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const responseText = await response.text();
                toast.error(responseText);
                throw new Error(responseText);
            }

            const updatedInsurances = await fetchInsurance();
            toast.success(editingInsurance ? "Insurance updated successfully" : "Insurance added successfully");
            setInsurance(updatedInsurances);
            setInsuranceName('');
            setEditingInsurance(null);
        } catch (error) {
    
            toast.error(error instanceof Error ? error.message : "An error occurred");
        }
    }

    const handleEdit = (insurance: InsuranceData) => {
        setEditingInsurance(insurance);
        setInsuranceName(insurance.attributes.name);
    }

    const handleDelete = async (insurance: InsuranceData) => {
        if (!window.confirm(`Are you sure you want to delete ${insurance.attributes.name}? This action cannot be undone.`)) {
            return;
        }

        const API_BASE_URL = "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com";
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/insurances/${insurance.id}`,
                {
                    method: "DELETE",
                    headers: {
                        'Authorization': getAdminAuthHeader(),
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete insurance");
            }

            const updatedInsurances = await fetchInsurance();
            toast.success(`Insurance ${insurance.attributes.name} deleted successfully`);
            setInsurance(updatedInsurances);
        } catch (error) {
    
            toast.error("Failed to delete insurance");
        }
    }

    return (
        <div className='flex w-full'>
            <ToastContainer />
            <div className='flex flex-col w-1/2 p-8 text-center'>
                <h1 className='text-2xl font-bold'>Current Insurances</h1>
                <input 
                    type='text' 
                    placeholder='Search Insurance' 
                    className='border-2 border-gray-300 p-2 rounded-md w-full' 
                    value={searchInsurance} 
                    onChange={(e) => setSearchInsurance(e.target.value)} 
                />
                <ul className='flex flex-col justify-center w-full'>
                    {filteredInsurance.sort((a, b) => 
                        a.attributes.name.localeCompare(b.attributes.name)
                    ).map((insurance, index) => (
                        <li className='flex justify-between items-center' key={index}>
                            <label className='text-sm '>
                                <span className='text-black'>{index + 1}. </span>
                                <span className='text-blue-500'>{insurance.attributes.name}</span>
                            </label>
                            <div>
                                <button 
                                    onClick={() => handleEdit(insurance)}
                                    className='text-yellow-600 mx-2 hover:text-yellow-800 cursor-pointer'
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(insurance)}
                                    className='text-red-600 mx-2 hover:text-red-800 cursor-pointer'
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex flex-col w-1/2 p-8 text-center'>
                <h1 className='text-2xl font-bold'>
                    {editingInsurance ? 'Edit Insurance' : 'Add Insurance'}
                </h1>
                <form className='flex flex-col items-center w-full p-4' onSubmit={addInsurance}>
                    <textarea 
                        className='border-2 border-gray-300 p-2 rounded-md w-full max-w-full max-h-fit min-w-fit' 
                        placeholder='Insurance Name' 
                        value={insuranceName} 
                        onChange={(e) => setInsuranceName(e.target.value)} 
                    />
                    <div className='flex gap-2 mt-4'>
                        <button 
                            className='bg-blue-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-500' 
                            type='submit'
                        >
                            {editingInsurance ? 'Update' : 'Add'}
                        </button>
                        {editingInsurance && (
                            <button 
                                className='bg-gray-500 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700'
                                onClick={() => {
                                    setEditingInsurance(null);
                                    setInsuranceName('');
                                }}
                                type='button'
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminAddInsurances;