import React, { useState } from 'react';
import { AlertTriangle, Search, MessageSquare, Phone, Bell } from 'lucide-react';
import { RentInvoice, Tenant, Property } from '../types';
import { db } from '../lib/supabase';
import { formatAr, formatDate } from '../lib/formatters';

export const Debts: React.FC = () => {
  const [invoices] = useState<RentInvoice[]>(db.getInvoices());
  const [tenants] = useState<Tenant[]>(db.getTenants());
  const [properties] = useState<Property[]>(db.getProperties());
  const [search, setSearch] = useState('');

  const debtInvoices = invoices.filter(inv => inv.remainingAmount > 0);

  const handleWhatsAppReminder = (tenant: Tenant, inv: RentInvoice) => {
    const message = `Miarahaba anao Andriamatoa/Rtoa ${tenant.fullName}, mampahatsiahivana anao fa misy vola hofantrano sisa tsy voaloa mitentina ${formatAr(inv.remainingAmount)} ho an'ny volana ${inv.month} (Daty farany: ${formatDate(inv.dueDate)}). Misaotra indrindra. - HOFANTRANO`;
    const whatsappUrl = `https://wa.me/${tenant.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredDebts = debtInvoices.filter(inv => {
    const ten = tenants.find(t => t.id === inv.tenantId);
    return (ten && ten.fullName.toLowerCase().includes(search.toLowerCase())) ||
           inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trosa sy Fahataran'ny Vola (Créances & Retards)</h1>
        <p className="text-sm text-slate-500">Mijery sy mandefa fampahatsiahivana momba ny hofantrano tsy voaloa.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mitady mpanofa, laharana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-4 font-semibold">Mpanofa</th>
                <th className="p-4 font-semibold">Trano</th>
                <th className="p-4 font-semibold">Volana</th>
                <th className="p-4 font-semibold">Daty Farany</th>
                <th className="p-4 font-semibold">Sata</th>
                <th className="p-4 font-semibold text-right">Vola Tontolony</th>
                <th className="p-4 font-semibold text-right">Vola Sisa Tsy Voaloa</th>
                <th className="p-4 font-semibold text-center">Fampahatsiahivana WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDebts.map(inv => {
                const ten = tenants.find(t => t.id === inv.tenantId);
                const prop = properties.find(p => p.id === inv.propertyId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{ten?.fullName}</td>
                    <td className="p-4 text-slate-600">{prop?.name}</td>
                    <td className="p-4 text-slate-600">{inv.month}</td>
                    <td className="p-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">{formatAr(inv.totalAmount)}</td>
                    <td className="p-4 text-right font-bold text-rose-600">{formatAr(inv.remainingAmount)}</td>
                    <td className="p-4 text-center">
                      {ten && (
                        <button
                          onClick={() => handleWhatsAppReminder(ten, inv)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg transition inline-flex items-center gap-1.5 font-semibold"
                        >
                          <MessageSquare className="w-4 h-4" /> WhatsApp
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
