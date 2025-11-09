import axios from 'axios';
import { Providers, StateData, CountyData, InsuranceData } from './Types';
import { getAdminAuthHeader, getSuperAdminAuthHeader, API_CONFIG } from './config';

// Practice Types API
export interface PracticeType {
  id: number;
  name: string;
  description?: string;
}

export interface PracticeTypeResponse {
  id: number;
  type: string;
  attributes: {
    name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface PracticeTypesResponse {
  data: PracticeType[];
}

export const fetchPracticeTypes = async (): Promise<PracticeTypesResponse> => {
  try {
    console.log('🔄 Fetching practice types from API...');
    
    const response = await fetch(
      `${BASE_API_URL}/practice_types`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Practice types fetched successfully:', data);
    
    // Transform the response data to match our interface
    const transformedData = {
      data: data.data.map((item: PracticeTypeResponse) => ({
        id: item.id,
        name: item.attributes.name
      }))
    };

    // Remove duplicates and standardize names
    const uniqueTypes = transformedData.data.filter((type: PracticeType, index: number, self: PracticeType[]) => 
      index === self.findIndex((t: PracticeType) => t.name === type.name)
    );

    // Standardize "Autism Evaluation" to "Autism Evaluations" (plural)
    const standardizedTypes = uniqueTypes.map((type: PracticeType) => ({
      ...type,
      name: type.name === "Autism Evaluation" ? "Autism Evaluations" : type.name
    }));

    // Remove any remaining duplicates after standardization
    const finalTypes = standardizedTypes.filter((type: PracticeType, index: number, self: PracticeType[]) => 
      index === self.findIndex((t: PracticeType) => t.name === type.name)
    );
    
    // If we don't have enough types, use fallback
    if (finalTypes.length < 12) {
      console.log('⚠️ API returned only', finalTypes.length, 'practice types, using fallback for complete list');
      const fallbackTypes: PracticeType[] = [
        { id: 115, name: "ABA Therapy" },
        { id: 116, name: "Autism Evaluations" },
        { id: 117, name: "Speech Therapy" },
        { id: 118, name: "Occupational Therapy" },
        { id: 119, name: "Physical Therapy" },
        { id: 120, name: "Dentists" },
        { id: 121, name: "Orthodontists" },
        { id: 122, name: "Coaching/Mentoring" },
        { id: 123, name: "Therapists" },
        { id: 124, name: "Advocates" },
        { id: 125, name: "Barbers/Hair" },
        { id: 126, name: "Pediatricians" }
      ];
      return { data: fallbackTypes };
    }
    
    return { data: finalTypes };
  } catch (error) {
    console.error('❌ Failed to fetch practice types:', error);
    
    // Fallback to hardcoded types if API fails or doesn't have all types
    const fallbackTypes: PracticeType[] = [
      { id: 115, name: "ABA Therapy" },
      { id: 116, name: "Autism Evaluations" },
      { id: 117, name: "Speech Therapy" },
      { id: 118, name: "Occupational Therapy" },
      { id: 119, name: "Physical Therapy" },
      { id: 120, name: "Dentists" },
      { id: 121, name: "Orthodontists" },
      { id: 122, name: "Coaching/Mentoring" },
      { id: 123, name: "Therapists" },
      { id: 124, name: "Advocates" },
      { id: 125, name: "Barbers/Hair" },
      { id: 126, name: "Pediatricians" }
    ];
    
    console.log('🔄 Using fallback practice types');
    return { data: fallbackTypes };
  }
};

export const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin"
  : "/api/v1/admin";

export const BASE_API_URL = process.env.NODE_ENV === 'production'
  ? "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1"
  : "/api/v1";

// Sponsorship API Types
export interface PricingOption {
  id: 'monthly' | 'annual';
  price: number;
  price_id: string;
  label: string;
  savings?: string;
  description?: string;
}

export interface SponsorshipTier {
  id: string;
  name: string;
  price: number; // Default monthly price
  price_in_cents?: number; // For Stripe
  price_display: string; // Formatted string like "$25/Monthly"
  price_id?: string; // Legacy field for backward compatibility
  pricing_options: PricingOption[];
  features: string[];
  description?: string;
}

export interface SponsorshipTiersResponse {
  tiers: SponsorshipTier[];
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export interface Sponsorship {
  id: number;
  provider_id: number;
  tier: string;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

export interface SponsorshipResponse {
  sponsorship: Sponsorship;
}

export interface SponsorshipsResponse {
  sponsorships: Sponsorship[];
  // New fields from backend
  has_active_subscription?: boolean;
  message?: string;
  tiers_url?: string;
}

export interface SponsoredProvider {
  id: number;
  name: string;
  logo: string | null;
  website: string | null;
  sponsorship_tier: string | number; // Backend uses integer enum: 0=free, 1=featured, 2=sponsor, 3=partner
}

// Mass Email API Types
export interface MassEmailStats {
  statistics: {
    total_users_with_providers: number;
    users_needing_password_updates: number;
    recently_reset_password_count: number;
    providers_needing_updates: number;
    recently_updated_providers_count: number;
  };
  providers_needing_updates: ProviderForEmail[];
  recently_updated_providers: ProviderForEmail[];
}

export interface ProviderForEmail {
  id: number;
  name: string;
  email: string;
  user_email: string | null;
  created_at: string;
  updated_at: string;
  user_created_at: string | null;
  reset_password_sent_at: string | null;
}

export interface MassEmailResponse {
  success: boolean;
  message: string;
  emails_sent?: number;
  errors?: string[];
}

export interface EmailPreview {
  subject: string;
  content: string;
  recipients_count: number;
}

// Email Template API Types
export interface EmailTemplate {
  name: string;
  description: string;
  subject: string;
}

export interface EmailTemplateResponse {
  templates: { [key: string]: EmailTemplate };
}

export interface TemplateContentResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface TemplatePreviewResponse {
  subject: string;
  to: string;
  html_content?: string;
  text_content?: string;
  success: boolean;
  error?: string;
}

// Mass Email API Functions
export const fetchMassEmailStats = async (): Promise<MassEmailStats> => {
  try {
    const response = await fetch(`${API_URL}/mass_emails`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch mass email stats:', error);
    throw error;
  }
};

export const sendPasswordReminders = async (): Promise<MassEmailResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/mass_emails/send_password_reminders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to send password reminders:', error);
    throw error;
  }
};

export const sendSystemUpdates = async (): Promise<MassEmailResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/mass_emails/send_system_updates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to send system updates:', error);
    throw error;
  }
};

export const previewEmail = async (emailType: 'password_update_reminder' | 'system_update'): Promise<EmailPreview> => {
  try {
    const response = await fetch(
      `${API_URL}/mass_emails/preview_email?type=${emailType}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to preview email:', error);
    throw error;
  }
};

// Email Template API Functions
export const fetchEmailTemplates = async (): Promise<EmailTemplateResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/email_templates`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch email templates:', error);
    throw error;
  }
};

export const loadEmailTemplate = async (
  templateName: string,
  templateType: 'html' | 'text'
): Promise<TemplateContentResponse> => {
    const url = `${API_URL}/email_templates/${templateName}?type=${templateType}`;
  try {
    console.log('🔄 Loading template from URL:', url);
    console.log('🔑 Using auth header:', getSuperAdminAuthHeader());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getSuperAdminAuthHeader(),
      },
    });

    console.log('📡 Response status:', response.status);

    // If not OK, try to read text safely; DO NOT THROW
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = `HTTP ${response.status}`;
      }
      console.error('❌ API error loading template:', response.status, errorText);
      return { success: false, content: '', error: errorText || response.statusText };
    }

    // OK path: try JSON first; if it's raw text, handle gracefully
    let data: any;
    try {
      data = await response.json();
    } catch {
      // Backend might return raw content for some templates
      const text = await response.text();
      return { success: true, content: text };
    }

    console.log('✅ Template data received:', data);

    // Normalize to TemplateContentResponse
    if (typeof data?.content === 'string') {
      return { success: true, content: data.content };
    }

    // If backend returns {html: "..."} or something else:
    const content = data?.html ?? data?.text ?? '';
    const ok = typeof content === 'string' && content.length > 0;
    return { success: ok, content, error: ok ? undefined : 'Template content missing' };

  } catch (err: any) {
    console.error('❌ Network/parse error loading template:', err);
    // DON'T throw — return a soft error
    return { success: false, content: '', error: err?.message ?? 'Unknown error' };
  }
};

