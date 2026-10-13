import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  AdminSettings, PaymentAccount, Property, Tenant, 
  PaymentSubmission, Receipt, AppNotification 
} from '../types';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Offline IndexedDB Persistence
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = dbInstance;

// VAPID Public Key for Web Push Notifications
export const VAPID_KEY = 'BCY15_y12DL2yNd7PUsyyF2tRc1KLaL_2-bCIYo7PtikbubYW407Zal4DA6WnREpBPCide_hgrvW0NvZ04KoAlY';

// Audio Chime Synthesizer using Web Audio API (Zero download dependencies, 100% reliable)
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant 2-note chime (D5: 587.3Hz -> A5: 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Safe Messaging Initializer
let messagingInstance: any = null;
export async function getSafeMessaging() {
  if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
    try {
      const { isSupported, getMessaging } = await import('firebase/messaging');
      const supported = await isSupported().catch(() => false);
      if (supported) {
        if (!messagingInstance) {
          messagingInstance = getMessaging(app);
        }
        return messagingInstance;
      }
    } catch (e) {
      console.warn('Firebase Messaging not supported in this context:', e);
    }
  }
  return null;
}

// Check if notification is enabled
export function isNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('hofantrano_push_enabled') === 'true';
  const nativeGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  return stored || nativeGranted;
}

// Comprehensive activation with guaranteed action & fallback
export async function enableAppNotifications(userId?: string): Promise<{ success: boolean; token?: string | null; message: string; permission: string }> {
  let permissionStatus = 'default';

  if (typeof window !== 'undefined') {
    localStorage.setItem('hofantrano_push_enabled', 'true');
  }

  // Play immediate confirmation chime
  playNotificationSound();

  let token: string | null = null;

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      permissionStatus = Notification.permission;
      if (permissionStatus !== 'granted') {
        permissionStatus = await Notification.requestPermission();
      }

      if (permissionStatus === 'granted') {
        const messaging = await getSafeMessaging();
        if (messaging) {
          const { getToken } = await import('firebase/messaging');
          try {
            token = await getToken(messaging, { vapidKey: VAPID_KEY });
            console.log('FCM Token voaray:', token);
            if (userId && token) {
              localStorage.setItem(`hofantrano_fcm_token_${userId}`, token);
            }
          } catch (tokErr) {
            console.warn('getToken warning:', tokErr);
          }
        }
      }
    } catch (err) {
      console.warn('Notification permission request notice:', err);
    }
  }

  // Fire welcome and confirmation notification
  await showSystemNotification(
    'HOFANTRANO - Mavitrika',
    'Mandeha soa aman-tsara ny fampahafantarana (Push Notifications)!'
  );

  return {
    success: true,
    token,
    permission: permissionStatus,
    message: permissionStatus === 'granted' 
      ? 'Voahetsika soa aman-tsara ny Push Notifications amin\'ny findainao!' 
      : 'Voahetsika ao amin\'ny fampiharana ny fampandrenesana!'
  };
}

// Request Notification Permission & get FCM token
export async function requestNotificationPermission(userId?: string): Promise<string | null> {
  const res = await enableAppNotifications(userId);
  return res.token || 'granted';
}

// Helper to trigger a system push / device notification in the OS notification bar + In-App popup
export async function showSystemNotification(title: string, body: string, url: string = '/') {
  if (typeof window === 'undefined') return;

  // 1. Play crystal clear notification sound chime
  playNotificationSound();

  // 2. Dispatch custom in-app visual notification event (instant visual toast on screen)
  window.dispatchEvent(new CustomEvent('hofantrano_inapp_notification', {
    detail: { 
      title, 
      body, 
      url, 
      timestamp: new Date().toISOString() 
    }
  }));

  // 3. Dispatch general notification list update event
  window.dispatchEvent(new CustomEvent('hofantrano_notifications_updated'));

  // 4. Try browser Notification / Service Worker push
  if (typeof Notification !== 'undefined') {
    // If permission has not been asked, request it in background
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }

    if (Notification.permission === 'granted') {
      // 4a. Try Service Worker showNotification (Best for Android & PWA background bar)
      if ('serviceWorker' in navigator) {
        try {
          const swReadyPromise = navigator.serviceWorker.ready;
          const timeoutPromise = new Promise<ServiceWorkerRegistration | null>((resolve) => 
            setTimeout(() => resolve(null), 1200)
          );
          const reg = await Promise.race([swReadyPromise, timeoutPromise]);
          if (reg && reg.showNotification) {
            await reg.showNotification(title, {
              body,
              icon: '/logo-192.png',
              badge: '/logo-192.png',
              data: { url },
              vibrate: [200, 100, 200],
              tag: 'hofantrano-' + Date.now()
            } as any);
            return;
          }
        } catch (e) {
          console.warn('SW notification fallback:', e);
        }
      }

      // 4b. Try window Notification API (Desktop / Browsers where window.Notification works)
      try {
        new Notification(title, {
          body,
          icon: '/logo-192.png'
        });
        return;
      } catch (e) {}
    }
  }

  console.log('[HOFANTRANO Notification Sent]', title, body);
}

