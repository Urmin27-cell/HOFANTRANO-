import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Info, Sparkles, Volume2 } from 'lucide-react';
import { AppNotification } from '../types';
import { 
  dbStore, 
  getCurrentSession, 
  isNotificationEnabled, 
  enableAppNotifications,
  showSystemNotification 
} from '../lib/firebase';

export const SharedNotifications: React.FC = () => {
  const session = getCurrentSession();
  const [notifications, setNotifications] = useState<AppNotification[]>(dbStore.getNotifications());
  const [isPushActive, setIsPushActive] = useState(isNotificationEnabled());
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(dbStore.getNotifications());
      setIsPushActive(isNotificationEnabled());
    };
    window.addEventListener('hofantrano_notifications_updated', handleUpdate);
    return () => {
      window.removeEventListener('hofantrano_notifications_updated', handleUpdate);
    };
  }, []);

  const list = session.role === 'TOMPO_TRANO'
    ? notifications
    : notifications.filter(n => n.userId === session.tenantId);

  const markAllRead = () => {
    const updated = notifications.map(n => {
      if (session.role === 'TOMPO_TRANO' || n.userId === session.tenantId) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    dbStore.saveNotifications(updated);
  };

  const handleTestNotification = () => {
    dbStore.addNotification(
      'Fitsapana HOFANTRANO',
      'Fitsapana fampandrenesana: Miasa tsara 100% ny fampahatsiahivana sy ny feo!',
      session.userId,
      'SUCCESS'
    );
    setNotifications(dbStore.getNotifications());
    setTestSuccessMessage('Voaray soa aman-tsara ny fampandrenesana fitsapana!');
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  const handleActivatePush = async () => {
    const res = await enableAppNotifications(session.userId);
    setIsPushActive(true);
    setNotifications(dbStore.getNotifications());
    setTestSuccessMessage(res.message);
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Ireo fampahatsiahivana, fandoavam-bola sy hafatra rehetra.</p>
        </div>

        <div className="flex items-center gap-2">
          {list.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-emerald-600 hover:underline px-2.5 py-1.5"
            >
              Voavaky daholo
            </button>
          )}

          <button
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hitsapa (Tester)</span>
          </button>
        </div>
      </div>

      {testSuccessMessage && (
        <div className="bg-emerald-900 text-white text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{testSuccessMessage}</span>
        </div>
      )}

      {/* Push Status Card */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {isPushActive ? 'Push Notifications: Mavitrika (Actif)' : 'Push Notifications: Tsy mbola voahetsika'}
            </h4>
            <p className="text-[11px] text-slate-300">
              {isPushActive 
                ? 'Handray fampandrenesana eo amin\'ny ecran-ny finday avy hatrany ianao rehefa misy hetsika.'
                : 'Tsindrio ny bokotra mba handraisana fampahatsiahivana mivantana amin\'ny findainao.'}
            </p>
          </div>
        </div>

        {!isPushActive ? (
          <button
            onClick={handleActivatePush}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hanaiky (Activer)</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vonona</span>
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Tsy misy fampahatsiahivana aloha.
          </div>
        ) : (
          list.map(n => (
            <div key={n.id} className={`p-5 flex items-start gap-4 transition ${!n.read ? 'bg-emerald-50/40' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {n.type === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.createdAt}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
