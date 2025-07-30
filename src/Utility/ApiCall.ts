import axios from 'axios';
import { Providers, StateData, CountyData, InsuranceData } from './Types';

export const API_URL = "https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin";

const API_URL_PROVIDERS = 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers';

export const fetchProviders = async (): Promise<Providers> => {
  try {
    const response = await axios.get<Providers>(API_URL_PROVIDERS, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching providers:', error);
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
  console.log("Fetching provider with ID:", providerId);
  const token = sessionStorage.getItem('authToken'); 

  try {
    const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`, {
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error('Error fetching single provider:', error);
    throw error;
  }
}

export const fetchStates = async (): Promise<StateData[]> => {
  const response = await fetch(
    "https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/states",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch states");
  const data = await response.json();
  return data.data;
};

export const fetchCountiesByState = async (stateId: number): Promise<CountyData[]> => {
  const authToken = sessionStorage.getItem("authToken");
  const headers: Record<string, string> = {};
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  const response = await fetch(
    `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/states/${stateId}/counties`,
    {
      headers,
    }
  );
  if (!response.ok) throw new Error("Failed to fetch counties");
  const data = await response.json();
  return data.data;
};

export const fetchInsurance = async (): Promise<InsuranceData[]> => {
  const response = await fetch(
    "https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/insurances",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  const data = await response.json();
  return data.data;
};

// Test function to check API health
export const testAPIHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    console.log('Testing API health...');
    
    // Test basic providers endpoint
    const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers', {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });
    
    console.log('Basic providers endpoint status:', response.status);
    
    if (response.ok) {
      return { status: 'healthy', message: 'API is working correctly' };
    } else {
      const errorText = await response.text();
      return { status: 'error', message: `API returned ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error('API health check failed:', error);
    return { status: 'error', message: `API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

export const fetchProvidersByStateIdAndProviderType = async (stateId: string, providerType: string) => {
  const url = `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/states/${stateId}/providers?provider_type=${encodeURIComponent(providerType)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch providers');
  return response.json();
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
      console.warn(`Request failed (attempt ${i + 1}/${maxRetries}):`, error);
      
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

export const uploadProviderLogo = async (providerId: number, logoFile: File): Promise<{ success: boolean; error?: string; updatedProvider?: any }> => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await fetch(
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload logo');
    }

    const responseData = await response.json();
    return { 
      success: true, 
      updatedProvider: responseData.data?.[0] 
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const removeProviderLogo = async (providerId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}/remove_logo`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove logo');
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing logo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};