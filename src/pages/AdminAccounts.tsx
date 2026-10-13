import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit } from 'lucide-react';
import { PaymentAccount } from '../types';
import { dbStore } from '../lib/firebase';

export const AdminAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<PaymentAccount[]>(dbStore.getAccounts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);

  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankOrProvider, setBankOrProvider] = useState('MVola');

  const handleOpenAdd = () => {
    if (accounts.length >= 3) {
      alert('Afaka mampiditra kaonty hatramin\'ny telo (3) monja ianao araka ny toromarika.');
      return;
    }
    setEditing(null);
    setAccountNumber('');
    setAccountName('');
    setBankOrProvider('MVola');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const updated = accounts.map(a => a.id === editing.id ? { ...a, accountNumber, accountName, bankOrProvider } : a);
      setAccounts(updated);
      dbStore.saveAccounts(updated);
    } else {
      if (accounts.length >= 3) {
        alert('Tsy afaka mihoatra ny telo (3) ny kaonty.');
        return;
      }
      const newAcc: PaymentAccount = {
        id: `acc-${Date.now()}`,
        accountNumber,
        accountName,
        bankOrProvider
      };
      const updated = [...accounts, newAcc];
      setAccounts(updated);
      dbStore.saveAccounts(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tena te hamafa an\'ity kaonty ity ve ianao?')) {
      const updated = accounts.filter(a => a.id !== id);
      setAccounts(updated);
      dbStore.saveAccounts(updated);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Numéro de Compte du Paiement</h1>
          <p className="text-sm text-slate-500">Ampidiro eto ny kaonty fandoavam-bola (hatramin'ny telo).</p>
        </div>
        {accounts.length < 3 && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
          >
            <Plus className="w-5 h-5" /> Manampy Kaonty
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {acc.bankOrProvider}
              </span>
              <h3 className="font-bold text-lg text-slate-900 mt-3 font-mono">{acc.accountNumber}</h3>
              <p className="text-xs text-slate-500 mt-1">Anarana: {acc.accountName}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setEditing(acc);
                  setAccountNumber(acc.accountNumber);
                  setAccountName(acc.accountName);
                  setBankOrProvider(acc.bankOrProvider);
                  setIsModalOpen(true);
                }}
                className="p-2 text-slate-600 hover:text-emerald-600 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(acc.id)}
                className="p-2 text-slate-600 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">{editing ? 'Manova Kaonty' : 'Manampy Kaonty Fandoavana'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Karazana Kaonty (Banky / Mobile Money)</label>
                <select
                  value={bankOrProvider}
                  onChange={(e) => setBankOrProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="MVola">MVola</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="BNI Madagascar">BNI Madagascar</option>
                  <option value="BOA Madagascar">BOA Madagascar</option>
                  <option value="Societe Generale">Societe Generale</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Laharana (Numéro de compte)</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ohatra: 034 12 345 67"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anaran'ny Tompon'ny Kaonty</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ohatra: Jean Ramanantsoa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                >
                  Hanafoana
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Hitahirina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