export const saveEmailTemplate = async (templateName: string, content: string, templateType: 'html' | 'text'): Promise<TemplateContentResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/email_templates/${templateName}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
        body: JSON.stringify({
          content: content,
          type: templateType
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to save email template:', error);
    throw error;
  }
};

export const previewEmailTemplate = async (templateName: string, templateType: 'html' | 'text'): Promise<TemplatePreviewResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/email_templates/${templateName}/preview?type=${templateType}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getSuperAdminAuthHeader(),
        },
      }
    );
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = `HTTP ${response.status}`;
      }
      console.error('❌ API error previewing template:', response.status, errorText);
      return { 
        success: false, 
        subject: '', 
        to: '', 
        error: errorText || response.statusText 
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ Failed to preview email template:', error);
    // DON'T throw — return a soft error
    return { 
      success: false, 
      subject: '', 
      to: '', 
      error: error?.message ?? 'Unknown error' 
    };
  }
};

const API_URL_PROVIDERS = 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers';

// Fallback function to fetch all providers by state (since main endpoints are broken)
export const fetchAllProvidersByState = async (): Promise<Providers> => {
  try {
    console.log('🔄 Fetching providers by state (fallback method)...');
    
    // First get all states
    const statesResponse = await fetch(
      'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/states',
      {
        headers: {
          'Authorization': getAdminAuthHeader(),
        },
      }
    );
    
    if (!statesResponse.ok) {
      throw new Error(`Failed to fetch states: ${statesResponse.status}`);
    }
    
    const statesData = await statesResponse.json();
    const allProviders: any[] = [];
    
    // Fetch providers for each state
    for (const state of statesData.data) {
      try {
        const providersResponse = await fetch(
          `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/states/${state.id}/providers`,
          {
            headers: {
              'Authorization': getAdminAuthHeader(),
            },
          }
        );
        
        if (providersResponse.ok) {
          const providersData = await providersResponse.json();
          if (providersData.data && Array.isArray(providersData.data)) {
            allProviders.push(...providersData.data);
          }
        }
      } catch (stateError) {
        console.log(`⚠️ Failed to fetch providers for state ${state.attributes.name}:`, stateError);
        // Continue with other states
      }
    }
    
    console.log(`✅ Fetched ${allProviders.length} providers using state-by-state method`);
    
    return { data: allProviders };
  } catch (error) {
    console.error('❌ Failed to fetch providers by state:', error);
    throw new Error('Unable to fetch providers using fallback method');
  }
};

