import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchAllTenants } from '../firebase/firebaseConfig';

export const TenantDetail = () => {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllTenants();
      const found = data.find(t => t.id === id);
      setTenant(found);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8 text-sm">Cargando detalles del local...</div>;
  if (!tenant) return <div className="text-rose-400 p-8 text-sm">No se encontró el comercio especificado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tenants" className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{tenant.name}</h2>
          <p className="text-slate-400 text-xs">Detalle de registro en base de datos Firebase ({tenant.project})</p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Dueño / Encargado</span>
          <p className="text-base sm:text-lg font-bold text-white">{tenant.owner}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Variante Valhalla</span>
          <p className="text-base sm:text-lg font-bold text-rose-400 uppercase">{tenant.type}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">WhatsApp de Contacto</span>
          <p className="text-base sm:text-lg font-bold text-emerald-400">{tenant.phone || 'No registrado'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Correo Electrónico</span>
          <p className="text-sm font-semibold text-slate-200 truncate">{tenant.email || 'No registrado'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Estado del Sistema</span>
          <p className={`text-sm font-bold ${tenant.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {tenant.isActive ? 'Activo (Operativo)' : 'Suspendido (Bloqueado)'}
          </p>
        </div>
      </div>
    </div>
  );
};