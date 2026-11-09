import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isBoss } = useAuth();

  if (!isBoss) {
    return <Navigate to="/" replace />;
  }

  return children;
};