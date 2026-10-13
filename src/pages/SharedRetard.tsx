import React, { useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { Tenant, Property, PaymentSubmission } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';

export const SharedRetard: React.FC = () => {
  const session = getCurrentSession();
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [submissions] = useState<PaymentSubmission[]>(dbStore.getSubmissions());
  const [search, setSearch] = useState('');

  const today = new Date();

  // Calculate overdue / late calculation based on 30-day cycles from startDate
  const getTenantRetards = (tenant: Tenant) => {
    const entryDate = new Date(tenant.startDate);
    if (isNaN(entryDate.getTime())) return [];

    const diffTime = today.getTime() - entryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalCyclesExpected = Math.max(0, Math.floor(diffDays / 30));

    // Count how many verified payments this tenant has
    const tenantPaidCount = submissions.filter(s => s.tenantId === tenant.id && s.status === 'VOALOA').length;

    const unpaidCycles = Math.max(0, totalCyclesExpected - tenantPaidCount);
    const retardsList = [];

    for (let i = 1; i <= unpaidCycles; i++) {
      const cycleDueDate = new Date(entryDate.getTime() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      retardsList.push({
        cycleId: i,
        dueDate: cycleDueDate,
        amount: tenant.monthlyRent,
        tenant,
        property: properties.find(p => p.id === tenant.propertyId)
      });
    }

    return retardsList;
  };

  const allRetards = tenants.flatMap(t => {
    if (session.role === 'MPANOFA' && t.id !== session.tenantId) return [];
    return getTenantRetards(t);
  });

  const filtered = allRetards.filter(r => 
    r.tenant.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (r.property && r.property.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">HOFANTRANO Retard (Tara Fandoavana)</h1>
        <p className="text-sm text-slate-500">
          {session.role === 'TOMPO_TRANO' ? 'Ireo tara fandoavana rehetra kajiana ho azy isaky ny 30 andro.' : 'Ny tara fandoavanao raha misy.'}
        </p>
      </div>

      {session.role === 'TOMPO_TRANO' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Mitady mpanofa, trano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center text-sm font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emerald-600" />
          Tsy misy tara fandoavana aloha. Ara-potoana avy hatrany ny fandoavana rehetra!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-4 font-semibold">Mpanofa</th>
                  <th className="p-4 font-semibold">Trano Hofaina</th>
                  <th className="p-4 font-semibold">Daty Tokony Nandoavana</th>
                  <th className="p-4 font-semibold text-center">Sata</th>
                  <th className="p-4 font-semibold text-right">Vola Tara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{r.tenant.fullName}</td>
                    <td className="p-4 text-slate-600">{r.property?.name} ({r.property?.code})</td>
                    <td className="p-4 text-slate-600">{formatDate(r.dueDate)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Tara Fandoavana
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600">{formatAr(r.amount)}</td>
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
