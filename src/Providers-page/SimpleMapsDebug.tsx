import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../Utility/config';

const SimpleMapsDebug: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [testResults, setTestResults] = useState<string>('');

  useEffect(() => {
    // Get basic info
    const key = API_CONFIG.GOOGLE_PLACES_API_KEY;
    setApiKey(key || 'NOT_FOUND');
    setCurrentDomain(window.location.hostname);
  }, []);

  const testBasicInfo = () => {
    const results = [
      `API Key: ${apiKey ? 'FOUND' : 'NOT_FOUND'}`,
      `API Key Length: ${apiKey?.length || 0} characters`,
      `Current Domain: ${currentDomain}`,
      `Protocol: ${window.location.protocol}`,
      `Full URL: ${window.location.href}`,
      `User Agent: ${navigator.userAgent.substring(0, 50)}...`,
      `Timestamp: ${new Date().toISOString()}`
    ].join('\n');
    
    setTestResults(results);
  };

  const clearResults = () => {
    setTestResults('');
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      fontFamily: 'monospace'
    }}>
      <h2>🔧 Simple Google Maps Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Basic Information:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>API Key Status:</strong> {apiKey ? '✅ FOUND' : '❌ NOT_FOUND'}</li>
          <li><strong>API Key Length:</strong> {apiKey?.length || 0} characters</li>
          <li><strong>Current Domain:</strong> {currentDomain}</li>
          <li><strong>Protocol:</strong> {window.location.protocol}</li>
          <li><strong>Full URL:</strong> {window.location.href}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>API Key Preview:</h3>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          borderRadius: '4px',
          border: '1px solid #ddd',
          wordBreak: 'break-all'
        }}>
          {apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}` : 'No API key found'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBasicInfo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Basic Info
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      {testResults && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Test Results:</h3>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '15px', 
            borderRadius: '4px',
            border: '1px solid #ddd',
            whiteSpace: 'pre-wrap',
            fontSize: '14px'
          }}>
            {testResults}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>🎯 Direct Iframe Test:</h3>
        <p>If you see a map below, your Google Maps API is working!</p>
        <div style={{ 
          width: '100%', 
          height: '400px', 
          border: '3px solid #007bff',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa'
        }}>
          {apiKey ? (
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              title="Google Maps Test"
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#dc3545',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ❌ No API Key - Cannot test
            </div>
          )}
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          <strong>Expected:</strong> You should see a map of New York City above.<br/>
          <strong>If blocked:</strong> You'll see "This content is blocked" - this means API key restrictions need to be fixed.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔗 Direct Link Test:</h3>
        <p>Click this link to test the Google Maps embed in a new tab:</p>
        {apiKey ? (
          <a 
            href={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            🗺️ Open Google Maps Test (New Tab)
          </a>
        ) : (
          <span style={{ color: '#dc3545' }}>❌ No API key available for testing</span>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: '4px', 
        padding: '15px',
        marginTop: '20px'
      }}>
        <h3>📋 Google Cloud Console Setup:</h3>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Navigate to <strong>APIs & Services → Credentials</strong></li>
          <li>Click on your API key</li>
          <li>Under <strong>"Application restrictions"</strong>, select <strong>"HTTP referrers (web sites)"</strong></li>
          <li>Add these referrers exactly:</li>
          <ul style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            <li><code>https://www.autismserviceslocator.com/*</code></li>
            <li><code>https://autismserviceslocator.com/*</code></li>
            <li><code>https://autismserviceslocator.netlify.app/*</code></li>
            <li><code>http://localhost:3000/*</code></li>
          </ul>
          <li>Under <strong>"API restrictions"</strong>, select <strong>"Restrict key"</strong></li>
          <li>Enable: <strong>Maps Embed API</strong>, <strong>Places API</strong></li>
          <li><strong>Save</strong> the changes</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleMapsDebug;

