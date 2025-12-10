import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../Provider-login/AuthProvider';
import { Save, X } from 'lucide-react';

const UserInfoForm: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFirstName(currentUser?.first_name || '');
  }, [currentUser?.first_name]);

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
    }
    return process.env.REACT_APP_API_BASE_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('User not found');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id.toString()}`,
        },
        body: JSON.stringify({
          user: {
            first_name: firstName.trim() || null
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update user information');
      }

      // Response is successful, update currentUser in context and session storage
      const updatedUser = {
        ...currentUser,
        first_name: firstName.trim() || null
      };
      
      setCurrentUser(updatedUser);
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      toast.success('Name updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(currentUser?.first_name || '');
    setIsEditing(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p className="text-sm text-gray-900">{currentUser.email || 'N/A'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your name"
              disabled={isSaving}
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
              title="Save"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="p-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-900 flex-1">
              {currentUser.first_name || 'Not set'}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          This name will be used in welcome messages
        </p>
      </div>
    </div>
  );
};

export default UserInfoForm;
