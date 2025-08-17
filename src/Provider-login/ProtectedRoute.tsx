import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const LoadingScreen = () => (
  <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
    <div>Loading…</div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { authReady, isAuthenticated, currentUser, activeProvider } = useAuth();
  const location = useLocation();

  // Don't decide anything until auth has hydrated
  if (!authReady) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = currentUser?.role || '';

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // role-based redirects
    if (role === 'provider_admin') {
      const pid =
        activeProvider?.id ??
        currentUser?.active_provider_id ??
        null;

      return pid
        ? <Navigate to={`/providerEdit/${pid}`} replace />
        : <Navigate to="/login" replace />; // fallback if we somehow lack an id
    }

    if (role === 'super_admin') {
      return <Navigate to="/superAdmin" replace />;
    }

    // default: deny
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;