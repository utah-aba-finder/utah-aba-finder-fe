import React from 'react';
import {  Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
    children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loggedInProvider } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to an unauthorized page or the appropriate provider page
    if (userRole === 'provider_admin' && loggedInProvider?.id) {
      return <Navigate to={`/providerEdit/${loggedInProvider.id}`} state={{ from: location }} replace />;
    }
    return <Navigate to="/404" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

  
export default ProtectedRoute;