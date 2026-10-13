import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCcw } from 'lucide-react';
import { db } from '../lib/supabase';
import { AppSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settings);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleResetDemo = () => {
    if (window.confirm('Tena hiverina amin\'ny angona fanombohana (demo data) ve ianao? Ho soloina daholo ny fanovana nataonao.')) {
      db.resetDemoData();
      setSettings(db.getSettings());
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fanamarinana & Settings</h1>
        <p className="text-sm text-slate-500">Ireo fanamboarana ankapobeny ho an'ny tompon-trano sy ny orinasa.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
          Voatahiry soa aman-tsara ny fanovana!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Anaran'ny Tompon-trano</label>
            <input
              type="text"
              value={settings.landlordName}
              onChange={(e) => setSettings({ ...settings, landlordName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Anaran'ny Agence / Orinasa</label>
            <input
              type="text"
              value={settings.agencyName || ''}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Adiresy</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Finday</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Mailaka (Email)</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Antsipiriany Banky (RIB)</label>
          <input
            type="text"
            value={settings.bankDetails || ''}
            onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Antsipiriany Mobile Money (MVola / Orange / Airtel)</label>
          <input
            type="text"
            value={settings.mobileMoneyDetails || ''}
            onChange={(e) => setSettings({ ...settings, mobileMoneyDetails: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCcw className="w-4 h-4" /> Hamerina ny Demo Data
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Hitahirina ny Fanovana
          </button>
        </div>
      </form>
    </div>
  );
};
