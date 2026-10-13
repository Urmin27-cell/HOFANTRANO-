import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { AuthSession, setCurrentSession } from '../lib/firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionChange: (session: AuthSession) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSessionChange }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '080600') {
      const newSession: AuthSession = {
        isAuthenticated: true,
        role: 'ADMIN_PLATFORME',
        userId: 'admin-platform',
        fullName: 'Admin Plateforme'
      };
      setCurrentSession(newSession);
      onSessionChange(newSession);
      onClose();
    } else {
      setErrorMsg('Code PIN diso!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6">
        <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Admin Plateforme</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Ampidiro ny PIN"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-emerald-500"
            required
          />
          {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
            Hiditra
          </button>
        </form>
      </div>
    </div>
  );
};
