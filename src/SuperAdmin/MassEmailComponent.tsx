import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  fetchMassEmailStats, 
  sendPasswordReminders, 
  sendSystemUpdates, 
  previewEmail,
  fetchEmailTemplates,
  loadEmailTemplate,
  saveEmailTemplate,
  previewEmailTemplate,
  MassEmailStats,
  EmailPreview,
  EmailTemplate,
  TemplatePreviewResponse
} from '../Utility/ApiCall';
import { Mail, Users, AlertCircle, CheckCircle, Eye, Send, RefreshCw, Edit3, Save } from 'lucide-react';

interface MassEmailComponentProps {
  onClose?: () => void;
}

const MassEmailComponent: React.FC<MassEmailComponentProps> = ({ onClose }) => {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [stats, setStats] = useState<MassEmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  
  // Template Editor State
  const [templates, setTemplates] = useState<{ [key: string]: EmailTemplate }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState('');
  const [originalTemplateContent, setOriginalTemplateContent] = useState('');
  const [templateType, setTemplateType] = useState<'html' | 'text'>('html');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreviewResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates'>('dashboard');

  useEffect(() => {
    loadStats();
    loadTemplates();
  }, []);

  // Add global error handler to prevent component unmounting
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log('🚨 Global error caught in MassEmailComponent:', event.error);
      setHasError(true);
      setErrorMessage(event.error?.message || 'Unknown error occurred');
      event.preventDefault(); // Prevent default error handling
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('🚨 Unhandled promise rejection in MassEmailComponent:', event.reason);
      setHasError(true);
      setErrorMessage(event.reason?.message || 'Promise rejection occurred');
      event.preventDefault(); // Prevent default error handling
      return false;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchMassEmailStats();
      setStats(data);
    } catch (error) {
      console.error('❌ Failed to load mass email stats:', error);
      toast.error('Failed to load email statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReminders = async () => {
    if (!stats || stats.statistics.users_needing_password_updates === 0) {
      toast.warning('No providers need password reminders');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send password reminders to ${stats.statistics.users_needing_password_updates} providers?`
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
    if (!stats || stats.statistics.total_users_with_providers === 0) {
      toast.warning('No providers available for system updates');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send system updates to all ${stats.statistics.total_users_with_providers} providers?`
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

  const handlePreviewEmail = async (type: 'password_update_reminder' | 'system_update') => {
    try {
      console.log('🔄 Loading email preview for:', type);
      
      try {
        // Map frontend template names to backend parameter names
        const backendType = type === 'password_update_reminder' ? 'password_update_reminder' : type;
        const previewData = await previewEmail(backendType);
        console.log('✅ Email preview loaded:', previewData);
        setPreview(previewData);
      } catch (error) {
        // If preview API doesn't exist, show a placeholder preview
        console.log('⚠️ Preview API not available, showing placeholder');
        const placeholderPreview = {
          subject: type === 'password_update_reminder' 
            ? 'Password Update Required - Utah ABA Finder'
            : 'System Update - Utah ABA Finder',
          content: type === 'password_update_reminder'
            ? 'This is a placeholder for the password reminder email. The actual email will be sent to providers who need to update their passwords.'
            : 'This is a placeholder for the system update email. The actual email will contain system updates and announcements.',
          recipients_count: type === 'password_update_reminder' 
            ? stats?.statistics.users_needing_password_updates || 0
            : stats?.statistics.total_users_with_providers || 0
        };
        setPreview(placeholderPreview);
      }
      
      setShowPreview(true);
    } catch (error) {
      console.error('❌ Failed to preview email:', error);
      toast.error('Failed to load email preview');
    }
  };

  // Template Editor Functions
  const loadTemplates = async () => {
    try {
      console.log('🔄 Loading email templates...');
      const data = await fetchEmailTemplates();
      console.log('✅ Templates loaded:', data);
      setTemplates(data.templates);
      
      // Log available template keys for debugging
      if (data.templates) {
        console.log('📋 Available template keys:', Object.keys(data.templates));
        console.log('📋 Template details:', data.templates);
      }
    } catch (error) {
      console.error('❌ Failed to load templates:', error);
      toast.error('Failed to load email templates');
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return selectedTemplate && templateContent !== originalTemplateContent;
  };

  const loadTemplateContent = async (templateName: string) => {
    // Check for unsaved changes before loading a new template
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to switch templates? Your changes will be lost.'
      );
      if (!confirmed) {
        return;
      }
    }

    setTemplateLoading(true);
    console.log('🔄 Loading template:', templateName, 'with type:', templateType);
    
    const data = await loadEmailTemplate(templateName, templateType);
    console.log('✅ Template response received:', data);
    
    setTemplateLoading(false);
    
    if (!data.success) {
      // Handle error gracefully without unmounting the component
      console.log('⚠️ Template loading failed, showing placeholder content');
      const placeholderContent = `<!-- ${templateName} template placeholder -->
<html>
<body>
  <h2>${templates[templateName]?.name || templateName}</h2>
  <p>This template is not available on the backend yet.</p>
  <p>Template name: ${templateName}</p>
  <p>Template type: ${templateType}</p>
  <p>Error: ${data.error || 'Unknown error'}</p>
  
  <p>Available template details:</p>
  <ul>
    <li>Name: ${templates[templateName]?.name || 'Unknown'}</li>
    <li>Subject: ${templates[templateName]?.subject || 'No subject'}</li>
    <li>Description: ${templates[templateName]?.description || 'No description'}</li>
  </ul>
</body>
</html>`;
      setTemplateContent(placeholderContent);
      setSelectedTemplate(templateName);
      toast.warning(`Template "${templateName}" not available: ${data.error || 'Unknown error'}`);
      return;
    }
    
    // Success path
    if (data.content) {
      setTemplateContent(data.content);
      setOriginalTemplateContent(data.content); // Track original content
      setSelectedTemplate(templateName);
      toast.success(`Template "${templateName}" loaded successfully`);
    } else {
      setTemplateContent('');
      setOriginalTemplateContent('');
      toast.warning('Template loaded but content is empty');
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;
    
    setTemplateSaving(true);
    try {
      console.log('💾 Saving template:', selectedTemplate, 'with content length:', templateContent.length);
      const data = await saveEmailTemplate(selectedTemplate, templateContent, templateType);
      console.log('💾 Save response:', data);
      
      if (data.success) {
        toast.success('Template saved successfully!');
        // Update the original content to match the saved content
        setOriginalTemplateContent(templateContent);
        // Update the templates list to reflect the saved content
        setTemplates(prev => ({
          ...prev,
          [selectedTemplate]: {
            ...prev[selectedTemplate],
            // Mark as recently saved
            lastSaved: new Date().toISOString()
          }
        }));
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template');
    } finally {
      setTemplateSaving(false);
    }
  };

  const previewTemplate = async () => {
    if (!selectedTemplate) return;
    
    const data = await previewEmailTemplate(selectedTemplate, templateType);
    
    if (data.success) {
      setTemplatePreview(data);
      toast.success('Template preview loaded successfully');
    } else {
      // Handle error gracefully without unmounting the component
      console.log('⚠️ Preview not available, showing mock preview');
      const mockPreview: TemplatePreviewResponse = {
        subject: `${templates[selectedTemplate]?.name || selectedTemplate} Preview`,
        to: 'user@example.com',
        html_content: templateContent && templateContent.includes('<html>') ? templateContent : `<html><body><pre>${templateContent || 'No content available'}</pre></body></html>`,
        text_content: templateContent && templateContent.includes('<html>') ? 'HTML content - text preview not available' : (templateContent || 'No content available'),
        success: true
      };
      setTemplatePreview(mockPreview);
      toast.warning(`Preview service not available: ${data.error || 'Unknown error'}. Showing content directly.`);
    }
  };

  // Error boundary - show error message instead of crashing
  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error in Mass Email Component</div>
          <div className="text-gray-600 mb-4">{errorMessage}</div>
          <button 
            onClick={() => {
              setHasError(false);
              setErrorMessage(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Component
          </button>
        </div>
      </div>
    );
  }

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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email Dashboard
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            Email Templates
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statistics.total_users_with_providers ?? 'N/A'}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statistics.users_needing_password_updates ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Updated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statistics.recently_updated_users ?? 'N/A'}
              </p>
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
              <span className="text-sm text-gray-500">{stats.statistics.users_needing_password_updates} recipients</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send password reset reminders to providers who haven't updated their passwords recently.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePreviewEmail('password_update_reminder')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleSendPasswordReminders}
                disabled={sending || stats.statistics.users_needing_password_updates === 0}
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
              <span className="text-sm text-gray-500">{stats.statistics.total_users_with_providers} recipients</span>
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
                disabled={sending || stats.statistics.total_users_with_providers === 0}
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
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Template Selector */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(templates).length > 0 ? (
                Object.entries(templates).map(([key, template]) => (
                  <div 
                    key={key}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      console.log('🖱️ Clicking on template:', key);
                      loadTemplateContent(key);
                    }}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <small className="text-xs text-gray-500">Subject: {template.subject}</small>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-gray-500">
                  <p>No templates available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Template Editor */}
          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Template: {templates[selectedTemplate]?.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <select 
                      value={templateType} 
                      onChange={(e) => {
                        const newType = e.target.value as 'html' | 'text';
                        
                        // Check for unsaved changes before switching type
                        if (hasUnsavedChanges()) {
                          const confirmed = window.confirm(
                            'You have unsaved changes. Are you sure you want to switch template type? Your changes will be lost.'
                          );
                          if (!confirmed) {
                            return;
                          }
                        }
                        
                        setTemplateType(newType);
                        if (selectedTemplate) {
                          // Reload template content with new type
                          loadTemplateContent(selectedTemplate);
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="html">HTML</option>
                      <option value="text">Text</option>
                    </select>
                    <button 
                      onClick={previewTemplate}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={templateLoading}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button 
                      onClick={saveTemplate}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        hasUnsavedChanges() 
                          ? 'bg-orange-600 text-white hover:bg-orange-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={templateSaving || templateLoading}
                    >
                      {templateSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>
                        {templateSaving ? 'Saving...' : 
                         hasUnsavedChanges() ? 'Save Changes' : 'Save Template'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Enter your email template content here..."
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={templateLoading}
                />
              </div>

              {/* Template Preview */}
              {templatePreview && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Email Preview</h4>
                  <div className="bg-white rounded-lg border overflow-hidden">
                    {/* Email Header */}
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">U</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Utah ABA Finder</p>
                            <p className="text-xs text-gray-500">no-reply@utahabafinder.com</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">To: {templatePreview.to}</p>
                          <p className="text-xs text-gray-500">Subject: {templatePreview.subject}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Email Content */}
                    <div className="p-6">
                      {templateType === 'html' ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          style={{
                            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            lineHeight: '1.6',
                            color: '#333'
                          }}
                          dangerouslySetInnerHTML={{ __html: templatePreview.html_content || '' }} 
                        />
                      ) : (
                        <div 
                          className="whitespace-pre-wrap"
                          style={{
                            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            lineHeight: '1.6',
                            color: '#333',
                            fontSize: '14px'
                          }}
                        >
                          {templatePreview.text_content || ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MassEmailComponent;
