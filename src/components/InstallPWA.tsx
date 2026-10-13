import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => (window as any).showInstallPrompt()}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/30 transition animate-bounce"
      >
        <Download className="w-5 h-5" />
        Installer HOFANTRANO
      </button>
    </div>
  );
};
