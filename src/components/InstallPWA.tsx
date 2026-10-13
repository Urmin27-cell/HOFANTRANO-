import React, { useState } from 'react';
import { Download, Smartphone, Share, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const InstallPWA: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed, NEVER render the install banner
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleConfirmAlreadyInstalled = () => {
    markAsInstalled();
    setShowGuideModal(false);
  };

  return (
    <>
      {/* Floating Bottom Action Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-192.png" 
              alt="HOFANTRANO" 
              className="w-11 h-11 rounded-xl shadow-md border border-white/20 shrink-0" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">HOFANTRANO</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-300">Azo apetraka amin'ny finday na solosaina</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Installer</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Akatony"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Installation Guide Modal (for iOS or browsers without native prompt) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img src="/logo-192.png" alt="HOFANTRANO Logo" className="w-12 h-12 rounded-2xl shadow" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Famenoana / Fametrahana PWA</h3>
                <p className="text-xs text-emerald-600 font-semibold">HOFANTRANO - Fitantanana Trano</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Tsindrio ny bokotra "Partager" (Share)</p>
                      <p className="text-xs text-slate-500 mt-0.5">Eo amin'ny farany ambany amin'ny Safari (sary efamira misy zana-tsipìka miakatra <Share className="inline w-3.5 h-3.5 text-blue-600" />).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Fidio ny "Sur l'écran d'accueil"</p>
                      <p className="text-xs text-slate-500 mt-0.5">Mikorisa midina kely dia tsindrio "Sur l'écran d'accueil" (Add to Home Screen).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Tsindrio ny "Ajouter"</p>
                      <p className="text-xs text-slate-500 mt-0.5">Efa hiseho eo amin'ny efijerin'ny iPhone na iPad toy ny tena application ny HOFANTRANO.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Ao amin'ny Chrome na navigateur finday</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tsindrio ny teboka telo (⋮) eo ambony havanana.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Fidio "Installer l'application"</p>
                      <p className="text-xs text-slate-500 mt-0.5">Na "Ajouter à l'écran d'accueil" (Install app).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Fanamarihana</p>
                      <p className="text-xs text-slate-500 mt-0.5">Miasa offline tanteraka ny HOFANTRANO na tsy misy internet aza!</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleConfirmAlreadyInstalled}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Efa voapetraka (Efa nanao installation)
              </button>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Akatony
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
