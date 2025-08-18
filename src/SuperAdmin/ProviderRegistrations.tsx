import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Search
} from 'lucide-react';
import { useAuth } from '../Provider-login/AuthProvider';

interface ProviderRegistration {
  id: string;
  type: 'provider_registration';
  attributes: {
    email: string;
    provider_name: string;
    service_types: string[];
    submitted_data: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
  };
}

const ProviderRegistrations: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [registrations, setRegistrations] = useState<ProviderRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  // Debug currentUser
  useEffect(() => {
    console.log('🔍 ProviderRegistrations: Component mounted/rendered', {
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?.id,
      currentUserRole: currentUser?.role,
      currentUserEmail: currentUser?.email
    });
  }, [currentUser]);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    console.log('🔍 ProviderRegistrations: fetchRegistrations called', {
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?.id,
      currentUserRole: currentUser?.role
    });
    
    if (!token) {
      console.log('❌ ProviderRegistrations: No token available');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📡 ProviderRegistrations: Making API call with Authorization: Bearer', token.substring(0, 20) + '...');
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_registrations',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 ProviderRegistrations: API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 ProviderRegistrations: Data received:', data);
        setRegistrations(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('❌ ProviderRegistrations: API error response:', errorText);
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ ProviderRegistrations: Error fetching registrations:', error);
      toast.error('Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Approve registration
  const approveRegistration = async (registrationId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_registrations/${registrationId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Registration approved successfully');
        fetchRegistrations(); // Refresh the list
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error('Failed to approve registration');
    }
  };

  // Reject registration
  const rejectRegistration = async (registrationId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_registrations/${registrationId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Registration rejected successfully');
        fetchRegistrations(); // Refresh the list
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('Failed to reject registration');
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(registration => {
    // Add null checks for registration attributes
    if (!registration?.attributes) return false;
    
    const matchesSearch = 
      (registration.attributes.provider_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registration.attributes.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || registration.attributes.status === statusFilter;
    
    const matchesServiceType = serviceTypeFilter === 'all' || 
      (registration.attributes.service_types || []).includes(serviceTypeFilter);
    
    // Debug filtering
    if (searchTerm || statusFilter !== 'all' || serviceTypeFilter !== 'all') {
      console.log('🔍 Filtering registration:', {
        providerName: registration.attributes.provider_name,
        email: registration.attributes.email,
        status: registration.attributes.status,
        serviceTypes: registration.attributes.service_types,
        matchesSearch,
        matchesStatus,
        matchesServiceType,
        searchTerm,
        statusFilter,
        serviceTypeFilter
      });
    }
    
    return matchesSearch && matchesStatus && matchesServiceType;
  });

  useEffect(() => {
    console.log('🔍 ProviderRegistrations: useEffect triggered, calling fetchRegistrations');
    fetchRegistrations();
  }, [fetchRegistrations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Loading registrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Registrations</h1>
          <p className="text-gray-600">Review and manage new provider applications</p>
        </div>
        <button
          onClick={fetchRegistrations}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Provider name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              <option value="aba_therapy">ABA Therapy</option>
              <option value="speech_therapy">Speech Therapy</option>
              <option value="occupational_therapy">Occupational Therapy</option>
              <option value="autism_evaluations">Autism Evaluations</option>
              <option value="physical_therapy">Physical Therapy</option>
              <option value="therapists">Therapists</option>
              <option value="dentists">Dentists</option>
              <option value="pediatricians">Pediatricians</option>
              <option value="orthodontists">Orthodontists</option>
              <option value="barbers_hair">Barbers & Hair</option>
              <option value="advocates">Advocates</option>
              <option value="coaching_mentoring">Coaching & Mentoring</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
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
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {registration.attributes.provider_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.attributes.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(registration.attributes.service_types || []).map((serviceType, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(registration.attributes.submitted_data?.contact_phone) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(registration.attributes.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(registration.attributes.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {registration.attributes.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveRegistration(registration.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectRegistration(registration.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                      {registration.attributes.status !== 'pending' && (
                        <span className="text-gray-400">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderRegistrations; 