import React from 'react';
import { Building, Users, Wallet, AlertTriangle } from 'lucide-react';
import { Property, Tenant, PaymentSubmission } from '../types';
import { dbStore } from '../lib/firebase';
import { formatAr } from '../lib/formatters';

export const AdminDashboard: React.FC = () => {
  const properties: Property[] = dbStore.getProperties();
  const tenants: Tenant[] = dbStore.getTenants();
  const submissions: PaymentSubmission[] = dbStore.getSubmissions();

  const totalProperties = properties.length;
  const vacantProperties = properties.filter(p => p.status === 'MALALAKA').length;
  const occupiedProperties = properties.filter(p => p.status === 'MISY_MPANOFA').length;
  const totalTenants = tenants.length;

  const totalPaid = submissions
    .filter(s => s.status === 'VOALOA')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalExpected = tenants.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalRemaining = Math.max(0, totalExpected - totalPaid);

  // Overdue count calculation
  const today = new Date();
  const overdueCount = tenants.reduce((count, tenant) => {
    const entryDate = new Date(tenant.startDate);
    if (isNaN(entryDate.getTime())) return count;
    const diffTime = today.getTime() - entryDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const totalCyclesExpected = Math.max(0, Math.floor(diffDays / 30));
    const tenantPaidCount = submissions.filter(s => s.tenantId === tenant.id && s.status === 'VOALOA').length;
    return count + Math.max(0, totalCyclesExpected - tenantPaidCount);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Tompo-trano • Tableau de Bord
          </span>
          <h1 className="text-3xl font-black mt-2">HOFANTRANO</h1>
          <p className="text-sm text-slate-300 mt-1">Fintina sy antontan'isa momba ny trano sy ny vola voaray.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-right">
          <p className="text-xs text-slate-300">Vola Efa Azo (Total Voaray):</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{formatAr(totalPaid)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Vola Efa Azo</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{formatAr(totalPaid)}</h3>
            <p className="text-xs text-slate-500 mt-1">Voamarina</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Vola Tsy Azo</p>
            <h3 className="text-xl font-black text-rose-600 mt-1">{formatAr(totalRemaining)}</h3>
            <p className="text-xs text-slate-500 mt-1">Sisa andrasana</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Mpanofa Trano</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{totalTenants}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Mavitrika</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Trano Libre</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{vacantProperties}</h3>
            <p className="text-xs text-slate-500 mt-1">Malalaka</p>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Trano Occupé</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{occupiedProperties}</h3>
            <p className="text-xs text-slate-500 mt-1">Misy mpanofa</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
