import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../Utility/config';

const GoogleMapsDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    checkDebugInfo();
  }, []);

  const checkDebugInfo = () => {
    const apiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;
    const isProduction = API_CONFIG.IS_PRODUCTION;
    
    setDebugInfo({
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStart: apiKey?.substring(0, 10) || 'N/A',
      isProduction,
      currentDomain: window.location.hostname,
      currentProtocol: window.location.protocol,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'None'
    });
  };

  const testMapsEmbed = async () => {
    const apiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      setTestResults({ error: 'No API key found' });
      return;
    }

    try {
      // Test basic embed URL
      const testUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`;
      
      const response = await fetch(testUrl);
      const html = await response.text();
      
      setTestResults({
        status: response.status,
        statusText: response.statusText,
        hasError: html.includes('This content is blocked'),
        responseLength: html.length,
        errorInResponse: html.includes('error') || html.includes('blocked')
      });
    } catch (error) {
      setTestResults({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'network'
      });
    }
  };

  const testDirectIframe = () => {
    const apiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      alert('No API key found');
      return;
    }

    const testUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`;
    window.open(testUrl, '_blank');
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Google Maps API Debug Information</h3>
      
      {debugInfo.currentDomain === 'autismserviceslocator.com' && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>⚠️ Domain Notice:</strong> You're accessing this page without "www". 
          Your site uses <code>www.autismserviceslocator.com</code>. 
          <br />
          <a href="https://www.autismserviceslocator.com/maps-debug" style={{color: '#007bff'}}>
            Click here to access the debug page with the correct domain
          </a>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Environment Info:</h4>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Results:</h4>
        {Object.keys(testResults).length > 0 ? (
          <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        ) : (
          <p>No test results yet</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={checkDebugInfo}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Debug Info
        </button>
        
        <button 
          onClick={testMapsEmbed}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Maps Embed API
        </button>
        
        <button 
          onClick={testDirectIframe}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Direct Iframe (New Tab)
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Instructions for Google Cloud Console:</h4>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Navigate to APIs & Services → Credentials</li>
          <li>Click on your API key</li>
          <li>Under "Application restrictions", select "HTTP referrers (web sites)"</li>
          <li>Add these referrers (in this exact order):</li>
          <ul>
            <li><code>https://www.autismserviceslocator.com/*</code> (primary domain)</li>
            <li><code>https://autismserviceslocator.com/*</code> (redirects to www)</li>
            <li><code>https://autismserviceslocator.netlify.app/*</code> (Netlify subdomain)</li>
            <li><code>http://localhost:*/*</code> (for development)</li>
          </ul>
          <li>Under "API restrictions", select "Restrict key" and enable:</li>
          <ul>
            <li>Maps Embed API</li>
            <li>Places API</li>
          </ul>
          <li>Save the changes</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleMapsDebug;
