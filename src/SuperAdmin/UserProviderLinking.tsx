import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAdminAuthHeader } from '../Utility/config';

interface User {
  id: number;
  email: string;
  provider_id?: number;
  provider_name?: string;
  role?: number;
  created_at?: string;
  updated_at?: string;
}



interface Provider {
  id: number;
  name: string;
}

const UserProviderLinking: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsersForBulk, setSelectedUsersForBulk] = useState<number[]>([]);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

  // Multi-Provider State
  const [userProviders, setUserProviders] = useState<Record<string, Provider[]>>({});
  const [activeProviders, setActiveProviders] = useState<Record<string, number>>({});
  const [showUserProviderDetails, setShowUserProviderDetails] = useState<string | null>(null);
  const [isLoadingUserProviders, setIsLoadingUserProviders] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchProviders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.provider-dropdown')) {
        setShowProviderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.provider_name && user.provider_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role?.toString() === filterRole;
    return matchesSearch && matchesRole;
  });

  // Filter and sort providers
  const filteredAndSortedProviders = providers
    .filter(provider => 
      provider.name.toLowerCase().includes(providerSearchTerm.toLowerCase()) ||
      provider.id.toString().includes(providerSearchTerm)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Count users per provider
  const usersPerProvider = users.reduce((acc, user) => {
    if (user.provider_id) {
      acc[user.provider_id] = (acc[user.provider_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const handleBulkAssignment = () => {
    if (selectedUsersForBulk.length === 0 || !selectedProvider) {
      toast.error('Please select users and a provider for bulk assignment');
      return;
    }

    const userEmails = selectedUsersForBulk.map(userId => {
      const user = users.find(u => u.id === userId);
      return user?.email;
    }).filter(Boolean) as string[];

    bulkAssignUsers(userEmails, selectedProvider);
    setSelectedUsersForBulk([]);
    setShowBulkAssignment(false);
  };

  // Test function to verify API key
  const testApiKey = async () => {
    try {
      const authHeader = getAdminAuthHeader();
      console.log('🧪 Testing API key:', authHeader);
      
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/providers_list', {
        headers: {
          'Authorization': authHeader,
        }
      });
      
      console.log('🧪 Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🧪 Test successful, providers count:', data.providers?.length || 0);
        toast.success('API key test successful!');
      } else {
        const errorText = await response.text();
        console.error('🧪 Test failed:', errorText);
        toast.error(`API key test failed: ${response.status}`);
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
      toast.error('API key test error');
    }
  };

  // Comprehensive API endpoint testing
  const testAllEndpoints = async () => {
    const testEmail = 'mfielder@abacenters.com';
    const testProviderId = 1095;
    
    console.log('🧪🧪🧪 Testing All API Endpoints 🧪🧪🧪');
    
    // Test 1: User Providers Endpoint (This should work for existing user)
    console.log('🧪 Test 1: User Providers Endpoint');
    try {
      const response1 = await fetch(`https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/user_providers?user_email=${encodeURIComponent(testEmail)}`, {
        headers: {
          'Authorization': getAdminAuthHeader(),
        }
      });
      console.log('🧪 User Providers Status:', response1.status);
      if (response1.ok) {
        const data = await response1.json();
        console.log('🧪 User Providers Success:', data);
      } else {
        const errorText = await response1.text();
        console.error('🧪 User Providers Error:', errorText);
      }
    } catch (error) {
      console.error('🧪 User Providers Exception:', error);
    }
    
    // Test 2: Set Active Provider (This should work for existing user)
    console.log('🧪 Test 2: Set Active Provider Endpoint');
    try {
      const response2 = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/set_active_provider', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: testEmail,
          provider_id: testProviderId
        })
      });
      console.log('🧪 Set Active Provider Status:', response2.status);
      if (response2.ok) {
        const data = await response2.json();
        console.log('🧪 Set Active Provider Success:', data);
      } else {
        const errorText = await response2.text();
        console.error('🧪 Set Active Provider Error:', errorText);
      }
    } catch (error) {
      console.error('🧪 Set Active Provider Exception:', error);
    }
    
    // Test 3: Individual Assignment Endpoint (This will fail for owner - expected)
    console.log('🧪 Test 3: Individual Assignment Endpoint (Expected to fail for owner)');
    try {
      const response3 = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/assign_provider_to_user', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: testEmail,
          provider_id: testProviderId
        })
      });
      console.log('🧪 Individual Assignment Status:', response3.status);
      if (response3.ok) {
        const data = await response3.json();
        console.log('🧪 Individual Assignment Success:', data);
      } else {
        const errorText = await response3.text();
        console.error('🧪 Individual Assignment Error (Expected for owner):', errorText);
      }
    } catch (error) {
      console.error('🧪 Individual Assignment Exception:', error);
    }
    
    // Test 4: Bulk Assignment Endpoint (This will fail for owner - expected)
    console.log('🧪 Test 4: Bulk Assignment Endpoint (Expected to fail for owner)');
    try {
      const response4 = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/bulk_assign_users', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: testEmail,
          provider_id: testProviderId
        })
      });
      console.log('🧪 Bulk Assignment Status:', response4.status);
      if (response4.ok) {
        const data = await response4.json();
        console.log('🧪 Bulk Assignment Success:', data);
      } else {
        const errorText = await response4.text();
        console.error('🧪 Bulk Assignment Error (Expected for owner):', errorText);
      }
    } catch (error) {
      console.error('🧪 Bulk Assignment Exception:', error);
    }
    
    console.log('🧪🧪🧪 Endpoint Testing Complete 🧪🧪🧪');
  };

  // Multi-Provider Management Functions
  const fetchUserProviders = async (userEmail: string) => {
    try {
      const response = await fetch(`https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/user_providers?user_email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': getAdminAuthHeader(),
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.providers || [];
      } else {
        console.error('Failed to fetch user providers:', response.status);
        // Enhanced error logging for 422 errors
        if (response.status === 422) {
          const errorText = await response.text();
          console.error('422 Error Details:', errorText);
          try {
            const errorJson = JSON.parse(errorText);
            console.error('422 Error JSON:', errorJson);
          } catch (e) {
            console.error('422 Error is not JSON:', errorText);
          }
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching user providers:', error);
      return [];
    }
  };

  const setActiveProvider = async (userEmail: string, providerId: number) => {
    try {
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/set_active_provider', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          provider_id: providerId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Active provider updated successfully!');
          return true;
        } else {
          toast.error(`Failed to update active provider: ${result.message || 'Unknown error'}`);
          return false;
        }
      } else {
        toast.error(`Failed to update active provider: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Error setting active provider:', error);
      toast.error('Failed to update active provider');
      return false;
    }
  };

  const removeUserFromProvider = async (userEmail: string, providerId: number) => {
    try {
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/remove_provider_from_user', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          provider_id: providerId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('User removed from provider successfully!');
          fetchUsers(); // Refresh the user list
          return true;
        } else {
          toast.error(`Failed to remove user: ${result.message || 'Unknown error'}`);
          return false;
        }
      } else {
        toast.error(`Failed to remove user: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Error removing user from provider:', error);
      toast.error('Failed to remove user from provider');
      return false;
    }
  };

  const loadUserProviderDetails = async (userEmail: string) => {
    if (userProviders[userEmail]) {
      // Already loaded, just toggle display
      setShowUserProviderDetails(showUserProviderDetails === userEmail ? null : userEmail);
      return;
    }

    setIsLoadingUserProviders(true);
    try {
      const providers = await fetchUserProviders(userEmail);
      setUserProviders(prev => ({
        ...prev,
        [userEmail]: providers
      }));
      setShowUserProviderDetails(userEmail);
    } catch (error) {
      console.error('Error loading user provider details:', error);
      toast.error('Failed to load user provider details');
    } finally {
      setIsLoadingUserProviders(false);
    }
  };

  const handleSetActiveProvider = async (userEmail: string, providerId: number) => {
    const success = await setActiveProvider(userEmail, providerId);
    if (success) {
      setActiveProviders(prev => ({
        ...prev,
        [userEmail]: providerId
      }));
    }
  };

  const handleRemoveUserFromProvider = async (userEmail: string, providerId: number) => {
    const success = await removeUserFromProvider(userEmail, providerId);
    if (success) {
      // Update local state
      setUserProviders(prev => ({
        ...prev,
        [userEmail]: prev[userEmail]?.filter(p => p.id !== providerId) || []
      }));
      // Clear active provider if it was the one removed
      if (activeProviders[userEmail] === providerId) {
        setActiveProviders(prev => {
          const newState = { ...prev };
          delete newState[userEmail];
          return newState;
        });
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const authHeader = getAdminAuthHeader();
      console.log('🔑 Auth header being sent:', authHeader);
      console.log('🔑 Full headers:', {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      });
      
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/users_with_providers', {
        headers: {
          'Authorization': authHeader,
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();

        const users = data.users || [];
        
        // Note: The accessible_providers endpoint requires user-specific authentication
        // which is not available in the Super Admin context. We'll work with the
        // basic user-provider relationship data we already have.

        
        // Log summary of users with providers
        setUsers(users);
      } else {
        await response.text();
        console.error('❌ Error response:', response.status);
        toast.error(`Failed to fetch users: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchProviders = async () => {
    try {

      
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/providers_list', {
        headers: {
          'Authorization': getAdminAuthHeader(),
        }
      });
      

      
      if (response.ok) {
        const data = await response.json();

        setProviders(data.providers || []);
      } else {
        await response.text();

        toast.error(`Failed to fetch providers: ${response.status}`);
      }
    } catch (error) {

      toast.error('Failed to fetch providers');
    }
  };

  const linkUserToProvider = async () => {
    if (!selectedUser || !selectedProvider) {
      toast.error('Please select both a user and a provider');
      return;
    }

    setIsLoading(true);
    try {
      // Find the user object from the selected user ID
      const selectedUserObj = users.find(user => user.id === selectedUser);
      if (!selectedUserObj) {
        toast.error('Selected user not found');
        return;
      }

      // Check if user already has a provider
      if (selectedUserObj.provider_id && selectedUserObj.provider_id !== selectedProvider) {

      }
      
      // Use the working multi-provider endpoint with correct format
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/assign_provider_to_user', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: selectedUserObj.email, // API expects user_email, not user_id
          provider_id: selectedProvider
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          toast.success('User successfully assigned to provider!');

          await fetchUsers(); // Refresh the user list
          setSelectedUser(null);
          setSelectedProvider(null);
          setProviderSearchTerm(''); // Clear the search term
        } else {
          toast.error(`Failed to assign user: ${result.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        toast.error(`Failed to assign user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {

      toast.error('Failed to assign user to provider');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkAssignUsers = async (userEmails: string[], providerId: number) => {
    setIsLoading(true);
    try {
      // Log the request data for debugging
      const requestBody = {
        user_email: userEmails[0], // API expects user_email (singular), not user_emails (array)
        provider_id: providerId
      };
      console.log('🔍 Debug: userEmails array:', userEmails);
      console.log('🔍 Debug: requestBody object:', requestBody);
      console.log('🔍 Debug: JSON.stringify(requestBody):', JSON.stringify(requestBody));
      
      // Try the bulk assignment endpoint first
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/bulk_assign_users', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🔍 Debug: Response status:', response.status);
      console.log('🔍 Debug: Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(`Bulk assignment completed! ${result.assigned_count || userEmails.length} users assigned successfully.`);
          fetchUsers(); // Refresh the user list
          setProviderSearchTerm(''); // Clear the search term
          setSelectedProvider(null);
          return; // Success, exit early
        }
      }
      
      // If bulk endpoint fails, fall back to individual assignments
      console.log('Bulk endpoint failed, falling back to individual assignments...');
      let successCount = 0;
      let failureCount = 0;
      const failedEmails: string[] = [];
      
      for (const email of userEmails) {
        try {
          // Find the user by email to get their ID
          const userObj = users.find(user => user.email === email);
          if (!userObj) {
            failedEmails.push(email);
            failureCount++;
            continue;
          }

          const individualResponse = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/assign_provider_to_user', {
            method: 'POST',
            headers: {
              'Authorization': getAdminAuthHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_email: email, // API expects user_email, not user_id
              provider_id: providerId
            })
          });

          if (individualResponse.ok) {
            const result = await individualResponse.json();
            if (result.success) {
              successCount++;
            } else {
              failedEmails.push(email);
              failureCount++;
            }
          } else {
            // Enhanced error logging for 422 errors
            if (individualResponse.status === 422) {
              const errorText = await individualResponse.text();
              console.error(`422 Error for ${email}:`, errorText);
              try {
                const errorJson = JSON.parse(errorText);
                console.error(`422 Error JSON for ${email}:`, errorJson);
              } catch (e) {
                console.error(`422 Error is not JSON for ${email}:`, errorText);
              }
            }
            failedEmails.push(email);
            failureCount++;
          }
        } catch (error) {
          failedEmails.push(email);
          failureCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Bulk assignment completed! ${successCount} users assigned successfully.`);
      }
      
      if (failureCount > 0) {
        toast.error(`${failureCount} users failed to assign: ${failedEmails.join(', ')}`);
      }

      if (successCount > 0) {
        fetchUsers(); // Refresh the user list
        setProviderSearchTerm(''); // Clear the search term
        setSelectedProvider(null);
      }
      
    } catch (error) {
      console.error('Bulk assignment error:', error);
      toast.error('Failed to bulk assign users');
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkUserFromProvider = async (userId: number, providerId?: number) => {
    setIsLoading(true);
    try {
      // Find the user object from the user ID
      const userObj = users.find(user => user.id === userId);
      if (!userObj) {
        toast.error('User not found');
        return;
      }

      // If providerId is provided, use it; otherwise use the user's primary provider_id
      const targetProviderId = providerId || userObj.provider_id;
      
      if (!targetProviderId) {
        toast.error('User is not currently assigned to any provider');
        return;
      }

      // Use the new unlink endpoint
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/unassign_provider_from_user', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          provider_id: targetProviderId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('User successfully unlinked from provider!');
          fetchUsers(); // Refresh the user list
        } else {
          toast.error(`Failed to unlink user: ${result.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(`Failed to unlink user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {

      toast.error('Failed to unlink user from provider');
    } finally {
      setIsLoading(false);
    }
  };

  const forceUnassignUser = async (userId: number) => {
    setIsLoading(true);
    try {
      // Find the user object from the user ID
      const userObj = users.find(user => user.id === userId);
      if (!userObj) {
        toast.error('User not found');
        return;
      }

      // Use the new unassign endpoint
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/unassign_provider_from_user', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: userObj.provider_id
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          toast.success('User successfully unassigned from all providers!');

          await fetchUsers(); // Refresh the user list
        } else {
          toast.error(`Failed to unassign user: ${result.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        toast.error(`Failed to unassign user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {

      toast.error('Failed to unassign user');
    } finally {
      setIsLoading(false);
    }
  };

  const connectedUsers = filteredUsers.filter(user => user.provider_id);
  const unconnectedUsers = filteredUsers.filter(user => !user.provider_id);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User-Provider Linking Tool</h1>
        
        {/* Debug Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Total Users:</strong> {users.length}
            </div>
            <div>
              <strong>Connected Users:</strong> {connectedUsers.length}
            </div>
            <div>
              <strong>Users with Providers:</strong> {users.filter(u => u.provider_id).length}
            </div>
          </div>
          <div className="mt-2 text-xs text-yellow-700">
            Note: Multiple provider assignments are not visible in Super Admin view due to authentication limitations
          </div>
          <div className="mt-4">
            <button
              onClick={testApiKey}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              🧪 Test API Key
            </button>
            <span className="ml-2 text-xs text-yellow-700">
              Click to test if the API key is working
            </span>
          </div>
          <div className="mt-2">
            <button
              onClick={testAllEndpoints}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              🧪🧪🧪 Test All Endpoints
            </button>
            <span className="ml-2 text-xs text-yellow-700">
              Click to test all API endpoints individually
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Connected Users</h3>
            <p className="text-3xl font-bold text-green-600">{connectedUsers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Unconnected Users</h3>
            <p className="text-3xl font-bold text-red-600">{unconnectedUsers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Active Providers</h3>
            <p className="text-3xl font-bold text-purple-600">
              {Object.keys(usersPerProvider).length}
            </p>
            <p className="text-sm text-gray-500">
              {Object.values(usersPerProvider).reduce((sum, count) => sum + count, 0)} total assignments
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search & Filter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or provider name..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="0">Super Admin</option>
                <option value="1">Provider Admin</option>
                <option value="2">Regular User</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setShowBulkAssignment(!showBulkAssignment)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {showBulkAssignment ? 'Hide Bulk Assignment' : 'Show Bulk Assignment'}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Assignment Section */}
        {showBulkAssignment && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Assignment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users (All Users)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {filteredUsers.map(user => (
                    <label key={user.id} className="flex items-center space-x-2 p-1">
                      <input
                        type="checkbox"
                        checked={selectedUsersForBulk.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsersForBulk([...selectedUsersForBulk, user.id]);
                          } else {
                            setSelectedUsersForBulk(selectedUsersForBulk.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {user.email}
                        {user.provider_name && (
                          <span className="text-gray-500 ml-2">(Currently: {user.provider_name})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedUsersForBulk.length} users
                </p>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Provider for Assignment
                </label>
                <div className="relative provider-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={providerSearchTerm}
                      onChange={(e) => setProviderSearchTerm(e.target.value)}
                      onFocus={() => setShowProviderDropdown(true)}
                      placeholder="Search providers..."
                      className="w-full p-2 border border-gray-300 rounded-md pr-8"
                    />
                    {providerSearchTerm && (
                      <button
                        onClick={() => {
                          setProviderSearchTerm('');
                          setSelectedProvider(null);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {showProviderDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-sm text-gray-500 mb-2">
                          {filteredAndSortedProviders.length} providers found
                        </div>
                        {filteredAndSortedProviders.map(provider => (
                          <div
                            key={provider.id}
                            onClick={() => {
                              setSelectedProvider(provider.id);
                              setProviderSearchTerm(provider.name);
                              setShowProviderDropdown(false);
                            }}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                          >
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {provider.id} • {usersPerProvider[provider.id] || 0} users
                            </div>
                          </div>
                        ))}
                        {filteredAndSortedProviders.length === 0 && (
                          <div className="p-2 text-gray-500 text-sm">
                            No providers found matching "{providerSearchTerm}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedProvider && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">Selected:</span> {providers.find(p => p.id === selectedProvider)?.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleBulkAssignment}
              disabled={selectedUsersForBulk.length === 0 || !selectedProvider || isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Assigning...' : `Assign ${selectedUsersForBulk.length} Users to Provider`}
            </button>
          </div>
        )}

        {/* Manual Linking Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Linking</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(Number(e.target.value) || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a user...</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} 
                    {user.provider_name 
                      ? ` (Currently: ${user.provider_name})` 
                      : ' (No Provider)'
                    }
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Provider
              </label>
                              <div className="relative provider-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={providerSearchTerm}
                      onChange={(e) => setProviderSearchTerm(e.target.value)}
                      onFocus={() => setShowProviderDropdown(true)}
                      placeholder="Search providers..."
                      className="w-full p-2 border border-gray-300 rounded-md pr-8"
                    />
                    {providerSearchTerm && (
                      <button
                        onClick={() => {
                          setProviderSearchTerm('');
                          setSelectedProvider(null);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                {showProviderDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-sm text-gray-500 mb-2">
                        {filteredAndSortedProviders.length} providers found
                      </div>
                      {filteredAndSortedProviders.map(provider => (
                        <div
                          key={provider.id}
                          onClick={() => {
                            setSelectedProvider(provider.id);
                            setProviderSearchTerm(provider.name);
                            setShowProviderDropdown(false);
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                        >
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-gray-500">ID: {provider.id}</div>
                        </div>
                      ))}
                      {filteredAndSortedProviders.length === 0 && (
                        <div className="p-2 text-gray-500 text-sm">
                          No providers found matching "{providerSearchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedProvider && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <div className="text-sm">
                    <span className="font-medium">Selected:</span> {providers.find(p => p.id === selectedProvider)?.name}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={linkUserToProvider}
            disabled={!selectedUser || !selectedProvider || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Linking...' : 'Assign User to Provider'}
          </button>
        </div>

        {/* Connected Users List */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Users ({connectedUsers.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multi-Provider Access</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connectedUsers.map(user => {
                  const userProviderList = userProviders[user.email] || [];
                  
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email} (ID: {user.id})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.provider_name ? (
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 border border-blue-200">
                            {user.provider_name} (ID: {user.provider_id})
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No primary provider</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => loadUserProviderDetails(user.email)}
                            disabled={isLoadingUserProviders}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 text-sm"
                          >
                            {isLoadingUserProviders && showUserProviderDetails === user.email ? 'Loading...' : 'View Providers'}
                          </button>
                          {userProviderList.length > 0 && (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 border border-green-200">
                              {userProviderList.length} provider{userProviderList.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {/* Provider Details Dropdown */}
                        {showUserProviderDetails === user.email && userProviderList.length > 0 && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                            <div className="text-xs font-medium text-gray-700 mb-2">Provider Access:</div>
                            {userProviderList.map(provider => (
                              <div key={provider.id} className="flex items-center justify-between py-1">
                                <span className="text-sm text-gray-600">
                                  {provider.name} (ID: {provider.id})
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleSetActiveProvider(user.email, provider.id)}
                                    disabled={isLoading}
                                    className={`px-2 py-1 text-xs rounded ${
                                      activeProviders[user.email] === provider.id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {activeProviders[user.email] === provider.id ? 'Active' : 'Set Active'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveUserFromProvider(user.email, provider.id)}
                                    disabled={isLoading}
                                    className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {user.provider_id ? (
                            <button
                              onClick={() => unlinkUserFromProvider(user.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Unlink Primary
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">No primary provider</span>
                          )}
                          <button
                            onClick={() => forceUnassignUser(user.id)}
                            disabled={isLoading}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50 text-xs"
                            title="Force unassign from all providers"
                          >
                            Force Unassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Provider Management Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Multi-Provider Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Assign users to multiple providers for enhanced access control and flexibility.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(Number(e.target.value) || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a user...</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} 
                    {user.provider_name 
                      ? ` (Primary: ${user.provider_name})` 
                      : ' (No Primary Provider)'
                    }
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Additional Provider
              </label>
              <div className="relative provider-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    value={providerSearchTerm}
                    onChange={(e) => setProviderSearchTerm(e.target.value)}
                    onFocus={() => setShowProviderDropdown(true)}
                    placeholder="Search providers..."
                    className="w-full p-2 border border-gray-300 rounded-md pr-8"
                  />
                  {providerSearchTerm && (
                    <button
                      onClick={() => {
                        setProviderSearchTerm('');
                        setSelectedProvider(null);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {showProviderDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {filteredAndSortedProviders.map(provider => (
                        <div
                          key={provider.id}
                          onClick={() => {
                            setSelectedProvider(provider.id);
                            setProviderSearchTerm(provider.name);
                            setShowProviderDropdown(false);
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                        >
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {provider.id} • {usersPerProvider[provider.id] || 0} users
                          </div>
                        </div>
                      ))}
                      {filteredAndSortedProviders.length === 0 && (
                        <div className="p-2 text-gray-500 text-sm">
                          No providers found matching "{providerSearchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={linkUserToProvider}
                disabled={!selectedUser || !selectedProvider || isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Provider Access'}
              </button>
            </div>
          </div>
          
          {selectedUser && selectedProvider && (
            <div className="mt-2 p-2 bg-purple-50 rounded-md">
              <div className="text-sm">
                <span className="font-medium">Adding Access:</span> 
                {users.find(u => u.id === selectedUser)?.email} → {providers.find(p => p.id === selectedProvider)?.name}
              </div>
            </div>
          )}
        </div>

        {/* Unconnected Users List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Unconnected Users ({unconnectedUsers.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unconnectedUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email} (ID: {user.id})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unconnected
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserProviderLinking; 