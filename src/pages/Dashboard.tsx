import React from 'react';
import { 
  Building, Users, CreditCard, AlertTriangle, ArrowUpRight, 
  CheckCircle, Clock, Wallet, FileText 
} from 'lucide-react';
import { db } from '../lib/supabase';
import { formatAr } from '../lib/formatters';

export const Dashboard: React.FC = () => {
  const properties = db.getProperties();
  const tenants = db.getTenants();
  const invoices = db.getInvoices();
  const payments = db.getPayments();

  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'MISY_MPANOFA').length;
  const vacantProperties = properties.filter(p => p.status === 'MALALAKA').length;
  const totalTenants = tenants.length;

  const totalExpectedRent = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRemaining = invoices.reduce((sum, i) => sum + i.remainingAmount, 0);
  const overdueCount = invoices.filter(i => i.status === 'TARA_FANDOAVANA').length;

  const recentPayments = payments.slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Madagasikara • Ar
          </span>
          <h1 className="text-2xl font-black mt-2">Tontolon'ny Fitantanana - HOFANTRANO</h1>
          <p className="text-sm text-slate-300 mt-1">Araho mora foana ny trano, mpanofa, hofan-trano ary fandoavam-bola.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-right">
          <p className="text-xs text-slate-300">Vola Voaray Tontolo:</p>
          <p className="text-xl font-bold text-emerald-400">{formatAr(totalPaid)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Trano Rehetra</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalProperties}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{occupiedProperties} misy mpanofa • {vacantProperties} malalaka</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Mpanofa Mavitrika</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalTenants}</h3>
            <p className="text-xs text-blue-600 mt-1 font-medium">Mifanaraka tsara</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Vola Sisa Tsy Voaloa</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatAr(totalRemaining)}</h3>
            <p className="text-xs text-rose-500 mt-1 font-medium">{overdueCount} tara fandoavana</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Hofan-trano Voaray</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatAr(totalPaid)}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Tontalin'ny vola voaray</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Fandoavam-bola Farany
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-semibold">Daty</th>
                  <th className="pb-3 font-semibold">Fomba</th>
                  <th className="pb-3 font-semibold">Référence</th>
                  <th className="pb-3 font-semibold text-right">Vola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-600">{p.paymentDate}</td>
                    <td className="py-3 font-medium text-slate-800">{p.paymentMethod}</td>
                    <td className="py-3 text-slate-500 font-mono">{p.reference || '-'}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{formatAr(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Factures Farany
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-semibold">Laharana</th>
                  <th className="pb-3 font-semibold">Volana</th>
                  <th className="pb-3 font-semibold">Sata</th>
                  <th className="pb-3 font-semibold text-right">Vola Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-800 font-mono">{inv.invoiceNumber}</td>
                    <td className="py-3 text-slate-600">{inv.month}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        inv.status === 'VOALOA_TANTERAKA' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'VOALOA_AMPALAHANY' ? 'bg-amber-100 text-amber-800' :
                        inv.status === 'TARA_FANDOAVANA' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatAr(inv.remainingAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
