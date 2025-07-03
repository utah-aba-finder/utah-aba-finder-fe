# Google Reviews Troubleshooting Guide

## Why Google Reviews Might Not Be Showing

There are several common reasons why Google reviews might not appear even though they exist on Google Maps:

### 1. **API Key Issues**
- **Invalid API Key**: The API key might be incorrect or expired
- **API Not Enabled**: Places API might not be enabled in Google Cloud Console
- **Billing Not Set Up**: Google Places API requires billing to be enabled
- **API Key Restrictions**: The key might be restricted to specific domains or IP addresses
- **Quota Exceeded**: You might have hit the daily/monthly quota limits

### 2. **Business Listing Issues**
- **No Google My Business Listing**: Some businesses don't have a Google My Business profile
- **Unverified Business**: The business might not be verified on Google
- **Private Business**: Some businesses choose to keep their information private
- **New Business**: Very new businesses might not have reviews yet

### 3. **Search Issues**
- **Search Query Too Specific**: Using exact business name + address might be too restrictive
- **Business Name Variations**: The business might be listed under a different name
- **Address Mismatch**: The address in your database might not match Google's listing
- **Website Domain Mismatch**: The business website might not match their Google listing

### 4. **Technical Issues**
- **Network Problems**: CORS issues or network connectivity problems
- **Rate Limiting**: Too many requests in a short time
- **Environment Variables**: The API key might not be loaded properly

## How to Troubleshoot

### Step 1: Test Your API Key
1. Go to `/google-debug` in your application
2. Enter your API key and click "Test API Key Only"
3. Check if the API key is valid

### Step 2: Test with a Known Business
1. Use the "Test with Walmart" button to verify the API works
2. This should return results for Walmart in Salt Lake City

### Step 3: Check Console Logs
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for error messages or API responses
4. The logs will show detailed information about what's happening

### Step 4: Verify Business on Google Maps
1. Go to Google Maps directly
2. Search for the business name and location
3. Confirm the business exists and has reviews
4. Note the exact business name and address

### Step 5: Test Custom Search
1. Use the debug page to test with the specific business
2. Try different variations of the business name
3. Try with and without the address
4. Try with and without the website

## Common Error Messages and Solutions

### "API request denied"
- **Cause**: Invalid API key or API not enabled
- **Solution**: Check your API key and enable Places API in Google Cloud Console

### "ZERO_RESULTS"
- **Cause**: No business found matching the search criteria
- **Solution**: Try different search terms or verify the business exists on Google Maps

### "REQUEST_DENIED"
- **Cause**: API key restrictions or billing issues
- **Solution**: Check API key restrictions and ensure billing is set up

### "OVER_QUERY_LIMIT"
- **Cause**: Quota exceeded
- **Solution**: Check your usage in Google Cloud Console and wait or upgrade

### "INVALID_REQUEST"
- **Cause**: Malformed search query
- **Solution**: Check the search parameters and ensure they're properly formatted

## Google Cloud Console Setup

### 1. Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for and enable:
   - Places API
   - Maps JavaScript API

### 2. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated key

### 3. Restrict API Key (Recommended)
1. Click on the API key to edit it
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain (e.g., `localhost:3000/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select "Places API" and "Maps JavaScript API"

### 4. Enable Billing
1. Go to "Billing" in the left menu
2. Link a billing account to your project
3. Google Places API requires billing to be enabled

## Testing Your Setup

### Environment Variables
Make sure your `.env` file contains:
```
REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Restart Development Server
After adding the API key, restart your development server:
```bash
npm start
```

### Debug Page
Visit `/google-debug` to test your setup with detailed logging.

## Provider-Specific Issues

### Business Name Variations
- Try the business name without "LLC", "Inc.", etc.
- Try common abbreviations
- Try the business name as it appears on Google Maps

### Address Issues
- Use just the city and state instead of full address
- Try different address formats
- Some businesses might be listed under a different address

### Website Issues
- The business website might not match their Google listing
- Some businesses don't have websites
- The website domain might be different from their Google listing

## Performance Considerations

### Rate Limiting
- Google Places API has rate limits
- Don't make too many requests in a short time
- Consider caching results

### Caching
- Consider caching review results to avoid repeated API calls
- Cache for a reasonable time (e.g., 24 hours)

### Error Handling
- Always handle API errors gracefully
- Show user-friendly error messages
- Log errors for debugging

## Getting Help

If you're still having issues:

1. **Check the debug page** at `/google-debug` for detailed error information
2. **Check browser console** for error messages
3. **Verify your Google Cloud Console setup**
4. **Test with a known business** like Walmart
5. **Check the business on Google Maps directly**

## Example Debug Output

When testing, you should see output like this in the console:

```
Searching by website: https://www.abctherapy.com
Website search URL: https://maps.googleapis.com/maps/api/place/textsearch/json?query=abctherapy.com&key=[API_KEY_HIDDEN]
Website search response status: 200
Website search results: {status: "OK", results: [...]}
Found place by website: ABC Therapy Services
Getting place details for: ChIJ...
Found 15 reviews
```

If you see different output, the debug information will help identify the issue. 