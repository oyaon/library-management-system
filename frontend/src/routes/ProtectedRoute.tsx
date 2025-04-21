import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const context = useContext(AuthContext);
  const user = context?.user;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && (!user.role || !roles.includes(user.role))) {
    // Not authorized for this role
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
