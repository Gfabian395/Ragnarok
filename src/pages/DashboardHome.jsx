import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Zap, DollarSign, AlertTriangle, MessageCircle, Power, BellRing, Clock, ShieldAlert, TrendingUp } from 'lucide-react';
import { fetchAllTenants, toggleTenantStatus } from '../firebase/firebaseConfig';

export const DashboardHome = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'Service', 'Express', 'Store'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'pending', 'urgent', 'suspended'

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

  const activeCount = tenants.filter(t => t.isActive).length;
  const totalCobradoAltas = tenants.reduce((acc, t) => acc + (t.isActive ? Number(t.precioUnico || 0) : 0), 0);
  const totalMantenimientoMensual = tenants.reduce((acc, t) => acc + (t.isActive ? Number(t.mantenimientoMensual || 0) : 0), 0);
  
  const today = new Date();

  const tenantsWithMetrics = tenants.map(tenant => {
    let diffDays = 999;
    let isUrgent = false;
    let daysLeftForDeletion = 60;

    if (tenant.dueDate && tenant.dueDate !== "A coordinar") {
      const parts = tenant.dueDate.split('/');
      if (parts.length === 3) {
        const due = new Date(parts[2], parts[1] - 1, parts[0]);
        const diffTime = due - today;
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isUrgent = diffDays <= 5;

        if (!tenant.isActive) {
          const daysSinceDue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          daysLeftForDeletion = Math.max(0, 60 - daysSinceDue);
        }
      }
    }

    return { ...tenant, diffDays, isUrgent, daysLeftForDeletion };
  });

  const pendingActivationList = tenantsWithMetrics.filter(t => !t.isActive && t.diffDays >= 0);
  const urgentTenants = tenantsWithMetrics.filter(t => t.isUrgent && t.isActive);
  const bajaPorFaltaDePagoList = tenantsWithMetrics.filter(t => !t.isActive && t.diffDays < 0);
  const pendingCount = tenantsWithMetrics.filter(t => !t.isActive).length;

  const filteredTenants = tenantsWithMetrics.filter(t => {
    const matchesTab = activeTab === 'all' || t.type.toLowerCase() === activeTab.toLowerCase();
    if (!matchesTab) return false;

    if (statusFilter === 'active') return t.isActive;
    if (statusFilter === 'pending') return !t.isActive && t.diffDays >= 0;
    if (statusFilter === 'urgent') return t.isUrgent && t.isActive;
    if (statusFilter === 'suspended') return !t.isActive && t.diffDays < 0;

    return true;
  });

  const stats = [
    { title: 'Activos / Total', value: `${activeCount} / ${tenants.length}`, icon: Store, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Cobrado (Altas)', value: `$${totalCobradoAltas.toLocaleString('es-AR')}`, icon: DollarSign, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Mantenimiento /mes', value: `$${totalMantenimientoMensual.toLocaleString('es-AR')}`, icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { title: 'Pend / Suspendidos', value: pendingCount, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* 3 ALERTAS GIGANTES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`glass-card p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
            statusFilter === 'pending' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-amber-500/50'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Alerta 1</span>
            <h4 className="text-sm font-black text-white">{pendingActivationList.length} Pendiente(s)</h4>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'urgent' ? 'all' : 'urgent')}
          className={`glass-card p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
            statusFilter === 'urgent' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Alerta 2</span>
            <h4 className="text-sm font-black text-white">{urgentTenants.length} Pago(s) Próximo(s)</h4>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')}
          className={`glass-card p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
            statusFilter === 'suspended' ? 'border-rose-500 bg-rose-500/20' : 'border-white/10 hover:border-rose-500/50'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Alerta 3</span>
            <h4 className="text-sm font-black text-white">{bajaPorFaltaDePagoList.length} Baja por Pago</h4>
          </div>
        </div>
      </div>

      {/* Tarjetas Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 truncate">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-2">{loading ? '...' : stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Pestañas de filtrado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'Service', 'Express', 'Store'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab}
            </button>
          ))}
        </div>

        {statusFilter !== 'all' && (
          <button 
            onClick={() => setStatusFilter('all')}
            className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 w-fit cursor-pointer"
          >
            Filtro: {statusFilter} (Limpiar ✕)
          </button>
        )}
      </div>

      {/* DISEÑO RESPONSIVE HÍBRIDO */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Sincronizando bases de datos...</div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No hay comercios que mostrar.</div>
        ) : (
          <>
            {/* VISTA MÓVIL: Tarjetas Minimalistas Ultra Limpias */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredTenants.map((tenant) => (
                <div key={tenant.id} className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{tenant.name}</h3>
                      <p className="text-xs text-slate-400">{tenant.owner}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      tenant.type === 'Service' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      tenant.type === 'Express' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {tenant.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-slate-400">Próx. Pago: <strong className="text-rose-400">{tenant.dueDate}</strong></span>
                    {tenant.isActive ? (
                      <span className="text-emerald-400 font-semibold">● Operativo</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">● Pendiente</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                    {tenant.phone ? (
                      <a 
                        href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border border-emerald-500/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    ) : <span className="text-slate-500 text-xs">Sin tel</span>}

                    <button
                      onClick={() => handleToggle(tenant)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer ${
                        tenant.isActive 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {tenant.isActive ? 'Apagar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA ESCRITORIO: Tabla Clásica */}
            <div className="hidden md:block glass-card rounded-2xl p-6 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-4">Local / Negocio</th>
                      <th className="pb-4">Variante</th>
                      <th className="pb-4">Dueño</th>
                      <th className="pb-4">Próximo Pago</th>
                      <th className="pb-4">Estado</th>
                      <th className="pb-4">WhatsApp</th>
                      <th className="pb-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-white/2 transition">
                        <td className="py-4 font-bold text-white">{tenant.name}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                            tenant.type === 'Service' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            tenant.type === 'Express' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {tenant.type}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">{tenant.owner}</td>
                        <td className="py-4 text-rose-400 font-semibold text-xs">{tenant.dueDate}</td>
                        <td className="py-4">
                          {tenant.isActive ? (
                            <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">Operativo</span>
                          ) : (
                            <span className="text-amber-300 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">Pendiente</span>
                          )}
                        </td>
                        <td className="py-4">
                          {tenant.phone ? (
                            <a href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline text-xs flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" /> {tenant.phone}
                            </a>
                          ) : <span className="text-slate-500 text-xs">Sin teléfono</span>}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleToggle(tenant)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                              tenant.isActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            {tenant.isActive ? 'Apagar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};