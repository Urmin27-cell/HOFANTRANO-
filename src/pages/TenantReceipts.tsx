import React, { useState } from 'react';
import { Receipt as ReceiptIcon, Download, CheckCircle2 } from 'lucide-react';
import { Receipt, Tenant, Property, PaymentAccount } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';
import { generateReceiptPDF } from '../lib/pdfGenerator';

export const TenantReceipts: React.FC = () => {
  const session = getCurrentSession();
  const [receipts] = useState<Receipt[]>(dbStore.getReceipts());
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [accounts] = useState<PaymentAccount[]>(dbStore.getAccounts());

  const currentTenant = tenants.find(t => t.id === session.tenantId);
  const currentProperty = properties.find(p => p.id === currentTenant?.propertyId);

  const tenantReceipts = receipts.filter(r => r.tenantId === session.tenantId);

  const handleDownloadPDF = (receipt: Receipt) => {
    if (currentTenant && currentProperty) {
      generateReceiptPDF(receipt, currentTenant, currentProperty);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reçu du Paiement</h1>
        <p className="text-sm text-slate-500">Ireo reçus voamarina sy efa nankatoavin'ny Tompon-trano.</p>
      </div>

      {tenantReceipts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy mbola misy reçu voamarina ho anao.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenantReceipts.map(rec => (
            <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {rec.receiptNumber}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(rec.issueDate)}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mt-3">{formatAr(rec.amountPaid)}</h3>
                <p className="text-xs text-slate-500 mt-1">Référence: {rec.reference || '-'}</p>
              </div>

              <div className="py-2 border-y border-slate-100 text-xs space-y-1">
                <p className="text-slate-600">Kaonty: {rec.accountName}</p>
                <p className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Voamarina sy Voasonia
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleDownloadPDF(rec)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" /> Hisintona Reçu PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
