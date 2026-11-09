import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Clock, Send } from 'lucide-react';
import { fetchAllTenants } from '../firebase/firebaseConfig';

export const PaymentsLedger = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAllTenants();
      setTenants(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Cobros & Suscripciones</h2>
          <p className="text-slate-400 text-sm mt-1">Supervisa montos y envía recordatorios o links de pago por WhatsApp.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Cargando suscripciones...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-4">Local</th>
                  <th className="pb-4">Variante</th>
                  <th className="pb-4">Dueño</th>
                  <th className="pb-4">Monto Mensual</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4 text-right">Acciones de Cobro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/2 transition">
                    <td className="py-4 font-semibold text-white">{tenant.name}</td>
                    <td className="py-4 text-slate-300 uppercase text-xs">{tenant.type}</td>
                    <td className="py-4 text-slate-300">{tenant.owner}</td>
                    <td className="py-4 text-emerald-400 font-bold">${tenant.price?.toLocaleString('es-AR') || '20.000'}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        tenant.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {tenant.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {tenant.isActive ? 'Al Día' : 'Pendiente / Suspendido'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {tenant.phone && (
                        <a
                          href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(tenant.owner)},%20te%20escribo%20para%20coordinar%20el%20pago%20mensual%20de%20tu%20sistema%20${tenant.type}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/30 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Cobrar por WhatsApp</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};