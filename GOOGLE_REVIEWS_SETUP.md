# Google Reviews Integration Setup Guide

This guide will help you set up Google Places API to automatically fetch and display Google reviews for your providers.

## 🚀 Quick Start

### 1. Get Google Places API Key

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Places API**
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

4. **Restrict API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain: `https://yourdomain.com/*`
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" from the dropdown

### 2. Environment Setup

Add your API key to your environment variables:

```bash
# .env.local (for development)
REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here

# .env.production (for production)
REACT_APP_GOOGLE_PLACES_API_KEY=your_production_api_key_here
```

### 3. Netlify Environment Variables

If deploying to Netlify, add the environment variable in your Netlify dashboard:

1. Go to your site settings
2. Navigate to "Environment variables"
3. Add `REACT_APP_GOOGLE_PLACES_API_KEY` with your API key

## 📊 API Usage & Costs

### Free Tier Limits
- **$200 credit per month** (approximately 28,500 requests)
- **Text Search**: $0.017 per request
- **Place Details**: $0.017 per request

### Estimated Costs
- **100 providers**: ~$3.40/month
- **500 providers**: ~$17/month
- **1000 providers**: ~$34/month

### Cost Optimization Tips
1. **Cache results** for 24-48 hours
2. **Implement rate limiting**
3. **Only fetch reviews when needed**
4. **Use bulk operations** when possible

## 🔧 Implementation Details

### How It Works

1. **Provider Search**: Uses provider name + address to find Google Business listing
2. **Place Details**: Fetches detailed information including reviews
3. **Review Display**: Shows up to 5 most recent reviews with pagination

### API Endpoints Used

```javascript
// Search for place
GET https://maps.googleapis.com/maps/api/place/textsearch/json?query={provider_name} {address}&key={api_key}

// Get place details with reviews
GET https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=place_id,name,formatted_address,rating,user_ratings_total,reviews,website,formatted_phone_number&key={api_key}
```

### Data Structure

```typescript
interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
  website?: string;
  phone?: string;
}
```

## 🛠️ Advanced Configuration

### 1. Caching Implementation

To reduce API calls and costs, implement caching:

```javascript
// Add to GooglePlacesAPI.ts
class GooglePlacesAPI {
  private cache = new Map();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  async searchPlace(providerName: string, address: string) {
    const cacheKey = `${providerName}-${address}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const result = await this.fetchFromAPI(providerName, address);
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }
}
```

### 2. Rate Limiting

```javascript
class GooglePlacesAPI {
  private requestQueue = [];
  private lastRequestTime = 0;
  private minInterval = 100; // 100ms between requests

  async makeRequest(url) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    return fetch(url);
  }
}
```

### 3. Error Handling

```javascript
async searchPlace(providerName: string, address: string) {
  try {
    const response = await this.makeRequest(url);
    
    if (response.status === 429) {
      // Rate limited - retry after delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return this.searchPlace(providerName, address);
    }
    
    if (response.status === 403) {
      throw new Error('API key invalid or quota exceeded');
    }
    
    // Handle other errors...
  } catch (error) {
    console.error('Google Places API error:', error);
    throw error;
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"No Google listing found"**
   - Provider may not have a Google Business listing
   - Try different address formats
   - Check if business name matches exactly

2. **"API key invalid"**
   - Verify API key is correct
   - Check if Places API is enabled
   - Ensure API key restrictions allow your domain

3. **"Quota exceeded"**
   - Check usage in Google Cloud Console
   - Implement caching to reduce requests
   - Consider upgrading billing plan

4. **"CORS errors"**
   - Google Places API doesn't support CORS from browsers
   - Use a backend proxy or serverless function

### Backend Proxy Solution

If you encounter CORS issues, create a backend endpoint:

```javascript
// Backend route (Node.js/Express)
app.get('/api/google-reviews', async (req, res) => {
  const { providerName, address } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(providerName + ' ' + address)}&key=${apiKey}`
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});
```

Then update the frontend to use your backend:

```javascript
// Frontend
async searchPlace(providerName: string, address: string) {
  const response = await fetch(
    `/api/google-reviews?providerName=${encodeURIComponent(providerName)}&address=${encodeURIComponent(address)}`
  );
  return response.json();
}
```

## 📈 Monitoring & Analytics

### Track API Usage

```javascript
class GooglePlacesAPI {
  private requestCount = 0;
  private errorCount = 0;

  async searchPlace(providerName: string, address: string) {
    this.requestCount++;
    
    try {
      const result = await this.fetchFromAPI(providerName, address);
      return result;
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }

  getStats() {
    return {
      requests: this.requestCount,
      errors: this.errorCount,
      successRate: ((this.requestCount - this.errorCount) / this.requestCount) * 100
    };
  }
}
```

### Google Cloud Console Monitoring

1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Dashboard"
3. Select "Places API"
4. View usage metrics and quotas

## 🔒 Security Best Practices

1. **Never expose API key in client-side code**
   - Use environment variables
   - Implement backend proxy
   - Use API key restrictions

2. **Implement rate limiting**
   - Prevent abuse
   - Control costs
   - Respect API limits

3. **Cache responses**
   - Reduce API calls
   - Improve performance
   - Lower costs

4. **Monitor usage**
   - Track request patterns
   - Set up alerts
   - Monitor costs

## 🎯 Next Steps

1. **Get your API key** and add it to environment variables
2. **Test with a few providers** to ensure it works
3. **Monitor usage** and costs
4. **Implement caching** to optimize performance
5. **Add error handling** for production use

## 📞 Support

- **Google Places API Documentation**: [https://developers.google.com/maps/documentation/places/web-service](https://developers.google.com/maps/documentation/places/web-service)
- **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- **API Quotas & Pricing**: [https://developers.google.com/maps/documentation/places/web-service/usage-and-billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) 