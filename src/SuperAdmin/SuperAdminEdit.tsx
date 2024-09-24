import React, { useState, useEffect } from 'react'
import { MockProviderData, ProviderAttributes } from '../Utility/Types'

interface SuperAdminEditProps {
    provider: ProviderAttributes;
    onUpdate: (updatedProvider: ProviderAttributes) => void
}

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({ provider , onUpdate }) => {
    const [editedProvider, setEditedProvider] = useState<ProviderAttributes | null>(null);

    useEffect(() => {
        if (provider) {
            setEditedProvider(provider);
        }
    }, [provider]);

    if (!editedProvider) {
        return <p>Loading provider data...</p>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedProvider(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editedProvider) {
            onUpdate(editedProvider);
        }
    };

  
    return (
    <div className='superAdminEditWrapper'>
        <h1>SuperAdminEdit</h1>
        <section>
            <h2>Edit Provider</h2>
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                value={editedProvider.name || ''}
                onChange={handleInputChange}
                placeholder="Provider Name"
            />
            {/* Add other input fields for provider attributes */}
            <button type="submit">Update Provider</button>
        </form>
        </section>
    </div>
    )
}
