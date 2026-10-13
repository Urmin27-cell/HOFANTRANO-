/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProperties } from './pages/AdminProperties';
import { AdminTenants } from './pages/AdminTenants';
import { AdminAccounts } from './pages/AdminAccounts';
import { AdminVerification } from './pages/AdminVerification';
import { TenantDashboard } from './pages/TenantDashboard';
import { TenantPayment } from './pages/TenantPayment';
import { TenantReceipts } from './pages/TenantReceipts';
import { SharedRetard } from './pages/SharedRetard';
import { SharedHistorique } from './pages/SharedHistorique';
import { SharedNotifications } from './pages/SharedNotifications';
import { AdminPlatform } from './pages/AdminPlatform';
import { InstallPWA } from './components/InstallPWA';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getCurrentSession, setCurrentSession, AuthSession, dbStore, requestNotificationPermission } from './lib/firebase';

export default function App() {
  const [session, setSession] = useState<AuthSession>(getCurrentSession());
  const [activeTab, setActiveTab] = useState(session.role === 'MPANOFA' ? 'tenant-dashboard' : 'dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!session.isAuthenticated);
  
  // Track /admin platform route (Secret access via URL /admin or secret gesture)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(
    typeof window !== 'undefined' && (
      window.location.pathname === '/admin' || 
      window.location.hash === '#/admin' ||
      window.location.search.includes('admin')
    )
  );

  // Sync landlord from Firestore on startup & keep session permanently
  useEffect(() => {
    dbStore.syncFromFirestore().then((admin) => {
      if (admin && admin.isRegistered) {
        const ses = getCurrentSession();
        setSession(ses);
        setIsAuthModalOpen(false);
      }
    });

    if (session.isAuthenticated) {
      requestNotificationPermission(session.userId);
    }
  }, []);

  // Listen to browser URL changes for secret /admin route
  useEffect(() => {
    const handlePopState = () => {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.hash === '#/admin';
      setIsPlatformAdmin(isPathAdmin);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleOpenAdminPlatform = () => {
    setIsPlatformAdmin(true);
    try {
      window.history.pushState({}, '', '/admin');
    } catch (e) {}
  };

  const handleBackFromAdminPlatform = () => {
    setIsPlatformAdmin(false);
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {}
  };

  const handleLogout = () => {
    const admin = dbStore.getAdmin();
    const loggedOutSession: AuthSession = {
      isAuthenticated: false,
      role: 'TOMPO_TRANO',
      userId: admin.id || 'admin-1',
      fullName: admin.adminName
    };
    setCurrentSession(loggedOutSession);
    setSession(loggedOutSession);
    setIsAuthModalOpen(true);
  };

  // If on /admin, show dedicated Secret Platform Administration
  if (isPlatformAdmin) {
    return <AdminPlatform onBackToApp={handleBackFromAdminPlatform} />;
  }

  const renderContent = () => {
    if (!session.isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-5">
          <img src="/logo-192.png" alt="HOFANTRANO" className="w-20 h-20 rounded-3xl shadow-xl border border-emerald-500/30" />
          <h2 className="text-2xl font-black text-slate-900">HOFANTRANO</h2>
          <p className="text-sm text-slate-600 max-w-md">
            Mila miditra (Connexion) amin'ny Code PIN ianao vao afaka mampiasa ny fampiharana.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/25 hover:bg-emerald-700 transition active:scale-95"
          >
            Sokafy ny Fidirana (Login PIN)
          </button>
        </div>
      );
    }

    if (session.role === 'MPANOFA') {
      switch (activeTab) {
        case 'tenant-dashboard': return <TenantDashboard />;
        case 'tenant-payment': return <TenantPayment />;
        case 'tenant-receipts': return <TenantReceipts />;
        case 'retard': return <SharedRetard />;
        case 'historique': return <SharedHistorique />;
        case 'notifications': return <SharedNotifications />;
        default: return <TenantDashboard />;
      }
    }

    // Admin view
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'properties': return <AdminProperties />;
      case 'tenants': return <AdminTenants />;
      case 'accounts': return <AdminAccounts />;
      case 'verification': return <AdminVerification />;
      case 'retard': return <SharedRetard />;
      case 'historique': return <SharedHistorique />;
      case 'notifications': return <SharedNotifications />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={session.role}
        onOpenAdminPlatform={handleOpenAdminPlatform}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar 
          currentUser={{
            id: session.userId,
            email: session.role === 'TOMPO_TRANO' ? 'admin@hofantrano.mg' : 'mpanofa@hofantrano.mg',
            fullName: session.fullName,
            role: session.role === 'TOMPO_TRANO' ? 'TOMPO_TRANO' : 'MPANOFA',
            createdAt: '2026-01-01'
          }} 
          onOpenAuthModal={() => setIsAuthModalOpen(true)} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenAdminPlatform={handleOpenAdminPlatform}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSessionChange={(newSes) => {
          setSession(newSes);
          setActiveTab(newSes.role === 'MPANOFA' ? 'tenant-dashboard' : 'dashboard');
        }}
      />
      
      <OfflineIndicator />
      <InstallPWA />
    </div>
  );
}
