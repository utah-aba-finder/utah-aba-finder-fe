import React, { useEffect, useState } from 'react';
import { ProviderAttributes } from '../Utility/Types';
import ProviderCard from '../Providers-page/ProviderCard';
import ProviderModal from '../Providers-page/ProviderModal';
import playblocks from '../Assets/playblocks.jpg';
import './FavoriteProviders.css'
import {Link} from 'react-router-dom';


const FavoriteProviders: React.FC = () => {
    const [favoriteProviders, setFavoriteProviders] = useState<ProviderAttributes[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [mapAddress, setMapAddress] = useState<string>('');


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


        setMapAddress(address);
        setSelectedAddress(address);
    };

    const handleViewOnMapClick = (address: string) => {
        setMapAddress(address);
    };
    const handleCloseModal = () => {
        setSelectedProvider(null);
    };

    return (
        <div className="favorite-providers-page">
            <section className="find-your-provider-section">
                <img src={playblocks} alt="Find Your Provider" className="banner-image" />
                <h1 className="providers-banner-title">Favorite Providers</h1>
            </section>

            <section className="glass">

                <section className="favorite-provider-list-section">
                    {favoriteProviders.length === 0 ? (
                        <div>
                            <p className="favorite-provider-number title">You have not favorited any providers yet</p>
                            <Link to="/providers" className="begin-section-button1">VIEW PROVIDERS</Link>
                        </div>
                    ) : (
                        <div>
                            <p className="favorite-provider-number title">
                                You have {favoriteProviders.length} favorite provider{favoriteProviders.length !== 1 ? 's' : ''}
                            </p>
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
                        </div>
                    )}
                </section>
            </section>
            {selectedProvider && (
                <ProviderModal
                    provider={selectedProvider}
                    address={selectedAddress || 'Address not available'}
                    mapAddress={mapAddress || 'Address not available'}
                    onClose={handleCloseModal}
                    onViewOnMapClick={handleViewOnMapClick}
                />
            )}
        </div>
    );
};

export default FavoriteProviders;
