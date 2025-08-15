import axios from 'axios';
import { Providers, StateData, CountyData, InsuranceData } from './Types';
import { getAdminAuthHeader, API_CONFIG } from './config';

export const API_URL = "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin";

const API_URL_PROVIDERS = 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers';

export const fetchProviders = async (): Promise<Providers> => {
  try {
    const response = await axios.get<Providers>(API_URL_PROVIDERS, {
      timeout: 10000, // 10 second timeout
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
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - please check your connection');
      } else if (error.response?.status === 503) {
        throw new Error('Service temporarily unavailable');
      }
    }
    throw new Error('Unable to fetch providers data');
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
  const response = await fetch(
    "https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/insurances",
    {
      headers: {
        'Authorization': getAdminAuthHeader(),
      },
    }
  );
  const data = await response.json();
  return data.data;
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
    const url = `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/states/${stateId}/providers?provider_type=${encodeURIComponent(providerType)}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': 'be6205db57ce01863f69372308c41e3a'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch providers');
    const data = await response.json();
    
    // Ensure we return a valid structure
    if (!data || typeof data !== 'object') {
      return { data: [] };
    }
    return data;
  } catch (error) {
    
    // Return empty data structure instead of throwing
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
export const uploadProviderLogo = async (providerId: number, logoFile: File, userId: string): Promise<{ success: boolean; error?: string; updatedProvider?: any }> => {
  try {
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

    const response = await fetch(
      `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${providerId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': userId,
          // Don't set Content-Type header - browser will set it automatically with boundary
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Upload failed: ${response.status} - ${errorText}` };
    }

    const result = await response.json();

    return { 
      success: true, 
      updatedProvider: result 
    };
  } catch (error) {
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
              `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/providers/${providerId}/remove_logo`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': userId,
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







export const uploadAdminProviderLogo = async (providerId: number, logoFile: File): Promise<{ success: boolean; error?: string; updatedProvider?: any }> => {
  try {
    
    
    // Create FormData with just the logo file (Active Storage format)
    const formData = new FormData();
    formData.append('logo', logoFile); // Only send the logo file
    

    
    const response = await fetch(
      `https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin/providers/${providerId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'be6205db57ce01863f69372308c41e3a'
          // Don't set Content-Type - browser handles it for FormData
        },
        body: formData
      }
    );



    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            // If it's not JSON, use the raw text
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (textError) {
        // If we can't read the response text, use the status

      }
      
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return { 
      success: true, 
      updatedProvider: responseData.data?.[0] 
    };
  } catch (error) {
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

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