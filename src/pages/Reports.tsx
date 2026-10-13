import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { RentInvoice, Payment, Property, Tenant } from '../types';
import { db } from '../lib/supabase';
import { formatAr } from '../lib/formatters';

export const Reports: React.FC = () => {
  const [invoices] = useState<RentInvoice[]>(db.getInvoices());
  const [payments] = useState<Payment[]>(db.getPayments());
  const [properties] = useState<Property[]>(db.getProperties());
  const [tenants] = useState<Tenant[]>(db.getTenants());

  const totalExpected = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRemaining = invoices.reduce((sum, i) => sum + i.remainingAmount, 0);

  const exportCSV = () => {
    const headers = ['ID', 'Tenant', 'Amount', 'Date', 'Method'];
    const rows = payments.map(p => [
      p.id,
      tenants.find(t => t.id === p.tenantId)?.fullName || '',
      p.amount,
      p.paymentDate,
      p.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tatitra_Paiements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tatitra Ara-bola (Rapports Financiers)</h1>
          <p className="text-sm text-slate-500">Fintina sy tatitra feno momba ny vola miditra sy trosa.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> CSV Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Vola Tokony Ho Azo</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatAr(totalExpected)}</h3>
          <p className="text-xs text-slate-500 mt-1">Totalin'ny facture rehetra</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Vola Tena Voaray</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">{formatAr(totalPaid)}</h3>
          <p className="text-xs text-emerald-500 mt-1">Totalin'ny fandoavam-bola voaray</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Vola Sisa Tsy Voaloa</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-2">{formatAr(totalRemaining)}</h3>
          <p className="text-xs text-rose-500 mt-1">Totalin'ny trosa mbola miandry</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 mb-4">Fintina isaky ny Trano</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-semibold">Trano</th>
                <th className="pb-3 font-semibold">Zone</th>
                <th className="pb-3 font-semibold text-right">Hofan-trano Isam-bolana</th>
                <th className="pb-3 font-semibold text-center">Sata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-800">{p.name} ({p.code})</td>
                  <td className="py-3 text-slate-600">{p.zone}</td>
                  <td className="py-3 text-right font-bold text-emerald-600">{formatAr(p.monthlyRent)}</td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
