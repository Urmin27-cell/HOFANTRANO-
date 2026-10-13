import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Users, Building, DollarSign, Save, 
  CheckCircle2, Clock, AlertTriangle, ChevronRight, X, Phone, 
  ArrowLeft, RefreshCw, KeyRound 
} from 'lucide-react';
import { dbStore, PlatformAccount, LandlordProfile } from '../lib/firebase';
import { Tenant, Property } from '../types';
import { formatAr } from '../lib/formatters';

interface AdminPlatformProps {
  onBackToApp: () => void;
}

export const AdminPlatform: React.FC<AdminPlatformProps> = ({ onBackToApp }) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  // Platform State
  const [platformAccount, setPlatformAccount] = useState<PlatformAccount>(dbStore.getPlatformAccount());
  const [adminProfile, setAdminProfile] = useState<LandlordProfile>(dbStore.getAdmin());
  const [tenants] = useState<Tenant[]>(dbStore.getTenants());
  const [properties] = useState<Property[]>(dbStore.getProperties());

  // Form edit state
  const [accNum, setAccNum] = useState(platformAccount.accountNumber);
  const [accName, setAccName] = useState(platformAccount.accountName);
  const [provider, setProvider] = useState(platformAccount.provider || 'MVola');
  const [subPrice, setSubPrice] = useState(platformAccount.subscriptionPrice || 2500);
  const [saveToast, setSaveToast] = useState(false);

  // Selected landlord for inspecting tenants
  const [selectedLandlordForTenants, setSelectedLandlordForTenants] = useState<LandlordProfile | null>(null);

  // Verify PIN (080600)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '080600') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Diso ny Code PIN Admin Plateforme (080600)!');
    }
  };

  // Save platform account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlatformAccount = {
      ...platformAccount,
      accountNumber: accNum,
      accountName: accName,
      provider: provider,
      subscriptionPrice: Number(subPrice)
    };
    dbStore.savePlatformAccount(updated);
    setPlatformAccount(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Calculate Landlord 35-day trial status
  const calculateTrialStatus = (profile: LandlordProfile) => {
    const regDate = profile.registeredAt ? new Date(profile.registeredAt) : new Date();
    const now = new Date();
    const diffTime = now.getTime() - regDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 35 - diffDays);
    const isExpired = diffDays >= 35 && !profile.isSubscriptionPaid;

    return {
      daysRemaining,
      diffDays,
      isExpired,
      isPaid: profile.isSubscriptionPaid
    };
  };

  const trialInfo = calculateTrialStatus(adminProfile);

  // Confirm Landlord Subscription Payment (2 500 Ar)
  const handleToggleSubscription = () => {
    const newPaidStatus = !adminProfile.isSubscriptionPaid;
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const updated = dbStore.saveAdmin({
      isSubscriptionPaid: newPaidStatus,
      subscriptionPaidUntil: newPaidStatus ? nextMonth : undefined
    });
    setAdminProfile(updated);
    
    // Add notification to landlord
    if (newPaidStatus) {
      dbStore.addNotification(
        'Abonnement Voamarina (2 500 Ar)',
        'Voamarina soa aman-tsara ny fandoavam-bolanao 2 500 Ar ho an\'ny application HOFANTRANO. Misaotra anao!',
        adminProfile.id,
        'SUCCESS'
      );
    }
  };

  // PIN LOGIN GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Plateforme</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Faritra voaaro ho an'ny fitantanana ankapobeny ny HOFANTRANO (/admin)
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 text-left mb-1.5">
                Code PIN Fidirana (080600)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ampidiro ny PIN 080600"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-lg font-mono text-emerald-400 font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl font-medium">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/40 transition"
            >
              Hiditra ao amin'ny Admin Plateforme
            </button>

            <button
              type="button"
              onClick={onBackToApp}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Miverina any amin'ny Application
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PLATFORM DASHBOARD
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                /admin
              </span>
              <h1 className="text-2xl font-black text-white">Fitantanana ny Plateforme HOFANTRANO</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mitantana ireo Tompo-trano rehetra, mpanofa trano, ary fanamafisana ny fandoavana abonnement (2 500 Ar/mois)
            </p>
          </div>

          <button
            onClick={onBackToApp}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Miverina any amin'ny App
          </button>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Tompon-trano</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">1</div>
            <p className="text-[11px] text-emerald-400 mt-1">Voasoratra anarana</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Trano Rehetra</span>
              <Building className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{properties.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Ao amin'ny rafitra</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Mpanofa Trano</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{tenants.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Mpanofa manontolo</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Vidiny Abonnement</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{formatAr(platformAccount.subscriptionPrice)}</div>
            <p className="text-[11px] text-slate-400 mt-1">Isam-bolana / Tompo-trano</p>
          </div>
        </div>

        {/* Section 1: Landlords Management & Tenant Inspection */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Lisitry ny Tompo-trano sy Mpanofa Trano
              </h2>
              <p className="text-xs text-slate-400">
                Jereo ny mpanofa trano isaky ny Tompo-trano ary hamafiso ny fandoavam-bola 2 500 Ar/bolana rehefa tapitra ny 35 andro maimaimpoana.
              </p>
            </div>
          </div>

          {/* Landlord Card */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white">{adminProfile.adminName || 'Jean Ramanantsoa'}</span>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    ID: {adminProfile.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {adminProfile.phone || '034 12 345 67'}
                  </span>
                  {adminProfile.email && <span>Email: {adminProfile.email}</span>}
                  <span className="text-slate-500">PIN: <code className="text-emerald-400 font-mono font-bold">{adminProfile.pinCode}</code></span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 35 days trial status badge */}
                {trialInfo.isPaid ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Abonnement Voaloa (2 500 Ar)
                  </span>
                ) : trialInfo.isExpired ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Tapitra ny 35 andro (Mila 2 500 Ar)
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Andrana maimaimpoana: {trialInfo.daysRemaining} andro sisa / 35
                  </span>
                )}

                {/* Button: Voir la liste des locataires */}
                <button
                  onClick={() => setSelectedLandlordForTenants(adminProfile)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 flex items-center gap-1.5 transition"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Hijery ny Mpanofa ({tenants.length})</span>
                </button>

                {/* Button: Confirmer Paiement */}
                <button
                  onClick={handleToggleSubscription}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    adminProfile.isSubscriptionPaid
                      ? 'bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {adminProfile.isSubscriptionPaid ? 'Hanafoana Fanamarinana' : 'Hamarina Fandoavana (2 500 Ar)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Payment Account Settings */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <div className="pb-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Kaonty Fandraisana Vola an'ny Plateforme (Abonnement)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ity kaonty ity no hiseho amin'ireo Tompo-trano handoavany ny 2 500 Ar/bolana rehefa tapitra ny 35 andro andrana.
            </p>
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Numéro de compte (Par défaut: 0323911654)
                </label>
                <input
                  type="text"
                  value={accNum}
                  onChange={(e) => setAccNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-emerald-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Nom de compte (Par défaut: RAVELOMANANTSOA URMIN)
                </label>
                <input
                  type="text"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Mpandraharaha / Opérateur
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="MVola (Telma) / Orange Money / Airtel"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
              >
                <Save className="w-4 h-4" />
                Hitahiry ny Fanovana (Enregistrer)
              </button>

              {saveToast && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Voatahiry soa aman-tsara ny kaonty!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Modal: Liste des locataires du Tompo-trano */}
        {selectedLandlordForTenants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    Lisitry ny Mpanofa an'i {selectedLandlordForTenants.adminName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fitambaran'ny mpanofa trano: {tenants.length} olona
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLandlordForTenants(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 overflow-y-auto space-y-3 flex-1">
                {tenants.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Mbola tsy nisy mpanofa trano nampidirina teto aloha.
                  </div>
                ) : (
                  tenants.map(t => {
                    const prop = properties.find(p => p.id === t.propertyId);
                    return (
                      <div key={t.id} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{t.fullName}</span>
                            <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                              PIN: <code className="font-mono text-emerald-300 font-bold">{t.pinCode}</code>
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
                            <span>Finday: {t.phone}</span>
                            <span>Trano: {prop ? prop.name : 'Tsy voafaritra'}</span>
                            <span>Hofa: <strong className="text-emerald-400">{formatAr(t.monthlyRent)}</strong>/volana</span>
                          </div>
                        </div>

                        <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold">
                          Miasa
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedLandlordForTenants(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Akatony
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
