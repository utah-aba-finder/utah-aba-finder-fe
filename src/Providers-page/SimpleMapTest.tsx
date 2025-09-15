import React from 'react';

const SimpleMapTest: React.FC = () => {
  const apiKey = 'EXPOSED_KEY_REMOVED';
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h2>🔍 Simple Google Maps Test</h2>
      <p>Testing with direct API key (no environment variables):</p>
      
      <div style={{ 
        width: '100%', 
        height: '400px', 
        border: '3px solid #ff0000',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <iframe
          src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Direct API Key Test"
        />
      </div>
      
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px' }}>
        <h3>🔗 Direct Links to Test:</h3>
        <ul>
          <li>
            <a 
              href={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=40.7128,-74.0060&zoom=10`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Test Maps Embed API (New Tab)
            </a>
          </li>
          <li>
            <a 
              href={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Test Maps JavaScript API (New Tab)
            </a>
          </li>
        </ul>
      </div>
      
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>📋 Troubleshooting Checklist:</h3>
        <ol>
          <li>✅ <strong>API Key Valid:</strong> Key loads and is 39 characters</li>
          <li>❓ <strong>Billing Enabled:</strong> Check Google Cloud Console → Billing</li>
          <li>❓ <strong>Maps Embed API Enabled:</strong> Check APIs & Services → Library</li>
          <li>❓ <strong>Restrictions Updated:</strong> Wait up to 24 hours for propagation</li>
          <li>❓ <strong>Domain Match:</strong> Ensure www.autismserviceslocator.com is in referrers</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleMapTest;
