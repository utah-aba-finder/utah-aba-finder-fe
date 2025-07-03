const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Proxy endpoint for Google Places API
app.get('/api/google-places/*', async (req, res) => {
  try {
    // Extract the path after /api/google-places/
    const googleApiPath = req.path.replace('/api/google-places/', '');
    
    // Construct the full Google API URL
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/${googleApiPath}`;
    
    console.log('Proxying request to:', googleApiUrl.replace(/key=[^&]*/, 'key=[HIDDEN]'));
    
    // Make the request to Google API
    const response = await fetch(googleApiUrl);
    const data = await response.json();
    
    // Return the response
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Google Places API Proxy is running' });
});

app.listen(PORT, () => {
  console.log(`Google Places API Proxy running on http://localhost:${PORT}`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/api/google-places/`);
}); 