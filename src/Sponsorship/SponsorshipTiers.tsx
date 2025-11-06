import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchSponsorshipTiers, SponsorshipTier } from '../Utility/ApiCall';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface SponsorshipTiersProps {
  providerId: number;
  onSelectTier: (tier: SponsorshipTier) => void;
  currentTier?: string | number | null;
}

// Helper function to normalize tier values for comparison
const normalizeTier = (tier: string | number | null | undefined): string | null => {
  if (tier === null || tier === undefined) return null;
  
  // Convert integer enum to string name
  if (typeof tier === 'number') {
    const enumMap: { [key: number]: string } = {
      0: 'free',
      1: 'featured',
      2: 'sponsor',
      3: 'partner'
    };
    return enumMap[tier] || null;
  }
  
  // Normalize string to lowercase
  return tier.toString().toLowerCase();
};

const SponsorshipTiers: React.FC<SponsorshipTiersProps> = ({
  providerId,
  onSelectTier,
  currentTier,
}) => {
  const [tiers, setTiers] = useState<SponsorshipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<SponsorshipTier | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const loadTiers = async () => {
      try {
        setLoading(true);
        const response = await fetchSponsorshipTiers();
        
        if (!cancelled) {
          setTiers(response.tiers || []);
        }
      } catch (error) {
        // Don't let errors crash the component
        console.error('Failed to load sponsorship tiers:', error);
        if (!cancelled) {
          toast.error('Failed to load sponsorship options. Please try again.', {
            position: "top-center",
            autoClose: 5000,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTiers();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTierSelect = (tier: SponsorshipTier) => {
    setSelectedTier(tier);
    onSelectTier(tier);
  };

  const getTierIcon = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('featured')) return <Crown className="w-6 h-6" />;
    if (name.includes('premium')) return <Star className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const getTierColor = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('featured')) return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    if (name.includes('premium')) return 'bg-purple-100 border-purple-500 text-purple-900';
    return 'bg-blue-100 border-blue-500 text-blue-900';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tiers...</span>
      </div>
    );
  }

  // If we have no tiers, show a message but don't crash
  if (tiers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No sponsorship tiers available at this time.</p>
        <p className="text-sm text-gray-400">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Sponsorship Tier</h2>
        <p className="text-gray-600">Select a tier to increase your visibility and reach more families</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isSelected = selectedTier?.id === tier.id;
          // Compare normalized tier values
          const normalizedCurrent = normalizeTier(currentTier);
          const normalizedTierId = tier.id ? tier.id.toString().toLowerCase() : null;
          const normalizedTierName = tier.name ? tier.name.toLowerCase() : null;
          const isCurrent = normalizedCurrent && normalizedTierName && (
            normalizedCurrent === normalizedTierId ||
            normalizedCurrent === normalizedTierName ||
            normalizedTierName.includes(normalizedCurrent) ||
            normalizedCurrent.includes(normalizedTierName)
          ) || false;
          const colorClass = getTierColor(tier.name);

          return (
            <div
              key={tier.id}
              className={`
                relative border-2 rounded-lg p-6 transition-all cursor-pointer
                ${isSelected ? colorClass : 'bg-white border-gray-200 hover:border-gray-300'}
                ${isCurrent ? 'ring-2 ring-green-500' : ''}
              `}
              onClick={() => handleTierSelect(tier)}
            >
              {isCurrent && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Current
                </div>
              )}

              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-100'}`}>
                  {getTierIcon(tier.name)}
                </div>
              </div>

              <h3 className="text-xl font-bold text-center mb-2">{tier.name}</h3>
              
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-gray-600">/month</span>
              </div>

              {tier.description && (
                <p className="text-sm text-gray-600 text-center mb-4">{tier.description}</p>
              )}

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-2 px-4 rounded-lg font-medium transition-colors
                  ${isSelected 
                    ? 'bg-white text-gray-900 hover:bg-gray-50' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                  ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={!!isCurrent}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCurrent) handleTierSelect(tier);
                }}
              >
                {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Tier'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SponsorshipTiers;
