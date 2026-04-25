import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // not logged in → redirect safely
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // wrong role → redirect safely
  if (requiredRole && user?.role !== requiredRole) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;