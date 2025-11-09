import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SponsorshipTiers from './SponsorshipTiers';
import SponsorshipPayment from './SponsorshipPayment';
import SponsorshipManagement from './SponsorshipManagement';
import { SponsorshipTier, fetchSponsorshipTiers } from '../Utility/ApiCall';
import { X, Crown } from 'lucide-react';

interface SponsorshipPageProps {
  providerId: number;
  currentTier?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

const SponsorshipPage: React.FC<SponsorshipPageProps> = ({
  providerId,
  currentTier,
  onClose,
  onSuccess,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<'tiers' | 'payment' | 'management'>('tiers');
  const [selectedTier, setSelectedTier] = useState<SponsorshipTier | null>(null);                                                                               
  const [tiers, setTiers] = useState<SponsorshipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tiers on mount
  useEffect(() => {
    let cancelled = false;
    
    const loadTiers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchSponsorshipTiers();
        
        if (!cancelled) {
          setTiers(response.tiers || []);
        }
      } catch (error: any) {
        // Don't let errors crash the component - just show them gracefully
        console.error('Failed to load tiers:', error);
        const errorMessage = error?.message || 'Failed to load sponsorship tiers. Please try again.';
        
        if (!cancelled) {
          setError(errorMessage);
          toast.error(errorMessage, {
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

  // Handle tier parameter from URL
  useEffect(() => {
    const tierParam = searchParams.get('tier');
    if (tierParam && tiers.length > 0) {
      // Find matching tier by name
      const tier = tiers.find(t => 
        t.name.toLowerCase().includes(tierParam.toLowerCase()) ||
        tierParam.toLowerCase().includes(t.name.toLowerCase())
      );
      if (tier) {
        setSelectedTier(tier);
        setStep('payment');
        // Clear the tier param from URL
        setSearchParams({ tab: 'sponsorship' });
      }
    }
  }, [searchParams, tiers, setSearchParams]);

  const handleTierSelect = (tier: SponsorshipTier) => {
    setSelectedTier(tier);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    toast.success('Sponsorship activated successfully!');
    setStep('management');
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePaymentCancel = () => {
    setStep('tiers');
    setSelectedTier(null);
  };

  const handleViewManagement = () => {
    setStep('management');
  };

  return (
    <div className="relative bg-white rounded-lg shadow-xl max-w-6xl mx-auto p-6 md:p-8">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      )}

            <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Sponsorship</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setStep('tiers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${                                                                         
                step === 'tiers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Browse Tiers
            </button>
            <button
              onClick={handleViewManagement}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${                                                                         
                step === 'management'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Sponsorships
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading sponsorship options...</span>
        </div>
      )}

            {error && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 font-semibold mb-2">No Active Sponsorship</h3>                                                               
              <p className="text-blue-800 text-sm mb-4">
                You don't currently have an active sponsorship. Select and pay for a sponsorship package to increase your visibility and reach more families.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Reload tiers
                    fetchSponsorshipTiers()
                      .then((response) => {
                        setTiers(response.tiers || []);
                        setError(null);
                      })
                      .catch((err: any) => {
                        const errorMessage = err?.message || 'Failed to load sponsorship tiers. Please try again.';                                                   
                        setError(errorMessage);
                        toast.error(errorMessage);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"                                       
                >
                  Browse Sponsorship Options
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    // Allow user to view management even if tiers failed to load
                    if (step === 'tiers') {
                      setStep('management');
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"                                       
                >
                  Check Sponsorship Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allow navigation to management even if tiers failed - don't block the UI */}
      {!loading && step === 'management' && (
        <SponsorshipManagement providerId={providerId} />
      )}

      {/* Only show tiers/payment if we have data or no error */}
      {!loading && (!error || tiers.length > 0) && step === 'tiers' && (
        <SponsorshipTiers
          providerId={providerId}
          onSelectTier={handleTierSelect}
          currentTier={currentTier}
        />
      )}

      {!loading && (!error || selectedTier) && step === 'payment' && selectedTier && (
        <SponsorshipPayment
          providerId={providerId}
          tier={selectedTier}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Show message if error and trying to access tiers */}
      {!loading && error && step === 'tiers' && tiers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Unable to load sponsorship tiers. Please use the "Try Again" button above or navigate to "My Sponsorships".</p>
        </div>
      )}
    </div>
  );
};

export default SponsorshipPage;
