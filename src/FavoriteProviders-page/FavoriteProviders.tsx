import React, { useEffect, useState } from 'react';
import { ProviderAttributes } from '../Utility/Types';
import ProviderCard from '../Providers-page/ProviderCard';
import ProviderModal from '../Providers-page/ProviderModal';
import playblocks from '../Assets/playblocks.jpg';
import './FavoriteProviders.css'
import { Link } from 'react-router-dom';


interface FavoriteDate {
    [providerId: number]: string;
}

const FavoriteProviders: React.FC = () => {
    const [favoriteProviders, setFavoriteProviders] = useState<ProviderAttributes[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<ProviderAttributes | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [mapAddress, setMapAddress] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [favoriteDates, setFavoriteDates] = useState<FavoriteDate>({});
    const providersPerPage = 8;


    useEffect(() => {
        const storedFavorites = localStorage.getItem('favoriteProviders');
        const storedDates = localStorage.getItem('favoriteDates');

        if (storedFavorites) {
            const parsedFavorites = JSON.parse(storedFavorites);
            setFavoriteProviders(parsedFavorites);
        }

        if (storedDates) {
            setFavoriteDates(JSON.parse(storedDates));
        }
    }, []);

    const handleToggleFavorite = (providerId: number) => {
        setFavoriteProviders((prevFavorites) => {
            const updatedFavorites = prevFavorites.filter((fav) => fav.id !== providerId);
            localStorage.setItem('favoriteProviders', JSON.stringify(updatedFavorites));

            setFavoriteDates(prevDates => {
                const { [providerId]: _, ...rest } = prevDates;
                localStorage.setItem('favoriteDates', JSON.stringify(rest));
                return rest;
            });

            const newTotalPages = Math.ceil(updatedFavorites.length / providersPerPage);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }

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

    const indexOfLastProvider = currentPage * providersPerPage;
    const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
    const currentProviders = favoriteProviders.slice(indexOfFirstProvider, indexOfLastProvider);
    const totalPages = Math.ceil(favoriteProviders.length / providersPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div className="favorite-providers-page">
            <section className="find-your-provider-section">
                <img src={playblocks} alt="Find Your Provider" className="banner-image" />
                <h1 className="providers-banner-title">Favorite Providers</h1>
            </section>

            <div className="glass-container">
                {favoriteProviders.length === 0 ? (
                    <div className="favorite-provider-info">
                        <p className="favorite-provider-number title">You have not favorited any providers yet</p>
                        <Link to="/providers" className="favorite-provider-section-button">VIEW PROVIDERS</Link>
                    </div>
                ) : (
                    <p className="favorite-provider-number title">
                        You have {favoriteProviders.length} favorite provider{favoriteProviders.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {favoriteProviders.length > 0 && (
                <section className={`glass ${totalPages > 1 ? 'with-pagination' : ''}`}>
                    <div className="favorite-provider-list-section">
                        <div className="card-container">
                            <div className="provider-cards-grid">
                                {currentProviders.map((provider) => (
                                    <ProviderCard
                                        key={provider.id}
                                        provider={provider}
                                        onViewDetails={() => handleProviderCardClick(provider)}
                                        onToggleFavorite={() => handleToggleFavorite(provider.id)}
                                        isFavorited={true}
                                        favoritedDate={favoriteDates[provider.id]}
                                        renderViewOnMapButton={() => null}
                                        selectedState=""
                                    />
                                ))}
                            </div>
                            {favoriteProviders.length > providersPerPage && (
                                <div className="favorite-pagination-controls">
                                    {currentPage > 1 && (
                                        <button className="pagination-button" onClick={handlePreviousPage}>
                                            &lt; Previous
                                        </button>
                                    )}
                                    {currentPage < totalPages && (
                                        <button className="pagination-button" onClick={handleNextPage}>
                                            Next &gt;
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {selectedProvider && (
                <ProviderModal
                    provider={{
                        id: selectedProvider.id,
                        type: "provider",
                        states: selectedProvider.states,
                        attributes: selectedProvider
                    }}
                    address={selectedAddress || 'Address not available'}
                    mapAddress={mapAddress || 'Address not available'}
                    onClose={handleCloseModal}
                    onViewOnMapClick={handleViewOnMapClick}
                    selectedState={null}
                />
            )}
        </div>
    );
};

export default FavoriteProviders;