import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

import { DashboardHome } from './pages/DashboardHome';
import { TenantsManager } from './pages/TenantsManager';
import { TenantDetail } from './pages/TenantDetail';
import { PaymentsLedger } from './pages/PaymentsLedger';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <div className="flex h-screen bg-[#09090b] text-slate-100 overflow-hidden">
            {/* Sidebar Fijo */}
            <Sidebar />

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <Navbar />
              <main className="p-8 max-w-7xl w-full mx-auto">
                <Routes>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/tenants" element={<TenantsManager />} />
                  <Route path="/tenants/:id" element={<TenantDetail />} />
                  <Route path="/payments" element={<PaymentsLedger />} />
                </Routes>
              </main>
            </div>
          </div>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;