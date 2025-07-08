const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'https://autismserviceslocator.com', 'https://www.autismserviceslocator.com'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Replace the require with a dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Google Places API proxy endpoint - GET requests
app.get('/api/google-places/*', async (req, res) => {
  try {
    // Read API key from .env file
    const envContent = fs.readFileSync('.env', 'utf8');
    const apiKeyMatch = envContent.match(/REACT_APP_GOOGLE_PLACES_API_KEY=(.+)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
    
    console.log('API key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!apiKey) {
      console.error('No API key found in .env file');
      return res.status(500).json({ 
        status: 'ERROR', 
        error_message: 'Google Places API key not found in .env file' 
      });
    }

    // Extract the path after /api/google-places/
    const googleApiPath = req.path.replace('/api/google-places', '');
    
    // Build the Google API URL
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place${googleApiPath}`;
    
    // Add the API key to the URL
    const url = new URL(googleApiUrl);
    url.searchParams.set('key', apiKey);
    
    // Add any query parameters from the original request
    Object.keys(req.query).forEach(key => {
      url.searchParams.set(key, req.query[key]);
    });

    console.log('Proxying request to Google Places API:', url.toString().replace(apiKey, '[API_KEY_HIDDEN]'));

    // Make the request to Google Places API
    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('Google API response status:', response.status);
    console.log('Google API response data:', data);

    // Return the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      message: 'Proxy server encountered an error'
    });
  }
});

// Google Places API proxy endpoint - POST requests
app.post('/api/google-places', async (req, res) => {
  try {
    // Read API key from .env file
    const envContent = fs.readFileSync('.env', 'utf8');
    const apiKeyMatch = envContent.match(/REACT_APP_GOOGLE_PLACES_API_KEY=(.+)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
    
    console.log('API key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!apiKey) {
      console.error('No API key found in .env file');
      return res.status(500).json({ 
        status: 'ERROR', 
        error_message: 'Google Places API key not found in .env file' 
      });
    }

    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        status: 'ERROR', 
        error_message: 'URL is required in request body' 
      });
    }

    // Add the API key to the URL if not already present
    const googleUrl = new URL(url);
    if (!googleUrl.searchParams.has('key')) {
      googleUrl.searchParams.set('key', apiKey);
    }

    console.log('Proxying request to Google Places API:', googleUrl.toString().replace(apiKey, '[API_KEY_HIDDEN]'));

    // Make the request to Google Places API
    const response = await fetch(googleUrl.toString());
    const data = await response.json();

    console.log('Google API response status:', response.status);
    console.log('Google API response data:', data);

    // Return the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      message: 'Proxy server encountered an error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Google Places API proxy available at http://localhost:${PORT}/api/google-places/`);
}); 