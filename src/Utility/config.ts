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

/**
 * Build `Authorization` for session-based admin calls.
 * Same convention as super-admin: `Bearer <numeric id>` or `Bearer <email>` (see `getSuperAdminAuthHeader`).
 */
// Helper function to get admin authorization header
export const getAdminAuthHeader = () => {
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser) as { id?: number | string; email?: string };
      const bearer = bearerFromSessionUser(user);
      if (bearer) return bearer;
    } catch {
    }
  }

  // Fallback to API key if no user session
  return API_CONFIG.ADMIN_API_KEY;
};

// Helper function to get user authorization header
export const getUserAuthHeader = () => {
  return sessionStorage.getItem('authToken');
};

/**
 * Super-admin routes (e.g. GET /api/v1/provider_registrations) expect:
 * `Authorization: Bearer <numeric user id>` or `Bearer <user email>`.
 * The API uses `authenticate_user!` on that value (not a JWT unless enabled server-side).
 * User must have `role === 'super_admin'` or the API returns 403 `{ "error": "Unauthorized" }`.
 */
function bearerFromSessionUser(user: {
  id?: number | string;
  email?: string;
}): string | null {
  if (user.id != null && String(user.id).trim() !== '') {
    return `Bearer ${user.id}`;
  }
  if (user.email != null && String(user.email).trim() !== '') {
    return `Bearer ${user.email}`;
  }
  return null;
}

// Helper function specifically for super admin operations
export const getSuperAdminAuthHeader = () => {
  const raw = sessionStorage.getItem('currentUser');
  if (raw) {
    try {
      const user = JSON.parse(raw) as { id?: number | string; email?: string };
      const bearer = bearerFromSessionUser(user);
      if (bearer) return bearer;
      throw new Error(
        'Super admin authentication failed: No user id or email in session'
      );
    } catch (e) {
      if (e instanceof Error && e.message.includes('Super admin authentication failed')) throw e;
      throw new Error('Super admin authentication failed: No valid user session');
    }
  }
  throw new Error('Super admin authentication failed: No user session found');
};

// Helper function to get the appropriate API base URL
export const getApiBaseUrl = (): string => {
  // Temporarily use production for testing multi-provider system
  if (process.env.NODE_ENV === 'development') {
    return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
  }
  return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
}; 