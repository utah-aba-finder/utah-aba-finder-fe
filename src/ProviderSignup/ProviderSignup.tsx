import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  Building2, Heart, Brain, Scissors, Activity, Target, 
  Smile, ClipboardCheck, Baby, Dumbbell, Shield, Ear
} from 'lucide-react';
import { fetchStates } from '../Utility/ApiCall';
import InsuranceInput from './InsuranceInput';
import './InsuranceInput.css';
import './ProviderSignup.css';

// TypeScript declarations for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string, options: any) => number;
    };
  }
}

  // Add reCAPTCHA script to head (supports both v2 and v3)
  const addRecaptchaScript = () => {
    return new Promise<void>((resolve) => {
      if (document.querySelector('script[src*="recaptcha"]')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.onload = () => {
        console.log('reCAPTCHA script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
        resolve();
      };
      document.head.appendChild(script);
    });
  };





// Enhanced interfaces with slugs
interface CategoryField {
  id: number;
  name: string;
  slug: string; // Added slug for future-proofing
  field_type: 'select' | 'multi_select' | 'boolean' | 'text';
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

type ProviderRegistration = {
  email: string;
  provider_name: string;
  service_types: string[];
  submitted_data: Record<string, any>;
  logo?: string;
};

// Autosave and resume functionality
const AUTOSAVE_KEY = 'provider_registration_draft';
const AUTOSAVE_INTERVAL = 3000; // 3 seconds

const ProviderSignup: React.FC = () => {
  const [categories, setCategories] = useState<ProviderCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProviderCategory[]>([]);
  const [formData, setFormData] = useState<ProviderRegistration>({
    email: '',
    provider_name: '',
    service_types: [],
    submitted_data: {},
    logo: ''
  });
  
  // Enhanced common fields (contact info only - insurance is now service-specific)
  const [commonFields, setCommonFields] = useState({
    contact_phone: '',
    website: '',
    service_areas: [] as string[],
    waitlist_status: '',
    additional_notes: '',
    primary_address: {
      street: '',
      suite: '',
      city: '',
      state: '',
      zip: '',
      phone: ''
    },
    service_delivery: {
      in_clinic: false,
      in_home: false,
      telehealth: false
    }
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [states, setStates] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCheckComplete, setDuplicateCheckComplete] = useState(false);
  
  // Autosave and resume functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ providerName: string; email: string } | null>(null);

  // Initialize reCAPTCHA widget
  const initializeRecaptcha = useCallback(() => {
    if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.render('recaptcha-container', {
          sitekey: '6LfTMGErAAAAAARfviGKHaQSMBEiUqHOZeBEmRIu',
          callback: (token: string) => {
            console.log('reCAPTCHA success, token:', token);
            setRecaptchaToken(token);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            setRecaptchaToken('');
          },
          'error-callback': () => {
            console.log('reCAPTCHA error');
            setRecaptchaToken('');
          }
        });
      });
    }
  }, []);
  
  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.timestamp && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          setFormData(draft.formData || {
            email: '',
            provider_name: '',
            service_types: [],
            submitted_data: {},
            logo: ''
          });
          setCommonFields(draft.commonFields || {
            contact_phone: '',
            website: '',
            service_areas: [],
            waitlist_status: '',
            additional_notes: '',
            primary_address: {
              street: '',
              suite: '',
              city: '',
              state: '',
              zip: '',
              phone: ''
            },
            service_delivery: {
              in_clinic: false,
              in_home: false,
              telehealth: false
            }
          });
          setSelectedCategories(draft.selectedCategories || []);
          setStep(draft.step || 1);
          setHasUnsavedChanges(false);
          setHasDraft(true);
          toast.info('Draft loaded from previous session');
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
          setHasDraft(false);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem(AUTOSAVE_KEY);
        setHasDraft(false);
      }
    } else {
      setHasDraft(false);
    }
  }, []); // Empty dependency array - only run once on mount
  
  // Autosave functionality
  const saveDraft = useCallback(() => {
    const draft = {
      formData,
      commonFields,
      selectedCategories,
      step,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
    setHasUnsavedChanges(false);
  }, [formData, commonFields, selectedCategories, step]);
  
  // Comprehensive form reset function
  const resetForm = useCallback(() => {
    // Reset all form data
    setFormData({
      email: '',
      provider_name: '',
      service_types: [],
      submitted_data: {},
      logo: ''
    });
    
    // Reset common fields
    setCommonFields({
      contact_phone: '',
      website: '',
      service_areas: [],
      waitlist_status: '',
      additional_notes: '',
      primary_address: {
        street: '',
        suite: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
      },
      service_delivery: {
        in_clinic: false,
        in_home: false,
        telehealth: false
      }
    });
    
    // Reset other states
    setSelectedCategories([]);
    setStep(1);
    setDuplicateCheckComplete(false);
    setRecaptchaToken('');
    setHasUnsavedChanges(false);
    
    // Clear localStorage draft
    localStorage.removeItem(AUTOSAVE_KEY);
    
    // Clear any stored resume links
    localStorage.removeItem('provider_registration_resume_link');
    
    // Update draft state
    setHasDraft(false);
  }, []);
  
  // Handle success modal close and form reset
  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    setSuccessData(null);
    resetForm();
  }, [resetForm]);
  
  // Handle clicking outside modal to close
  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSuccessClose();
    }
  }, [handleSuccessClose]);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSuccess) {
        handleSuccessClose();
      }
    };
    
    if (showSuccess) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showSuccess, handleSuccessClose]);
  
  // Autosave on changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(saveDraft, AUTOSAVE_INTERVAL);
    }
    
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, saveDraft]);
  
  // Mark changes for autosave
  const markChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);
  
  // Enhanced input handlers that mark changes
  const handleInputChange = useCallback((field: string, value: any, categorySlug?: string) => {
    if (field.startsWith('submitted_data.')) {
      const fieldSlug = field.replace('submitted_data.', '');
      
      if (categorySlug) {
        // Store under specific category
        setFormData(prev => ({
          ...prev,
          submitted_data: {
            ...prev.submitted_data,
            [categorySlug]: {
              ...prev.submitted_data[categorySlug],
              [fieldSlug]: value
            }
          }
        }));
      } else {
        // Store directly under submitted_data (fallback)
        setFormData(prev => ({
          ...prev,
          submitted_data: {
            ...prev.submitted_data,
            [fieldSlug]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    markChanged();
  }, [markChanged]);
  
  const handleArrayInputChange = useCallback((field: string, value: string, checked: boolean, categorySlug?: string) => {
    const fieldPath = field.replace('submitted_data.', '');
    
    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 handleArrayInputChange:', { fieldPath, value, checked, categorySlug });
    }
    
    if (categorySlug) {
      // Store under specific category
      setFormData(prev => {
        const currentValues = (prev.submitted_data[categorySlug]?.[fieldPath] as string[]) || [];
        const newValues = checked 
          ? [...currentValues, value]
          : currentValues.filter(v => v !== value);
        
        // Debug logging only in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Setting array values:', { categorySlug, fieldPath, newValues });
        }
        
        return {
          ...prev,
          submitted_data: {
            ...prev.submitted_data,
            [categorySlug]: {
              ...prev.submitted_data[categorySlug],
              [fieldPath]: newValues
            }
          }
        };
      });
    } else {
      // Store directly under submitted_data (fallback)
      setFormData(prev => {
        const currentValues = (prev.submitted_data[fieldPath] as string[]) || [];
        const newValues = checked 
          ? [...currentValues, value]
          : currentValues.filter(v => v !== value);
        
        return {
          ...prev,
          submitted_data: {
            ...prev.submitted_data,
            [fieldPath]: newValues
          }
        };
      });
    }
    markChanged();
  }, [markChanged]);
  
  const handleCommonFieldChange = useCallback((field: keyof typeof commonFields, value: any) => {
    setCommonFields(prev => ({ ...prev, [field]: value }));
    markChanged();
  }, [markChanged]);

  // Fetch provider categories on component mount
  useEffect(() => {
    fetchProviderCategories();
    addRecaptchaScript().then(() => {
      // reCAPTCHA script is now loaded, proceed with other effects
      setIsRecaptchaReady(true);
      
      // Initialize reCAPTCHA widget
      setTimeout(() => {
        initializeRecaptcha();
      }, 100);
      
      fetchStates().then(data => {
        const stateNames = data.map(state => state.attributes.name);
        setStates(stateNames);
      });
    });
  }, [initializeRecaptcha]);

  const fetchProviderCategories = async () => {
    try {
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_categories'
      );
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch categories:', response.status);
        toast.error('Failed to load provider categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load provider categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const checkForDuplicateProvider = async (): Promise<boolean> => {
    try {
      // Check existing providers endpoint to see if provider already exists
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const existingProviders = data.data || [];
        
        // Check if provider with same email or name already exists
        const isDuplicate = existingProviders.some((provider: any) => {
          const providerEmail = provider.attributes?.email?.toLowerCase();
          const providerName = provider.attributes?.provider_name?.toLowerCase();
          const newEmail = formData.email.toLowerCase();
          const newName = formData.provider_name.toLowerCase();
          
          return providerEmail === newEmail || providerName === newName;
        });
        
        return isDuplicate;
      }
      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };



  // Validate that required service-specific fields are filled out
  const validateServiceFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    selectedCategories.forEach(category => {
      const categorySlug = category.attributes.slug;
      const categoryFields = category.attributes.category_fields || [];
      
      categoryFields.forEach(field => {
        if (field.required) {
          const fieldValue = formData.submitted_data[categorySlug]?.[field.slug];
          
          if (!fieldValue || 
              (Array.isArray(fieldValue) && fieldValue.length === 0) ||
              (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
              (typeof fieldValue === 'boolean' && !fieldValue)) {
            errors.push(`${category.attributes.name}: ${field.name} is required`);
          }
        }
      });
    });
    
    return { isValid: errors.length === 0, errors };
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategories.length) {
      toast.error('Please select at least one provider category');
      return;
    }

    // Validate required service-specific fields
    const validation = validateServiceFields();
    if (!validation.isValid) {
      toast.error(`Please fill out all required fields:\n${validation.errors.join('\n')}`);
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

    // Check reCAPTCHA v2 completion
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification above before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Structure data according to new API format with service-specific fields
      const structuredSubmittedData: Record<string, any> = {};
      
      // Add service-specific data first
      selectedCategories.forEach(category => {
        const categorySlug = category.attributes.slug;
        const categoryData = formData.submitted_data[categorySlug] || {};
        
        // Ensure insurance_accepted is included for each service category
        if (categoryData.insurance_accepted && Array.isArray(categoryData.insurance_accepted)) {
          structuredSubmittedData[categorySlug] = {
            ...categoryData,
            insurance_accepted: categoryData.insurance_accepted
          };
        } else {
          structuredSubmittedData[categorySlug] = categoryData;
        }
      });
      
      // Add common fields to each service category (since they're shared across services)
      Object.keys(structuredSubmittedData).forEach(categorySlug => {
        structuredSubmittedData[categorySlug] = {
          ...structuredSubmittedData[categorySlug],
          contact_phone: commonFields.contact_phone,
          website: commonFields.website,
          service_areas: commonFields.service_areas,
          waitlist_status: commonFields.waitlist_status,
          additional_notes: commonFields.additional_notes,
          primary_address: commonFields.primary_address,
          service_delivery: commonFields.service_delivery
        };
      });

      const submitData = {
        provider_registration: {
          email: formData.email,
          provider_name: formData.provider_name,
          service_types: selectedCategories.map(cat => cat.attributes.slug),
          submitted_data: structuredSubmittedData,
          logo: formData.logo
        },
        recaptcha_token: recaptchaToken
      };

      // Debug: Log the data being sent
      // Debug logging only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Debug: Data being sent to API:', JSON.stringify(submitData, null, 2));
      }

      // Generate idempotency key to prevent duplicate submissions
      const idempotencyKey = crypto.randomUUID();
      
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/provider_registrations',
        { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify(submitData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const locationHeader = response.headers.get('Location');
        
        toast.success('Provider registration submitted successfully!');
        console.log('Registration successful:', data);
        
        // Store resume link if provided
        if (locationHeader) {
          localStorage.setItem('provider_registration_resume_link', locationHeader);
          console.log('Resume link stored:', locationHeader);
        }
        
        // Set success state and data
        setShowSuccess(true);
        setSuccessData({ providerName: formData.provider_name, email: formData.email });

        // Reset form using the comprehensive reset function
        resetForm();
        
        // Show additional success toast
        toast.success('Form has been reset and is ready for new registration!');
      } else {
        const errorData = await response.json();
        // Detailed error logging only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('🔍 Full error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorData
          });
        }
        
        // Handle new field-level error format from API
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((error: any) => {
            const fieldPath = error.source?.pointer || 'unknown';
            const message = error.detail || 'Unknown error';
            return `${fieldPath}: ${message}`;
          }).join('\n');
          
          throw new Error(`Validation errors:\n${errorMessages}`);
        } else {
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
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

  const renderDynamicFields = (categoryFields: CategoryField[], categorySlug: string) => {
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
          
          {(field.field_type === 'select' || field.field_type === 'multi_select') && field.options && field.options.choices && (
            // Determine if this field should be multi-select based on field name and context
            (() => {
              const fieldName = field.name.toLowerCase();
              
              // Fields that should ALWAYS be multi-select (arrays)
              const alwaysMultiSelect = [
                'provider_types', 'provider_type', 'service_types', 'service_type',
                'locations_served', 'location_served', 'service_areas', 'service_area',
                'specialties', 'specialty', 'certifications', 'certification',
                'licenses', 'license', 'therapy_types', 'therapy_type', 'therapy types',
                'insurance', 'insurances', 'insurance_types', 'insurance_type',
                'ages_served', 'age_served', 'populations_served', 'population_served',
                'languages', 'language', 'modalities', 'modality',
                'treatment_approaches', 'treatment_approach', 'interventions', 'intervention'
              ];
              
              // Check if this field should be multi-select
              const shouldBeMultiSelect = alwaysMultiSelect.some(multiField => 
                fieldName.includes(multiField) || multiField.includes(fieldName)
              );
              
              // Explicit check for specific field names that should be multi-select
              const explicitMultiSelect = [
                'licenses', 'therapy_types', 'specialties', 'certifications'
              ];
              const isExplicitMultiSelect = explicitMultiSelect.includes(field.slug);
              
              // Final multi-select decision
              const finalMultiSelect = shouldBeMultiSelect || isExplicitMultiSelect;
              
              // Debug logging for field type detection (only in development)
              if (process.env.NODE_ENV === 'development') {
                console.log(`🔍 Field "${field.name}" (${field.slug}):`, {
                  fieldName,
                  finalMultiSelect,
                  fieldType: field.field_type
                });
              }
              
              if (finalMultiSelect) {
                // Special handling for insurance fields - use InsuranceInput component
                if (fieldName.includes('insurance')) {
                  const currentValues = (formData.submitted_data[categorySlug]?.[field.slug] as string[]) || [];
                  return (
                    <div className="space-y-2">
                      <div className="text-xs text-green-600 mb-2">Insurance field - Select from suggestions or type custom</div>
                      <InsuranceInput
                        value={currentValues}
                        onChange={(value) => handleInputChange(`submitted_data.${field.slug}`, value, categorySlug)}
                        placeholder={`Select or type insurance options for ${field.name.replace(/_/g, ' ')}...`}
                        multiple={true}
                        categoryId={selectedCategories.find(cat => 
                          cat.attributes.category_fields?.some(f => f.slug === field.slug)
                        )?.id.toString()}
                      />
                    </div>
                  );
                }
                
                // Enhanced age groups with broader selections
                if (fieldName.includes('age') || fieldName.includes('ages')) {
                  const enhancedAgeOptions = [
                    '0-6 months',
                    '6-12 months', 
                    '1-2 years',
                    '2-3 years',
                    '3-4 years',
                    '4-5 years',
                    '5-6 years',
                    '6-8 years',
                    '8-10 years',
                    '10-12 years',
                    '12-14 years',
                    '14-16 years',
                    '16-18 years',
                    '18-21 years',
                    '21+ years',
                    'Adults (18+)',
                    'Seniors (65+)',
                    'All Ages'
                  ];
                  
                  return (
                    <div className="space-y-2">
                      <div className="text-xs text-blue-600 mb-2">Age groups served - Select multiple</div>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {enhancedAgeOptions.map((option) => {
                          const currentValues = (formData.submitted_data[categorySlug]?.[field.slug] as string[]) || [];
                          const isChecked = currentValues.includes(option);
                          return (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleArrayInputChange(`submitted_data.${field.slug}`, option, e.target.checked, categorySlug)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                // Enhanced payment options with more flexibility
                if (fieldName.includes('payment') || fieldName.includes('cost') || fieldName.includes('pricing')) {
                  const enhancedPaymentOptions = [
                    'Private Pay',
                    'Insurance Accepted',
                    'Medicaid',
                    'Medicare',
                    'Sliding Scale',
                    'Payment Plans Available',
                    'Monthly Installments',
                    'Quarterly Payments',
                    'Annual Discounts',
                    'Family Discounts',
                    'Sibling Discounts',
                    'Group Session Rates',
                    'Package Deals',
                    'Free Initial Consultation',
                    'Reduced Rate for Uninsured',
                    'School District Contracts',
                    'State Programs',
                    'Grant-Funded Services',
                    'Scholarship Programs',
                    'Financial Assistance Available'
                  ];
                  
                  return (
                    <div className="space-y-2">
                      <div className="text-xs text-blue-600 mb-2">Payment options - Select multiple</div>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {enhancedPaymentOptions.map((option) => {
                          const currentValues = (formData.submitted_data[categorySlug]?.[field.slug] as string[]) || [];
                          const isChecked = currentValues.includes(option);
                          return (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleArrayInputChange(`submitted_data.${field.slug}`, option, e.target.checked, categorySlug)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                // Multi-select checkboxes for other array fields
                return (
                  <div className="space-y-2">
                    <div className="text-xs text-blue-600 mb-2">Multi-select field (checkboxes)</div>
                    {field.options.choices.map((option) => {
                      const currentValues = (formData.submitted_data[categorySlug]?.[field.slug] as string[]) || [];
                      const isChecked = currentValues.includes(option);
                      return (
                        <label key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleArrayInputChange(`submitted_data.${field.slug}`, option, e.target.checked, categorySlug)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                );
              } else {
                // Single select dropdown for non-array fields
                return (
                  <div>
                    <div className="text-xs text-gray-600 mb-2">Single-select field (dropdown)</div>
                    <select
                      value={formData.submitted_data[categorySlug]?.[field.slug] || ''}
                      onChange={(e) => handleInputChange(`submitted_data.${field.slug}`, e.target.value, categorySlug)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                    >
                      <option value="">Select {field.name}</option>
                      {field.options.choices.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                );
              }
            })()
          )}
          
          {field.field_type === 'boolean' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.submitted_data[categorySlug]?.[field.slug] || false}
                onChange={(e) => handleInputChange(`submitted_data.${field.slug}`, e.target.checked, categorySlug)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{field.help_text || field.name}</span>
            </label>
          )}
          
          {field.field_type === 'text' && (
            <input
              type="text"
              value={formData.submitted_data[categorySlug]?.[field.slug] || ''}
              onChange={(e) => handleInputChange(`submitted_data.${field.slug}`, e.target.value, categorySlug)}
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
      'advocates': <Shield className="h-8 w-8 text-orange-600" />,
      'autism-evaluations': <ClipboardCheck className="h-8 w-8 text-teal-600" />,
      'barbers-hair': <Scissors className="h-8 w-8 text-indigo-600" />,
      'coaching-mentoring': <Target className="h-8 w-8 text-cyan-600" />,
      'dentists': <Building2 className="h-8 w-8 text-green-600" />,
      'occupational-therapy': <Activity className="h-8 w-8 text-yellow-600" />,
      'orthodontists': <Smile className="h-8 w-8 text-violet-600" />,
      'pediatricians': <Baby className="h-8 w-8 text-emerald-600" />,
      'physical-therapists': <Dumbbell className="h-8 w-8 text-purple-600" />,
      'speech-therapy': <Ear className="h-8 w-8 text-pink-600" />,
      'therapists': <Heart className="h-8 w-8 text-red-600" />
    };
    return iconMap[categorySlug] || <Building2 className="h-8 w-8 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Link
              to="/provider-walkthrough"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              📋 New Provider? Start Here - View Our Complete Walkthrough
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Provider Network
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Help families find the autism services they need
          </p>
          <p className="text-sm text-gray-500">
            Get started by selecting your service categories below, or learn more about our platform first
          </p>
        </div>

        {/* Draft Management */}
        {hasDraft && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Draft Found
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>We found a saved draft from your previous session. Your progress has been restored.</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    localStorage.removeItem(AUTOSAVE_KEY);
                    setHasDraft(false);
                    resetForm();
                    toast.success('Draft cleared. Starting fresh!');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Clear Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Categories</span>
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
            <h2 className="text-2xl font-semibold mb-6">Choose Your Service Categories</h2>
            
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
                  {categories
                    .sort((a, b) => a.attributes.name.localeCompare(b.attributes.name))
                    .map(category => (
                    <div
                      key={category.id}
                      className={`category-card cursor-pointer border-2 rounded-lg p-6 transition-all duration-200 ${
                        selectedCategories.some(sc => sc.id === category.id)
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => {
                        console.log('Selected category:', category);
                        setSelectedCategories(prev => {
                          const isSelected = prev.some(sc => sc.id === category.id);
                          if (isSelected) {
                            return prev.filter(sc => sc.id !== category.id);
                          } else {
                            return [...prev, category];
                          }
                        });
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
                    disabled={!selectedCategories.length}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Continue to Details ({selectedCategories.length} selected)
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Dynamic Form Fields */}
        {step === 2 && selectedCategories.length > 0 && (
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
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {formData.logo ? (
                        <img 
                          src={formData.logo} 
                          alt="Business logo preview" 
                          className="h-20 w-20 object-contain border border-gray-300 rounded-lg"
                        />
                      ) : (
                        <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const result = e.target?.result as string;
                              handleInputChange('logo', result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Upload your business logo (PNG, JPG, GIF). Max size: 5MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Category Fields */}
            {selectedCategories.map(category => (
              <div key={category.id} className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  {getCategoryIcon(category.attributes.slug)}
                  <h3 className="text-xl font-semibold ml-3">{category.attributes.name}</h3>
                </div>
                
                {/* Field Type Legend */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span className="font-medium">Multi-select fields</span> - Checkboxes for multiple selections
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                      <span className="font-medium">Single-select fields</span> - Dropdown for one selection
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="font-medium">Insurance fields</span> - Text input for each provider type
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDynamicFields(category.attributes.category_fields, category.attributes.slug)}
                </div>
              </div>
            ))}

            {/* Universal Insurance Section - Available for all providers */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Insurance & Payment Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Insurance Information:</span> This section is available for all providers. 
                      Select from our comprehensive list of insurance options or add custom insurance names.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Insurance is now handled per service category - see individual service forms above */}
            </div>

            {/* Contact & Business Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Contact & Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={commonFields.contact_phone || ''}
                    onChange={(e) => handleCommonFieldChange('contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={commonFields.website || ''}
                    onChange={(e) => handleCommonFieldChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {states.map((state) => {
                      const currentValues = commonFields.service_areas || [];
                      const isChecked = currentValues.includes(state);
                      return (
                        <label key={state} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleCommonFieldChange('service_areas', [...commonFields.service_areas, state]);
                              } else {
                                handleCommonFieldChange('service_areas', commonFields.service_areas.filter(s => s !== state));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{state}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Select all states where you provide services</p>
                </div>
                
                {/* Primary Office Address */}
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Office Address</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-xs text-gray-600 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={commonFields.primary_address?.street || ''}
                        onChange={(e) => handleCommonFieldChange('primary_address', { ...commonFields.primary_address, street: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-xs text-gray-600 mb-1">Suite/Unit (Optional)</label>
                      <input
                        type="text"
                        value={commonFields.primary_address?.suite || ''}
                        onChange={(e) => handleCommonFieldChange('primary_address', { ...commonFields.primary_address, suite: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Suite 100"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-xs text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        value={commonFields.primary_address?.city || ''}
                        onChange={(e) => handleCommonFieldChange('primary_address', { ...commonFields.primary_address, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Salt Lake City"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-xs text-gray-600 mb-1">State</label>
                      <select
                        value={commonFields.primary_address?.state || ''}
                        onChange={(e) => handleCommonFieldChange('primary_address', { ...commonFields.primary_address, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="block text-xs text-gray-600 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={commonFields.primary_address?.zip || ''}
                        onChange={(e) => handleCommonFieldChange('primary_address', { ...commonFields.primary_address, zip: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="84101"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-xs text-gray-600 mb-1">Phone for this location</label>
                      <input
                        type="tel"
                        value={commonFields.primary_address?.phone || ''}
                        onChange={(e) => handleCommonFieldChange('primary_address', { ...commonFields.primary_address, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(801) 555-0123"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Service Delivery Options */}
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Delivery Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={commonFields.service_delivery?.in_clinic || false}
                        onChange={(e) => handleCommonFieldChange('service_delivery', { ...commonFields.service_delivery, in_clinic: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">In-Clinic Services</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={commonFields.service_delivery?.in_home || false}
                        onChange={(e) => handleCommonFieldChange('service_delivery', { ...commonFields.service_delivery, in_home: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">In-Home Services</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={commonFields.service_delivery?.telehealth || false}
                        onChange={(e) => handleCommonFieldChange('service_delivery', { ...commonFields.service_delivery, telehealth: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Telehealth Services</span>
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Select all service delivery methods you offer</p>
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waitlist Status</label>
                  <select
                    value={commonFields.waitlist_status || ''}
                    onChange={(e) => handleCommonFieldChange('waitlist_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Currently accepting clients">Currently accepting clients</option>
                    <option value="Short waitlist">Short waitlist</option>
                    <option value="Long waitlist">Long waitlist</option>
                    <option value="Not accepting new clients">Not accepting new clients</option>
                  </select>
                </div>
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={commonFields.additional_notes || ''}
                    onChange={(e) => handleCommonFieldChange('additional_notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Tell us about your services, special accommodations, or anything else..."
                  />
                </div>
              </div>
            </div>

            {/* reCAPTCHA Section */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">Security Verification:</span> This form is protected by reCAPTCHA to ensure you're human.
                  </p>
                  <div className="mt-2">
                    {process.env.NODE_ENV === 'development' ? (
                      // Development fallback - simple checkbox
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dev-recaptcha"
                          checked={recaptchaToken === 'dev-token'}
                          onChange={(e) => setRecaptchaToken(e.target.checked ? 'dev-token' : '')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="dev-recaptcha" className="text-sm text-gray-700">
                          I'm not a robot (Development Mode)
                        </label>
                      </div>
                    ) : (
                      // Production reCAPTCHA
                      <div id="recaptcha-container"></div>
                    )}
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="mt-2 text-xs text-blue-600">
                      🔧 Development Mode: Using simple checkbox instead of reCAPTCHA
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Back to Categories
              </button>
              <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Fallback for Step 2 if no category selected */}
        {step === 2 && !selectedCategories.length && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-6">No Categories Selected</h2>
            <p className="text-gray-600 mb-6">Please go back and select at least one provider category first.</p>
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
                  <span className="font-medium">Categories:</span>
                  <span>{selectedCategories.map(cat => cat.attributes.name).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact Phone:</span>
                  <span>{commonFields.contact_phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Website:</span>
                  <span>{commonFields.website || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Service Areas:</span>
                  <span>{commonFields.service_areas.length > 0 ? commonFields.service_areas.join(', ') : 'None selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Waitlist Status:</span>
                  <span>{commonFields.waitlist_status || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Additional Notes:</span>
                  <span>{commonFields.additional_notes || 'None'}</span>
                </div>
                {/* Service-specific fields summary */}
                {selectedCategories.map(category => (
                  <div key={category.id} className="flex justify-between">
                    <span className="font-medium">
                      {category.attributes.name} Details:
                    </span>
                    <span className="text-gray-600">
                      {Object.keys(formData.submitted_data[category.attributes.slug] || {}).length} fields completed
                    </span>
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
                    {!isRecaptchaReady ? (
                      <>
                        <span className="font-semibold">Loading reCAPTCHA...</span> Please wait while we load the security verification system.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">reCAPTCHA Ready!</span> This site is protected by reCAPTCHA and the Google{' '}
                        <a href="https://policies.google.com/privacy" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a href="https://policies.google.com/terms" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">
                          Terms of Service
                        </a>{' '}
                        apply.
                      </>
                    )}
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
                disabled={isSubmitting || isCheckingDuplicate || !isRecaptchaReady}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {!isRecaptchaReady ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading reCAPTCHA...
                  </>
                ) : isCheckingDuplicate ? (
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
      
      {/* Success Modal */}
      {showSuccess && successData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-slideIn">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 relative">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {/* Decorative elements */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -top-2 -left-2 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            
            {/* Success Message */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4 animate-pulse">
              Registration Successful! 🎉
            </h3>
            
            <div className="text-gray-600 mb-6 space-y-2">
              <p className="text-lg">
                Thank you, <span className="font-semibold text-gray-900">{successData.providerName}</span>!
              </p>
              <p>
                Your provider registration has been submitted successfully. We've sent a confirmation email to{' '}
                <span className="font-semibold text-gray-900">{successData.email}</span>.
              </p>
            </div>
            
            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Our team will review your information within 2-3 business days</li>
                <li>You'll receive updates via email about your approval status</li>
                <li>Once approved, your profile will be visible to families seeking services</li>
                <li>You can log in to update your information anytime</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleSuccessClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
              >
                Register Another Provider
              </button>
              
              <Link
                to="/"
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
              >
                Return to Homepage
              </Link>
              
              <Link
                to="/providers"
                className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 font-medium text-sm"
              >
                View All Providers
              </Link>
            </div>
            
            {/* Contact Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Questions? Contact us at{' '}
                <a href="mailto:registration@autismserviceslocator.com" className="text-blue-600 hover:underline">
                  registration@autismserviceslocator.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSignup; 