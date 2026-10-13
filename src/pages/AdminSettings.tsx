import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, KeyRound } from 'lucide-react';
import { dbStore } from '../lib/firebase';
import { AdminSettings as AdminSettingsType } from '../types';

export const AdminSettings: React.FC = () => {
  const [admin, setAdmin] = useState<AdminSettingsType>(dbStore.getAdmin());
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin && currentPin !== admin.pinCode) {
      setError('Diso ny Code PIN efa nisy teo aloha!');
      return;
    }

    const updated: AdminSettingsType = {
      ...admin,
      pinCode: newPin ? newPin : admin.pinCode
    };
    dbStore.saveAdmin(updated);
    if (newPin) dbStore.saveAdminPin(newPin);

    setAdmin(updated);
    setSuccess(true);
    setError('');
    setCurrentPin('');
    setNewPin('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mamorona Compte / Fanamarinana Tompo-trano</h1>
        <p className="text-sm text-slate-500">Ovay ny anaranao sy ny Code PIN fidiranao.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
          Voatahiry soa aman-tsara ny fanovana!
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anaran'ny Tompon-trano</label>
          <input
            type="text"
            value={admin.adminName}
            onChange={(e) => setAdmin({ ...admin, adminName: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Code PIN Taloha (Raha hanova PIN)</label>
          <input
            type="password"
            maxLength={6}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            placeholder="Ohatra: 1234"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Code PIN Vaovao</label>
          <input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Ohatra: 5678"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-700 bg-emerald-50"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/25 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Hitahiry ny Fanovana
        </button>
      </form>
    </div>
  );
};
