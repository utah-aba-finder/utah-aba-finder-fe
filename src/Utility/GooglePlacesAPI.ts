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

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Extract domain from website URL
  private extractDomain(website: string): string {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch (error) {
      
      return website;
    }
  }

  // Make API request through proxy server to avoid CORS issues
  private async makeRequest(url: string): Promise<any> {
    try {
      // Use local proxy server in development, Netlify function in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const proxyUrl = isDevelopment 
        ? 'http://localhost:3001/api/google-places'
        : '/.netlify/functions/google-places';
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        // Add longer timeout for mobile networks
        signal: AbortSignal.timeout(60000) // 60 second timeout for mobile
      });
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection.');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network connection error. Please check your internet connection.');
        }
      }
      throw error;
    }
  }

  // Validate API key by making a simple test request
  async validateAPIKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const testUrl = `${this.baseUrl}/textsearch/json?query=test&key=${this.apiKey}`;
      const data = await this.makeRequest(testUrl);
      
      if (data.status === 'REQUEST_DENIED') {
        return { valid: false, error: 'API configuration error' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Network error or configuration issue' };
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

        throw new Error('Search request denied');
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
      
      return null;
    }
  }

  // Search for a place by name and address (fallback method)
  async searchPlaceByNameAndAddress(providerName: string, address: string): Promise<GooglePlaceDetails | null> {
    try {
      const searchQuery = `${providerName} ${address}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `${this.baseUrl}/textsearch/json?query=${encodedQuery}&key=${this.apiKey}`;

      const data = await this.makeRequest(url);

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('Search request denied');
      }

      if (data.status === 'ZERO_RESULTS') {
        return null;
      }

      if (data.status === 'OK' && data.results.length > 0) {
        const place = data.results[0];
        
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

      return null;
    } catch (error) {
      return null;
    }
  }

  // Get detailed place information including reviews
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,rating,user_ratings_total,reviews,website,formatted_phone_number&key=${this.apiKey}`;

      const data = await this.makeRequest(url);

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('Details request denied');
      }

      if (data.status === 'NOT_FOUND') {
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
      
      return null;
    }
  }

  // Get reviews for a specific place
  async getPlaceReviews(placeId: string): Promise<GoogleReview[]> {
    try {
      const placeDetails = await this.getPlaceDetails(placeId);
      return placeDetails?.reviews || [];
    } catch (error) {
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
  
        try {
          placeDetails = await this.searchPlaceByWebsite(website);
          if (placeDetails) {
            searchMethod = 'website';
  
          } else {
            errors.push(`No place found for website: ${website}`);
          }
        } catch (error) {
          errors.push(`Website search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Fallback to name and address if website search failed
      if (!placeDetails) {

        try {
          placeDetails = await this.searchPlaceByNameAndAddress(providerName, address);
          if (placeDetails) {
            searchMethod = 'name_address';

          } else {
            errors.push(`No place found for name/address: ${providerName} ${address}`);
          }
        } catch (error) {
          errors.push(`Name/address search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (!placeDetails) {

        return { placeDetails: null, reviews: [], searchMethod: 'none', errors };
      }

      // Get reviews for the found place
      try {
        const reviews = await this.getPlaceReviews(placeDetails.place_id);

        
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