const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          status: 'ERROR', 
          error_message: 'URL is required in request body' 
        })
      };
    }

    // Add API key if not present
    const googleUrl = new URL(url);
    if (!googleUrl.searchParams.has('key')) {
      googleUrl.searchParams.set('key', process.env.REACT_APP_GOOGLE_PLACES_API_KEY);
    }

    console.log('Proxying request to Google Places API:', googleUrl.toString().replace(process.env.REACT_APP_GOOGLE_PLACES_API_KEY, '[API_KEY_HIDDEN]'));

    // Make the request to Google Places API
    const response = await fetch(googleUrl.toString());
    const data = await response.json();

    console.log('Google API response status:', response.status);
    console.log('Google API response data:', data);

    // Return the response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message, 
        message: 'Netlify function encountered an error'
      })
    };
  }
}; 