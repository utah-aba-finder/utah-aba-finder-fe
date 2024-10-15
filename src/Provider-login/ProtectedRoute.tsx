import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
    if (userRole === 'provider_admin' && loggedInProvider?.id) {
      return <Navigate to={`/providerEdit/${loggedInProvider.id}`} replace />;
    } else if (userRole === 'super_admin') {
      return <Navigate to="/superAdmin" replace />;
  }
}

  return <>{children}</>;
};

export default ProtectedRoute;