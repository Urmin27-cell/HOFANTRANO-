import React, { useState } from 'react';
import { Receipt, Plus, Download, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { RentInvoice, Tenant, Property } from '../types';
import { db } from '../lib/supabase';
import { formatAr, formatDate, getCurrentYearMonth } from '../lib/formatters';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import { generateMonthlyRentInvoices, recalculateInvoicesAndDebts } from '../services/rentCalculator';

export const Invoices: React.FC = () => {
  recalculateInvoicesAndDebts();
  const [invoices, setInvoices] = useState<RentInvoice[]>(db.getInvoices());
  const [tenants] = useState<Tenant[]>(db.getTenants());
  const [properties] = useState<Property[]>(db.getProperties());
  const [search, setSearch] = useState('');
  const [targetMonth, setTargetMonth] = useState(getCurrentYearMonth());

  const handleGenerateMonthly = () => {
    const count = generateMonthlyRentInvoices(targetMonth);
    setInvoices(db.getInvoices());
    alert(`Noforonina soa aman-tsara ny facture ${count} vaovao ho an'ny volana ${targetMonth}`);
  };

  const handleDownloadPDF = (inv: RentInvoice) => {
    const tenant = tenants.find(t => t.id === inv.tenantId);
    const property = properties.find(p => p.id === inv.propertyId);
    const settings = db.getSettings();
    if (tenant && property) {
      generateInvoicePDF(inv, tenant, property, settings);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const tenant = tenants.find(t => t.id === inv.tenantId);
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
                          (tenant && tenant.fullName.toLowerCase().includes(search.toLowerCase())) ||
                          inv.month.includes(search);
    return matchesSearch;
  });

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || 'Mpanofa';
  const getPropName = (id: string) => properties.find(p => p.id === id)?.name || 'Trano';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Factures Hofan-trano</h1>
          <p className="text-sm text-slate-500">Fitantanana sy famoronana facture isam-bolana ho an'ny mpanofa.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
          />
          <button
            onClick={handleGenerateMonthly}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            Mamorona Facture Volana
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mitady facture, mpanofa, volana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-4 font-semibold">Laharana</th>
                <th className="p-4 font-semibold">Mpanofa</th>
                <th className="p-4 font-semibold">Trano</th>
                <th className="p-4 font-semibold">Volana</th>
                <th className="p-4 font-semibold">Daty Farany</th>
                <th className="p-4 font-semibold">Sata</th>
                <th className="p-4 font-semibold text-right">Tontolony</th>
                <th className="p-4 font-semibold text-right">Vola Sisa</th>
                <th className="p-4 font-semibold text-center">Asa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                  <td className="p-4 font-semibold text-slate-900">{getTenantName(inv.tenantId)}</td>
                  <td className="p-4 text-slate-600">{getPropName(inv.propertyId)}</td>
                  <td className="p-4 text-slate-600">{inv.month}</td>
                  <td className="p-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inv.status === 'VOALOA_TANTERAKA' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'VOALOA_AMPALAHANY' ? 'bg-amber-100 text-amber-800' :
                      inv.status === 'TARA_FANDOAVANA' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">{formatAr(inv.totalAmount)}</td>
                  <td className="p-4 text-right font-bold text-rose-600">{formatAr(inv.remainingAmount)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDownloadPDF(inv)}
                      className="p-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg transition inline-flex items-center gap-1"
                      title="Hisintona PDF"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
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
