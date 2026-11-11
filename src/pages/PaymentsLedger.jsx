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
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cobros & Suscripciones</h2>
        <p className="text-slate-400 text-sm mt-1">Supervisa montos y envía recordatorios o links de pago por WhatsApp.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando suscripciones...</div>
      ) : tenants.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl text-slate-400 text-sm">No hay suscripciones registradas.</div>
      ) : (
        <>
          {/* VISTA MÓVIL: Tarjetas Minimalistas */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{tenant.name}</h3>
                    <p className="text-xs text-slate-400">{tenant.owner}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                    {tenant.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-slate-400">Mensualidad: <strong className="text-emerald-400">${tenant.mantenimientoMensual?.toLocaleString('es-AR') || '40.000'}</strong></span>
                  <span className={`font-semibold ${tenant.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tenant.isActive ? '● Al Día' : '● Pendiente'}
                  </span>
                </div>

                {tenant.phone && (
                  <div className="pt-2 border-t border-white/5">
                    <a
                      href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(tenant.owner)},%20te%20escribo%20para%20coordinar%20el%20pago%20mensual%20de%20tu%20sistema%20${tenant.type}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Cobrar por WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* VISTA ESCRITORIO: Tabla Clásica */}
          <div className="hidden md:block glass-card rounded-2xl p-6 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto w-full">
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
                      <td className="py-4 text-emerald-400 font-bold">
                        ${tenant.mantenimientoMensual?.toLocaleString('es-AR') || '40.000'}
                      </td>
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
          </div>
        </>
      )}
    </div>
  );
};