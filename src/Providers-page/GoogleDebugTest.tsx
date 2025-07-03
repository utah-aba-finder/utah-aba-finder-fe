import React, { useState } from 'react';
import { GooglePlacesAPI } from '../Utility/GooglePlacesAPI';

const GoogleDebugTest: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [providerName, setProviderName] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSearch = async () => {
    if (!apiKey.trim() || !providerName.trim()) {
      setError('Please enter both API key and provider name');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const googlePlaces = new GooglePlacesAPI(apiKey);
      
      console.log('Testing Google Places API with:', {
        providerName,
        address,
        website,
        hasApiKey: !!apiKey
      });

      const result = await googlePlaces.searchAndGetReviews(providerName, address, website);
      
      setResults({
        searchResult: result,
        debugInfo: await googlePlaces.debugSearch(providerName, address, website)
      });

      console.log('Test results:', result);
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testSimpleSearch = async () => {
    if (!apiKey.trim()) {
      setError('Please enter API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const googlePlaces = new GooglePlacesAPI(apiKey);
      
      // Test with a well-known business
      const result = await googlePlaces.searchAndGetReviews('Walmart', 'Salt Lake City, UT', 'https://www.walmart.com');
      
      setResults({
        searchResult: result,
        message: 'Tested with Walmart in Salt Lake City, UT'
      });

      console.log('Simple test results:', result);
    } catch (err) {
      console.error('Simple test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testAPIKeyOnly = async () => {
    if (!apiKey.trim()) {
      setError('Please enter API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const googlePlaces = new GooglePlacesAPI(apiKey);
      const validation = await googlePlaces.validateAPIKey();
      
      setResults({
        apiKeyValidation: validation,
        message: 'API Key validation test'
      });

      console.log('API Key validation:', validation);
    } catch (err) {
      console.error('API Key test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Google Places API Debug Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Check</h3>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
        <p><strong>REACT_APP_GOOGLE_PLACES_API_KEY exists:</strong> {process.env.REACT_APP_GOOGLE_PLACES_API_KEY ? 'Yes' : 'No'}</p>
        <p><strong>Key length:</strong> {process.env.REACT_APP_GOOGLE_PLACES_API_KEY?.length || 0} characters</p>
        <p><strong>Key starts with:</strong> {process.env.REACT_APP_GOOGLE_PLACES_API_KEY?.substring(0, 10) || 'N/A'}...</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Configuration</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Google Places API Key:
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Places API key"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Provider Name:
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g., ABC Therapy Services"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Address:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Salt Lake City, UT"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Website (optional):
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g., https://www.abctherapy.com"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testAPIKeyOnly}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test API Key Only'}
        </button>
        
        <button
          onClick={testSimpleSearch}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test with Walmart (Simple)'}
        </button>
        
        <button
          onClick={testSearch}
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#34a853',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Custom Search'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fecaca',
          borderRadius: '5px',
          marginBottom: '20px',
          color: '#991b1b'
        }}>
          <h4>Error:</h4>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd',
          borderRadius: '5px'
        }}>
          <h4>Test Results:</h4>
          {results.message && <p><strong>Test:</strong> {results.message}</p>}
          
          {results.apiKeyValidation && (
            <div style={{ marginBottom: '15px' }}>
              <h5>API Key Validation:</h5>
              <p><strong>Valid:</strong> {results.apiKeyValidation.valid ? '✅ Yes' : '❌ No'}</p>
              {results.apiKeyValidation.error && (
                <p><strong>Error:</strong> {results.apiKeyValidation.error}</p>
              )}
            </div>
          )}
          
          {results.searchResult && (
            <>
              <h5>Search Result:</h5>
              <p><strong>Search Method:</strong> {results.searchResult.searchMethod}</p>
              <p><strong>Place Found:</strong> {results.searchResult.placeDetails ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Reviews Found:</strong> {results.searchResult.reviews?.length || 0}</p>
              
              {results.searchResult.errors && results.searchResult.errors.length > 0 && (
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #fde68a',
                  borderRadius: '5px',
                  marginBottom: '10px'
                }}>
                  <h6>Errors/Warnings:</h6>
                  <ul>
                    {results.searchResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <pre style={{ 
                backgroundColor: '#1f2937', 
                color: '#f9fafb', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(results.searchResult, null, 2)}
              </pre>
            </>
          )}
          
          {results.debugInfo && (
            <>
              <h5>Debug Info:</h5>
              <p><strong>API Key Valid:</strong> {results.debugInfo.apiKeyValid ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Website Search Result:</strong> {results.debugInfo.websiteSearch ? '✅ Found' : '❌ Not Found'}</p>
              <p><strong>Name/Address Search Result:</strong> {results.debugInfo.nameAddressSearch ? '✅ Found' : '❌ Not Found'}</p>
              
              {results.debugInfo.errors && results.debugInfo.errors.length > 0 && (
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #fde68a',
                  borderRadius: '5px',
                  marginBottom: '10px'
                }}>
                  <h6>Debug Errors:</h6>
                  <ul>
                    {results.debugInfo.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <pre style={{ 
                backgroundColor: '#1f2937', 
                color: '#f9fafb', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(results.debugInfo, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '5px' }}>
        <h4>Setup Instructions:</h4>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Create a new project or select an existing one</li>
          <li>Enable the "Places API" and "Maps JavaScript API"</li>
          <li>Go to "Credentials" and create an API key</li>
          <li>Restrict the API key to your domain for security</li>
          <li>Copy the API key and paste it above</li>
          <li>Test with a known business first (like Walmart)</li>
        </ol>
        
        <h4>Common Issues & Solutions:</h4>
        <ul>
          <li><strong>API not enabled:</strong> Make sure Places API is enabled in Google Cloud Console</li>
          <li><strong>Billing not set up:</strong> Google Places API requires billing to be enabled</li>
          <li><strong>API key restrictions:</strong> Check if your API key is restricted to specific domains</li>
          <li><strong>Quota exceeded:</strong> Check your usage in Google Cloud Console</li>
          <li><strong>Business not on Google Maps:</strong> Some businesses may not have a Google My Business listing</li>
          <li><strong>Search query too specific:</strong> Try using just the business name without address</li>
          <li><strong>Website domain mismatch:</strong> The business website might not match their Google listing</li>
        </ul>

        <h4>Troubleshooting Steps:</h4>
        <ol>
          <li><strong>Test API Key:</strong> Use the "Test API Key Only" button first</li>
          <li><strong>Test with Known Business:</strong> Use "Test with Walmart" to verify the API works</li>
          <li><strong>Check Console Logs:</strong> Open browser dev tools and check the console for detailed error messages</li>
          <li><strong>Verify Business Listing:</strong> Search for the business directly on Google Maps to confirm it exists</li>
          <li><strong>Try Different Search Terms:</strong> Use variations of the business name</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleDebugTest; 