import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ user, children }) => {
  // Verificación estricta del correo del jefe maestro
  if (!user || user.email !== 'gfabian395@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return children;
};