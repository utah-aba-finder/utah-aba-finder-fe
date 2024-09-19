import axios from 'axios';
import { MockProviders } from './Types';

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
  try {
    const response = await fetch(`https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`);
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

// export const updateProviderData = async (providerId: number) => {
//   try {
//     const response = await axios.patch(`${API_URL}/${providerId}`, updatedData, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (response.status === 200) {
//       return response.data;
//     } else {
//       throw new Error('Failed to update provider data');
//     }
//   }
// }