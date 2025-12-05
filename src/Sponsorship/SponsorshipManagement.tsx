import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchUserSponsorships, cancelSponsorship, Sponsorship } from '../Utility/ApiCall';
import { Calendar, DollarSign, X, CheckCircle, AlertCircle, Crown, Star, Zap } from 'lucide-react';
import moment from 'moment';

interface SponsorshipManagementProps {
  providerId?: number;
}

const SponsorshipManagement: React.FC<SponsorshipManagementProps> = ({ providerId }) => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  const loadSponsorships = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchUserSponsorships();
      
      // Store full response data for metadata (message, tiers_url, etc.)
      setResponseData(response);
      
      let filteredSponsorships = response.sponsorships || [];

      // Filter by providerId if provided
      if (providerId) {
        filteredSponsorships = filteredSponsorships.filter(
          (sponsorship) => sponsorship.provider_id === providerId
        );
      }

      setSponsorships(filteredSponsorships);
    } catch (error: any) {
      // Handle 401/403 errors gracefully without crashing
      if (error?.status === 401 || error?.status === 403) {
        // Don't show error toast for auth errors - just show empty state
        setSponsorships([]);
        setResponseData(null);
      } else {
        // For other errors, show a subtle message but don't crash
        setSponsorships([]);
        setResponseData(null);
      }
      // Don't throw - prevent the error from propagating and causing crashes
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    loadSponsorships();
  }, [loadSponsorships]);

  const handleCancel = async (sponsorshipId: number) => {
    if (!window.confirm('Are you sure you want to cancel this sponsorship? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingId(sponsorshipId);
      await cancelSponsorship(sponsorshipId);
      toast.success('Sponsorship cancelled successfully');
      loadSponsorships(); // Reload list
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel sponsorship');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierIcon = (tier: string) => {
    const tierLower = tier.toLowerCase();
    if (tierLower.includes('featured')) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (tierLower.includes('premium')) return <Star className="w-4 h-4 text-purple-500" />;
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sponsorships.length === 0) {
    const message = responseData?.message;
    const tiersUrl = responseData?.tiers_url;
    
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sponsorships</h3>
        {message ? (
          <>
            <p className="text-gray-600 mb-4">{message}</p>
            {tiersUrl && (
              <a
                href={`/providerEdit/${providerId}?tab=sponsorship`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Sponsorship Options
              </a>
            )}
          </>
        ) : (
          <p className="text-gray-600">You don't have any active sponsorships at this time.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Sponsorships</h2>
        <span className="text-sm text-gray-600">{sponsorships.length} sponsorship(s)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sponsorships.map((sponsorship) => (
          <div
            key={sponsorship.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTierIcon(sponsorship.tier)}
                <h3 className="text-lg font-semibold text-gray-900">{sponsorship.tier}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusBadge(
                  sponsorship.status
                )}`}
              >
                {getStatusIcon(sponsorship.status)}
                <span className="capitalize">{sponsorship.status}</span>
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Started: {moment(sponsorship.started_at).format('MMM DD, YYYY')}
                </span>
              </div>

              {sponsorship.expires_at && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Expires: {moment(sponsorship.expires_at).format('MMM DD, YYYY')}
                  </span>
                </div>
              )}

              {sponsorship.stripe_subscription_id && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span>Subscription ID: {sponsorship.stripe_subscription_id.slice(0, 20)}...</span>
                </div>
              )}
            </div>

            {sponsorship.status === 'active' && (
              <button
                onClick={() => handleCancel(sponsorship.id)}
                disabled={cancellingId === sponsorship.id}
                className="w-full px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {cancellingId === sponsorship.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel Sponsorship</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorshipManagement;
