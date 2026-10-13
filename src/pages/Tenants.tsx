import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit, Trash2, KeyRound } from 'lucide-react';
import { Tenant, Property } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';
import { formatAr, formatDate } from '../lib/formatters';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cin, setCin] = useState('');
  const [pinCode, setPinCode] = useState('1234');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRent, setMonthlyRent] = useState(400000);
  const [notes, setNotes] = useState('');

  const session = getCurrentSession();

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setFullName('');
    setPhone('+261 34 ');
    setEmail('');
    setAddress('');
    setCin('');
    setPinCode('1234');
    setPropertyId(properties[0]?.id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setMonthlyRent(400000);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ten: Tenant) => {
    setEditingTenant(ten);
    setFullName(ten.fullName);
    setPhone(ten.phone);
    setEmail(ten.email);
    setAddress(ten.address);
    setCin(ten.cin || '');
    setPinCode(ten.pinCode || '1234');
    setPropertyId(ten.propertyId);
    setStartDate(ten.startDate);
    setMonthlyRent(ten.monthlyRent);
    setNotes(ten.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTenant) {
      const updated = tenants.map(t => t.id === editingTenant.id ? {
        ...t,
        fullName,
        phone,
        email,
        address,
        cin,
        pinCode,
        propertyId,
        startDate,
        monthlyRent,
        notes
      } : t);
      setTenants(updated);
      dbStore.saveTenants(updated);
    } else {
      const newTen: Tenant = {
        id: `ten-${Date.now()}`,
        ownerId: session.userId,
        propertyId,
        fullName,
        phone,
        email,
        address,
        cin,
        pinCode,
        startDate,
        monthlyRent,
        status: 'MIVANTAKA',
        createdAt: new Date().toISOString().split('T')[0],
        notes
      };
      const updated = [newTen, ...tenants];
      setTenants(updated);
      dbStore.saveTenants(updated);

      // Update property status
      const props = dbStore.getProperties();
      const updatedProps = props.map(p => p.id === propertyId ? { ...p, status: 'MISY_MPANOFA' as const } : p);
      dbStore.saveProperties(updatedProps);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tena te hanafatra na hamafa an\'ity mpanofa ity ve ianao?')) {
      const updated = tenants.filter(t => t.id !== id);
      setTenants(updated);
      dbStore.saveTenants(updated);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.fullName.toLowerCase().includes(search.toLowerCase()) || 
    t.phone.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const getPropName = (propId: string) => {
    const prop = properties.find(p => p.id === propId);
    return prop ? `${prop.name} (${prop.code})` : 'Trano';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fitantanana Mpanofa (Locataires)</h1>
          <p className="text-sm text-slate-500">Ampidiro eto ny mpanofa trano miaraka amin'ny Code PIN fidirany.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition"
        >
          <Plus className="w-5 h-5" />
          Manampy Mpanofa
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Mitady mpanofa, finday..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {filteredTenants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Tsy misy mpanofa voasoratra aloha. Tsindrio ny bokotra "Manampy Mpanofa".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map(ten => (
            <div key={ten.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{ten.fullName}</h3>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">{getPropName(ten.propertyId)}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {ten.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{ten.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{ten.email}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <KeyRound className="w-4 h-4" />
                    <span>Code PIN: {ten.pinCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <p className="text-slate-400">Hofan-trano / 30 andro</p>
                    <p className="font-bold text-slate-900 mt-0.5">{formatAr(ten.monthlyRent)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Daty Nidirana</p>
                    <p className="font-bold text-slate-800 mt-0.5">{formatDate(ten.startDate)}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(ten)}
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                  title="Ovaina"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ten.id)}
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
                {editingTenant ? 'Manova Mpanofa' : 'Manampy Mpanofa Vaovao'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Anarana Feno</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Finday</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Mailaka (Email)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Code PIN Fidirana</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-widest font-bold text-emerald-700 bg-emerald-50"
                    required
                  />
                </div>
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
                    <option key={p.id} value={p.id}>{p.name} ({p.code}) - {formatAr(p.monthlyRent)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Daty Nidirana (Manomboka ny 30 andro)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Hofan-trano Isam-bolana (Ar)</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
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
