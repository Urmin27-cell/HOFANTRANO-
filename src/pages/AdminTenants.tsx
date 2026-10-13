import React, { useState } from 'react';
import { Users, Plus, Trash2, KeyRound, Phone, Calendar } from 'lucide-react';
import { Tenant, Property } from '../types';
import { dbStore } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';

export const AdminTenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [monthlyRent, setMonthlyRent] = useState(400000);
  const [pinCode, setPinCode] = useState('1234');

  const handleOpenAdd = () => {
    setFullName('');
    setPhone('+261 34 ');
    setStartDate(new Date().toISOString().split('T')[0]);
    setPropertyId(properties[0]?.id || '');
    setMonthlyRent(properties[0]?.monthlyRent || 400000);
    setPinCode('1234');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenant: Tenant = {
      id: `ten-${Date.now()}`,
      fullName,
      phone,
      startDate,
      propertyId,
      monthlyRent,
      pinCode,
      status: 'MIVANTAKA',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newTenant, ...tenants];
    setTenants(updated);
    dbStore.saveTenants(updated);

    // Update property status
    const props = dbStore.getProperties();
    const updatedProps = props.map(p => p.id === propertyId ? { ...p, status: 'MISY_MPANOFA' as const } : p);
    dbStore.saveProperties(updatedProps);

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, propId: string) => {
    if (window.confirm('Tena te hanafatra na hamafa an\'ity mpanofa ity ve ianao?')) {
      const updated = tenants.filter(t => t.id !== id);
      setTenants(updated);
      dbStore.saveTenants(updated);

      const props = dbStore.getProperties();
      const updatedProps = props.map(p => p.id === propId ? { ...p, status: 'MALALAKA' as const } : p);
      dbStore.saveProperties(updatedProps);
    }
  };

  const getPropInfo = (propId: string) => {
    const p = properties.find(prop => prop.id === propId);
    return p ? `${p.name} (${p.code})` : 'Trano';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mampiditra Mpanofa</h1>
          <p className="text-sm text-slate-500">Ampidiro ny anarana, finday, daty nidirana, trano, hofan-trano ary Code PIN.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
        >
          <Plus className="w-5 h-5" /> Manampy Mpanofa
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          Fanamarihana: Mila mampiditra trano aloha ianao vao afaka mampiditra mpanofa.
        </div>
      ) : null}

      {tenants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy mbola misy mpanofa voasoratra.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{t.fullName}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">{getPropInfo(t.propertyId)}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 py-2 border-y border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Daty nidirana: {formatDate(t.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <KeyRound className="w-4 h-4" />
                  <span>Code PIN: {t.pinCode}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-[10px] text-slate-400">Vola efaina par mois</p>
                  <p className="font-bold text-slate-900">{formatAr(t.monthlyRent)}</p>
                </div>
                <button
                  onClick={() => handleDelete(t.id, t.propertyId)}
                  className="p-2 text-slate-600 hover:text-rose-600 rounded-lg transition"
                  title="Mamafa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Manampy Mpanofa Vaovao</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anarana Feno</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Finday</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Daty Nidirana</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trano Ahofa</label>
                <select
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                    const sel = properties.find(p => p.id === e.target.value);
                    if (sel) setMonthlyRent(sel.monthlyRent);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  required
                >
                  {properties.filter(p => p.status === 'MALALAKA').map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({formatAr(p.monthlyRent)})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vola Efaina Par Mois (Ar)</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Code PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-700 bg-emerald-50"
                    required
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                >
                  Hanafoana
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
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
