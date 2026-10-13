import React from 'react';
import { 
  Building, Users, CreditCard, CheckCircle2, History, 
  Bell, LayoutDashboard, ShieldCheck, Wallet, Receipt, AlertTriangle, Home, Shield
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onOpenAdminPlatform: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, onOpenAdminPlatform }) => {
  const adminMenuItems = [
    { id: 'dashboard', label: '1. Tableau de Bord', icon: LayoutDashboard },
    { id: 'properties', label: '2. Trano Ahofa', icon: Building },
    { id: 'tenants', label: '3. Mpanofa Trano', icon: Users },
    { id: 'accounts', label: '4. Kaonty Fandoavana', icon: CreditCard },
    { id: 'verification', label: '5. Vérification Paiement', icon: CheckCircle2 },
    { id: 'retard', label: 'HOFANTRANO Retard', icon: AlertTriangle },
    { id: 'historique', label: 'Historique (Rehetra)', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const tenantMenuItems = [
    { id: 'tenant-dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'tenant-payment', label: '1. Option Paiement', icon: Wallet },
    { id: 'tenant-receipts', label: '2. Reçu du Paiement', icon: Receipt },
    { id: 'retard', label: 'HOFANTRANO Retard', icon: AlertTriangle },
    { id: 'historique', label: 'Historique (Anao)', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const items = role === 'TOMPO_TRANO' ? adminMenuItems : tenantMenuItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl shrink-0 hidden md:flex">
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <img 
          src="/logo-192.png" 
          alt="HOFANTRANO" 
          className="w-10 h-10 rounded-xl shadow-lg border border-emerald-500/30 shrink-0" 
        />
        <div>
          <h1 className="text-white font-bold text-lg tracking-wider">HOFANTRANO</h1>
          <p className="text-[11px] text-emerald-400 font-medium">Fitantanana Trano</p>
        </div>
      </div>

      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Area with Profile & Admin Platform Link */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <button
          onClick={onOpenAdminPlatform}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold">Admin Plateforme</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
            /admin
          </span>
        </button>

        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-white truncate">
              {role === 'TOMPO_TRANO' ? 'Tompo-trano (Admin)' : 'Mpanofa'}
            </p>
            <p className="text-[9px] text-emerald-400 font-mono">Malagasy Ariary (Ar)</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
