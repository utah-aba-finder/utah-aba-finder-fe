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