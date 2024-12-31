import axios from 'axios';
import { MockProviders, StateData, CountyData } from './Types';

const API_URL = 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers';

export const fetchProviders = async (): Promise<MockProviders> => {
  try {
    const response = await axios.get<MockProviders>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching providers:', error);
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



