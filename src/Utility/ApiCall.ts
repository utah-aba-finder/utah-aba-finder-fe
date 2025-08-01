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
    console.log('Uploading logo for provider ID:', providerId);
    console.log('Logo file:', logoFile.name, 'Size:', logoFile.size, 'Type:', logoFile.type);
    
    const authToken = sessionStorage.getItem('authToken');
    console.log('Auth token available:', !!authToken);
    console.log('Auth token length:', authToken?.length);
    
    // Try multiple approaches
    const approaches: Array<{
      name: string;
      url: string;
      method: string;
      headers: Record<string, string>;
      body: FormData | string;
    }> = [
      {
        name: 'Admin endpoint with FormData',
        url: `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${providerId}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: (() => {
          const formData = new FormData();
          formData.append('logo', logoFile);
          return formData;
        })()
      },
      {
        name: 'Admin endpoint with JSON',
        url: `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${providerId}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logo: await fileToBase64(logoFile)
        })
      },
      {
        name: 'Regular endpoint with FormData',
        url: `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: (() => {
          const formData = new FormData();
          formData.append('logo', logoFile);
          return formData;
        })()
      }
    ];

    for (const approach of approaches) {
      try {
        console.log(`Trying approach: ${approach.name}`);
        console.log('Request URL:', approach.url);
        console.log('Request method:', approach.method);
        
        const response = await fetch(approach.url, {
          method: approach.method,
          headers: approach.headers,
          body: approach.body
        });

        console.log(`${approach.name} response status:`, response.status);
        console.log(`${approach.name} response headers:`, response.headers);

        if (response.ok) {
          const responseData = await response.json();
          console.log(`${approach.name} success response:`, responseData);
          return { 
            success: true, 
            updatedProvider: responseData.data?.[0] 
          };
        } else {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorText = await response.text();
            console.log(`${approach.name} raw error response:`, errorText);
            
            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
                console.log(`${approach.name} parsed error data:`, errorData);
              } catch (parseError) {
                errorMessage = errorText || errorMessage;
                console.log(`${approach.name} error parsing JSON:`, parseError);
              }
            }
          } catch (textError) {
            console.warn(`${approach.name} could not read error response:`, textError);
          }
          
          console.log(`${approach.name} failed:`, errorMessage);
        }
      } catch (error) {
        console.log(`${approach.name} exception:`, error);
      }
    }

    // If all approaches fail, return error
    return { 
      success: false, 
      error: 'All upload approaches failed. Please check server logs.' 
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
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

export const testLogoUpload = async (providerId: number, logoFile: File): Promise<{ success: boolean; error?: string; details?: any }> => {
  try {
    console.log('=== TESTING LOGO UPLOAD ===');
    console.log('Provider ID:', providerId);
    console.log('File details:', {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
      lastModified: logoFile.lastModified
    });
    
    // Test 1: Check if provider exists
    const providerResponse = await fetch(
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${providerId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      }
    );
    
    console.log('Provider check status:', providerResponse.status);
    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();
      console.log('Provider check error:', errorText);
      return { success: false, error: `Provider not found or accessible: ${providerResponse.status}` };
    }
    
    // Test 2: Try different upload endpoints
    const endpoints = [
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${providerId}`,
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`,
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}/logo`
    ];
    
    const results: Array<{
      endpoint: string;
      status: number | string;
      statusText?: string;
      ok?: boolean;
      error?: string;
      data?: any;
    }> = [];
    
    for (const endpoint of endpoints) {
      try {
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        console.log(`Testing endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          },
          body: formData
        });
        
        const result: {
          endpoint: string;
          status: number;
          statusText: string;
          ok: boolean;
          error?: string;
          data?: any;
        } = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };
        
        if (!response.ok) {
          try {
            const errorText = await response.text();
            result.error = errorText;
          } catch (e) {
            result.error = 'Could not read error response';
          }
        } else {
          try {
            const data = await response.json();
            result.data = data;
          } catch (e) {
            result.data = 'Could not parse response';
          }
        }
        
        results.push(result);
        console.log(`Endpoint ${endpoint} result:`, result);
        
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'ERROR'
        });
        console.log(`Endpoint ${endpoint} error:`, error);
      }
    }
    
    return { 
      success: results.some(r => r.ok === true), 
      details: results 
    };
    
  } catch (error) {
    console.error('Test logo upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const uploadLogoWithFallback = async (providerId: number, logoFile: File): Promise<{ success: boolean; error?: string; updatedProvider?: any }> => {
  try {
    console.log('=== FALLBACK LOGO UPLOAD ===');
    console.log('Provider ID:', providerId);
    console.log('File:', logoFile.name, 'Size:', logoFile.size, 'Type:', logoFile.type);
    
    // Method 1: Try with smaller file size
    if (logoFile.size > 1024 * 1024) { // If larger than 1MB
      console.log('File is large, trying to compress...');
      const compressedFile = await compressImage(logoFile);
      console.log('Compressed file size:', compressedFile.size);
      
      const result = await uploadProviderLogo(providerId, compressedFile);
      if (result.success) {
        return result;
      }
    }
    
    // Method 2: Try with different content type
    const formData = new FormData();
    formData.append('logo', logoFile, logoFile.name);
    formData.append('provider_id', providerId.toString());
    
    const response = await fetch(
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/admin/providers/${providerId}`,
      {
        method: 'POST', // Try POST instead of PATCH
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
        body: formData
      }
    );
    
    if (response.ok) {
      const responseData = await response.json();
      return { success: true, updatedProvider: responseData.data?.[0] };
    }
    
    return { success: false, error: 'All fallback methods failed' };
    
  } catch (error) {
    console.error('Fallback upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Helper function to compress image
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800px width/height)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original file
        }
      }, file.type, 0.7); // 70% quality
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const uploadAdminProviderLogo = async (providerId: number, logoFile: File): Promise<{ success: boolean; error?: string; updatedProvider?: any }> => {
  try {
    console.log('Uploading logo for provider ID (admin):', providerId);
    console.log('Logo file:', logoFile.name, 'Size:', logoFile.size, 'Type:', logoFile.type);
    
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    // Debug request details
    console.log('Admin Request URL:', `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`);
    console.log('Admin Request method: PATCH');
    console.log('Admin FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes, ${value.type})` : value);
    }
    
    const response = await fetch(
      `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          'X-Admin-Request': 'true', // Add admin header to indicate this is an admin request
        },
        body: formData
      }
    );

    console.log('Admin logo upload response status:', response.status);
    console.log('Admin logo upload response headers:', response.headers);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.log('Admin Raw error response text:', errorText);
        
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.log('Admin Parsed error data:', errorData);
          } catch (parseError) {
            // If it's not JSON, use the raw text
            errorMessage = errorText || errorMessage;
            console.log('Admin Error parsing JSON response:', parseError);
          }
        }
      } catch (textError) {
        // If we can't read the response text, use the status
        console.warn('Could not read admin error response text:', textError);
      }
      
      console.error('Admin logo upload error response:', errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Admin logo upload success response:', responseData);
    return { 
      success: true, 
      updatedProvider: responseData.data?.[0] 
    };
  } catch (error) {
    console.error('Error uploading admin logo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const testPasswordReset = async (email: string): Promise<{ success: boolean; error?: string; details?: any; workingEndpoint?: string }> => {
  try {
    console.log('=== TESTING PASSWORD RESET ===');
    console.log('Email:', email);
    
    // Test 1: Check if the API endpoint is reachable
    const healthCheck = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/health', {
      method: 'GET'
    });
    
    console.log('API health check status:', healthCheck.status);
    
    // Test 2: Try different password reset endpoints
    const endpoints = [
      'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/password_resets',
      'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/password_resets',
      'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/auth/password_resets',
      'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/users/password_resets',
      'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/auth/forgot_password',
      'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/forgot_password'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim()
          })
        });
        
        const result: {
          endpoint: string;
          status: number;
          statusText: string;
          ok: boolean;
          error?: string;
          data?: any;
        } = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };
        
        if (!response.ok) {
          try {
            const errorText = await response.text();
            result.error = errorText;
          } catch (e) {
            result.error = 'Could not read error response';
          }
        } else {
          try {
            const data = await response.json();
            result.data = data;
          } catch (e) {
            result.data = 'Could not parse response';
          }
        }
        
        results.push(result);
        console.log(`Endpoint ${endpoint} result:`, result);
        
        // If we find a working endpoint, return it
        if (response.ok) {
          return {
            success: true,
            workingEndpoint: endpoint,
            details: results
          };
        }
        
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'ERROR'
        });
        console.log(`Endpoint ${endpoint} error:`, error);
      }
    }
    
    // If no working endpoint found, return the results
    return { 
      success: false, 
      error: 'No working password reset endpoint found',
      details: results 
    };
    
  } catch (error) {
    console.error('Password reset test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: { error: error }
    };
  }
};