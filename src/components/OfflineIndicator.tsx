import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnlineToast(true);
      const timer = setTimeout(() => setShowBackOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnlineToast) return null;

  if (!isOnline) {
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-amber-600/95 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg border border-amber-400 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
        <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-200" />
        <span className="font-semibold">Miasa Offline (Tsy misy internet)</span>
        <span className="text-amber-100 hidden sm:inline">— Voatahiry an-toerana sy ao amin'ny Firestore ny angona</span>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-600/95 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg border border-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
      <Wifi className="w-3.5 h-3.5 text-emerald-200" />
      <span className="font-semibold">Tafaverina ny Fifandraisana (Online)</span>
      <span className="text-emerald-100 hidden sm:inline">— Voarindra amin'ny Firestore ny angona</span>
    </div>
  );
};
