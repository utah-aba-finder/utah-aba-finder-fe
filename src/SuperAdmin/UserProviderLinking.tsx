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

  // Get unlinked users for bulk assignment
  const unlinkedUsers = filteredUsers.filter(user => !user.provider_id);

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

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from:', 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/users_with_providers');
      console.log('Using auth header:', getAdminAuthHeader());
      
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/users_with_providers', {
        headers: {
          'Authorization': getAdminAuthHeader(),
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users API response:', data);
        console.log('Setting users:', data.users || []);
        setUsers(data.users || []);
      } else {
        const errorText = await response.text();
        console.error('Users API error:', response.status, errorText);
        toast.error(`Failed to fetch users: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchUnlinkedUsers = async () => {
    try {
      console.log('Fetching unlinked users from:', 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/unlinked_users');
      
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/unlinked_users', {
        headers: {
          'Authorization': getAdminAuthHeader(),
        }
      });
      
      console.log('Unlinked users response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Unlinked users API response:', data);
        // We could use this for additional functionality if needed
        return data.users || [];
      } else {
        const errorText = await response.text();
        console.error('Unlinked users API error:', response.status, errorText);
        return [];
      }
    } catch (error) {
      console.error('Error fetching unlinked users:', error);
      return [];
    }
  };

  const fetchProviders = async () => {
    try {
      console.log('Fetching providers from:', 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/providers_list');
      
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/providers_list', {
        headers: {
          'Authorization': getAdminAuthHeader(),
        }
      });
      
      console.log('Providers response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Providers API response:', data);
        setProviders(data.providers || []);
      } else {
        const errorText = await response.text();
        console.error('Providers API error:', response.status, errorText);
        toast.error(`Failed to fetch providers: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
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
      // Find the user email from the selected user ID
      const selectedUserObj = users.find(user => user.id === selectedUser);
      if (!selectedUserObj) {
        toast.error('Selected user not found');
        return;
      }

      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/manual_link', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: selectedUserObj.email,
          provider_id: selectedProvider
        })
      });

      if (response.ok) {
        toast.success('User successfully linked to provider!');
        fetchUsers(); // Refresh the user list
        setSelectedUser(null);
        setSelectedProvider(null);
        setProviderSearchTerm(''); // Clear the search term
      } else {
        const errorData = await response.json();
        toast.error(`Failed to link user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error linking user to provider:', error);
      toast.error('Failed to link user to provider');
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserProvider = async (userEmail: string, newProviderId: number | null) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/switch_provider', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          new_provider_id: newProviderId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(`User switched successfully!`);
          fetchUsers(); // Refresh the user list
        } else {
          toast.error(`Failed to switch user: ${result.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to switch user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error switching user provider:', error);
      toast.error('Failed to switch user provider');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkAssignUsers = async (userEmails: string[], providerId: number) => {
    setIsLoading(true);
    try {
      // For now, use individual assignments until bulk endpoint is available
      let successfulAssignments = 0;
      let failedAssignments: string[] = [];
      
      for (const email of userEmails) {
        try {
          const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/manual_link', {
            method: 'POST',
            headers: {
              'Authorization': getAdminAuthHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_email: email,
              provider_id: providerId
            })
          });
          
          if (response.ok) {
            successfulAssignments++;
          } else {
            failedAssignments.push(email);
          }
        } catch (error) {
          failedAssignments.push(email);
        }
      }
      
      if (successfulAssignments > 0) {
        toast.success(`Bulk assignment completed! ${successfulAssignments} users assigned successfully.`);
      }
      if (failedAssignments.length > 0) {
        toast.warning(`${failedAssignments.length} assignments failed. Check console for details.`);
        console.log('Failed assignments:', failedAssignments);
      }
      
      fetchUsers(); // Refresh the user list
      setProviderSearchTerm(''); // Clear the search term
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error bulk assigning users:', error);
      toast.error('Failed to bulk assign users');
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkUserFromProvider = async (userId: number) => {
    setIsLoading(true);
    try {
      // Find the user object from the user ID
      const userObj = users.find(user => user.id === userId);
      if (!userObj) {
        toast.error('User not found');
        return;
      }

      if (!userObj.provider_id) {
        toast.error('User is not currently assigned to any provider');
        return;
      }

      // Use the new unlink endpoint
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/unlink_user_from_provider', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userObj.email,
          provider_id: userObj.provider_id
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
      console.error('Error unlinking user from provider:', error);
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
        console.log('Force unassign response:', result);
        if (result.success) {
          toast.success('User successfully unassigned from all providers!');
          console.log('Refreshing user list after force unassign...');
          await fetchUsers(); // Refresh the user list
        } else {
          toast.error(`Failed to unassign user: ${result.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Force unassign error:', errorData);
        toast.error(`Failed to unassign user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error unassigning user:', error);
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
                  Select Unlinked Users
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {unlinkedUsers.map(user => (
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
                      <span className="text-sm">{user.email}</span>
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
                {unconnectedUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} (ID: {user.id})
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
            {isLoading ? 'Linking...' : 'Link User to Provider'}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connectedUsers.map(user => {
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email} (ID: {user.id})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.provider_name || `Provider ID: ${user.provider_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => unlinkUserFromProvider(user.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Unlink
                          </button>
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