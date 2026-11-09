import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, logoutAdmin } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './pages/DashboardHome';
import { Login } from './pages/Login';

export function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === 'gfabian395@gmail.com') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400 font-medium">
        Verificando credenciales de Ragnarok...
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#0a0f1d] text-slate-100 overflow-hidden">
        <Sidebar onLogout={() => logoutAdmin()} />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/tenants" element={<DashboardHome />} />
            <Route path="/payments" element={<DashboardHome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;