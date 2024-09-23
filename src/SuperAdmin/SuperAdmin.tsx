import { useState, useEffect} from 'react'
import './SuperAdmin.css'
import { MockProviderData, ProviderAttributes } from '../Utility/Types'

interface SuperAdminTypes {
    providers: MockProviderData[];
}

export const SuperAdmin: React.FC<SuperAdminTypes> = ({ providers }) => {

    const handleProviderClick = {

    }
  return (
    <div className='adminWrapper'>
        <section className='allProvidersData'>
            <h2>All Providers</h2>
            <div className="providers-list">
                {providers.map((provider) => (
                    <div key={provider.id} className="provider-item" >
                        <h3>{provider.attributes.name}</h3>
                        <p>Email: {provider.attributes.email}</p>
                        <p>Phone: {provider.attributes.name}</p>
                    </div>
                ))}
            </div>
        </section>
    </div>
  )
}
