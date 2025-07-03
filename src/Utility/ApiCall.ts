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
  const response = await fetch(
    `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/states/${stateId}/counties`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
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

export const fetchProvidersByStateIdAndProviderType = async(stateId: string, providerType: string): Promise<Providers> => {
  const response = await fetch(
    `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/states/${stateId}/providers?provider_type=${providerType}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  if(!response.ok) throw new Error("Failed to fetch providers");
  const data = await response.json();
  return data;
}

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