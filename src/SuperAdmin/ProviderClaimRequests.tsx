import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Search,
  X,
  Mail,
  Building2,
  Send
} from 'lucide-react';
import { useAuth } from '../Provider-login/AuthProvider';
import { getSuperAdminAuthHeader } from '../Utility/config';

interface ProviderInfo {
  id: number;
  name: string;
  email?: string;
  website?: string;
}

interface ProviderClaimRequest {
  id: number;
  provider_id?: number;
  provider?: ProviderInfo;
  provider_name?: string;
  provider_email?: string;
  claimer_email: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

const ProviderClaimRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [claimRequests, setClaimRequests] = useState<ProviderClaimRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ProviderClaimRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resendingEmailId, setResendingEmailId] = useState<number | null>(null);

  // Fetch claim requests
  const fetchClaimRequests = useCallback(async () => {
    if (!currentUser?.id) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/provider_claim_requests',
        {
          headers: {
            'Authorization': getSuperAdminAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const requests = data.data || data.claim_requests || [];
        console.log('Fetched claim requests:', requests);
        setClaimRequests(requests);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      toast.error(`Failed to fetch claim requests: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchClaimRequests();
  }, [fetchClaimRequests]);

  // Approve claim request
  const approveClaimRequest = async (requestId: number) => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to approve claim requests');
      return;
    }
    
    if (processingId === requestId) {
      return;
    }
    
    setProcessingId(requestId);
    
    try {
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/provider_claim_requests/${requestId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': getSuperAdminAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Claim request approved successfully');
        await fetchClaimRequests();
        if (isModalOpen && selectedRequest?.id === requestId) {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || errorData.error || 'Failed to approve claim request');
      }
    } catch (error: any) {
      toast.error(`Failed to approve claim request: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Resend email for claim request
  const resendEmail = async (requestId: number) => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to resend emails');
      return;
    }
    
    if (resendingEmailId === requestId) {
      return;
    }
    
    setResendingEmailId(requestId);
    
    try {
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/provider_claim_requests/${requestId}/resend_email`,
        {
          method: 'POST',
          headers: {
            'Authorization': getSuperAdminAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Email resent successfully');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || errorData.error || 'Failed to resend email');
      }
    } catch (error: any) {
      toast.error(`Failed to resend email: ${error.message || 'Unknown error'}`);
    } finally {
      setResendingEmailId(null);
    }
  };

  // Reject claim request
  const rejectClaimRequest = async (requestId: number, reason?: string) => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to reject claim requests');
      return;
    }
    
    if (processingId === requestId) {
      return;
    }
    
    setProcessingId(requestId);
    
    try {
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/provider_claim_requests/${requestId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': getSuperAdminAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rejection_reason: reason || null
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Claim request rejected');
        await fetchClaimRequests();
        setRejectionReason('');
        if (isModalOpen && selectedRequest?.id === requestId) {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || errorData.error || 'Failed to reject claim request');
      }
    } catch (error: any) {
      toast.error(`Failed to reject claim request: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper function to get provider name from request
  const getProviderName = (request: ProviderClaimRequest): string => {
    return request.provider?.name || request.provider_name || 'N/A';
  };

  // Helper function to get provider email from request
  const getProviderEmail = (request: ProviderClaimRequest): string => {
    return request.provider?.email || request.provider_email || 'N/A';
  };

  // Helper function to get provider ID from request
  const getProviderId = (request: ProviderClaimRequest): number | null => {
    return request.provider?.id || request.provider_id || null;
  };

  // Filter claim requests
  const filteredRequests = claimRequests.filter(request => {
    const providerName = getProviderName(request).toLowerCase();
    const providerEmail = getProviderEmail(request).toLowerCase();
    const claimerEmail = request.claimer_email?.toLowerCase() || '';
    
    const matchesSearch = 
      claimerEmail.includes(searchTerm.toLowerCase()) ||
      providerName.includes(searchTerm.toLowerCase()) ||
      providerEmail.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Provider Claim Requests</h1>
        <p className="text-gray-600">Review and approve/reject provider account claim requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or provider name..."
                className="w-3/4 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claim Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading claim requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No claim requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claimer Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{request.claimer_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{getProviderName(request)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getProviderEmail(request)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveClaimRequest(request.id)}
                              disabled={processingId === request.id || resendingEmailId === request.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsModalOpen(true);
                              }}
                              disabled={processingId === request.id || resendingEmailId === request.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {(request.status === 'approved' || request.status === 'rejected') && (
                          <button
                            onClick={() => resendEmail(request.id)}
                            disabled={resendingEmailId === request.id || processingId === request.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Resend email to claimer"
                          >
                            {resendingEmailId === request.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                Resend Email
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Claim Request Details</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claimer Email</label>
                <p className="text-sm text-gray-900">{selectedRequest.claimer_email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                <p className="text-sm text-gray-900">{getProviderName(selectedRequest)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Email</label>
                <p className="text-sm text-gray-900">{getProviderEmail(selectedRequest)}</p>
              </div>

              {selectedRequest.provider?.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Website</label>
                  <p className="text-sm text-gray-900">
                    <a 
                      href={selectedRequest.provider.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedRequest.provider.website}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider ID</label>
                <p className="text-sm text-gray-900">{getProviderId(selectedRequest) || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="ml-1 capitalize">{selectedRequest.status}</span>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                <p className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
              </div>

              {selectedRequest.reviewed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.reviewed_at)}</p>
                </div>
              )}

              {selectedRequest.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                  <p className="text-sm text-gray-900">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (Optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection (optional)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => approveClaimRequest(selectedRequest.id)}
                      disabled={processingId === selectedRequest.id || resendingEmailId === selectedRequest.id}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === selectedRequest.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => rejectClaimRequest(selectedRequest.id, rejectionReason || undefined)}
                      disabled={processingId === selectedRequest.id || resendingEmailId === selectedRequest.id}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === selectedRequest.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {(selectedRequest.status === 'approved' || selectedRequest.status === 'rejected') && (
                <div className="pt-4 border-t">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => resendEmail(selectedRequest.id)}
                      disabled={resendingEmailId === selectedRequest.id || processingId === selectedRequest.id}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendingEmailId === selectedRequest.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Resend Email
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedRequest.status === 'approved' 
                      ? 'Resend the approval email with login credentials to the claimer.'
                      : 'Resend the rejection email to the claimer.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderClaimRequests;
