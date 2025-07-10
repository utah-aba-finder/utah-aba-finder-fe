import React, { useState, useEffect } from 'react';
import { GooglePlacesAPI } from '../Utility/GooglePlacesAPI';

const MobileDebugTest: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testNetworkConnectivity = async () => {
    addDebugInfo('Testing network connectivity...');
    
    try {
      // Test basic connectivity
      const response = await fetch('https://httpbin.org/get', {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        addDebugInfo('✅ Basic network connectivity: OK');
      } else {
        addDebugInfo('❌ Basic network connectivity: Failed');
      }
    } catch (error) {
      addDebugInfo(`❌ Basic network connectivity: ${error}`);
    }

    // Test proxy server
    try {
      const proxyResponse = await fetch('http://localhost:3001/api/health', {
        signal: AbortSignal.timeout(10000)
      });
      
      if (proxyResponse.ok) {
        addDebugInfo('✅ Proxy server: OK');
      } else {
        addDebugInfo('❌ Proxy server: Failed');
      }
    } catch (error) {
      addDebugInfo(`❌ Proxy server: ${error}`);
    }
  };

  const testGoogleAPI = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    setTestResults(null);
    
    try {
      addDebugInfo('Starting mobile debug test...');
      addDebugInfo(`User Agent: ${navigator.userAgent}`);
      addDebugInfo(`Platform: ${navigator.platform}`);
      addDebugInfo(`Language: ${navigator.language}`);
      addDebugInfo(`Online: ${navigator.onLine}`);
      addDebugInfo(`Connection: ${(navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown'}`);
      addDebugInfo(`Cookie Enabled: ${navigator.cookieEnabled}`);
      addDebugInfo(`Do Not Track: ${navigator.doNotTrack}`);
      
      // Test network connectivity first
      await testNetworkConnectivity();

      // Test Google API
      const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        addDebugInfo('❌ No Google API key found');
        return;
      }

      addDebugInfo('✅ Google API key found');
      addDebugInfo(`API key length: ${apiKey.length}`);
      addDebugInfo(`API key starts with: ${apiKey.substring(0, 10)}...`);

      const googleAPI = new GooglePlacesAPI(apiKey);
      
      // Test API key validation
      addDebugInfo('Testing API key validation...');
      const validation = await googleAPI.validateAPIKey();
      
      if (validation.valid) {
        addDebugInfo('✅ API key validation: OK');
      } else {
        addDebugInfo(`❌ API key validation: ${validation.error}`);
      }

      // Test a simple search
      addDebugInfo('Testing Google Places search...');
      const testProvider = {
        name: 'Test Provider',
        address: 'Salt Lake City, UT',
        website: 'https://example.com'
      };

      const results = await googleAPI.searchAndGetReviews(
        testProvider.name,
        testProvider.address,
        testProvider.website
      );

      setTestResults({
        searchMethod: results.searchMethod,
        placeFound: !!results.placeDetails,
        reviewsCount: results.reviews.length,
        errors: results.errors || []
      });

      addDebugInfo(`Search method used: ${results.searchMethod}`);
      addDebugInfo(`Place found: ${!!results.placeDetails}`);
      addDebugInfo(`Reviews found: ${results.reviews.length}`);
      
      if (results.errors && results.errors.length > 0) {
        addDebugInfo(`Errors: ${results.errors.join(', ')}`);
      }

    } catch (error) {
      addDebugInfo(`❌ Test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
    setTestResults(null);
  };

  return (
    <div className="mobile-debug-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mobile Debug Test</h1>
      <p>This page helps diagnose mobile-specific issues with Google reviews and network connectivity.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testGoogleAPI}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Testing...' : 'Run Mobile Debug Test'}
        </button>
        
        <button 
          onClick={clearDebugInfo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Clear Results
        </button>
      </div>

      {testResults && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          <h3>Test Results Summary:</h3>
          <ul>
            <li><strong>Search Method:</strong> {testResults.searchMethod}</li>
            <li><strong>Place Found:</strong> {testResults.placeFound ? 'Yes' : 'No'}</li>
            <li><strong>Reviews Found:</strong> {testResults.reviewsCount}</li>
            {testResults.errors.length > 0 && (
              <li><strong>Errors:</strong> {testResults.errors.join(', ')}</li>
            )}
          </ul>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3>Debug Information:</h3>
        {debugInfo.length === 0 ? (
          <p>No debug information yet. Click "Run Mobile Debug Test" to start.</p>
        ) : (
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {debugInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {info}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h3>Troubleshooting Tips:</h3>
        <ul>
          <li><strong>Network Issues:</strong> Check if you're on a stable internet connection</li>
          <li><strong>Proxy Server:</strong> Make sure the proxy server is running on port 3001</li>
          <li><strong>API Key:</strong> Verify your Google API key is valid and has the correct restrictions</li>
          <li><strong>Mobile Browser:</strong> Try using Chrome or Safari on mobile</li>
          <li><strong>Cache:</strong> Clear browser cache and reload the page</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileDebugTest; 