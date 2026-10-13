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
import { InstallPWA } from './components/InstallPWA';
import { getCurrentSession, setCurrentSession, AuthSession, dbStore, requestNotificationPermission } from './lib/firebase';

export default function App() {
  const [session, setSession] = useState<AuthSession>(getCurrentSession());
  const [activeTab, setActiveTab] = useState(session.role === 'MPANOFA' ? 'tenant-dashboard' : 'dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!session.isAuthenticated);

  useEffect(() => {
    if (session.isAuthenticated) {
      requestNotificationPermission(session.userId);
    } else {
      setIsAuthModalOpen(true);
    }
  }, [session.isAuthenticated, session.userId]);

  const handleLogout = () => {
    const admin = dbStore.getAdmin();
    const loggedOutSession: AuthSession = {
      isAuthenticated: false,
      role: 'TOMPO_TRANO',
      userId: 'admin-1',
      fullName: admin.adminName
    };
    setCurrentSession(loggedOutSession);
    setSession(loggedOutSession);
    setIsAuthModalOpen(true);
  };

  const renderContent = () => {
    if (!session.isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Mila miditra (Connexion) ianao vao afaka mampiasa ny HOFANTRANO</h2>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition"
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

  const admin = dbStore.getAdmin();

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={session.role} />

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
      <InstallPWA />
    </div>
  );
}
