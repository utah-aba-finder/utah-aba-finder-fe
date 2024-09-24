import React from 'react'
import { MockProviderData, ProviderAttributes } from '../Utility/Types'

interface SuperAdminEditProps {
    providers: MockProviderData[];
    onUpdate: (updatedProvider: ProviderAttributes) => void
}

export const SuperAdminEdit: React.FC<SuperAdminEditProps> = ({ providers , onUpdate }) => {
  return (
    <div className='superAdminEditWrapper'>
        <h1>SuperAdminEdit</h1>
        <section>
            <h2>Edit Provider</h2>
            <form>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" value={providers[0].attributes.name ?? ''} />
                
            </form>
        </section>
    </div>
    )
}
