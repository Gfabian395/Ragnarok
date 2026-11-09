import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Zap, DollarSign, AlertTriangle, Calendar, MessageCircle, Power, BellRing, Clock, ShieldAlert } from 'lucide-react';
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

  // Cálculos analíticos y métricas de tiempo
  const activeCount = tenants.filter(t => t.isActive).length;
  const totalRevenue = tenants.reduce((acc, t) => acc + (t.isActive ? Number(t.price || 0) : 0), 0);
  
  const today = new Date();

  // Procesar métricas avanzadas para cada local
  const tenantsWithMetrics = tenants.map(tenant => {
    let diffDays = 999;
    let isUrgent = false;
    let daysLeftForDeletion = 60; // Cuenta regresiva de 60 días para baja definitiva

    if (tenant.dueDate && tenant.dueDate !== "A coordinar") {
      const parts = tenant.dueDate.split('/');
      if (parts.length === 3) {
        const due = new Date(parts[2], parts[1] - 1, parts[0]);
        const diffTime = due - today;
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isUrgent = diffDays <= 5; // Vence en 5 días o ya pasó

        // Si está inactivo, calculamos la cuenta regresiva de los 60 días desde el vencimiento
        if (!tenant.isActive) {
          const daysSinceDue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          daysLeftForDeletion = Math.max(0, 60 - daysSinceDue);
        }
      }
    }

    return {
      ...tenant,
      diffDays,
      isUrgent,
      daysLeftForDeletion
    };
  });

  // Clasificación para las 3 Alertas
  const pendingActivationList = tenantsWithMetrics.filter(t => !t.isActive && t.diffDays >= 0);
  const urgentTenants = tenantsWithMetrics.filter(t => t.isUrgent && t.isActive);
  const bajaPorFaltaDePagoList = tenantsWithMetrics.filter(t => !t.isActive && t.diffDays < 0);

  const pendingCount = tenantsWithMetrics.filter(t => !t.isActive).length;

  // Filtrado final para la tabla
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
    { title: 'Locales Activos / Total', value: `${activeCount} / ${tenants.length}`, icon: Store, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Recaudación Estimada', value: `$${totalRevenue.toLocaleString('es-AR')}`, icon: DollarSign, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Suspendidos / Pendientes', value: pendingCount, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Sistemas Conectados', value: 'Store, Express, Service', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* 3 ALERTAS GIGANTES E INDEPENDIENTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alerta 1: Pendiente de Activación */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer flex items-center gap-4 ${
            statusFilter === 'pending' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-amber-500/50'
          }`}
        >
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerta 1</span>
            <h4 className="text-lg font-black text-white">{pendingActivationList.length} Pendiente(s) de Activación</h4>
            <p className="text-xs text-amber-300 mt-0.5">Clic para filtrar solicitudes nuevas</p>
          </div>
        </div>

        {/* Alerta 2: Pago Próximoseándose / Vencido */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'urgent' ? 'all' : 'urgent')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer flex items-center gap-4 ${
            statusFilter === 'urgent' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50'
          }`}
        >
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerta 2</span>
            <h4 className="text-lg font-black text-white">{urgentTenants.length} Pago(s) Próximo(s)</h4>
            <p className="text-xs text-indigo-300 mt-0.5">Vencen en los próximos 5 días</p>
          </div>
        </div>

        {/* Alerta 3: Baja por Falta de Pago (Cuenta Regresiva 60 Días) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')}
          className={`glass-card p-5 rounded-2xl border transition cursor-pointer flex items-center gap-4 ${
            statusFilter === 'suspended' ? 'border-rose-500 bg-rose-500/20' : 'border-white/10 hover:border-rose-500/50'
          }`}
        >
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerta 3</span>
            <h4 className="text-lg font-black text-white">{bajaPorFaltaDePagoList.length} Baja por Falta de Pago</h4>
            <p className="text-xs text-rose-300 mt-0.5">En cuenta regresiva de 60 días</p>
          </div>
        </div>
      </div>

      {/* Bienvenida */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-3xl font-black text-white tracking-tight">Centro de Mando // Ragnarok</h2>
        <p className="text-slate-400 mt-2 max-w-xl">
          Panel maestro de control absoluto. Administra aprobaciones, plazos de gracia por baja y accesos de cada sucursal.
        </p>
      </motion.div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-white">{loading ? '...' : stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selector de Pestañas y Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Service', 'Express', 'Store'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'Todas las Sucursales' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {statusFilter !== 'all' && (
            <button 
              onClick={() => setStatusFilter('all')}
              className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition cursor-pointer"
            >
              Filtro Activo: {statusFilter} (Limpiar ✕)
            </button>
          )}
          <button 
            onClick={loadData} 
            className="text-xs text-rose-400 font-semibold uppercase bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition cursor-pointer"
          >
            🔄 Sincronizar Firebase
          </button>
        </div>
      </div>

      {/* Lista / Tabla de Locales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-white/10"
      >
        {loading ? (
          <div className="text-center py-16 text-slate-400">Sincronizando bases de datos...</div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No hay comercios que coincidan con los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-4">Local / Negocio</th>
                  <th className="pb-4">Variante</th>
                  <th className="pb-4">Dueño</th>
                  <th className="pb-4">Fecha Alta</th>
                  <th className="pb-4">Próximo Pago</th>
                  <th className="pb-4">Observación / Estado</th>
                  <th className="pb-4">WhatsApp</th>
                  <th className="pb-4 text-right">Interruptor Ragnarok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/2 transition">
                    <td className="py-4 font-bold text-white">
                      {tenant.name}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        tenant.type === 'Service' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        tenant.type === 'Express' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {tenant.type}
                      </span>
                    </td>
                    <td className="py-4 text-slate-300">{tenant.owner}</td>
                    <td className="py-4 text-slate-300 text-xs">
                      {tenant.createdAt}
                    </td>
                    <td className="py-4 text-rose-400 font-semibold text-xs">
                      {tenant.dueDate}
                    </td>
                    <td className="py-4">
                      {tenant.isActive ? (
                        <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          Operativo
                        </span>
                      ) : tenant.diffDays >= 0 ? (
                        <span className="text-amber-300 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          ⏳ Pendiente de Activación
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-rose-400 text-[11px] font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20 w-fit">
                            🔴 Baja por Falta de Pago
                          </span>
                          <span className="text-rose-300 text-[10px] font-medium">
                            ⏱️ Cuenta regresiva: <strong>{tenant.daysLeftForDeletion} días</strong> para borrado de base de datos
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      {tenant.phone ? (
                        <a 
                          href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(tenant.owner)},%20te%20escribo%20desde%20Ragnarok%20por%20la%20suscripción%20de%20tu%20sistema%20${tenant.type}.`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline text-xs font-medium flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" /> {tenant.phone}
                        </a>
                      ) : <span className="text-slate-500 text-xs">Sin teléfono</span>}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleToggle(tenant)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md ${
                          tenant.isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {tenant.isActive ? 'Activo (Apagar)' : 'Aprobar / Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};