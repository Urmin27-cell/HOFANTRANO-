import React, { useRef } from 'react';
import { 
  Building, Users, CreditCard, CheckCircle2, History, 
  Bell, LayoutDashboard, ShieldCheck, Wallet, Receipt, AlertTriangle, Home
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onOpenAdminPlatform?: () => void;
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

  const secretClickCount = useRef(0);
  const secretClickTimer = useRef<any>(null);

  const handleSecretLogoClick = () => {
    secretClickCount.current += 1;
    if (secretClickTimer.current) clearTimeout(secretClickTimer.current);
    secretClickTimer.current = setTimeout(() => {
      secretClickCount.current = 0;
    }, 2500);

    if (secretClickCount.current >= 5) {
      secretClickCount.current = 0;
      if (onOpenAdminPlatform) onOpenAdminPlatform();
      else window.location.href = '/admin';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl shrink-0 hidden md:flex">
      <div 
        className="p-5 border-b border-slate-800 flex items-center space-x-3 cursor-pointer select-none"
        onClick={handleSecretLogoClick}
      >
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

      {/* Footer Area with Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
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
