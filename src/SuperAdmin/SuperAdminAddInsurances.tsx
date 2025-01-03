import { useState } from 'react';

const SuperAdminAddInsurances = ({handleCloseForm}: {handleCloseForm: () => void}) => {
    const [searchInsurance, setSearchInsurance] = useState('');
    const [insuranceName, setInsuranceName] = useState('');

const mockInsurance = [
    {
        id: 1,
        name: 'Blue Cross Blue Shield'
    },
    {
        id: 2,
        name: 'United Healthcare'
    },
    {
        id: 3,
        name: 'Aetna'
    },
    {
        id: 4,
        name: 'U of U Health Plans'
    },
    {
        id: 5,
        name: 'Deseret Mutual Benefits Administration (DMBA) '
    }
]

    const filteredInsurance = mockInsurance.filter((insurance) => insurance.name.toLowerCase().includes(searchInsurance.toLowerCase()));

    return (
        <div className='flex items-center justify-center w-full'>
                <div className='flex flex-col items-center w-1/2 border-2 border-red rounded-md p-8 text-center'>
              <h1 className='text-2xl font-bold'>Current Insurances</h1>
                    <input type='text' placeholder='Search Insurance' className='border-2 border-gray-300 p-2 rounded-md w-full' value={searchInsurance} onChange={(e) => setSearchInsurance(e.target.value)} />
                    <ul className='flex flex-col justify-center w-full'>
                        {filteredInsurance.sort((a, b) => a.name.localeCompare(b.name)).map((insurance, index) => (
                            <li className='flex'>
                                <label className='text-sm'>
                                    <span className='text-black'>{index + 1}. </span>
                                    <span className='text-blue-500'>{insurance.name}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            <div className='flex flex-col items-center justify-center w-full'>
                        <h1 className='text-2xl font-bold '>Add Insurance</h1>
                <form className='flex flex-col items-center w-1/2 border-2 border-red rounded-md p-4'>
                        <textarea className='border-2 border-gray-300 p-2 rounded-md w-full max-w-full max-h-fit min-w-fit' placeholder='Insurance Name' value={insuranceName} onChange={(e) => setInsuranceName(e.target.value)} />
                        <button className='bg-blue-500 text-white p-2 rounded-md w-fit-content mt-4 cursor-pointer hover:bg-green-500 hover:text-white' type='submit'>Add</button>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminAddInsurances;