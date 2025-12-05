import React, { useState, useEffect } from 'react';
import { fetchSponsoredProviders, SponsoredProvider } from '../Utility/ApiCall';
import { ChevronLeft, ChevronRight, Building2, ExternalLink, Star, Crown, Zap } from 'lucide-react';

interface SponsoredProvidersCarouselProps {
  className?: string;
}

const SponsoredProvidersCarousel: React.FC<SponsoredProvidersCarouselProps> = ({ className = '' }) => {
  const [providers, setProviders] = useState<SponsoredProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        const sponsoredProviders = await fetchSponsoredProviders();
        setProviders(sponsoredProviders);
      } catch (err) {
        setError('Failed to load sponsored providers');
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % providers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + providers.length) % providers.length);
  };

  const normalizeTierValue = (tier: string | number | null | undefined): string => {
    if (!tier) return 'free';
    
    // Convert integer enum to string name
    if (typeof tier === 'number') {
      const enumMap: { [key: number]: string } = {
        0: 'free',
        1: 'featured',
        2: 'sponsor',
        3: 'partner'
      };
      return enumMap[tier] || 'free';
    }
    
    return tier.toString().toLowerCase();
  };

  const getTierIcon = (tier: string | number | null) => {
    const tierLower = normalizeTierValue(tier);
    if (tierLower.includes('partner')) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (tierLower.includes('sponsor')) return <Star className="w-5 h-5 text-purple-500" />;
    if (tierLower.includes('featured')) return <Zap className="w-5 h-5 text-blue-500" />;
    return <Zap className="w-5 h-5 text-blue-500" />;
  };

  const getTierBadge = (tier: string | number | null) => {
    const tierLower = normalizeTierValue(tier);
    if (tierLower.includes('partner')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (tierLower.includes('sponsor')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (tierLower.includes('featured')) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTierDisplayName = (tier: string | number | null): string => {
    const tierLower = normalizeTierValue(tier);
    if (tierLower.includes('partner')) return 'Community Partner';
    if (tierLower.includes('sponsor')) return 'Sponsor Provider';
    if (tierLower.includes('featured')) return 'Featured Provider';
    return 'Free';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || providers.length === 0) {
    return null; // Don't show carousel if there are no sponsored providers
  }

  const currentProvider = providers[currentIndex];

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Sponsored Providers</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm transition-colors"
            aria-label="Previous provider"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {providers.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm transition-colors"
            aria-label="Next provider"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-shrink-0">
            {currentProvider.logo ? (
              <img
                src={currentProvider.logo}
                alt={currentProvider.name}
                className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{currentProvider.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierBadge(currentProvider.sponsorship_tier)} flex items-center space-x-1`}>
                {getTierIcon(currentProvider.sponsorship_tier)}
                <span>{getTierDisplayName(currentProvider.sponsorship_tier)}</span>
              </span>
            </div>

            {currentProvider.website && (
              <a
                href={currentProvider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      {providers.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {providers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsoredProvidersCarousel;
