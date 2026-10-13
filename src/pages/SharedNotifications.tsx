import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { AppNotification } from '../types';
import { dbStore, getCurrentSession } from '../lib/firebase';

export const SharedNotifications: React.FC = () => {
  const session = getCurrentSession();
  const [notifications, setNotifications] = useState<AppNotification[]>(dbStore.getNotifications());

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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Ireo fampahatsiahivana sy hafatra rehetra.</p>
        </div>
        {list.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Voavaky daholo
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {list.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">Tsy misy fampahatsiahivana aloha.</div>
        ) : (
          list.map(n => (
            <div key={n.id} className={`p-5 flex items-start gap-4 ${!n.read ? 'bg-emerald-50/40' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {n.type === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">{n.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
