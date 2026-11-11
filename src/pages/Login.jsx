import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginWithGoogle } from '../firebase/firebaseConfig';
import { Lock } from 'lucide-react';

export const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || "Error al autenticar con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl p-2 bg-linear-to-br from-rose-600/20 to-indigo-600/20 border border-rose-500/30 flex items-center justify-center shadow-xl shadow-rose-950">
            <img 
              src="/Ragnarok.png" 
              alt="Ragnarok Master Panel Logo" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Ragnarok</h1>
        <p className="text-xs text-rose-400 font-semibold tracking-widest mt-1">MASTER PANEL // CONTROL ABSOLUTO</p>

        <p className="text-slate-400 text-sm mt-6 mb-8">
          Panel exclusivo para el administrador maestro. Inicia sesión con tu cuenta autorizada para acceder al ecosistema Valhalla.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.35 7.22 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.12 0 9.87 0 11.7s.43 3.58 1.19 5.12l4.09-2.55z"/>
            <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.17 2.65 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          {loading ? 'Verificando credenciales...' : 'Iniciar sesión con Google'}
        </button>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Acceso cifrado y seguro Firebase Auth</span>
        </div>
      </motion.div>
    </div>
  );
};