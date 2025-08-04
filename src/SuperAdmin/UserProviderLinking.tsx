import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdminAuthHeader } from '../Utility/config';

interface User {
  id: number;
  email: string;
  provider_id?: number;
  provider_name?: string;
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

  useEffect(() => {
    fetchUsers();
    fetchProviders();
  }, []);

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

  const unlinkUserFromProvider = async (userId: number) => {
    setIsLoading(true);
    try {
      // Find the user email from the user ID
      const userObj = users.find(user => user.id === userId);
      if (!userObj) {
        toast.error('User not found');
        return;
      }

      // For unlinking, we can switch the user to provider_id null or use a special endpoint
      // For now, let's use the switch_provider endpoint with null provider
      const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/users/switch_provider', {
        method: 'POST',
        headers: {
          'Authorization': getAdminAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userObj.email,
          new_provider_id: null
        })
      });

      if (response.ok) {
        toast.success('User successfully unlinked from provider!');
        fetchUsers(); // Refresh the user list
      } else {
        const errorData = await response.json();
        toast.error(`Failed to unlink user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error unlinking user from provider:', error);
      toast.error('Failed to unlink user from provider');
    } finally {
      setIsLoading(false);
    }
  };

  const connectedUsers = users.filter(user => user.provider_id);
  const unconnectedUsers = users.filter(user => !user.provider_id);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User-Provider Linking Tool</h1>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Provider
              </label>
              <select
                value={selectedProvider || ''}
                onChange={(e) => setSelectedProvider(Number(e.target.value) || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a provider...</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} (ID: {provider.id})
                  </option>
                ))}
              </select>
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
                        <button
                          onClick={() => unlinkUserFromProvider(user.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Unlink
                        </button>
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