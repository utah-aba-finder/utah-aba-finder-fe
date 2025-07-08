import React, { useState, useEffect } from 'react';

const GoogleApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [apiKeyExists, setApiKeyExists] = useState(false);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    
    setApiKeyExists(!!apiKey);
    
    if (!apiKey) {
      setStatus('error');
      setMessage('Google Places API key is not configured. Please add REACT_APP_GOOGLE_PLACES_API_KEY to your environment variables.');
      return;
    }

    try {
      // Test with a simple search through the proxy
      const testUrl = `http://localhost:3001/api/google-places/textsearch/json?query=Walmart`;
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED') {
        setStatus('error');
        setMessage(`API key error: ${data.error_message || 'Request denied'}`);
      } else if (data.status === 'OK') {
        setStatus('success');
        setMessage('Google Places API is working correctly!');
      } else {
        setStatus('error');
        setMessage(`API returned status: ${data.status}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{
      padding: '15px',
      margin: '10px 0',
      borderRadius: '5px',
      border: '1px solid',
      backgroundColor: status === 'loading' ? '#f3f4f6' : 
                     status === 'success' ? '#d1fae5' : '#fee2e2',
      borderColor: status === 'loading' ? '#d1d5db' : 
                  status === 'success' ? '#10b981' : '#ef4444',
      color: status === 'loading' ? '#374151' : 
             status === 'success' ? '#065f46' : '#991b1b'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Google Places API Status</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>API Key Configured:</strong> {apiKeyExists ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {
          status === 'loading' ? '🔄 Checking...' :
          status === 'success' ? '✅ Working' : '❌ Error'
        }
      </div>
      
      {message && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Message:</strong> {message}
        </div>
      )}
      
      <button 
        onClick={checkApiStatus}
        style={{
          padding: '5px 10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Test Again
      </button>
    </div>
  );
};

export default GoogleApiStatus; 