export const fetchProviders = async (): Promise<Providers> => {
  try {
    const response = await axios.get<Providers>(API_URL_PROVIDERS, {
      timeout: 20000, // 20 second timeout
      headers: {
        'Authorization': getAdminAuthHeader(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    // Ensure we return a valid structure even if the response is unexpected
    const data = response.data;
    if (!data || typeof data !== 'object') {
      return { data: [] };
    }
    
    // Process logo URLs in the response
    if (data.data && data.data.length > 0) {
      data.data.forEach(provider => {
        // Logo status logging removed for production
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch providers with admin auth:', error);
    
    // If admin auth fails, try the state-by-state method as fallback
    console.log('🔄 Admin providers failed, trying state-by-state fallback...');
    return await fetchAllProvidersByState();
  }
};

export const fetchSingleProvider = async (providerId: number) => {

  try {
    const response = await fetch(`${API_URL_PROVIDERS}/${providerId}`, {
      headers: {
        'Authorization': getAdminAuthHeader(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });



    if (!response.ok) {
      await response.text();
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    
    throw error;
  }
}

export const fetchStates = async (): Promise<StateData[]> => {
  const response = await fetch(
    "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/states",
    {
      headers: {
        'Authorization': getAdminAuthHeader(),
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch states");
  const data = await response.json();
  return data.data;
};

export const fetchCountiesByState = async (stateId: number): Promise<CountyData[]> => {
  const response = await fetch(
    `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/states/${stateId}/counties`,
    {
      headers: {
        'Authorization': getAdminAuthHeader(),
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch counties");
  const data = await response.json();
  return data.data;
};

export const fetchInsurance = async (): Promise<InsuranceData[]> => {
  // Try with authentication first (for logged-in users)
  const authHeader = getAdminAuthHeader();
  
  const response = await fetch(
    "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/insurances",
    {
      headers: authHeader ? {
        'Authorization': authHeader,
      } : {},
    }
  );
  
  if (!response.ok) {
    console.error('❌ Insurance API error:', response.status, response.statusText);
    throw new Error(`Failed to fetch insurances: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('📦 Raw insurance API response:', data);
  
  // Return data.data if it exists, otherwise return empty array
  return data.data || [];
};

// Test function to check API health
export const testAPIHealth = async (): Promise<{ status: string; message: string }> => {
  try {

    
    // Test basic providers endpoint
    const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers', {
      headers: {
        'Authorization': 'be6205db57ce01863f69372308c41e3a',
      },
    });
    
    
    
    if (response.ok) {
      return { status: 'healthy', message: 'API is working correctly' };
    } else {
      await response.text();
      return { status: 'error', message: `API returned ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    
    return { status: 'error', message: `API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

export const fetchProvidersByStateIdAndProviderType = async (stateId: string, providerType: string) => {
  try {
    console.log('🔍 API Call:', { stateId, providerType });
    
    // Build query parameters for the new backend filtering
    const params = new URLSearchParams();
    
    if (providerType && providerType !== 'none' && providerType.trim() !== '') {
      params.append('provider_type', providerType);
      console.log('🔍 Added provider_type filter:', providerType);
    }
    
    if (stateId && stateId !== 'none') {
      // Convert stateId to state name for the API (using correct backend state IDs)
      const stateMap: { [key: string]: string } = {
        '1': 'Utah',
        '34': 'Alabama',
        '35': 'Alaska',
        '36': 'Arizona',
        '37': 'Arkansas',
        '38': 'California',
        '39': 'Colorado',
        '40': 'Connecticut',
        '41': 'Delaware',
        '42': 'District of Columbia',
        '43': 'Florida',
        '44': 'Georgia',
        '45': 'Hawaii',
        '46': 'Idaho',
        '47': 'Illinois',
        '48': 'Indiana',
        '49': 'Iowa',
        '50': 'Kansas',
        '51': 'Kentucky',
        '52': 'Louisiana',
        '53': 'Maine',
        '54': 'Maryland',
        '55': 'Massachusetts',
        '56': 'Michigan',
        '57': 'Minnesota',
        '58': 'Mississippi',
        '59': 'Missouri',
        '60': 'Montana',
        '61': 'Nebraska',
        '62': 'Nevada',
        '63': 'New Hampshire',
        '64': 'New Jersey',
        '65': 'New Mexico',
        '66': 'New York',
        '67': 'North Carolina',
        '68': 'North Dakota',
        '69': 'Ohio',
        '70': 'Oklahoma',
        '71': 'Oregon',
        '72': 'Pennsylvania',
        '73': 'Rhode Island',
        '74': 'South Carolina',
        '75': 'South Dakota',
        '76': 'Tennessee',
        '77': 'Texas',
        '78': 'Vermont',
        '79': 'Virginia',
        '80': 'Washington',
        '81': 'West Virginia',
        '82': 'Wisconsin',
        '83': 'Wyoming'
      };
      
      const targetState = stateMap[stateId];
      if (targetState) {
        params.append('state', targetState);
        console.log('🔍 Added state filter:', targetState, 'for stateId:', stateId);
      } else {
        console.warn('⚠️ Unknown state ID:', stateId, 'Available states:', Object.keys(stateMap));
      }
    }
    
    // Build the URL with query parameters
    const baseUrl = 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers';
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    
    console.log('🔍 URL with query params:', url);
    console.log('🔍 Using new backend filtering system');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });
    
    console.log('🔍 Response:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Data received from backend filtering:', data);
    
    // The backend should now return pre-filtered results
    // No need for client-side filtering
    if (data && data.data && Array.isArray(data.data)) {
      console.log('🔍 Backend returned', data.data.length, 'filtered providers');
      return { data: data.data };
    }
    
    return data;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return { data: [] };
  }
};

// Network connectivity utility
export const checkNetworkConnectivity = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ('navigator' in window && 'onLine' in navigator) {
      resolve(navigator.onLine);
    } else {
      // Fallback: try to fetch a small resource
      fetch('/manifest.json', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
        .then(() => resolve(true))
        .catch(() => resolve(false));
    }
  });
};

// Retry mechanism for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error = new Error('All retry attempts failed');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Logo upload utility functions
export const validateLogoFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please select a PNG, JPEG, or GIF file' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};

// Enhanced logo upload function following the exact requirements
export const uploadProviderLogo = async (providerId: number, logoFile: File, authToken: string, isSuperAdmin: boolean = false): Promise<{ success: boolean; error?: string; updatedProvider?: any }> => {
  try {
    console.log('🔑 uploadProviderLogo: Starting logo upload for provider:', providerId);
    console.log('🔑 uploadProviderLogo: Is super admin:', isSuperAdmin);
    
    // Validate file before upload
    const validation = validateLogoFile(logoFile);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    // Create FormData for multipart upload (Active Storage format)
    const formData = new FormData();
    formData.append('logo', logoFile); // Only send the logo file
    
    // Add provider data to ensure the logo gets properly associated
    formData.append('provider_id', providerId.toString());

    // Determine the correct endpoint based on user type
    const endpoint = isSuperAdmin 
      ? `${API_URL}/providers/${providerId}`
      : `${BASE_API_URL}/provider_self`;

    // Set authentication header - authToken already contains "Bearer {user_id}"
    const authHeader = authToken; // Don't add extra "Bearer " prefix
    console.log('🔑 uploadProviderLogo: Using auth header:', authHeader);
    console.log('🔑 uploadProviderLogo: Endpoint:', endpoint);
    console.log('🔑 uploadProviderLogo: Method: PUT');
    console.log('🔑 uploadProviderLogo: FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    console.log('🔑 uploadProviderLogo: About to make fetch request...');

    const response = await fetch(
      endpoint,
      {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          // Don't set Content-Type header - browser will set it automatically with boundary
        },
        body: formData
      }
    );

    console.log('🔍 uploadProviderLogo: Response status:', response.status);
    console.log('🔍 uploadProviderLogo: Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ uploadProviderLogo: Response not OK:', response.status, response.statusText);
      console.log('❌ uploadProviderLogo: Error response text:', errorText);
      
      // Additional debugging for S3 integration issues
      if (response.status === 500) {
        console.log('🔍 uploadProviderLogo: 500 error detected - this might be an S3 integration issue');
        console.log('🔍 uploadProviderLogo: Check backend logs for S3 configuration errors');
      }
      
      return { success: false, error: `Upload failed: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    console.log('✅ uploadProviderLogo: Logo upload successful');
    console.log('🔍 uploadProviderLogo: Full response data:', result);
    console.log('🔍 uploadProviderLogo: Response data structure:', result);
    
    // Check if the response contains the new logo URL
    if (result && result.data && result.data[0] && result.data[0].attributes) {
      console.log('🔍 uploadProviderLogo: New logo URL:', result.data[0].attributes.logo);
      console.log('🔍 uploadProviderLogo: Full attributes:', result.data[0].attributes);
    } else {
      console.log('⚠️ uploadProviderLogo: Response structure unexpected - logo URL might be missing');
      console.log('⚠️ uploadProviderLogo: Response keys:', Object.keys(result || {}));
      if (result?.data) {
        console.log('⚠️ uploadProviderLogo: Data array length:', result.data.length);
        console.log('⚠️ uploadProviderLogo: First data item:', result.data[0]);
      }
    }

    return { 
      success: true, 
      updatedProvider: result 
    };
  } catch (error) {
    console.error('❌ uploadProviderLogo: Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Helper function to convert file to base64 (currently unused)
// const fileToBase64 = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       const result = reader.result as string;
//       // Remove the data URL prefix to get just the base64 string
//       const base64 = result.split(',')[1];
//       resolve(base64);
//     };
//     reader.onerror = error => reject(error);
//   });
// };

export const removeProviderLogo = async (providerId: number, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(
              `${BASE_API_URL}/providers/${providerId}/remove_logo`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userId}`,
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove logo');
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};







// Note: uploadAdminProviderLogo function has been removed and consolidated into uploadProviderLogo
// Use uploadProviderLogo(providerId, logoFile, authToken, true) for super admin logo uploads

export const testPasswordReset = async (email: string): Promise<{ success: boolean; error?: string; details?: any; status?: number }> => {
  try {
    // Test 1: Check if the API endpoint is reachable
    const healthCheck = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/up', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!healthCheck.ok) {
      return { 
        success: false, 
        error: 'API server is not reachable',
        details: { status: healthCheck.status, statusText: healthCheck.statusText },
        status: healthCheck.status
      };
    }
    
    // Test 2: Try the password reset endpoint
    const resetResponse = await fetch(`${API_CONFIG.BASE_API_URL}/api/v1/password_resets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim()
      })
    });
    
    let responseData;
    try {
      const responseText = await resetResponse.text();
      if (responseText) {
        responseData = JSON.parse(responseText);
      } else {
        responseData = {};
      }
    } catch (parseError) {
      responseData = {};
    }
    
    return { 
      success: resetResponse.ok, 
      error: resetResponse.ok ? undefined : responseData.error || `HTTP ${resetResponse.status}: ${resetResponse.statusText}`,
      details: { status: resetResponse.status, statusText: resetResponse.statusText, data: responseData },
      status: resetResponse.status
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or server unavailable',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
};

export const testAvailableEndpoints = async (): Promise<{ success: boolean; endpoints?: any; error?: string }> => {
  try {
    const baseUrl = API_CONFIG.BASE_API_URL;
    const endpoints = [
      `${baseUrl.replace('/api', '')}/`,
      `${baseUrl.replace('/api', '')}/up`,
      `${baseUrl}/v1/`,
      `${baseUrl}/v1/providers`,
      `${baseUrl}/api/v1/password_resets`,
      `${baseUrl.replace('/api', '')}/login`,
      `${baseUrl}/v1/auth`,
      `${baseUrl}/v1/users`
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result: {
          endpoint: string;
          status: number;
          statusText: string;
          ok: boolean;
          data?: string;
        } = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };
        
        if (response.ok) {
          try {
            const data = await response.text();
            result.data = data.substring(0, 200) + (data.length > 200 ? '...' : '');
          } catch (e) {
            result.data = 'Could not read response';
          }
        }
        
        results.push(result);
        
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'ERROR'
        });
      }
    }
    
    return { 
      success: true, 
      endpoints: results 
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Public providers function that uses states endpoint (no API key required)
export const fetchPublicProviders = async (): Promise<Providers> => {
  try {
    console.log('🔄 Fetching public providers using main providers endpoint...');
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    try {
      // Use the main providers endpoint since states endpoint is returning empty data
      const response = await fetch(
        'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers', // Main providers endpoint (working)
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Public providers fetched successfully from main providers endpoint');
      console.log('📊 All provider types found:', data?.data?.length || 0);
      console.log('🎯 This should show ABA Therapy, Autism Evaluations, Speech Therapy, Occupational Therapy, etc.');
      
      // Debug logo data
      const providersWithLogos = data?.data?.filter((p: any) => p.attributes.logo_url || p.attributes.logo) || [];
      console.log('🖼️ Providers with logos:', providersWithLogos.length);
      if (providersWithLogos.length > 0) {
        const sampleProvider = providersWithLogos[0];
        console.log('🖼️ Sample provider with logo:', {
          name: sampleProvider.attributes.name,
          logo_url: sampleProvider.attributes.logo_url,
          logo: sampleProvider.attributes.logo,
          urlType: sampleProvider.attributes.logo_url ? 
            (sampleProvider.attributes.logo_url.includes('rails/active_storage') ? 'Rails Active Storage' : 'Direct S3') : 
            'None'
        });
        
        // Test if the URL is accessible
        if (sampleProvider.attributes.logo_url) {
          console.log('🔗 Testing logo URL accessibility...');
          fetch(sampleProvider.attributes.logo_url, { method: 'HEAD' })
            .then(response => {
              console.log('🔗 Logo URL test result:', {
                status: response.status,
                statusText: response.statusText,
                url: sampleProvider.attributes.logo_url,
                accessible: response.ok
              });
            })
            .catch(error => {
              console.error('🔗 Logo URL test failed:', error);
            });
        }
      }
      
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // If it's an abort error, it means timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timed out - server is not responding');
      }
      
      // If it's a network error, throw it directly
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Network error - unable to connect to server');
      }
      
      // Re-throw other errors
      throw fetchError;
    }
  } catch (error) {
    console.log('🔄 Public providers failed, trying admin fallback...');
    try {
      return await fetchProviders();
    } catch (adminError) {
      console.log('🔄 Admin fallback failed, trying state-by-state method...');
      try {
        return await fetchAllProvidersByState();
      } catch (stateError) {
        // If all fallbacks fail, throw a comprehensive error
        console.error('❌ All provider fetch methods failed:', { error, adminError, stateError });
        throw new Error('All provider data sources are currently unavailable. Please try again later.');
      }
    }
  }
};

// Sponsorship API Functions
export const fetchSponsorshipTiers = async (): Promise<SponsorshipTiersResponse> => {
  try {
    // Include authentication headers if available
    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth header if available (some endpoints may require auth)
    if (userId) {
      headers['Authorization'] = userId;
    }

    const response = await fetch(`${BASE_API_URL}/sponsorships/tiers`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Create a user-friendly error that won't crash the app
      const error = new Error(`Unable to load sponsorship tiers (${response.status})`);
      // Store the original error details for debugging
      (error as any).status = response.status;
      (error as any).details = errorText;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Log the error but don't let it crash the app
    console.error('❌ Failed to fetch sponsorship tiers:', {
      message: error?.message,
      status: error?.status,
      details: error?.details
    });
    // Re-throw with a user-friendly message
    throw error;
  }
};

export const createPaymentIntent = async (
  providerId: number,
  tierId: string
): Promise<PaymentIntentResponse> => {
  try {
    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const response = await fetch(`${BASE_API_URL}/payments/create_payment_intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId || '',
      },
      body: JSON.stringify({
        provider_id: providerId,
        tier_id: tierId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to create payment intent:', error);
    throw error;
  }
};

export const confirmSponsorship = async (
  paymentIntentId: string,
  providerId: number,
  tierId: string
): Promise<SponsorshipResponse> => {
  try {
    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const response = await fetch(`${BASE_API_URL}/payments/confirm_sponsorship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId || '',
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        provider_id: providerId,
        tier_id: tierId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to confirm sponsorship:', error);
    throw error;
  }
};

export const fetchSponsoredProviders = async (): Promise<SponsoredProvider[]> => {
  try {
    const response = await fetch(`${BASE_API_URL}/sponsorships/sponsored_providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.providers || data.sponsored_providers || [];
  } catch (error) {
    console.error('❌ Failed to fetch sponsored providers:', error);
    throw error;
  }
};

export const fetchUserSponsorships = async (): Promise<SponsorshipsResponse> => {
  try {
    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const response = await fetch(`${BASE_API_URL}/sponsorships`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId || '',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Create a user-friendly error that won't crash the app
      const error = new Error(`Unable to load sponsorships (${response.status})`);
      // Store the original error details for debugging
      (error as any).status = response.status;
      (error as any).details = errorText;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Log the error but don't let it crash the app
    console.error('❌ Failed to fetch user sponsorships:', {
      message: error?.message,
      status: error?.status,
      details: error?.details
    });
    // Re-throw with a user-friendly message
    throw error;
  }
};

export const fetchSponsorship = async (sponsorshipId: number): Promise<SponsorshipResponse> => {
  try {
    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const response = await fetch(`${BASE_API_URL}/sponsorships/${sponsorshipId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch sponsorship:', error);
    throw error;
  }
};

export const cancelSponsorship = async (sponsorshipId: number): Promise<void> => {
  try {
    const authToken = sessionStorage.getItem('authToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id?.toString() || authToken;

    const response = await fetch(`${BASE_API_URL}/sponsorships/${sponsorshipId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Failed to cancel sponsorship:', error);
    throw error;
  }
};