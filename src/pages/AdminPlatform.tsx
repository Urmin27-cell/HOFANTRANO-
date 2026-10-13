import React, { useState } from 'react';
import { Users, Building, Settings, DollarSign, Save } from 'lucide-react';
import { dbStore } from '../lib/firebase';
import { PaymentAccount, Tenant, Property } from '../types';
import { formatAr } from '../lib/formatters';

export const AdminPlatform: React.FC = () => {
  const [accounts, setAccounts] = useState<PaymentAccount>(dbStore.getPlatformAccount());
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  
  const [accNum, setAccNum] = useState(accounts.accountNumber);
  const [accName, setAccName] = useState(accounts.accountName);

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...accounts, accountNumber: accNum, accountName: accName };
    dbStore.savePlatformAccount(updated);
    setAccounts(updated);
    alert('Voatahiry!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Plateforme</h1>
      
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2"><DollarSign />Kaonty Fandoavana Defaut</h3>
        <form onSubmit={handleUpdateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" value={accNum} onChange={e=>setAccNum(e.target.value)} placeholder="Numéro" />
          <input className="border p-2 rounded" value={accName} onChange={e=>setAccName(e.target.value)} placeholder="Anarana" />
          <button className="bg-emerald-600 text-white p-2 rounded" type="submit"><Save /> Hitahiry</button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold mb-4">Lisitry ny Tompo-trano</h3>
          {/* Simplified representation for brevity */}
          <div className="text-sm">Misy Tompon-trano 1 voasoratra (Ramanantsoa Jean)</div>
        </div>
      </div>
    </div>
  );
};
