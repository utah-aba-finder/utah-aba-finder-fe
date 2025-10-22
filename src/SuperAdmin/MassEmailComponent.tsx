import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  fetchMassEmailStats, 
  sendPasswordReminders, 
  sendSystemUpdates, 
  previewEmail,
  MassEmailStats,
  MassEmailResponse,
  EmailPreview
} from '../Utility/ApiCall';
import { Mail, Users, AlertCircle, CheckCircle, Eye, Send, RefreshCw } from 'lucide-react';

interface MassEmailComponentProps {
  onClose?: () => void;
}

const MassEmailComponent: React.FC<MassEmailComponentProps> = ({ onClose }) => {
  const [stats, setStats] = useState<MassEmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [previewType, setPreviewType] = useState<'password_reminder' | 'system_update' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchMassEmailStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load mass email stats:', error);
      toast.error('Failed to load email statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReminders = async () => {
    if (!stats || stats.providers_needing_password_update === 0) {
      toast.warning('No providers need password reminders');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send password reminders to ${stats.providers_needing_password_update} providers?`
    );

    if (!confirmed) return;

    try {
      setSending(true);
      const response = await sendPasswordReminders();
      
      if (response.success) {
        toast.success(`✅ Password reminders sent successfully! ${response.emails_sent || 0} emails sent.`);
        setLastAction('Password reminders sent');
        await loadStats(); // Refresh stats
      } else {
        toast.error(`❌ Failed to send password reminders: ${response.message}`);
      }
    } catch (error) {
      console.error('Failed to send password reminders:', error);
      toast.error('Failed to send password reminders');
    } finally {
      setSending(false);
    }
  };

  const handleSendSystemUpdates = async () => {
    if (!stats || stats.total_providers === 0) {
      toast.warning('No providers available for system updates');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send system updates to all ${stats.total_providers} providers?`
    );

    if (!confirmed) return;

    try {
      setSending(true);
      const response = await sendSystemUpdates();
      
      if (response.success) {
        toast.success(`✅ System updates sent successfully! ${response.emails_sent || 0} emails sent.`);
        setLastAction('System updates sent');
        await loadStats(); // Refresh stats
      } else {
        toast.error(`❌ Failed to send system updates: ${response.message}`);
      }
    } catch (error) {
      console.error('Failed to send system updates:', error);
      toast.error('Failed to send system updates');
    } finally {
      setSending(false);
    }
  };

  const handlePreviewEmail = async (type: 'password_reminder' | 'system_update') => {
    try {
      setPreviewType(type);
      const previewData = await previewEmail(type);
      setPreview(previewData);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to preview email:', error);
      toast.error('Failed to load email preview');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading email statistics...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
        <p className="text-gray-600 mb-4">Unable to load email statistics. Please try again.</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mass Email System</h2>
            <p className="text-sm text-gray-600">Send targeted emails to providers</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_providers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Need Password Update</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.providers_needing_password_update}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Created</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.recently_created_providers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password Reminders */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Password Reminders</h4>
              <span className="text-sm text-gray-500">{stats.providers_needing_password_update} recipients</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send password reset reminders to providers who haven't updated their passwords recently.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePreviewEmail('password_reminder')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleSendPasswordReminders}
                disabled={sending || stats.providers_needing_password_update === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Reminders</span>
              </button>
            </div>
          </div>

          {/* System Updates */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">System Updates</h4>
              <span className="text-sm text-gray-500">{stats.total_providers} recipients</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send system updates and announcements to all providers in the system.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePreviewEmail('system_update')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleSendSystemUpdates}
                disabled={sending || stats.total_providers === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Updates</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Last Action */}
      {lastAction && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm text-green-800">{lastAction}</span>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-900">{preview.subject}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-900">{preview.recipients_count} providers</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="p-3 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                  <div 
                    className="text-sm text-gray-900 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: preview.content }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassEmailComponent;
