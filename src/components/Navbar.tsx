import React, { useState } from 'react';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import { UserProfile, AppNotification } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';

interface NavbarProps {
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onOpenAuthModal, activeTab, setActiveTab, onLogout }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(dbStore.getNotifications());
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const session = getCurrentSession();
  const userNotifs = session.role === 'MPANOFA' 
    ? notifications.filter(n => n.userId === session.tenantId) 
    : notifications;

  const unreadCount = userNotifs.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => {
      if (session.role === 'TOMPO_TRANO' || n.userId === session.tenantId) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    dbStore.saveNotifications(updated);
  };

  const menuItems = session.role === 'MPANOFA' ? [
    { id: 'tenant-dashboard', label: 'Tableau de Bord' },
    { id: 'tenant-payment', label: '1. Option Paiement' },
    { id: 'tenant-receipts', label: '2. Reçu du Paiement' },
    { id: 'retard', label: 'HOFANTRANO Retard' },
    { id: 'historique', label: 'Historique' },
    { id: 'notifications', label: 'Notifications' }
  ] : [
    { id: 'dashboard', label: '1. Tableau de Bord' },
    { id: 'properties', label: '2. Trano Ahofa' },
    { id: 'tenants', label: '3. Mpanofa Trano' },
    { id: 'accounts', label: '4. Kaonty Fandoavana' },
    { id: 'verification', label: '5. Vérification Paiement' },
    { id: 'retard', label: 'HOFANTRANO Retard' },
    { id: 'historique', label: 'Historique' },
    { id: 'notifications', label: 'Notifications' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Madagasikara
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5 md:hidden">HOFANTRANO</h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-emerald-600 hover:underline">
                      Voavaky daholo
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {userNotifs.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Tsy misy notification aloha</p>
                  ) : (
                    userNotifs.slice(0, 5).map(n => (
                      <div key={n.id} className={`p-3 text-xs ${!n.read ? 'bg-emerald-50/50' : ''}`}>
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pl-3 py-1.5 pr-4 border border-slate-200 rounded-full bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.fullName}</p>
              <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
                {currentUser.role === 'TOMPO_TRANO' ? 'Tompo-trano (Admin)' : 'Mpanofa'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold shadow-xs transition"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Mivoaka</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-slate-300 px-4 pt-2 pb-6 space-y-2 border-b border-slate-800">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === item.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
