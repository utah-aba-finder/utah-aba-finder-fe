import React, {useState, useEffect} from 'react'
import { Provider } from '../Utility/Types'

const Providers: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([])
    useEffect(() => {
        fetch('http://localhost:3001/providers')
            .then(response => response.json())
            .then(data => setProviders(data))
    }, [])
  return (
    <div>Providers</div>
  )
}

export default Providers

const providers = [
    {
        name: 'Kids On The Move',
        website: 'kotm.org',
        phone: '(385) 292-5633',
        email: '',
        address: '475 West 260 North Orem, UT 84057'
    }
]
