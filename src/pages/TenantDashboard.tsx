import React, { useState } from 'react';
import { Home, Wallet, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { Tenant, Property, PaymentSubmission } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';

export const TenantDashboard: React.FC = () => {
  const session = getCurrentSession();
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [submissions] = useState<PaymentSubmission[]>(dbStore.getSubmissions());

  const tenant = tenants.find(t => t.id === session.tenantId);
  const property = properties.find(p => p.id === tenant?.propertyId);

  const tenantSubs = submissions.filter(s => s.tenantId === session.tenantId && s.status === 'VOALOA');
  const totalPaid = tenantSubs.reduce((sum, s) => sum + s.amount, 0);

  // 30-day calculation from startDate
  const today = new Date();
  const entryDate = tenant ? new Date(tenant.startDate) : new Date();
  const diffTime = today.getTime() - entryDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const totalCyclesExpected = Math.max(0, Math.floor(diffDays / 30));
  const unpaidCyclesCount = Math.max(0, totalCyclesExpected - tenantSubs.length);
  const unpaidAmount = unpaidCyclesCount * (tenant?.monthlyRent || 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Mpanofa • Tableau de Bord
          </span>
          <h1 className="text-3xl font-black mt-2">Miarahaba anao, {tenant?.fullName}</h1>
          <p className="text-sm text-slate-300 mt-1">Jereo eto ny mombamomba ny trano hofainao sy ny fandoavam-bolanao.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-right">
          <p className="text-xs text-slate-300">Vola Efa Naloa Tontolo:</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{formatAr(totalPaid)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Trano Hofaina</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{property?.name || 'Tsy misy'}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{property?.address} ({property?.zone})</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Vola Volana (Par mois)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatAr(tenant?.monthlyRent || 0)}</h3>
            <p className="text-xs text-slate-500 mt-1">Isaky ny 30 andro</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Volana Mbola Tsy Voahefa</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{unpaidCyclesCount} cycle(s)</h3>
            <p className="text-xs text-rose-500 mt-1 font-medium">{formatAr(unpaidAmount)} trosa</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Fampahalalana 30 Andro (Calcul Automatique)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Niditra tamin'ny <strong>{formatDate(tenant?.startDate || '')}</strong> ianao. Ny rafitra dia manao kaonty mandeha ho azy isaky ny 30 andro ho an'ny fandoavana ny hofan-trano, ary mandefa fampahatsiahivana (notification) amin'ny fotoana tokony handoavanao azy.
        </p>
      </div>
    </div>
  );
};
