import React, { useState } from 'react';
import { Building, Plus, Trash2, Edit } from 'lucide-react';
import { Property } from '../types';
import { dbStore } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';

export const AdminProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(dbStore.getProperties());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(400000);

  const handleOpenAdd = () => {
    setEditing(null);
    setCode(`TRN-00${properties.length + 1}`);
    setName('');
    setAddress('');
    setZone('Analakely');
    setMonthlyRent(400000);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const updated = properties.map(p => p.id === editing.id ? { ...p, code, name, address, zone, monthlyRent } : p);
      setProperties(updated);
      dbStore.saveProperties(updated);
    } else {
      const newProp: Property = {
        id: `prop-${Date.now()}`,
        code,
        name,
        address,
        zone,
        monthlyRent,
        status: 'MALALAKA',
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [newProp, ...properties];
      setProperties(updated);
      dbStore.saveProperties(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tena te hanafatra na hamafa an\'ity trano ity ve ianao?')) {
      const updated = properties.filter(p => p.id !== id);
      setProperties(updated);
      dbStore.saveProperties(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mampiditra Trano Ahofa</h1>
          <p className="text-sm text-slate-500">Ireo trano rehetra tantanin'ny Tompo-trano.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
        >
          <Plus className="w-5 h-5" /> Manampy Trano
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy mbola misy trano voasoratra. Tsindrio ny bokotra "Manampy Trano".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {p.code}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.address} - {p.zone}</p>
              </div>

              <div className="py-2 border-y border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Hofan-trano / volana:</span>
                <span className="font-bold text-emerald-600 text-sm">{formatAr(p.monthlyRent)}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  p.status === 'MISY_MPANOFA' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {p.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setCode(p.code);
                      setName(p.name);
                      setAddress(p.address);
                      setZone(p.zone);
                      setMonthlyRent(p.monthlyRent);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-600 hover:text-emerald-600 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-600 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">{editing ? 'Manova Trano' : 'Manampy Trano Vaovao'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kaody</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anarana</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Adiresy</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Zone</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vola Efaina Isam-bolana (Ar)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
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
