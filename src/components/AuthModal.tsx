import React, { useState } from 'react';
import { KeyRound, Lock, User } from 'lucide-react';
import { AuthSession, dbStore, getCurrentSession, setCurrentSession } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionChange: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSessionChange }) => {
  const [session, setSession] = useState<AuthSession>(getCurrentSession());
  const [mode, setMode] = useState<'LOGIN_ADMIN' | 'LOGIN_TENANT'>('LOGIN_ADMIN');
  const [adminPin, setAdminPin] = useState('');
  const [tenantPin, setTenantPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = dbStore.getAdmin();
    if (adminPin === admin.pinCode) {
      const newSession: AuthSession = {
        isAuthenticated: true,
        role: 'TOMPO_TRANO',
        userId: 'admin-1',
        fullName: admin.adminName
      };
      setCurrentSession(newSession);
      onSessionChange(newSession);
      onClose();
    } else {
      setErrorMsg('Diso ny Code PIN Tompo-trano nampidirinao!');
    }
  };

  const handleTenantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const tenants = dbStore.getTenants();
    const tenant = tenants.find(t => t.pinCode === tenantPin);
    if (tenant) {
      const newSession: AuthSession = {
        isAuthenticated: true,
        role: 'MPANOFA',
        userId: tenant.id,
        fullName: tenant.fullName,
        tenantId: tenant.id
      };
      setCurrentSession(newSession);
      onSessionChange(newSession);
      onClose();
    } else {
      setErrorMsg('Tsy hita tao amin\'ny lisitra ny Code PIN an\'ny mpanofa nampidirinao.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
            H
          </div>
          <h3 className="text-xl font-black">HOFANTRANO</h3>
          <p className="text-xs text-emerald-400 mt-1 font-medium">Fidirana amin'ny Code PIN</p>
          {session.isAuthenticated && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">&times;</button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('LOGIN_ADMIN'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mode === 'LOGIN_ADMIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              Tompo-trano (Admin)
            </button>
            <button
              type="button"
              onClick={() => { setMode('LOGIN_TENANT'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mode === 'LOGIN_TENANT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              Mpanofa (PIN)
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'LOGIN_ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ampidiro ny Code PIN Tompo-trano (Default: 1234)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Ohatra: 1234"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-lg font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/25 transition"
              >
                Hiditra (Tompo-trano)
              </button>
            </form>
          )}

          {mode === 'LOGIN_TENANT' && (
            <form onSubmit={handleTenantLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ampidiro ny Code PIN an'ny Mpanofa
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Ohatra: 1234"
                    value={tenantPin}
                    onChange={(e) => setTenantPin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-lg font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Ny mpanofa dia mampiditra ny Code PIN nomena azy avy amin'ny Tompon-trano.</p>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/25 transition"
              >
                Fidiran'ny Mpanofa
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
