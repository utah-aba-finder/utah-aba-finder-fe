import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Mail, Building2, Phone, Globe, AlertCircle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

interface ClaimAccountProps {
  onBackToSignup: () => void;
}

const ClaimAccount: React.FC<ClaimAccountProps> = ({ onBackToSignup }) => {
  const [formData, setFormData] = useState({
    provider_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    additional_info: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider_name || !formData.contact_email) {
      toast.error('Please provide at least your provider name and contact email');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Send claim request to backend
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_registrations/claim_account',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            claim_request: {
              provider_name: formData.provider_name,
              contact_email: formData.contact_email,
              contact_phone: formData.contact_phone || null,
              website: formData.website || null,
              additional_info: formData.additional_info || null
            }
          })
        }
      );

      if (response.ok) {
        await response.json(); // Response is consumed but data not needed
        toast.success('Account claim request submitted successfully! We will verify your identity and send you login credentials within 24-48 hours.');
        
        // Reset form
        setFormData({
          provider_name: '',
          contact_email: '',
          contact_phone: '',
          website: '',
          additional_info: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit claim request. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Your Provider Account</h1>
          <p className="text-gray-600">
            Your provider information is already in our system! Request access to your account.
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Submit your provider information to match your existing profile</li>
                <li>We'll verify your identity and ownership of the provider</li>
                <li>You'll receive login credentials to access your account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Claim Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Name */}
            <div>
              <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700 mb-2">
                Provider Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="provider_name"
                  type="text"
                  required
                  value={formData.provider_name}
                  onChange={(e) => handleInputChange('provider_name', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border"
                  placeholder="Enter your provider organization name"
                />
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contact_email"
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:border-transparent box-border"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                id="additional_info"
                rows={3}
                value={formData.additional_info}
                onChange={(e) => handleInputChange('additional_info', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border"
                placeholder="Any additional details that might help us verify your account (e.g., previous contact person, services offered, etc.)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Submit Claim Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Signup */}
        <div className="text-center mt-6">
          <button
            onClick={onBackToSignup}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            ← Back to Provider Registration
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-2">
            Need immediate assistance?
          </p>
          <a
            href="mailto:registration@autismserviceslocator.com"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
          >
            Contact our support team
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Your provider profile is already in our system - we just need to verify you're the right person to give access to!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimAccount;
