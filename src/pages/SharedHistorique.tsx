import React, { useState } from 'react';
import { History, Search } from 'lucide-react';
import { PaymentSubmission, Tenant, Property } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';

export const SharedHistorique: React.FC = () => {
  const session = getCurrentSession();
  const [submissions] = useState<PaymentSubmission[]>(dbStore.getSubmissions());
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [search, setSearch] = useState('');

  const list = session.role === 'TOMPO_TRANO' 
    ? submissions 
    : submissions.filter(s => s.tenantId === session.tenantId);

  const filtered = list.filter(s => {
    const ten = tenants.find(t => t.id === s.tenantId);
    return (ten && ten.fullName.toLowerCase().includes(search.toLowerCase())) ||
           s.reference.toLowerCase().includes(search.toLowerCase());
  });

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || 'Mpanofa';
  const getPropName = (id: string) => properties.find(p => p.id === id)?.name || 'Trano';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Historique des Paiements</h1>
        <p className="text-sm text-slate-500">
          {session.role === 'TOMPO_TRANO' ? 'Tantaran\'ny fandoavam-bola rehetra avy amin\'ny mpanofa.' : 'Tantaran\'ny fandoavam-bola nataonao.'}
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mitady mpanofa, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy mbola misy tantara fandoavana aloha.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-4 font-semibold">Daty</th>
                  {session.role === 'TOMPO_TRANO' && <th className="p-4 font-semibold">Mpanofa</th>}
                  <th className="p-4 font-semibold">Trano</th>
                  <th className="p-4 font-semibold">Référence</th>
                  <th className="p-4 font-semibold text-center">Sata</th>
                  <th className="p-4 font-semibold text-right">Vola Naloa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-600">{formatDate(s.paymentDate)}</td>
                    {session.role === 'TOMPO_TRANO' && <td className="p-4 font-semibold text-slate-900">{getTenantName(s.tenantId)}</td>}
                    <td className="p-4 text-slate-600">{getPropName(s.propertyId)}</td>
                    <td className="p-4 font-mono text-slate-500">{s.reference}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.status === 'VOALOA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status === 'VOALOA' ? 'Nankatoavina' : 'Miandry Fanamarinana'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">{formatAr(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
