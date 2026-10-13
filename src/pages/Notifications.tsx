import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { AppNotification } from '../types';
import { db } from '../lib/supabase';
import { formatDate } from '../lib/formatters';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(db.getNotifications());

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    db.saveNotifications(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fampahatsiahivana & Haingam-baovao</h1>
        <p className="text-sm text-slate-500">Ireo filazana rehetra momba ny fandoavam-bola sy trano ao amin'ny HOFANTRANO.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Tsy misy fampahatsiahivana aloha.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-5 flex items-start justify-between gap-4 ${!n.read ? 'bg-emerald-50/40' : ''}`}>
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' :
                  n.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {n.type === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">{n.createdAt}</span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
                >
                  Voavaky
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
