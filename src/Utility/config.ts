// Configuration file for API keys and sensitive data
// This file should be added to .gitignore in production

export const API_CONFIG = {
  // API Keys - these should be set as environment variables
  ADMIN_API_KEY: process.env.REACT_APP_ADMIN_API_KEY || '',
  GOOGLE_PLACES_API_KEY: process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '',
  RECAPTCHA_SITE_KEY: process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LfTMGErAAAAAARfviGKHaQSMBEiUqHOZeBEmRIu',
  
  // API URLs - Always use the Heroku API for now
  BASE_API_URL: process.env.REACT_APP_BASE_API_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com',
  ADMIN_API_URL: process.env.REACT_APP_ADMIN_API_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com',
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Helper function to get admin authorization header
export const getAdminAuthHeader = () => {
  // For super admin operations, we need to send Bearer {user_id}
  // The user_id should be extracted from the current user's session
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      return `Bearer ${user.id}`;
    } catch (error) {
      console.error('Error parsing currentUser:', error);
    }
  }
  
  // Fallback to API key if no user session
  return API_CONFIG.ADMIN_API_KEY;
};

// Helper function to get user authorization header
export const getUserAuthHeader = () => {
  return sessionStorage.getItem('authToken');
};

// Helper function specifically for super admin operations
export const getSuperAdminAuthHeader = () => {
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      return `Bearer ${user.id}`;
    } catch (error) {
      console.error('Error parsing currentUser for super admin:', error);
      throw new Error('Super admin authentication failed: No valid user session');
    }
  }
  throw new Error('Super admin authentication failed: No user session found');
};

// Helper function to get the appropriate API base URL
export const getApiBaseUrl = (): string => {
  // Temporarily use production for testing multi-provider system
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 DEV MODE: Using production backend for testing');
    return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
  }
  return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
}; 