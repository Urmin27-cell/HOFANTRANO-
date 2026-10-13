import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if previously hidden, installed or in standalone mode
  const checkIsInstalledOrHidden = (): boolean => {
    if (typeof window === 'undefined') return false;

    // Check permanent localStorage flags
    const isHidden = 
      localStorage.getItem('hofantrano_installer_hidden') === 'true' ||
      localStorage.getItem('hofantrano_pwa_installed') === 'true' ||
      sessionStorage.getItem('hofantrano_pwa_installed') === 'true';

    // Check display modes
    const isStandalone =
      (typeof window.matchMedia !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
      )) ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('source=pwa');

    return isHidden || isStandalone;
  };

  const [isInstalled, setIsInstalled] = useState<boolean>(checkIsInstalledOrHidden);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Initial evaluation
    setIsInstalled(checkIsInstalledOrHidden());

    // Check iOS
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Event listener for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Event listener when native installation completes
    const handleAppInstalled = () => {
      localStorage.setItem('hofantrano_installer_hidden', 'true');
      localStorage.setItem('hofantrano_pwa_installed', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.dispatchEvent(new CustomEvent('hofantrano_pwa_installed_changed', { detail: true }));
    };

    // Cross-component sync event listener
    const handleCustomInstallChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsInstalled(customEvent.detail ?? true);
    };

    // Listen to media query changes (e.g. launched into standalone)
    let mql: MediaQueryList | null = null;
    if (typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(display-mode: standalone)');
      const handleMqlChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          localStorage.setItem('hofantrano_pwa_installed', 'true');
          setIsInstalled(true);
        }
      };
      mql.addEventListener?.('change', handleMqlChange);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('hofantrano_pwa_installed_changed', handleCustomInstallChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('hofantrano_pwa_installed_changed', handleCustomInstallChange);
    };
  }, []);

  const markAsInstalled = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hofantrano_installer_hidden', 'true');
      localStorage.setItem('hofantrano_pwa_installed', 'true');
      sessionStorage.setItem('hofantrano_pwa_installed', 'true');
      window.dispatchEvent(new CustomEvent('hofantrano_pwa_installed_changed', { detail: true }));
    }
    setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const hideInstallerForever = markAsInstalled;

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // If native prompt is unavailable, signal to open manual installation guide
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        markAsInstalled();
        return true;
      }
    } catch (e) {
      console.warn('Install prompt error:', e);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
    markAsInstalled,
    hideInstallerForever,
    deferredPrompt
  };
}
