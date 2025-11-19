import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'agency';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
