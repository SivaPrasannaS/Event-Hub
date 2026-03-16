import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useRBAC from '../../hooks/useRBAC';

function ProtectedRoute({ permission, children }) {
  const { isAuthenticated } = useAuth();
  const { can } = useRBAC();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
