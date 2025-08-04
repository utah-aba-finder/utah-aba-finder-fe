// Configuration file for API keys and sensitive data
// This file should be added to .gitignore in production

export const API_CONFIG = {
  // API Keys - these should be set as environment variables
  ADMIN_API_KEY: process.env.REACT_APP_ADMIN_API_KEY || 'be6205db57ce01863f69372308c41e3a',
  GOOGLE_PLACES_API_KEY: process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '',
  
  // API URLs - Always use the Heroku API for now
  BASE_API_URL: process.env.REACT_APP_BASE_API_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com',
  ADMIN_API_URL: process.env.REACT_APP_ADMIN_API_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com',
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Helper function to get admin authorization header
export const getAdminAuthHeader = () => {
  return API_CONFIG.ADMIN_API_KEY;
};

// Helper function to get user authorization header
export const getUserAuthHeader = () => {
  return sessionStorage.getItem('authToken');
}; 