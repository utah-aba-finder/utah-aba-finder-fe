import React, { useEffect, useState } from 'react';
import { ProviderAttributes } from '../Utility/Types';
import ProviderCard from '../Providers-page/ProviderCard';
import ProviderModal from '../Providers-page/ProviderModal';
import childrenBanner from '../Assets/children-banner.jpg';
import './FavoriteProviders.css'


const FavoriteProviders: React.FC = () => {
    const [favoriteProviders, setFavoriteProviders] = useState<ProviderAttributes[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem('favoriteProviders') || '[]');
        setFavoriteProviders(storedFavorites);
    }, []);

    const handleToggleFavorite = (providerId: number) => {
        setFavoriteProviders((prevFavorites) => {
            const updatedFavorites = prevFavorites.filter((fav) => fav.id !== providerId);
            localStorage.setItem('favoriteProviders', JSON.stringify(updatedFavorites));
            return updatedFavorites;
        });
    };

    const handleProviderCardClick = (provider: ProviderAttributes) => {
        setSelectedProvider(provider);

        const address = provider.locations.length > 0
            ? `${provider.locations[0].address_1 || ''} ${provider.locations[0].address_2 || ''}, ${provider.locations[0].city || ''}, ${provider.locations[0].state || ''} ${provider.locations[0].zip || ''}`.trim()
            : 'Address not available';

        setSelectedAddress(address);
    };

    const handleCloseModal = () => {
        setSelectedProvider(null);
    };

    return (
        <div className="favorite-providers-page">
            <section className="find-your-provider-section">
                <img src={childrenBanner} alt="Find Your Provider" className="banner-image" />
                <h1 className="providers-banner-title">Favorite Providers</h1>
            </section>

            <section className="glass">
                <section className="favorite-provider-list-section">
                    {favoriteProviders.length === 0 ? (
                        <p>No favorite providers yet.</p>
                    ) : (
                        <div className="card-container">
                            <div className="provider-cards-grid">
                                {favoriteProviders.map((provider) => (
                                    <ProviderCard
                                        key={provider.id}
                                        provider={provider}
                                        onViewDetails={() => handleProviderCardClick(provider)}
                                        onToggleFavorite={() => handleToggleFavorite(provider.id)}
                                        isFavorited={true}
                                        renderViewOnMapButton={() => null}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedProvider && (
                        <ProviderModal
                            provider={selectedProvider}
                            address={selectedAddress || 'Address not available'}
                            mapAddress={selectedAddress || 'Address not available'}
                            onClose={handleCloseModal}
                        />
                    )}
                </section>
            </section>
        </div>
    );
};

export default FavoriteProviders;
