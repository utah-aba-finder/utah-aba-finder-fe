import React, { useEffect, useState } from 'react';
import { ProviderAttributes } from '../Utility/Types';
import ProviderCard from '../Providers-page/ProviderCard';

const FavoriteProviders: React.FC = () => {
  const [favoriteProviders, setFavoriteProviders] = useState<ProviderAttributes[]>([]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoriteProviders(favorites);
  }, []);

  const handleToggleFavorite = (providerId: number) => {
    const updatedFavorites = favoriteProviders.filter((provider) => provider.id !== providerId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavoriteProviders(updatedFavorites);
  };
  const handleProviderCardClick = (provider: ProviderAttributes) => {
    // Logic for viewing provider details
    console.log('Viewing details for provider:', provider);
  };

  const renderViewOnMapButton = (provider: ProviderAttributes) => {
    // Logic for rendering the "View on Map" button
    return <button>View on Map</button>;
  };

  return (
    <div>
      <h2>Favorite Providers</h2>
      {favoriteProviders.length === 0 ? (
        <p>No favorite providers yet.</p>
      ) : (
        <div className="favorite-providers-list">
          {favoriteProviders.map((provider) => (
            <ProviderCard
            key={provider.id}
            provider={provider}
            onViewDetails={handleProviderCardClick}
            renderViewOnMapButton={renderViewOnMapButton}
            onToggleFavorite={() => handleToggleFavorite(provider.id)} // Pass toggle favorite function
            isFavorited={true} // Always true for favorites page
          />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProviders;
