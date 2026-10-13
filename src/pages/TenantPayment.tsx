import React, { useState } from 'react';
import { CreditCard, Send, Upload, CheckCircle2 } from 'lucide-react';
import { PaymentAccount, PaymentSubmission, Tenant, Property } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr, getCurrentDateISO } from '../lib/formatters';

export const TenantPayment: React.FC = () => {
  const session = getCurrentSession();
  const [accounts] = useState<PaymentAccount[]>(dbStore.getAccounts());
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>(dbStore.getSubmissions());

  const currentTenant = tenants.find(t => t.id === session.tenantId);
  const currentProperty = properties.find(p => p.id === currentTenant?.propertyId);

  const [amount, setAmount] = useState(currentTenant?.monthlyRent || 400000);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState(getCurrentDateISO());
  const [rentMonth, setRentMonth] = useState('Oktobra 2026');
  const [reference, setReference] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !currentProperty) {
      return;
    }

    const newSub: PaymentSubmission = {
      id: `sub-${Date.now()}`,
      ownerId: currentProperty.ownerId || currentTenant.ownerId || 'admin-1',
      tenantId: currentTenant.id,
      propertyId: currentProperty.id,
      amount: Number(amount),
      accountId,
      paymentDate,
      reference,
      rentMonth,
      proofImageUrl: proofImage,
      status: 'MIANDRY',
      createdAt: new Date().toISOString()
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    dbStore.saveSubmissions(updated);

    // Add notification for admin
    const notifs = dbStore.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: 'ADMIN',
      title: 'Fandoavam-bola Vaovao avy amin\'ny Mpanofa',
      message: `Nandefa fandoavana ho an'ny volana ${rentMonth} mitentina ${formatAr(amount)} i ${currentTenant.fullName}.`,
      type: 'INFO',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    dbStore.saveNotifications(notifs);

    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
    setReference('');
    setProofImage('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mandefa Vola (Option Paiement)</h1>
        <p className="text-sm text-slate-500">Alefaso eto ny vola hofan-trano sy ny volana nefaina ary ny sary preuve.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Voaray soa aman-tsara ny fampahalalana ny fandoavam-bola. Andrasana ny fanamarinan'ny Tompon-trano.
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">Kaonty Fandoavana (Numéros de Compte)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-white/10 border border-white/10 rounded-xl p-3 text-xs">
              <span className="font-bold text-emerald-300">{acc.bankOrProvider}</span>
              <p className="font-mono text-sm mt-1 font-bold">{acc.accountNumber}</p>
              <p className="text-slate-300 mt-0.5">Tompony: {acc.accountName}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Misafidy Kaonty Nandefasanao</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
            required
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.bankOrProvider} - {acc.accountNumber} ({acc.accountName})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Volana Nefaina (Mois réglé)</label>
            <input
              type="text"
              value={rentMonth}
              onChange={(e) => setRentMonth(e.target.value)}
              placeholder="Ohatra: Oktobra 2026"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vola Naloa (Ar)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Daty Nandoavana</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Référence Transaction</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ohatra: MV-982341"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sary Preuve du Paiement (Capture na Sary)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {proofImage ? (
              <div className="flex flex-col items-center space-y-2">
                <img src={proofImage} alt="Preuve" className="h-32 object-contain rounded-lg shadow" />
                <span className="text-xs text-emerald-600 font-semibold">Voatsindry ny sary. Tsindrio raha hanova.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 py-4">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-xs text-slate-600 font-medium">Tsindrio eto na ampidiro ny sarin'ny reçurao</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" /> Handefa ny Fandoavana amin'ny Tompon-trano
        </button>
      </form>
    </div>
  );
};
