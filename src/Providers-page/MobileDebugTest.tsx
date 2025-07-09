import React, { useState, useEffect } from 'react';
import { GooglePlacesAPI } from '../Utility/GooglePlacesAPI';

const MobileDebugTest: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testGoogleAPI = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    
    try {
      addDebugInfo('Starting mobile debug test...');
      addDebugInfo(`User Agent: ${navigator.userAgent}`);
      addDebugInfo(`Platform: ${navigator.platform}`);
      addDebugInfo(`Language: ${navigator.language}`);
      addDebugInfo(`Online: ${navigator.onLine}`);
      addDebugInfo(`Connection: ${(navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown'}`);
      
      // Test API key
      const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
      addDebugInfo(`API Key exists: ${!!apiKey}`);
      addDebugInfo(`API Key length: ${apiKey?.length || 0}`);
      
      if (!apiKey) {
        addDebugInfo('ERROR: No API key found');
        return;
      }

      // Test Google API
      const googleAPI = new GooglePlacesAPI(apiKey);
      addDebugInfo('Testing API key validation...');
      
      const validationResult = await googleAPI.validateAPIKey();
      addDebugInfo(`API Key validation: ${validationResult.valid ? 'SUCCESS' : 'FAILED'}`);
      
      if (!validationResult.valid) {
        addDebugInfo(`Validation error: ${validationResult.error}`);
        return;
      }

      // Test a simple search
      addDebugInfo('Testing Google Places search...');
      const searchResult = await googleAPI.searchPlaceByWebsite('https://www.google.com');
      addDebugInfo(`Search result: ${searchResult ? 'SUCCESS' : 'NO RESULTS'}`);
      
      if (searchResult) {
        addDebugInfo(`Found place: ${searchResult.name}`);
        addDebugInfo(`Place ID: ${searchResult.place_id}`);
      }

      addDebugInfo('Mobile debug test completed successfully!');
      
    } catch (error) {
      addDebugInfo(`ERROR: ${(error as Error).message}`);
      addDebugInfo(`Error type: ${(error as Error).name}`);
      console.error('Mobile debug test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-debug-test p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Mobile Debug Test</h2>
      
      <button 
        onClick={testGoogleAPI}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Run Mobile Debug Test'}
      </button>
      
      <div className="debug-output bg-white p-4 rounded border max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Debug Output:</h3>
        {debugInfo.length === 0 ? (
          <p className="text-gray-500">Click the button above to run the test</p>
        ) : (
          <div className="space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-sm font-mono">
                {info}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside mt-2">
          <li>Run this test on your mobile device</li>
          <li>Check the debug output for any errors</li>
          <li>Share the output if you encounter issues</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileDebugTest; 