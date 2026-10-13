import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs 
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
  // If already initialized
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = dbInstance;

// VAPID Public Key for Web Push Notifications
export const VAPID_KEY = 'BCY15_y12DL2yNd7PUsyyF2tRc1KLaL_2-bCIYo7PtikbubYW407Zal4DA6WnREpBPCide_hgrvW0NvZ04KoAlY';

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

// Request Notification Permission & get FCM token
export async function requestNotificationPermission(userId?: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = await getSafeMessaging();
      let token: string | null = null;
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

      // Show immediate welcome notification on device
      showSystemNotification(
        'HOFANTRANO - Vonona',
        'Mandeha soa aman-tsara ny fampandrenesana (Push Notifications) ao amin\'ny findainao!'
      );

      return token || 'granted';
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
  return null;
}

// Helper to trigger a system push / device notification in the OS notification bar
export async function showSystemNotification(title: string, body: string, url: string = '/') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/logo-192.png',
          badge: '/logo-192.png',
          data: { url },
          vibrate: [200, 100, 200]
        } as any);
        return;
      }
    }

    // Fallback to Window Notification API
    new Notification(title, {
      body,
      icon: '/logo-192.png'
    });
  } catch (e) {
    console.warn('Could not show system notification:', e);
  }
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
    const item = localStorage.getItem(`hofantrano_v6_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`hofantrano_v6_${key}`, JSON.stringify(data));
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
  return getStoredData<AuthSession>('auth_session', {
    isAuthenticated: false,
    role: 'TOMPO_TRANO',
    userId: 'admin-1',
    fullName: 'Tompon-trano'
  });
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

  saveAdmin: (admin: Partial<LandlordProfile>) => {
    const current = dbStore.getAdmin();
    const updated: LandlordProfile = { ...current, ...admin };
    setStoredData('admin_profile', updated);
    
    // Asynchronously sync to Firestore collection 'landlords'
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

  // Landlord's payment accounts (up to 3)
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

  // Helper to add a notification & trigger system push
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
    // Send system push notification directly to screen!
    showSystemNotification(title, message);
    return newNotif;
  },

  resetAll: () => localStorage.clear()
};
