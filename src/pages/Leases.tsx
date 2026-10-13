import React, { useState } from 'react';
import { FileText, Plus, ShieldCheck, Download, PenTool } from 'lucide-react';
import { Lease, Tenant, Property } from '../types';
import { db, getCurrentUser } from '../lib/supabase';
import { formatAr, formatDate } from '../lib/formatters';
import { SignaturePad } from '../components/SignaturePad';

export const Leases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>(db.getLeases());
  const [tenants] = useState<Tenant[]>(db.getTenants());
  const [properties] = useState<Property[]>(db.getProperties());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signingLease, setSigningLease] = useState<Lease | null>(null);

  // Form state
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2027-10-13');
  const [monthlyRent, setMonthlyRent] = useState(400000);
  const [dueDay, setDueDay] = useState(5);
  const [caution, setCaution] = useState(800000);
  const [additionalTerms, setAdditionalTerms] = useState('Tsy azo atao ny mampiranty biby fiompy na manova ny rafitry ny trano raha tsy nahazo alalana.');

  const currentUser = getCurrentUser();

  const handleOpenAdd = () => {
    setTenantId(tenants[0]?.id || '');
    setPropertyId(properties[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLease: Lease = {
      id: `lease-${Date.now()}`,
      ownerId: currentUser.id,
      tenantId,
      propertyId,
      leaseNumber: `CIF-2026-00${leases.length + 1}`,
      startDate,
      endDate,
      monthlyRent,
      dueDay,
      caution,
      additionalTerms,
      status: 'MIANTSOA',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newLease, ...leases];
    setLeases(updated);
    db.saveLeases(updated);
    setIsModalOpen(false);
  };

  const handleSaveSignature = (sigDataUrl: string) => {
    if (!signingLease) return;
    const updated = leases.map(l => l.id === signingLease.id ? {
      ...l,
      landlordSignature: sigDataUrl
    } : l);
    setLeases(updated);
    db.saveLeases(updated);
    setSigningLease(null);
  };

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || 'Mpanofa';
  const getPropName = (id: string) => {
    const p = properties.find(prop => prop.id === id);
    return p ? `${p.name} (${p.code})` : 'Trano';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fifanarahana Hofan-trano (Baux)</h1>
          <p className="text-sm text-slate-500">Ireo fifanarahana ara-dalana eo amin'ny tompon-trano sy ny mpanofa.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
        >
          <Plus className="w-5 h-5" />
          Hamboatra Fifanarahana
        </button>
      </div>

      {/* Leases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leases.map(lease => {
          const tenant = tenants.find(t => t.id === lease.tenantId);
          const property = properties.find(p => p.id === lease.propertyId);
          return (
            <div key={lease.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {lease.leaseNumber}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mt-2">{tenant?.fullName}</h3>
                  <p className="text-xs text-slate-500">{property?.name} - {property?.zone}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {lease.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400">Nanomboka</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatDate(lease.startDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Nifaranana</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatDate(lease.endDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Hofany</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{formatAr(lease.monthlyRent)}</p>
                </div>
              </div>

              {lease.additionalTerms && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                  <strong className="font-semibold text-slate-700">Fepetra:</strong> {lease.additionalTerms}
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 text-xs">
                  {lease.landlordSignature ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-4 h-4" /> Voasonia
                    </span>
                  ) : (
                    <button
                      onClick={() => setSigningLease(lease)}
                      className="text-amber-600 flex items-center gap-1 font-semibold hover:underline"
                    >
                      <PenTool className="w-4 h-4" /> Hanao sonia
                    </button>
                  )}
                </div>

                <button
                  onClick={() => alert(`Sokatra ny Fifanarahana ${lease.leaseNumber}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature Modal */}
      {signingLease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Sonia Elektronika Tompo-trano</h3>
            <p className="text-xs text-slate-500">Manaova sonia eo amin'ny boaty eto ambany ho an'ny fifanarahana {signingLease.leaseNumber}</p>
            <SignaturePad onSave={handleSaveSignature} />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSigningLease(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Hanafoana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">Mamorona Fifanarahana Hofan-trano</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Mpanofa</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  required
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Trano Hofaina</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  required
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Daty Nanombohana</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Daty Nifaranana</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fepetra Fanampiny</label>
                <textarea
                  value={additionalTerms}
                  onChange={(e) => setAdditionalTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  rows={3}
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
                  Hitahirina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
