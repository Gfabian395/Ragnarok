import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, logoutAdmin } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardHome } from './pages/DashboardHome';
import { TenantsManager } from './pages/TenantsManager';
import { PaymentsLedger } from './pages/PaymentsLedger';
import { TenantDetail } from './pages/TenantDetail';
import { Login } from './pages/Login';

export function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col md:flex-row overflow-x-hidden">
        {/* Sidebar Responsive */}
        <Sidebar 
          onLogout={() => logoutAdmin()} 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />

        {/* Contenedor Principal con Navbar y Rutas */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Navbar 
            user={user} 
            onLogout={() => logoutAdmin()} 
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} 
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/tenants" element={<TenantsManager />} />
              <Route path="/payments" element={<PaymentsLedger />} />
              <Route path="/tenant/:id" element={<TenantDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;