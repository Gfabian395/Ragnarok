import React from 'react';
import { Bell, ShieldCheck, Terminal, Menu } from 'lucide-react';

export const Navbar = ({ onToggleMobileSidebar }) => {
  return (
    <header className="h-20 glass-card border-b border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl glass-card text-slate-300 hover:text-white transition"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Terminal className="w-5 h-5 text-rose-500 hidden sm:block" />
        <span className="text-xs sm:text-sm font-semibold text-slate-300 truncate">
          Ecosistema Valhalla <span className="text-rose-500">//</span> Control Central
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Sistemas Operativos</span>
        </div>

        <button className="relative p-2 rounded-xl glass-card text-slate-300 hover:text-white hover:border-white/20 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/10">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center font-bold text-white shadow-md text-xs sm:text-sm">
            JE
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold text-white">Jefe Supremo</p>
            <p className="text-xs text-slate-400">gfabian395@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};