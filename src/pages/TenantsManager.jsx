import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Power, Store as StoreIcon, MessageCircle } from 'lucide-react';
import { fetchAllTenants, toggleTenantStatus } from '../firebase/firebaseConfig';

export const TenantsManager = () => {
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllTenants();
    setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (tenant) => {
    const success = await toggleTenantStatus(tenant.project, tenant.id, tenant.isActive);
    if (success) {
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, isActive: !t.isActive } : t));
    }
  };

  // Filtrar locales por nombre o dueño
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gestión Absoluta de Locales</h2>
          <p className="text-slate-400 text-sm mt-1">Controla en tiempo real los accesos y comunícate con cada cliente.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar comercio o dueño..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando comercios desde Firebase...</div>
      ) : filteredTenants.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl text-slate-400">No se encontraron locales que coincidan con la búsqueda.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTenants.map((tenant, index) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400">
                      <StoreIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{tenant.name}</h3>
                      <p className="text-xs text-slate-400">{tenant.owner} // {tenant.email || 'Sin email'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 uppercase tracking-wider">
                    {tenant.type}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${tenant.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                  <span className={`text-xs font-semibold ${tenant.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tenant.isActive ? 'Activo' : 'Suspendido'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {tenant.phone && (
                    <a
                      href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(tenant.owner)},%20te%20contacto%20desde%20Ragnarok.`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  {/* Interruptor Ragnarok */}
                  <button
                    onClick={() => handleToggle(tenant)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                      tenant.isActive
                        ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 shadow-rose-900/20'
                        : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 shadow-emerald-900/20'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{tenant.isActive ? 'Deshabilitar' : 'Activar'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};