// Default Platform Account (for 2 500 Ar / month subscription)
export interface PlatformAccount {
  accountNumber: string;
  accountName: string;
  provider: string;
  subscriptionPrice: number; // 2500 Ar
  trialDays: number; // 35 days
}

const DEFAULT_PLATFORM_ACCOUNT: PlatformAccount = {
  accountNumber: '0323911654',
  accountName: 'RAVELOMANANTSOA URMIN',
  provider: 'MVola (Telma)',
  subscriptionPrice: 2500,
  trialDays: 35
};

// Initial Landlord Admin
export interface LandlordProfile extends AdminSettings {
  phone: string;
  email?: string;
  isRegistered: boolean;
  registeredAt: string;
  trialExpiresAt: string;
  isSubscriptionPaid: boolean;
  subscriptionPaidUntil?: string;
}

const INITIAL_ACCOUNTS: PaymentAccount[] = [
  { id: 'acc-1', accountNumber: '0323911654', accountName: 'RAVELOMANANTSOA URMIN', bankOrProvider: 'MVola (Telma)' }
];

function getStoredData<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`hofantrano_permanent_${key}`) || 
                 localStorage.getItem(`hofantrano_v6_${key}`) || 
                 localStorage.getItem(`hofantrano_v5_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`hofantrano_permanent_${key}`, serialized);
    localStorage.setItem(`hofantrano_v6_${key}`, serialized);
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: 'TOMPO_TRANO' | 'MPANOFA' | 'ADMIN_PLATFORME';
  userId: string;
  fullName: string;
  tenantId?: string;
}

export const getCurrentSession = (): AuthSession => {
  const admin = dbStore.getAdmin();
  const session = getStoredData<AuthSession>('auth_session', {
    isAuthenticated: admin.isRegistered,
    role: 'TOMPO_TRANO',
    userId: admin.id || 'admin-1',
    fullName: admin.adminName || 'Tompon-trano'
  });

  // Permanence rule: If admin is registered, keep them logged in automatically!
  if (admin.isRegistered) {
    if (session.role === 'MPANOFA' && session.isAuthenticated) {
      return session;
    }
    return {
      isAuthenticated: true,
      role: 'TOMPO_TRANO',
      userId: admin.id || 'admin-1',
      fullName: admin.adminName || 'Tompon-trano'
    };
  }

  return session;
};

export const setCurrentSession = (session: AuthSession) => {
  setStoredData('auth_session', session);
};

// Storage Service with Local + Firestore sync
export const dbStore = {
  // Landlord profile & Admin
  getAdmin: (): LandlordProfile => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString();
    return getStoredData<LandlordProfile>('admin_profile', {
      id: 'admin-1',
      adminName: 'Tompon-trano',
      pinCode: '1234',
      currency: 'Ar',
      phone: '034 00 000 00',
      isRegistered: false,
      registeredAt: now.toISOString(),
      trialExpiresAt: trialEnd,
      isSubscriptionPaid: false
    });
  },

  syncFromFirestore: async (): Promise<LandlordProfile> => {
    try {
      const snap = await getDoc(doc(db, 'landlords', 'admin-1'));
      if (snap.exists()) {
        const firestoreAdmin = snap.data() as LandlordProfile;
        if (firestoreAdmin && (firestoreAdmin.isRegistered || firestoreAdmin.adminName)) {
          const current = dbStore.getAdmin();
          const merged: LandlordProfile = { ...current, ...firestoreAdmin, isRegistered: true };
          setStoredData('admin_profile', merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Firestore sync note:', e);
    }
    return dbStore.getAdmin();
  },

  saveAdmin: (admin: Partial<LandlordProfile>) => {
    const current = dbStore.getAdmin();
    const updated: LandlordProfile = { ...current, ...admin, isRegistered: true };
    setStoredData('admin_profile', updated);
    
    // Automatically keep session authenticated permanently
    setStoredData('auth_session', {
      isAuthenticated: true,
      role: 'TOMPO_TRANO',
      userId: updated.id,
      fullName: updated.adminName
    });

    try {
      setDoc(doc(db, 'landlords', updated.id), updated, { merge: true }).catch(err => {
        console.warn('Firestore offline sync for admin:', err);
      });
    } catch (e) {}
    return updated;
  },

  saveAdminPin: (pin: string) => {
    const current = dbStore.getAdmin();
    current.pinCode = pin;
    dbStore.saveAdmin(current);
  },

  // Platform Admin (/admin)
  getPlatformAccount: (): PlatformAccount => {
    return getStoredData<PlatformAccount>('platform_account', DEFAULT_PLATFORM_ACCOUNT);
  },

  savePlatformAccount: (account: PlatformAccount) => {
    setStoredData('platform_account', account);
    try {
      setDoc(doc(db, 'platform_settings', 'main'), account, { merge: true }).catch(err => {
        console.warn('Firestore offline sync for platform account:', err);
      });
    } catch (e) {}
  },

  // Landlord's payment accounts
  getAccounts: (): PaymentAccount[] => getStoredData('accounts', INITIAL_ACCOUNTS),
  saveAccounts: (accounts: PaymentAccount[]) => {
    setStoredData('accounts', accounts);
    try {
      setDoc(doc(db, 'settings', 'accounts'), { accounts }, { merge: true }).catch(() => {});
    } catch (e) {}
  },

  // Properties
  getProperties: (): Property[] => getStoredData('properties', []),
  saveProperties: (props: Property[]) => {
    setStoredData('properties', props);
    try {
      setDoc(doc(db, 'app_data', 'properties'), { items: props }, { merge: true }).catch(() => {});
    } catch (e) {}
  },

  // Tenants
  getTenants: (): Tenant[] => getStoredData('tenants', []),
  saveTenants: (tenants: Tenant[]) => {
    setStoredData('tenants', tenants);
    try {
      setDoc(doc(db, 'app_data', 'tenants'), { items: tenants }, { merge: true }).catch(() => {});
    } catch (e) {}
  },

  // Submissions (payments from tenants)
  getSubmissions: (): PaymentSubmission[] => getStoredData('submissions', []),
  saveSubmissions: (subs: PaymentSubmission[]) => {
    setStoredData('submissions', subs);
    try {
      setDoc(doc(db, 'app_data', 'submissions'), { items: subs }, { merge: true }).catch(() => {});
    } catch (e) {}
  },

  // Receipts
  getReceipts: (): Receipt[] => getStoredData('receipts', []),
  saveReceipts: (receipts: Receipt[]) => {
    setStoredData('receipts', receipts);
    try {
      setDoc(doc(db, 'app_data', 'receipts'), { items: receipts }, { merge: true }).catch(() => {});
    } catch (e) {}
  },

  // Notifications
  getNotifications: (): AppNotification[] => getStoredData('notifications', []),
  saveNotifications: (notifs: AppNotification[]) => {
    setStoredData('notifications', notifs);
    try {
      setDoc(doc(db, 'app_data', 'notifications'), { items: notifs }, { merge: true }).catch(() => {});
    } catch (e) {}
  },

  addNotification: (title: string, message: string, userId: string = 'admin-1', type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
    const notifs = dbStore.getNotifications();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    const updated = [newNotif, ...notifs];
    dbStore.saveNotifications(updated);
    showSystemNotification(title, message);
    return newNotif;
  },

  resetAll: () => localStorage.clear()
};
