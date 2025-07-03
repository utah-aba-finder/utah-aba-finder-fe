// Google Places API integration for fetching provider reviews
export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
  website?: string;
  phone?: string;
}

export interface GoogleAPIError {
  status: string;
  error_message?: string;
  details?: any;
}

export class GooglePlacesAPI {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private localProxy = 'http://localhost:3001/api/google-places';
  private corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Extract domain from website URL
  private extractDomain(website: string): string {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch (error) {
      console.error('Error extracting domain:', error);
      return website;
    }
  }

  // Make API request with CORS proxy
  private async makeRequest(url: string): Promise<any> {
    try {
      // Try direct request first
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Direct request failed, trying CORS proxies...');
    }

    // Try multiple CORS proxies as fallback
    for (const proxy of this.corsProxies) {
      try {
        let proxyUrl: string;
        let headers: HeadersInit = {};

        if (proxy.includes('allorigins.win')) {
          proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('cors-anywhere')) {
          proxyUrl = `${proxy}${url}`;
          headers = {
            'Origin': 'http://localhost:3000',
            'X-Requested-With': 'XMLHttpRequest'
          };
        } else {
          proxyUrl = `${proxy}${url}`;
        }

        console.log('Trying CORS proxy:', proxyUrl.replace(this.apiKey, '[API_KEY_HIDDEN]'));
        
        const response = await fetch(proxyUrl, { headers });

        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log(`Proxy ${proxy} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All CORS proxies failed');
  }

  // Validate API key by making a simple test request
  async validateAPIKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const testUrl = `${this.baseUrl}/textsearch/json?query=test&key=${this.apiKey}`;
      const data = await this.makeRequest(testUrl);
      
      if (data.status === 'REQUEST_DENIED') {
        return { valid: false, error: data.error_message || 'API key is invalid or restricted' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Network error or API key validation failed' };
    }
  }

  // Search for a place by website domain
  async searchPlaceByWebsite(website: string): Promise<GooglePlaceDetails | null> {
    try {
      const domain = this.extractDomain(website);
      const encodedQuery = encodeURIComponent(domain);
      const url = `${this.baseUrl}/textsearch/json?query=${encodedQuery}&key=${this.apiKey}`;
      
      const data = await this.makeRequest(url);

      if (data.status === 'REQUEST_DENIED') {
        console.error('API request denied:', data.error_message);
        throw new Error(`API request denied: ${data.error_message}`);
      }

      if (data.status === 'ZERO_RESULTS') {
              return null;
      }

      if (data.status === 'OK' && data.results.length > 0) {
        // Find the best match by comparing domains
        const bestMatch = data.results.find((place: any) => {
          if (place.website) {
            const placeDomain = this.extractDomain(place.website);
            return placeDomain === domain;
          }
          return false;
        }) || data.results[0];

        return {
          place_id: bestMatch.place_id,
          name: bestMatch.name,
          formatted_address: bestMatch.formatted_address,
          rating: bestMatch.rating,
          user_ratings_total: bestMatch.user_ratings_total,
          website: bestMatch.website,
          phone: bestMatch.formatted_phone_number
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching for place by website:', error);
      return null;
    }
  }

  // Search for a place by name and address (fallback method)
  async searchPlaceByNameAndAddress(providerName: string, address: string): Promise<GooglePlaceDetails | null> {
    try {
      const searchQuery = `${providerName} ${address}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `${this.baseUrl}/textsearch/json?query=${encodedQuery}&key=${this.apiKey}`;
      
      console.log('Searching by name and address:', searchQuery);
      console.log('Name/address search URL:', url.replace(this.apiKey, '[API_KEY_HIDDEN]'));

      const data = await this.makeRequest(url);
      console.log('Name/address search results:', data);

      if (data.status === 'REQUEST_DENIED') {
        console.error('API request denied:', data.error_message);
        throw new Error(`API request denied: ${data.error_message}`);
      }

      if (data.status === 'ZERO_RESULTS') {
        console.log('No places found for name/address search:', searchQuery);
        return null;
      }

      if (data.status === 'OK' && data.results.length > 0) {
        const place = data.results[0];
        console.log('Selected place by name/address:', place);
        
        return {
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          website: place.website,
          phone: place.formatted_phone_number
        };
      }

      console.log('No places found for name/address search:', searchQuery);
      return null;
    } catch (error) {
      console.error('Error searching for place by name and address:', error);
      return null;
    }
  }

  // Get detailed place information including reviews
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,rating,user_ratings_total,reviews,website,formatted_phone_number&key=${this.apiKey}`;
      
      console.log('Getting place details for:', placeId);
      console.log('Details URL:', url.replace(this.apiKey, '[API_KEY_HIDDEN]'));

      const data = await this.makeRequest(url);
      console.log('Place details response:', data);

      if (data.status === 'REQUEST_DENIED') {
        console.error('API request denied for place details:', data.error_message);
        throw new Error(`API request denied: ${data.error_message}`);
      }

      if (data.status === 'NOT_FOUND') {
        console.log('Place not found:', placeId);
        return null;
      }

      if (data.status === 'OK' && data.result) {
        return {
          place_id: data.result.place_id,
          name: data.result.name,
          formatted_address: data.result.formatted_address,
          rating: data.result.rating,
          user_ratings_total: data.result.user_ratings_total,
          reviews: data.result.reviews || [],
          website: data.result.website,
          phone: data.result.formatted_phone_number
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  // Get reviews for a specific place
  async getPlaceReviews(placeId: string): Promise<GoogleReview[]> {
    try {
      const placeDetails = await this.getPlaceDetails(placeId);
      return placeDetails?.reviews || [];
    } catch (error) {
      console.error('Error getting place reviews:', error);
      return [];
    }
  }

  // Smart search that tries website first, then falls back to name/address
  async searchAndGetReviews(providerName: string, address: string, website?: string): Promise<{
    placeDetails: GooglePlaceDetails | null;
    reviews: GoogleReview[];
    searchMethod: 'website' | 'name_address' | 'none';
    errors?: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // First validate the API key
      const keyValidation = await this.validateAPIKey();
      if (!keyValidation.valid) {
        errors.push(`API Key validation failed: ${keyValidation.error}`);
        return { placeDetails: null, reviews: [], searchMethod: 'none', errors };
      }

      let placeDetails: GooglePlaceDetails | null = null;
      let searchMethod: 'website' | 'name_address' | 'none' = 'none';

      // Try website first if available
      if (website) {
        console.log(`Searching by website: ${website}`);
        try {
          placeDetails = await this.searchPlaceByWebsite(website);
          if (placeDetails) {
            searchMethod = 'website';
            console.log(`Found place by website: ${placeDetails.name}`);
          } else {
            errors.push(`No place found for website: ${website}`);
          }
        } catch (error) {
          errors.push(`Website search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Fallback to name and address if website search failed
      if (!placeDetails) {
        console.log(`Searching by name and address: ${providerName} ${address}`);
        try {
          placeDetails = await this.searchPlaceByNameAndAddress(providerName, address);
          if (placeDetails) {
            searchMethod = 'name_address';
            console.log(`Found place by name/address: ${placeDetails.name}`);
          } else {
            errors.push(`No place found for name/address: ${providerName} ${address}`);
          }
        } catch (error) {
          errors.push(`Name/address search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (!placeDetails) {
        console.log('No place found with either method');
        return { placeDetails: null, reviews: [], searchMethod: 'none', errors };
      }

      // Get reviews for the found place
      try {
        const reviews = await this.getPlaceReviews(placeDetails.place_id);
        console.log(`Found ${reviews.length} reviews`);
        
        return {
          placeDetails: {
            ...placeDetails,
            reviews
          },
          reviews,
          searchMethod,
          errors: errors.length > 0 ? errors : undefined
        };
      } catch (error) {
        errors.push(`Failed to get reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {
          placeDetails: {
            ...placeDetails,
            reviews: []
          },
          reviews: [],
          searchMethod,
          errors
        };
      }
    } catch (error) {
      console.error('Error searching and getting reviews:', error);
      errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { placeDetails: null, reviews: [], searchMethod: 'none', errors };
    }
  }

  // Debug method to test different search strategies
  async debugSearch(providerName: string, address: string, website?: string): Promise<{
    websiteSearch: GooglePlaceDetails | null;
    nameAddressSearch: GooglePlaceDetails | null;
    finalResult: GooglePlaceDetails | null;
    apiKeyValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    // Validate API key
    const keyValidation = await this.validateAPIKey();
    
    const websiteSearch = website ? await this.searchPlaceByWebsite(website) : null;
    const nameAddressSearch = await this.searchPlaceByNameAndAddress(providerName, address);
    
    return {
      websiteSearch,
      nameAddressSearch,
      finalResult: websiteSearch || nameAddressSearch,
      apiKeyValid: keyValidation.valid,
      errors: keyValidation.valid ? errors : [keyValidation.error || 'API key validation failed']
    };
  }
}

// Helper function to format review date
export const formatReviewDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to render star rating
export const renderStarRating = (rating: number): string => {
  const fullStars = '★'.repeat(Math.floor(rating));
  const emptyStars = '☆'.repeat(5 - Math.floor(rating));
  return fullStars + emptyStars;
}; 