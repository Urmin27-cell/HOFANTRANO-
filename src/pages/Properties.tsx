import React, { useState } from 'react';
import { Building, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Property, PropertyType } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr } from '../lib/formatters';

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(dbStore.getProperties());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [type, setType] = useState<PropertyType>('Appartement');
  const [rooms, setRooms] = useState(2);
  const [monthlyRent, setMonthlyRent] = useState(400000);
  const [notes, setNotes] = useState('');

  const session = getCurrentSession();

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setCode(`TRN-00${properties.length + 1}`);
    setName('');
    setAddress('');
    setZone('Analakely');
    setType('Appartement');
    setRooms(2);
    setMonthlyRent(400000);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setCode(prop.code);
    setName(prop.name);
    setAddress(prop.address);
    setZone(prop.zone);
    setType(prop.type);
    setRooms(prop.rooms);
    setMonthlyRent(prop.monthlyRent);
    setNotes(prop.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      const updated = properties.map(p => p.id === editingProperty.id ? {
        ...p,
        code,
        name,
        address,
        zone,
        type,
        rooms,
        monthlyRent,
        notes
      } : p);
      setProperties(updated);
      dbStore.saveProperties(updated);
    } else {
      const newProp: Property = {
        id: `prop-${Date.now()}`,
        ownerId: session.userId,
        code,
        name,
        address,
        zone,
        type,
        rooms,
        monthlyRent,
        status: 'MALALAKA',
        createdAt: new Date().toISOString().split('T')[0],
        notes
      };
      const updated = [newProp, ...properties];
      setProperties(updated);
      dbStore.saveProperties(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tena te hamafa tanteraka an\'ity trano ity ve ianao?')) {
      const updated = properties.filter(p => p.id !== id);
      setProperties(updated);
      dbStore.saveProperties(updated);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.code.toLowerCase().includes(search.toLowerCase()) || 
                          p.zone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fitantanana Trano Hofaina</h1>
          <p className="text-sm text-slate-500">Ampidiro sy tantano eto ny trano hofaina rehetra.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
        >
          <Plus className="w-5 h-5" />
          Manampy Trano
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mitady trano, kaody, zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'MISY_MPANOFA', 'MALALAKA'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Rehetra' : st === 'MISY_MPANOFA' ? 'Misy Mpanofa' : 'Malalaka'}
            </button>
          ))}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy misy trano voasoratra aloha. Tsindrio ny bokotra "Manampy Trano" mba hanombohana.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(prop => (
            <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {prop.code}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-2">{prop.name}</h3>
                    <p className="text-xs text-slate-500">{prop.address} ({prop.zone})</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    prop.status === 'MISY_MPANOFA' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prop.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <p className="text-slate-400">Karazany</p>
                    <p className="font-bold text-slate-800 mt-0.5">{prop.type} ({prop.rooms} efitra)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Hofan-trano</p>
                    <p className="font-bold text-emerald-600 mt-0.5">{formatAr(prop.monthlyRent)}</p>
                  </div>
                </div>

                {prop.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg italic">{prop.notes}</p>
                )}
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(prop)}
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                  title="Ovaina"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(prop.id)}
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition"
                  title="Mamafa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingProperty ? 'Manova Trano' : 'Manampy Trano Vaovao'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Kaody</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Anaran'ny Trano</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Adiresy</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Zone / Faritra</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Karazany</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Appartement">Appartement</option>
                    <option value="Trano">Trano</option>
                    <option value="Villa">Villa</option>
                    <option value="Studio">Studio</option>
                    <option value="Trano Fivarotana">Trano Fivarotana</option>
                    <option value="Birao">Birao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Efitra</label>
                  <input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Hofan-trano Isam-bolana (Ar)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  step={10000}
                  required
                />
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
