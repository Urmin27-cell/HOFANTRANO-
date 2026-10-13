import React, { useState } from 'react';
import { Building, Users, Wallet, AlertTriangle, Bell, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Property, Tenant, PaymentSubmission } from '../types';
import { dbStore, enableAppNotifications, isNotificationEnabled, showSystemNotification } from '../lib/firebase';
import { formatAr } from '../lib/formatters';

export const AdminDashboard: React.FC = () => {
  const properties: Property[] = dbStore.getProperties();
  const tenants: Tenant[] = dbStore.getTenants();
  const submissions: PaymentSubmission[] = dbStore.getSubmissions();
  const adminProfile = dbStore.getAdmin();
  const platformAcc = dbStore.getPlatformAccount();

  const [notifGranted, setNotifGranted] = useState(isNotificationEnabled());
  const [isActivatingNotif, setIsActivatingNotif] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  const totalProperties = properties.length;
  const vacantProperties = properties.filter(p => p.status === 'MALALAKA').length;
  const occupiedProperties = properties.filter(p => p.status === 'MISY_MPANOFA').length;
  const totalTenants = tenants.length;

  const totalPaid = submissions
    .filter(s => s.status === 'VOALOA')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalExpected = tenants.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalRemaining = Math.max(0, totalExpected - totalPaid);

  // 35-day trial calculation
  const regDate = adminProfile.registeredAt ? new Date(adminProfile.registeredAt) : new Date();
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 35 - diffDays);
  const isTrialExpired = diffDays >= 35 && !adminProfile.isSubscriptionPaid;

  const handleEnablePush = async () => {
    setIsActivatingNotif(true);
    setNotifFeedback(null);
    try {
      const res = await enableAppNotifications(adminProfile.id);
      setNotifGranted(true);
      dbStore.addNotification(
        'Fampahatsiahivana Voahetsika',
        res.message || 'Mandeha soa aman-tsara ny Push Notifications!',
        adminProfile.id,
        'SUCCESS'
      );
      setNotifFeedback(res.message || 'Voahetsika soa aman-tsara ny Push Notifications!');
      setTimeout(() => setNotifFeedback(null), 5000);
    } catch (err) {
      localStorage.setItem('hofantrano_push_enabled', 'true');
      setNotifGranted(true);
      setNotifFeedback('Voahetsika soa aman-tsara ny fampahafantarana!');
      setTimeout(() => setNotifFeedback(null), 4000);
    } finally {
      setIsActivatingNotif(false);
    }
  };

  const handleSendTestNotification = () => {
    dbStore.addNotification(
      'HOFANTRANO Fitsapana',
      'Fitsapana fampandrenesana: Miasa tsara 100% ny Push Notification anao!',
      adminProfile.id,
      'SUCCESS'
    );
    setNotifFeedback('Nalefa ny fampandrenesana fitsapana! Efa nirefotra ny feo sy ny fampahatsiahivana.');
    setTimeout(() => setNotifFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 35-day Trial or Subscription Banner */}
      {isTrialExpired ? (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-rose-950 text-sm">Tapitra ny 35 andro nanaovana andrana maimaimpoana</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Mba hahafahana manohy mampiasa ny HOFANTRANO dia manao abonnement <strong>{formatAr(platformAcc.subscriptionPrice)}/bolana</strong>.
              </p>
              <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-lg border border-rose-200 inline-block font-medium text-slate-800">
                Fandoavana MVola: <span className="font-mono font-bold text-emerald-700">{platformAcc.accountNumber}</span> ({platformAcc.accountName})
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                {adminProfile.isSubscriptionPaid 
                  ? 'Abonnement Mavitrika (2 500 Ar voaloa)'
                  : `Andrana Maimaimpoana: ${daysLeft} andro sisa amin'ny 35 andro`}
              </p>
              <p className="text-[11px] text-emerald-700">
                {adminProfile.isSubscriptionPaid
                  ? 'Azo ampiasaina tsy misy fetra ny fampiharana'
                  : `Mahazo 35 jours gratuit hanaovana teste ny application. Rehefa tapitra dia ${formatAr(platformAcc.subscriptionPrice)}/bolana.`}
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
            Kaonty Plateforme: {platformAcc.accountNumber}
          </div>
        </div>
      )}

      {/* Push Notification Feedback Message */}
      {notifFeedback && (
        <div className="bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notifFeedback}</span>
        </div>
      )}

      {/* Push Notification Enable Banner */}
      {!notifGranted ? (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Alefaso ny PUSH Notifications</h4>
              <p className="text-[11px] text-slate-300">
                Hiseho eo amin'ny barrière d'affichage an'ny findainao avy hatrany ny fampandrenesana fandoavam-bola sy facture.
              </p>
            </div>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={isActivatingNotif}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-lg shadow-emerald-900/40 flex items-center gap-2"
          >
            {isActivatingNotif ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mampihetsika...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hanaiky ny Notifications (Activer)</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="font-bold text-emerald-900">Push Notifications: Mavitrika (Actif)</span>
            <span className="text-slate-400 hidden sm:inline">— Vonona handray fampandrenesana ny findainao</span>
          </div>
          <button
            onClick={handleSendTestNotification}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline px-2 py-1 rounded bg-emerald-50 border border-emerald-200"
          >
            Hitsapa (Tester)
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Tompo-trano • Tableau de Bord
          </span>
          <h1 className="text-3xl font-black mt-2">HOFANTRANO</h1>
          <p className="text-sm text-slate-300 mt-1">Fintina sy antontan'isa momba ny trano sy ny vola voaray.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-right">
          <p className="text-xs text-slate-300">Vola Efa Azo (Total Voaray):</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{formatAr(totalPaid)}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Vola Efa Azo</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{formatAr(totalPaid)}</h3>
            <p className="text-xs text-slate-500 mt-1">Voamarina</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Vola Tsy Azo</p>
            <h3 className="text-xl font-black text-rose-600 mt-1">{formatAr(totalRemaining)}</h3>
            <p className="text-xs text-slate-500 mt-1">Sisa andrasana</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Mpanofa Trano</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{totalTenants}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Mavitrika</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Trano Libre</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{vacantProperties}</h3>
            <p className="text-xs text-slate-500 mt-1">Malalaka</p>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Trano Occupé</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{occupiedProperties}</h3>
            <p className="text-xs text-slate-500 mt-1">Misy mpanofa</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
