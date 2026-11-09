import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, CreditCard, LogOut } from 'lucide-react';

export const Sidebar = ({ onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Locales / Tenants', path: '/tenants', icon: Store },
    { name: 'Cobros & Suscripciones', path: '/payments', icon: CreditCard },
  ];

  return (
    <aside className="w-64 glass-card border-r border-white/10 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        {/* Header del Sidebar */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border border-rose-500/20 p-1">
            <img 
              src="/Ragnarok.png" 
              alt="Ragnarok Master Panel Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white uppercase">Ragnarok</h1>
            <p className="text-xs text-rose-400 font-medium tracking-widest">MASTER PANEL</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-950'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer del Sidebar con el botón de Cerrar Sesión */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-xs font-semibold text-white">Modo Administrador</p>
            <p className="text-[10px] text-slate-400">Control Total Activo</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};