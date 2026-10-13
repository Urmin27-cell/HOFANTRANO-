import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2 } from 'lucide-react';

interface InAppNotificationData {
  title: string;
  body: string;
  timestamp: string;
}

export const NotificationToast: React.FC = () => {
  const [notification, setNotification] = useState<InAppNotificationData | null>(null);

  useEffect(() => {
    let timer: any = null;

    const handleInAppNotification = (e: Event) => {
      const customEvent = e as CustomEvent<InAppNotificationData>;
      if (customEvent.detail) {
        setNotification(customEvent.detail);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setNotification(null);
        }, 6000);
      }
    };

    window.addEventListener('hofantrano_inapp_notification', handleInAppNotification);
    return () => {
      window.removeEventListener('hofantrano_inapp_notification', handleInAppNotification);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none animate-in fade-in slide-in-from-top duration-300">
      <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-400">HOFANTRANO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400">Vao teo</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5 truncate">{notification.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{notification.body}</p>
        </div>

        <button
          onClick={() => setNotification(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
          title="Akatony"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
