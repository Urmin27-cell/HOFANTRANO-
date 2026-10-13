import React, { useState, useEffect } from 'react';
import { KeyRound, Lock, User, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { AuthSession, dbStore, getCurrentSession, setCurrentSession } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionChange: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSessionChange }) => {
  const [adminProfile, setAdminProfile] = useState(dbStore.getAdmin());
  const isRegistered = Boolean(adminProfile && adminProfile.isRegistered);

  const [session, setSession] = useState<AuthSession>(getCurrentSession());
  const [mode, setMode] = useState<'LOGIN_ADMIN' | 'LOGIN_TENANT' | 'REGISTER_ADMIN'>(
    isRegistered ? 'LOGIN_ADMIN' : 'LOGIN_ADMIN' // Default to PIN login even if first check, with option to register
  );

  // If not registered and hasn't selected another tab, allow switching
  useEffect(() => {
    const admin = dbStore.getAdmin();
    setAdminProfile(admin);
    if (!admin.isRegistered) {
      setMode('REGISTER_ADMIN');
    } else {
      setMode('LOGIN_ADMIN');
    }
  }, [isOpen]);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');

  // Login fields
  const [adminPin, setAdminPin] = useState('');
  const [tenantPin, setTenantPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regPin.trim()) {
      setErrorMsg('Fenoy tsara ny anarana, finday ary Code PIN.');
      return;
    }

    const saved = dbStore.saveAdmin({
      id: 'admin-1',
      adminName: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      pinCode: regPin.trim(),
      currency: 'Ar',
      isRegistered: true,
      registeredAt: new Date().toISOString()
    });

    const newSession: AuthSession = {
      isAuthenticated: true,
      role: 'TOMPO_TRANO',
      userId: 'admin-1',
      fullName: regName.trim()
    };
    setCurrentSession(newSession);
    setSession(newSession);
    onSessionChange(newSession);
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = dbStore.getAdmin();
    // Verify PIN against saved admin profile
    if (adminPin.trim() === admin.pinCode.trim() || (adminPin.trim() === '1234' && !admin.isRegistered)) {
      const newSession: AuthSession = {
        isAuthenticated: true,
        role: 'TOMPO_TRANO',
        userId: 'admin-1',
        fullName: admin.adminName || 'Tompon-trano'
      };
      // Mark as registered and persist session permanently
      dbStore.saveAdmin({ isRegistered: true });
      setCurrentSession(newSession);
      setSession(newSession);
      onSessionChange(newSession);
      onClose();
    } else {
      setErrorMsg('Diso ny Code PIN Tompo-trano nampidirinao!');
    }
  };

  const handleTenantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const tenants = dbStore.getTenants();
    const tenant = tenants.find(t => t.pinCode.trim() === tenantPin.trim());
    if (tenant) {
      const newSession: AuthSession = {
        isAuthenticated: true,
        role: 'MPANOFA',
        userId: tenant.id,
        fullName: tenant.fullName,
        tenantId: tenant.id
      };
      setCurrentSession(newSession);
      setSession(newSession);
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
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg mb-3">
            H
          </div>
          <h3 className="text-xl font-black">HOFANTRANO</h3>
          <p className="text-xs text-emerald-400 mt-1 font-medium">
            {mode === 'REGISTER_ADMIN' 
              ? 'Fisoratana ho an\'ny Tompo-trano' 
              : 'Fidirana amin\'ny Code PIN (Connexion)'}
          </p>
          {session.isAuthenticated && (
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg"
              title="Akatony"
            >
              &times;
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Main Navigation Tabs - Always accessible so no one is trapped */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => { setMode('LOGIN_ADMIN'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'LOGIN_ADMIN' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tompo-trano (PIN)
            </button>
            <button
              type="button"
              onClick={() => { setMode('LOGIN_TENANT'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'LOGIN_TENANT' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mpanofa (PIN)
            </button>
            {!isRegistered && (
              <button
                type="button"
                onClick={() => { setMode('REGISTER_ADMIN'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'REGISTER_ADMIN' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Hisoratra
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* MODE 1: REGISTER ADMIN (Only if explicitly selected or first time setup) */}
          {mode === 'REGISTER_ADMIN' ? (
            <form onSubmit={handleAdminRegister} className="space-y-4">
              <div className="text-center pb-1">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Hisoratra ho an'ny Tompo-trano
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anarana Feno</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ohatra: Jean Ramanantsoa"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Finday</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="034 12 345 67"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email (raha misy)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="admin@mail.mg"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mamorona Code PIN</label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="Ohatra: 1234"
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl text-lg font-mono tracking-widest font-bold text-emerald-700 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/25 transition active:scale-95"
              >
                Hisoratra Tompo-trano (Inscription)
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN_ADMIN'); setErrorMsg(''); }}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-medium"
                >
                  Efa manana kaonty? Hiditra amin'ny Code PIN
                </button>
              </div>
            </form>
          ) : mode === 'LOGIN_ADMIN' ? (
            /* MODE 2: LOGIN TOMPO-TRANO PIN */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Code PIN Tompo-trano
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Ampidiro ny PIN"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-lg font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/25 transition active:scale-95"
              >
                Hiditra (Tompo-trano)
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('REGISTER_ADMIN'); setErrorMsg(''); }}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Hanoratra kaonty Tompo-trano vaovao
                </button>
              </div>
            </form>
          ) : (
            /* MODE 3: LOGIN MPANOFA PIN */
            <form onSubmit={handleTenantLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Code PIN an'ny Mpanofa
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Ampidiro ny PIN"
                    value={tenantPin}
                    onChange={(e) => setTenantPin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-lg font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/25 transition active:scale-95"
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
