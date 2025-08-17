import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Users,
  Heart,
  Brain,
  GraduationCap,
  Home,
  Calendar,
  Scissors,
  MessageSquare,
  Activity,
  Target,
  Stethoscope,
  Smile,
  ClipboardCheck
} from 'lucide-react';

// TypeScript declarations for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

// Add reCAPTCHA script to head
const addRecaptchaScript = () => {
  if (document.querySelector('script[src*="recaptcha"]')) return;
  
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?render=6LfTMGErAAAAAARfviGKHaQSMBEiUqHOZeBEmRIu';
  document.head.appendChild(script);
};

interface CategoryField {
  id: number;
  name: string;
  field_type: 'select' | 'boolean' | 'text';
  required: boolean;
  options?: {
    choices?: string[];
  };
  display_order: number;
  help_text: string | null;
  is_active: boolean;
}

interface ProviderCategory {
  id: number;
  type: 'provider_category';
  attributes: {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    display_order: number;
    category_fields: CategoryField[];
  };
  relationships?: {
    fields: {
      data: CategoryField[];
    };
  };
}

interface ProviderRegistration {
  email: string;
  provider_name: string;
  category: string;
  submitted_data: {
    [key: string]: any;
  };
}

const ProviderSignup: React.FC = () => {
  const [categories, setCategories] = useState<ProviderCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | null>(null);
  const [formData, setFormData] = useState<ProviderRegistration>({
    email: '',
    provider_name: '',
    category: '',
    submitted_data: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCheckComplete, setDuplicateCheckComplete] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch provider categories on component mount
  useEffect(() => {
    fetchProviderCategories();
    addRecaptchaScript();
  }, []);

  const executeRecaptcha = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window.grecaptcha === 'undefined') {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }
      
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute('6LfTMGErAAAAAARfviGKHaQSMBEiUqHOZeBEmRIu', { action: 'provider_signup' })
          .then((token: string) => resolve(token))
          .catch((error: any) => reject(error));
      });
    });
  };

  const checkForDuplicateProvider = async (): Promise<boolean> => {
    try {
      // Backend needs to implement this endpoint: /api/v1/providers/check_duplicate
      const response = await fetch(
        `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/check_duplicate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            provider_name: formData.provider_name
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.is_duplicate || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const fetchProviderCategories = async () => {
    try {
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_categories',
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Provider categories response:', data);
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch provider categories:', response.status, response.statusText);
        toast.error('Failed to load provider categories');
      }
    } catch (error) {
      console.error('Error fetching provider categories:', error);
      toast.error('Error loading provider categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('submitted_data.')) {
      const subField = field.replace('submitted_data.', '');
      setFormData(prev => ({
        ...prev,
        submitted_data: {
          ...prev.submitted_data,
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error('Please select a provider category');
      return;
    }

    // Check for duplicate provider first
    if (!duplicateCheckComplete) {
      setIsCheckingDuplicate(true);
      try {
        const isDuplicate = await checkForDuplicateProvider();
        if (isDuplicate) {
          toast.error('A provider with this email or name already exists in our system. Please contact us if you need to update your information.');
          setIsCheckingDuplicate(false);
          return;
        }
        setDuplicateCheckComplete(true);
      } catch (error) {
        toast.error('Error checking for duplicates. Please try again.');
        setIsCheckingDuplicate(false);
        return;
      } finally {
        setIsCheckingDuplicate(false);
      }
    }

    // Execute reCAPTCHA
    let token: string;
    try {
      token = await executeRecaptcha();
      setRecaptchaToken(token);
    } catch (error) {
      toast.error('reCAPTCHA verification failed. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        email: formData.email,
        provider_name: formData.provider_name,
        category: selectedCategory.attributes.slug,
        submitted_data: formData.submitted_data,
        recaptcha_token: token
      };

      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_registrations',
        { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('Provider registration submitted successfully!');
        console.log('Registration successful:', data);
        // Reset form and steps
        setFormData({
          email: '',
          provider_name: '',
          category: '',
          submitted_data: {}
        });
        setSelectedCategory(null);
        setStep(1);
        setRecaptchaToken(null);
        setDuplicateCheckComplete(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => { if (step < 3) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const renderDynamicFields = (categoryFields: CategoryField[]) => {
    if (!categoryFields || categoryFields.length === 0) {
      return (
        <div className="col-span-2 text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading category fields...</p>
        </div>
      );
    }

    return categoryFields
      .sort((a, b) => a.display_order - b.display_order)
      .map((field) => (
        <div key={field.id} className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.name} {field.required && <span className="text-red-500">*</span>}
          </label>
          
          {field.field_type === 'select' && field.options && field.options.choices && (
            <select
              value={formData.submitted_data[field.name] || ''}
              onChange={(e) => handleInputChange(`submitted_data.${field.name}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            >
              <option value="">Select {field.name}</option>
              {field.options.choices.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
          
          {field.field_type === 'boolean' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.submitted_data[field.name] || false}
                onChange={(e) => handleInputChange(`submitted_data.${field.name}`, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{field.help_text || field.name}</span>
            </label>
          )}
          
          {field.field_type === 'text' && (
            <input
              type="text"
              value={formData.submitted_data[field.name] || ''}
              onChange={(e) => handleInputChange(`submitted_data.${field.name}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.help_text || `Enter ${field.name.toLowerCase()}`}
              required={field.required}
            />
          )}
          
          {field.help_text && field.field_type !== 'boolean' && (
            <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
          )}
        </div>
      ));
  };

  const getCategoryIcon = (categorySlug: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'aba-therapy': <Brain className="h-8 w-8 text-blue-600" />,
      'dentists': <Building2 className="h-8 w-8 text-green-600" />,
      'therapists': <Heart className="h-8 w-8 text-red-600" />,
      'physical-therapists': <GraduationCap className="h-8 w-8 text-purple-600" />,
      'barbers-hair': <Scissors className="h-8 w-8 text-indigo-600" />,
      'advocates': <Users className="h-8 w-8 text-orange-600" />,
      'autism-evaluations': <ClipboardCheck className="h-8 w-8 text-teal-600" />,
      'speech-therapy': <MessageSquare className="h-8 w-8 text-pink-600" />,
      'occupational-therapy': <Activity className="h-8 w-8 text-yellow-600" />,
      'coaching-mentoring': <Target className="h-8 w-8 text-cyan-600" />,
      'pediatricians': <Stethoscope className="h-8 w-8 text-emerald-600" />,
      'orthodontists': <Smile className="h-8 w-8 text-violet-600" />
    };
    return iconMap[categorySlug] || <Building2 className="h-8 w-8 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Provider Network
          </h1>
          <p className="text-xl text-gray-600">
            Help families find the autism services they need
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Category</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Choose Your Service Category</h2>
            
            {isLoadingCategories ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading provider categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No provider categories available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Please try again later or contact support.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`category-card cursor-pointer border-2 rounded-lg p-6 transition-all duration-200 ${
                        selectedCategory?.id === category.id 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => {
                        console.log('Selected category:', category);
                        setSelectedCategory(category);
                      }}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          {getCategoryIcon(category.attributes.slug)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.attributes.name}</h3>
                        <p className="text-sm text-gray-600">{category.attributes.description}</p>
                        {category.attributes.category_fields && (
                          <p className="text-xs text-gray-400 mt-2">
                            {category.attributes.category_fields.length} fields
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <button
                    onClick={nextStep}
                    disabled={!selectedCategory}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Continue to Details
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Dynamic Form Fields */}
        {step === 2 && selectedCategory && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Tell Us About Your Services</h2>
            
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name *</label>
                  <input
                    type="text"
                    value={formData.provider_name || ''}
                    onChange={(e) => handleInputChange('provider_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category-Specific Fields */}
            {selectedCategory && selectedCategory.attributes.category_fields && selectedCategory.attributes.category_fields.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Service-Specific Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderDynamicFields(selectedCategory.attributes.category_fields)}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Service-Specific Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    No specific fields defined for this category. Please fill out the basic information below.
                  </p>
                </div>
              </div>
            )}

            {/* Contact & Business Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Contact & Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.submitted_data.contact_phone || ''}
                    onChange={(e) => handleInputChange('submitted_data.contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.submitted_data.website || ''}
                    onChange={(e) => handleInputChange('submitted_data.website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                  <input
                    type="text"
                    value={formData.submitted_data.service_areas || ''}
                    onChange={(e) => handleInputChange('submitted_data.service_areas', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Utah, Idaho, Wyoming"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waitlist Status</label>
                  <select
                    value={formData.submitted_data.waitlist_status || ''}
                    onChange={(e) => handleInputChange('submitted_data.waitlist_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Currently accepting clients">Currently accepting clients</option>
                    <option value="Short waitlist">Short waitlist</option>
                    <option value="Long waitlist">Long waitlist</option>
                    <option value="Not accepting new clients">Not accepting new clients</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Acceptance</label>
                  <select
                    value={formData.submitted_data.insurance_acceptance || ''}
                    onChange={(e) => handleInputChange('submitted_data.insurance_acceptance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes, we accept insurance</option>
                    <option value="No">No, private pay only</option>
                    <option value="Some">Some insurance plans</option>
                  </select>
                </div>
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={formData.submitted_data.additional_notes || ''}
                    onChange={(e) => handleInputChange('submitted_data.additional_notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Tell us about your services, special accommodations, or anything else..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Back to Category
              </button>
              <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Fallback for Step 2 if no category selected */}
        {step === 2 && !selectedCategory && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-6">No Category Selected</h2>
            <p className="text-gray-600 mb-6">Please go back and select a provider category first.</p>
            <button onClick={prevStep} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Back to Category Selection
            </button>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Review Your Information</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Registration Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Provider Name:</span>
                  <span>{formData.provider_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{selectedCategory?.attributes.name}</span>
                </div>
                {Object.entries(formData.submitted_data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                    <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'Not provided'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* reCAPTCHA Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="https://policies.google.com/terms" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Back to Details
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || isCheckingDuplicate}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCheckingDuplicate ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking for duplicates...
                  </>
                ) : isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSignup; 