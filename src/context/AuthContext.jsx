import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Como eres el jefe absoluto, simulamos sesión activa por defecto o switch rápido
  const [isBoss, setIsBoss] = useState(true);

  const loginAsBoss = () => setIsBoss(true);
  const logout = () => setIsBoss(false);

  return (
    <AuthContext.Provider value={{ isBoss, loginAsBoss, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);