import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Download, Image as ImageIcon, Eye } from 'lucide-react';
import { PaymentSubmission, Tenant, Property, PaymentAccount, Receipt } from '../types';
import { dbStore } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';
import { SignaturePad } from '../components/SignaturePad';
import { generateReceiptPDF } from '../lib/pdfGenerator';

export const AdminVerification: React.FC = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>(dbStore.getSubmissions());
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [accounts] = useState<PaymentAccount[]>(dbStore.getAccounts());
  const [receipts, setReceipts] = useState<Receipt[]>(dbStore.getReceipts());

  const [selectedSub, setSelectedSub] = useState<PaymentSubmission | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [viewImageModal, setViewImageModal] = useState<string | null>(null);

  const handleAcceptClick = (sub: PaymentSubmission) => {
    setSelectedSub(sub);
    setIsSignModalOpen(true);
  };

  const handleSignatureSave = (signatureDataUrl: string) => {
    if (!selectedSub) return;

    const tenant = tenants.find(t => t.id === selectedSub.tenantId);
    const property = properties.find(p => p.id === selectedSub.propertyId);
    const account = accounts.find(a => a.id === selectedSub.accountId);

    if (!tenant || !property) return;

    const updatedSubs = submissions.map(s => s.id === selectedSub.id ? { ...s, status: 'VOALOA' as const, landlordSignature: signatureDataUrl } : s);
    setSubmissions(updatedSubs);
    dbStore.saveSubmissions(updatedSubs);

    const recNumber = `REC-2026-${String(receipts.length + 1).padStart(3, '0')}`;
    const amountInWords = `${selectedSub.amount.toLocaleString('fr-FR')} Ariary`;

    const newReceipt: Receipt = {
      id: `rec-${Date.now()}`,
      paymentId: selectedSub.id,
      receiptNumber: recNumber,
      issueDate: new Date().toISOString().split('T')[0],
      tenantId: tenant.id,
      propertyId: property.id,
      amountPaid: selectedSub.amount,
      amountInWords,
      rentMonth: selectedSub.rentMonth,
      accountName: account ? `${account.bankOrProvider} (${account.accountNumber})` : 'Kaonty',
      reference: selectedSub.reference,
      landlordSignature: signatureDataUrl,
      createdAt: new Date().toISOString()
    };

    const updatedReceipts = [...receipts, newReceipt];
    setReceipts(updatedReceipts);
    dbStore.saveReceipts(updatedReceipts);

    const notifs = dbStore.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: tenant.id,
      title: 'Voaray sy Nankatoavina ny Fandoavam-bola',
      message: `Nankatoavin'ny Tompon-trano ny fandoavanao ho an'ny volana ${selectedSub.rentMonth} mitentina ${formatAr(selectedSub.amount)}. Azonao alaina ao amin'ny "Reçu du paiement" ny reçurao.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    dbStore.saveNotifications(notifs);

    generateReceiptPDF(newReceipt, tenant, property, account);

    setIsSignModalOpen(false);
    setSelectedSub(null);
    alert('Voamarina soa aman-tsara ny fandoavam-bola ary voaforona ny Reçu PDF!');
  };

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || 'Mpanofa';
  const getPropName = (id: string) => properties.find(p => p.id === id)?.name || 'Trano';
  const getAccountInfo = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? `${acc.bankOrProvider} - ${acc.accountNumber}` : 'Kaonty';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vérification Paiement</h1>
        <p className="text-sm text-slate-500">Hamarino ary ankatoavy ny fandoavam-bola nalefan'ny mpanofa.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy mbola misy fandoavam-bola nalefa.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-4 font-semibold">Daty</th>
                  <th className="p-4 font-semibold">Mpanofa</th>
                  <th className="p-4 font-semibold">Trano</th>
                  <th className="p-4 font-semibold">Volana Nefaina</th>
                  <th className="p-4 font-semibold">Kaonty</th>
                  <th className="p-4 font-semibold">Référence</th>
                  <th className="p-4 font-semibold">Sary Preuve</th>
                  <th className="p-4 font-semibold text-right">Vola Naloa</th>
                  <th className="p-4 font-semibold text-center">Sata</th>
                  <th className="p-4 font-semibold text-center">Asa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-600">{formatDate(sub.paymentDate)}</td>
                    <td className="p-4 font-semibold text-slate-900">{getTenantName(sub.tenantId)}</td>
                    <td className="p-4 text-slate-600">{getPropName(sub.propertyId)}</td>
                    <td className="p-4 font-bold text-emerald-700">{sub.rentMonth}</td>
                    <td className="p-4 text-slate-700">{getAccountInfo(sub.accountId)}</td>
                    <td className="p-4 font-mono text-slate-500">{sub.reference}</td>
                    <td className="p-4">
                      {sub.proofImageUrl ? (
                        <button
                          onClick={() => setViewImageModal(sub.proofImageUrl || null)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-blue-100"
                        >
                          <Eye className="w-3.5 h-3.5" /> Jereo Sary
                        </button>
                      ) : (
                        <span className="text-slate-400">Tsy misy sary</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">{formatAr(sub.amount)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sub.status === 'VOALOA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'VOALOA' ? 'Nankatoavina' : 'Miandry Fanamarinana'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {sub.status !== 'VOALOA' ? (
                        <button
                          onClick={() => handleAcceptClick(sub)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow inline-flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accepté
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">Voamarina</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Sonia ny Tompon-trano (Confirmation)</h3>
            <p className="text-xs text-slate-500">Manaova sonia eto ambany mba hanamarinana ny fandoavana ary hamoronana ny Reçu PDF.</p>
            <SignaturePad onSave={handleSignatureSave} />
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
              >
                Hanafoana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Proof Image Modal */}
      {viewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Sary Preuve du Paiement</h3>
              <button onClick={() => setViewImageModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <div className="bg-slate-100 rounded-xl p-2 flex justify-center items-center max-h-96 overflow-hidden">
              <img src={viewImageModal} alt="Preuve" className="max-h-80 object-contain rounded-lg" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewImageModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Hikatona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
