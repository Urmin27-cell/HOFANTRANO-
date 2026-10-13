import React, { useState } from 'react';
import { CreditCard, Plus, Download, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Payment, RentInvoice, Tenant, Property, PaymentMethod, Receipt } from '../types';
import { db, getCurrentUser } from '../lib/supabase';
import { formatAr, formatDate, getCurrentDateISO } from '../lib/formatters';
import { recordPayment } from '../services/rentCalculator';
import { generateReceiptPDF } from '../lib/pdfGenerator';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(db.getPayments());
  const [invoices] = useState<RentInvoice[]>(db.getInvoices());
  const [tenants] = useState<Tenant[]>(db.getTenants());
  const [properties] = useState<Property[]>(db.getProperties());
  const [receipts] = useState<Receipt[]>(db.getReceipts());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [amount, setAmount] = useState(invoices[0]?.remainingAmount || 400000);
  const [paymentDate, setPaymentDate] = useState(getCurrentDateISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOBILE_MONEY');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const currentUser = getCurrentUser();

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setAmount(inv.remainingAmount);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) return;

    recordPayment({
      ownerId: currentUser.id,
      tenantId: inv.tenantId,
      propertyId: inv.propertyId,
      invoiceId: inv.id,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      reference,
      notes,
      recordedBy: currentUser.fullName
    });

    setPayments(db.getPayments());
    setIsModalOpen(false);

    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDownloadReceipt = (payId: string) => {
    const rec = receipts.find(r => r.paymentId === payId);
    const pay = payments.find(p => p.id === payId);
    const inv = pay?.invoiceId ? invoices.find(i => i.id === pay.invoiceId) : undefined;
    const tenant = pay ? tenants.find(t => t.id === pay.tenantId) : undefined;
    const property = pay ? properties.find(p => p.id === pay.propertyId) : undefined;
    const settings = db.getSettings();

    if (rec && tenant && property) {
      generateReceiptPDF(rec, inv, tenant, property, settings);
    } else {
      alert('Tsy hita ny reçu mifanaraka amin\'ity fandoavam-bola ity.');
    }
  };

  const filteredPayments = payments.filter(p => {
    const tenant = tenants.find(t => t.id === p.tenantId);
    return (tenant && tenant.fullName.toLowerCase().includes(search.toLowerCase())) ||
           (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
           p.paymentMethod.toLowerCase().includes(search.toLowerCase());
  });

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || 'Mpanofa';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fandoavam-bola (Paiements)</h1>
          <p className="text-sm text-slate-500">Mandraikitra sy mijery ny fandoavana nataon'ny mpanofa.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
        >
          <Plus className="w-5 h-5" />
          Mandraikitra Fandoavana
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mitady fandoavana, mpanofa, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-4 font-semibold">Daty</th>
                <th className="p-4 font-semibold">Mpanofa</th>
                <th className="p-4 font-semibold">Fomba Fandoavana</th>
                <th className="p-4 font-semibold">Référence</th>
                <th className="p-4 font-semibold">Nandrakitra</th>
                <th className="p-4 font-semibold text-right">Vola Naloa</th>
                <th className="p-4 font-semibold text-center">Reçu PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{formatDate(pay.paymentDate)}</td>
                  <td className="p-4 font-semibold text-slate-900">{getTenantName(pay.tenantId)}</td>
                  <td className="p-4 font-medium text-slate-800">{pay.paymentMethod}</td>
                  <td className="p-4 font-mono text-slate-500">{pay.reference || '-'}</td>
                  <td className="p-4 text-slate-600">{pay.recordedBy}</td>
                  <td className="p-4 text-right font-bold text-emerald-600">{formatAr(pay.amount)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDownloadReceipt(pay.id)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg transition inline-flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-4 h-4" /> Reçu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">Mandraikitra Fandoavam-bola</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Facture / Volana</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  required
                >
                  {invoices.map(inv => {
                    const ten = tenants.find(t => t.id === inv.tenantId);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {ten?.fullName} - Volana {inv.month} (Sisa: {formatAr(inv.remainingAmount)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Vola Naloa (Ar)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    step={1000}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Daty Nandoavana</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fomba Fandoavana</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="MOBILE_MONEY">Mobile Money (MVola/Orange/Airtel)</option>
                    <option value="VOLA_MIVANTANA">Vola Mivantana (Espèces)</option>
                    <option value="BANKY">Banky (Virement)</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="HAFA">Hafa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Référence Transaction</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ohatra: MV-982341"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fanamarihana</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  rows={2}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hanafoana
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow transition"
                >
                  Handray sy Hamorona Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
