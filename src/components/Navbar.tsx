import React, { useState, useRef } from 'react';
import { Bell, Menu, X, LogOut, Download } from 'lucide-react';
import { UserProfile, AppNotification } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { usePWAInstall } from './usePWAInstall';

interface NavbarProps {
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenAdminPlatform?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onOpenAuthModal, 
  activeTab, 
  setActiveTab, 
  onLogout,
  onOpenAdminPlatform
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(dbStore.getNotifications());
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Secret click counter on logo to access /admin if needed
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

  const { isInstallable, isInstalled, install, markAsInstalled } = usePWAInstall();

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

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        window.dispatchEvent(new CustomEvent('open_pwa_install_guide'));
      }
    } else {
      window.dispatchEvent(new CustomEvent('open_pwa_install_guide'));
    }
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
          
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleSecretLogoClick}>
            <img src="/logo-192.png" alt="HOFANTRANO" className="w-8 h-8 rounded-lg shadow-sm md:hidden" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Madagasikara
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-none mt-0.5 md:hidden">HOFANTRANO</h2>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* PWA INSTALL BUTTON - DISAPPEARS COMPLETELY WHEN INSTALLED */}
          {!isInstalled && (
            <div className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-900/20 overflow-hidden">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 hover:bg-emerald-700/50 text-white text-xs font-bold transition active:scale-95"
                title="Installer l'application HOFANTRANO"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
                <span>Installer</span>
              </button>
              <button
                onClick={() => markAsInstalled()}
                className="px-2 py-1.5 sm:py-2 text-white/70 hover:text-white hover:bg-white/20 transition border-l border-white/20"
                title="Efa nanao installation (Esory ity)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
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

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2 pl-2 sm:pl-3 py-1 sm:py-1.5 pr-2.5 sm:pr-3.5 border border-slate-200 rounded-full bg-slate-50">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.fullName}</p>
              <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
                {currentUser.role === 'TOMPO_TRANO' ? 'Tompo-trano (Admin)' : 'Mpanofa'}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold shadow-xs transition"
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
